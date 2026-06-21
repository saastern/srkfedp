"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowRight, GraduationCap, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PreviewRow {
  class_id: number
  class_name: string
  order: number
  student_count: number
  next_class_name: string
  graduates: boolean
}

// Guess "2025-2026" style next-year name and term dates
const guessNextYear = (current?: string | null) => {
  const now = new Date()
  let startYear = now.getFullYear()
  if (current) {
    const m = current.match(/(\d{4})\s*-\s*(\d{4})/)
    if (m) startYear = Number(m[2]) // start next year where the current one ended
  }
  return {
    name: `${startYear}-${startYear + 1}`,
    start: `${startYear}-06-01`,
    end: `${startYear + 1}-05-31`,
  }
}

export function SettingsPromotion() {
  const { toast } = useToast()

  const [rows, setRows] = useState<PreviewRow[]>([])
  const [currentYear, setCurrentYear] = useState<string | null>(null)
  const [needsOrderSetup, setNeedsOrderSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [fixingOrder, setFixingOrder] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const [yearName, setYearName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchPreview()
  }, [])

  const fetchPreview = async () => {
    setLoading(true)
    try {
      const data = await ApiService.getPromotionPreview()
      if (!data.success) throw new Error(data.message || "Failed to load preview")
      setRows(data.rows || [])
      setCurrentYear(data.current_year || null)
      setNeedsOrderSetup(!!data.needs_order_setup)

      const guess = guessNextYear(data.current_year)
      setYearName(guess.name)
      setStartDate(guess.start)
      setEndDate(guess.end)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load preview", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleFixOrder = async () => {
    setFixingOrder(true)
    try {
      const data = await ApiService.setClassOrders()
      if (!data.success) throw new Error(data.message || "Failed to set class order")
      toast({ title: "Class Order Updated", description: data.message, duration: 5000 })
      if (data.unrecognized && data.unrecognized.length > 0) {
        toast({
          title: "Some classes need a manual order",
          description: data.unrecognized.map((u: any) => `${u.name} (${u.students} students)`).join(", "),
          variant: "destructive",
          duration: 8000,
        })
      }
      fetchPreview()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to set class order", variant: "destructive" })
    } finally {
      setFixingOrder(false)
    }
  }

  const handleRun = async () => {
    setRunning(true)
    try {
      const data = await ApiService.runPromotion({
        new_year_name: yearName,
        start_date: startDate,
        end_date: endDate,
      })
      if (!data.success) throw new Error(data.message || "Promotion failed")
      setResult(data.message)
      toast({ title: "Promotion Complete", description: data.message, duration: 5000 })
      fetchPreview()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Promotion failed", variant: "destructive" })
    } finally {
      setRunning(false)
    }
  }

  const formValid = yearName.trim() && startDate && endDate

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading promotion preview…" />
      </div>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Promote Students / Year Rollover</CardTitle>
        <p className="text-sm text-gray-600">
          Move every student up one class and start a new academic year. The final class graduates
          (kept in records, removed from active lists). {currentYear && <>Current year: <strong>{currentYear}</strong>.</>}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {needsOrderSetup && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <div className="flex items-start gap-2 flex-1">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Some classes have no promotion order set, so the "Moves To" mapping below is wrong. Click Fix to set the standard order (L.K.G → U.K.G → 1 → … → 10).</span>
            </div>
            <Button onClick={handleFixOrder} disabled={fixingOrder} size="sm" variant="outline" className="bg-white w-fit shrink-0">
              {fixingOrder ? "Fixing…" : "Fix Class Order"}
            </Button>
          </div>
        )}

        {!needsOrderSetup && (
          <div className="flex justify-end">
            <Button onClick={handleFixOrder} disabled={fixingOrder} size="sm" variant="ghost" className="text-gray-500">
              {fixingOrder ? "Re-applying…" : "Re-apply standard class order"}
            </Button>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">{result}</div>
        )}

        {/* Preview table */}
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Current Class</th>
                <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Students</th>
                <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Moves To</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.class_id} className="border-t">
                  <td className="px-3 py-2 font-medium text-gray-900">{row.class_name}</td>
                  <td className="px-3 py-2 text-center text-gray-700">{row.student_count}</td>
                  <td className="px-3 py-2">
                    {row.graduates ? (
                      <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                        <GraduationCap className="w-3 h-3" /> Graduate
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-700">
                        <ArrowRight className="w-3 h-3 text-blue-500" /> {row.next_class_name}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-3 py-6 text-center text-gray-500">No classes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* New year inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label htmlFor="yearName">New Academic Year</Label>
            <Input id="yearName" value={yearName} onChange={(e) => setYearName(e.target.value)} placeholder="2025-2026" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!formValid || running} className="bg-blue-600 hover:bg-blue-700">
                {running ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Promoting…</>
                ) : (
                  "Promote All Students"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Promote all students?</AlertDialogTitle>
                <AlertDialogDescription>
                  This moves every student up one class, graduates the final class, and starts academic
                  year <strong>{yearName}</strong>. This cannot be undone. Make sure you have a database backup.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRun} className="bg-blue-600 hover:bg-blue-700">
                  Yes, promote everyone
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
