"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Save, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"

interface Band {
  id?: number
  min_marks: string
  max_marks: string
  grade: string
  grade_point: string
}

const CLASS_GROUP_LABELS: Record<string, string> = {
  pre: "Pre-Primary (LKG/UKG)",
  "1-5": "Classes 1-5",
  "6-10": "Classes 6-10",
}

export function SettingsGradeConfig() {
  const { toast } = useToast()

  const [classGroups, setClassGroups] = useState<string[]>([])
  const [examTypes, setExamTypes] = useState<string[]>([])
  const [classGroup, setClassGroup] = useState<string>("")
  const [examType, setExamType] = useState<string>("")

  const [bands, setBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingBands, setLoadingBands] = useState(false)
  const [saving, setSaving] = useState(false)

  // Initial load: get option lists, default the dropdowns
  useEffect(() => {
    const init = async () => {
      try {
        const data = await ApiService.getGradeScales("", "")
        setClassGroups(data.class_groups || [])
        setExamTypes(data.exam_types || [])
        if (data.class_groups?.length) setClassGroup(data.class_groups[0])
        if (data.exam_types?.length) setExamType(data.exam_types[0])
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not load options", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load bands whenever the selection changes
  useEffect(() => {
    if (!classGroup || !examType) return
    fetchBands(classGroup, examType)
  }, [classGroup, examType])

  const fetchBands = async (cg: string, et: string) => {
    setLoadingBands(true)
    try {
      const data = await ApiService.getGradeScales(cg, et)
      setBands(
        (data.bands || []).map((b: any) => ({
          id: b.id,
          min_marks: String(b.min_marks),
          max_marks: String(b.max_marks),
          grade: b.grade,
          grade_point: String(b.grade_point),
        }))
      )
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load grade bands", variant: "destructive" })
      setBands([])
    } finally {
      setLoadingBands(false)
    }
  }

  const updateBand = (index: number, field: keyof Band, value: string) => {
    setBands((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)))
  }

  const addBand = () => {
    setBands((prev) => [...prev, { min_marks: "", max_marks: "", grade: "", grade_point: "" }])
  }

  const removeBand = (index: number) => {
    setBands((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        class_group: classGroup,
        exam_type: examType,
        bands: bands.map((b) => ({
          min_marks: Number(b.min_marks),
          max_marks: Number(b.max_marks),
          grade: b.grade.trim(),
          grade_point: Number(b.grade_point),
        })),
      }
      const data = await ApiService.saveGradeScales(payload)
      if (!data.success) throw new Error(data.message || "Save failed")
      toast({ title: "Grade Scale Saved", description: data.message, duration: 3000 })
      fetchBands(classGroup, examType)
    } catch (error: any) {
      toast({ title: "Error Saving", description: error.message || "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading grade configuration…" />
      </div>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Grade Configuration</CardTitle>
        <p className="text-sm text-gray-600">
          These bands are the single source of truth for grades. Editing them changes how marks are graded
          going forward; run a recompute (or re-save marks) to update existing summaries.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selectors */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Class Group</label>
            <Select value={classGroup} onValueChange={setClassGroup}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {classGroups.map((cg) => (
                  <SelectItem key={cg} value={cg}>{CLASS_GROUP_LABELS[cg] || cg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Exam Type</label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {examTypes.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et === "FA" ? "Formative (FA)" : et === "SA" ? "Summative (SA)" : et}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bands table */}
        {loadingBands ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading bands…" />
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Grade</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Min Marks</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Max Marks</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Grade Point</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {bands.map((band, index) => (
                  <tr key={band.id ?? `new-${index}`} className="border-t">
                    <td className="px-3 py-2">
                      <Input value={band.grade} onChange={(e) => updateBand(index, "grade", e.target.value)} className="w-20" placeholder="A1" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input type="number" value={band.min_marks} onChange={(e) => updateBand(index, "min_marks", e.target.value)} className="w-24 mx-auto text-center" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input type="number" value={band.max_marks} onChange={(e) => updateBand(index, "max_marks", e.target.value)} className="w-24 mx-auto text-center" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input type="number" step="0.1" value={band.grade_point} onChange={(e) => updateBand(index, "grade_point", e.target.value)} className="w-24 mx-auto text-center" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => removeBand(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {bands.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No bands. Add one below.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={addBand}>
            <Plus className="w-4 h-4 mr-2" /> Add Band
          </Button>
          <Button onClick={handleSave} disabled={saving || bands.length === 0} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Grade Scale</>
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Tip: the lowest band must start at 0 and bands must not overlap (e.g. 0-17, 18-20, 21-25…).
        </p>
      </CardContent>
    </Card>
  )
}
