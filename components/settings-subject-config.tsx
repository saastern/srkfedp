"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"

interface SubjectRow {
  subject_id: number
  name: string
  selected: boolean
  is_main: boolean
  fa_max: string
  sa_max: string
}

interface ClassOption {
  id: string
  displayName: string
}

export function SettingsSubjectConfig() {
  const { toast } = useToast()

  const [classes, setClasses] = useState<ClassOption[]>([])
  const [classId, setClassId] = useState<string>("")
  const [subjects, setSubjects] = useState<SubjectRow[]>([])

  const [loadingClasses, setLoadingClasses] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await ApiService.getMarksClasses()
        const opts: ClassOption[] = (data.classes || []).map((c: any) => ({
          id: String(c.id),
          displayName: c.displayName || c.name,
        }))
        setClasses(opts)
        if (opts.length) setClassId(opts[0].id)
      } catch (error: any) {
        toast({ title: "Error", description: error.message || "Could not load classes", variant: "destructive" })
      } finally {
        setLoadingClasses(false)
      }
    }
    loadClasses()
  }, [])

  useEffect(() => {
    if (!classId) return
    fetchSubjects(classId)
  }, [classId])

  const fetchSubjects = async (cid: string) => {
    setLoadingSubjects(true)
    try {
      const data = await ApiService.getClassSubjects(cid)
      if (!data.success) throw new Error(data.message || "Failed to load subjects")
      setSubjects(
        (data.subjects || []).map((s: any) => ({
          subject_id: s.subject_id,
          name: s.name,
          selected: s.selected,
          is_main: s.is_main,
          fa_max: String(s.fa_max ?? 0),
          sa_max: String(s.sa_max ?? 0),
        }))
      )
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load subjects", variant: "destructive" })
      setSubjects([])
    } finally {
      setLoadingSubjects(false)
    }
  }

  const updateRow = (index: number, field: keyof SubjectRow, value: any) => {
    setSubjects((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        class_id: classId,
        subjects: subjects
          .filter((s) => s.selected)
          .map((s) => ({
            subject_id: s.subject_id,
            is_main: s.is_main,
            fa_max: Number(s.fa_max) || 0,
            sa_max: Number(s.sa_max) || 0,
          })),
      }
      const data = await ApiService.saveClassSubjects(payload)
      if (!data.success) throw new Error(data.message || "Save failed")
      toast({ title: "Subjects Saved", description: data.message, duration: 3000 })
      fetchSubjects(classId)
    } catch (error: any) {
      toast({ title: "Error Saving", description: error.message || "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loadingClasses) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading classes…" />
      </div>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Subject Configuration</CardTitle>
        <p className="text-sm text-gray-600">
          Choose which subjects a class studies this year, mark each main/optional, and set the FA and SA
          maximum marks per subject. These max marks are used when entering and grading marks.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-xs">
          <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loadingSubjects ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading subjects…" />
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Has</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">Main?</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">FA Max</th>
                  <th className="px-3 py-2 text-center text-sm font-semibold text-gray-700">SA Max</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row, index) => (
                  <tr key={row.subject_id} className={`border-t ${row.selected ? "" : "opacity-50"}`}>
                    <td className="px-3 py-2 text-center">
                      <Checkbox
                        checked={row.selected}
                        onCheckedChange={(v) => updateRow(index, "selected", !!v)}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-900">{row.name}</td>
                    <td className="px-3 py-2 text-center">
                      <Checkbox
                        checked={row.is_main}
                        disabled={!row.selected}
                        onCheckedChange={(v) => updateRow(index, "is_main", !!v)}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input
                        type="number"
                        min={0}
                        value={row.fa_max}
                        disabled={!row.selected}
                        onChange={(e) => updateRow(index, "fa_max", e.target.value)}
                        className="w-24 mx-auto text-center"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Input
                        type="number"
                        min={0}
                        value={row.sa_max}
                        disabled={!row.selected}
                        onChange={(e) => updateRow(index, "sa_max", e.target.value)}
                        className="w-24 mx-auto text-center"
                      />
                    </td>
                  </tr>
                ))}
                {subjects.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No subjects available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Subjects</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
