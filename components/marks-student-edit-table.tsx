"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"

const TERM_KEYS = ["fa1", "fa2", "fa3", "fa4", "sa1", "sa2"] as const
type TermKey = (typeof TERM_KEYS)[number]
const TERM_LABELS: Record<TermKey, string> = {
  fa1: "FA-1",
  fa2: "FA-2",
  fa3: "FA-3",
  fa4: "FA-4",
  sa1: "SA-1",
  sa2: "SA-2",
}

interface TermCell {
  marks: number
  grade: string
  maxMarks: number
}

interface SubjectMarks {
  id: number
  name: string
  examCaps?: Record<TermKey, number>
  fa1: TermCell
  fa2: TermCell
  fa3: TermCell
  fa4: TermCell
  sa1: TermCell
  sa2: TermCell
}

interface ExamMeta {
  id: number
  name: string
  key: string // fa1, fa2, ...
}

interface MarksStudentEditTableProps {
  studentId: string
  classId: string
  subjects: SubjectMarks[]
  exams: ExamMeta[]
  onCancel: () => void
  onSaved: () => void
}

// editable values: { [subjectId]: { [termKey]: string } }
type EditState = Record<string, Record<string, string>>

export function MarksStudentEditTable({
  studentId,
  classId,
  subjects,
  exams,
  onCancel,
  onSaved,
}: MarksStudentEditTableProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const examByKey = new Map(exams.map((e) => [e.key, e]))

  // Seed editable state from current marks (only where a mark actually exists)
  const [values, setValues] = useState<EditState>(() => {
    const seed: EditState = {}
    for (const subject of subjects) {
      seed[String(subject.id)] = {}
      for (const key of TERM_KEYS) {
        const cell = subject[key]
        // A real mark exists if maxMarks > 0 (empty terms come back as maxMarks 0)
        seed[String(subject.id)][key] = cell && cell.maxMarks > 0 ? String(cell.marks) : ""
      }
    }
    return seed
  })

  const capFor = (subject: SubjectMarks, key: TermKey) => {
    // Prefer examCaps (present even for empty terms); fall back to cell maxMarks
    if (subject.examCaps && subject.examCaps[key]) return subject.examCaps[key]
    return subject[key]?.maxMarks || 0
  }

  const handleChange = (subject: SubjectMarks, key: TermKey, value: string) => {
    const cap = capFor(subject, key)
    if (value !== "") {
      const num = Number(value)
      if (Number.isNaN(num)) return
      if (num < 0) value = "0"
      else if (cap > 0 && num > cap) value = String(cap)
    }
    setValues((prev) => ({
      ...prev,
      [subject.id]: { ...prev[String(subject.id)], [key]: value },
    }))
  }

  const handleSave = async () => {
    // Group changes by exam: one saveClassMarksGrid call per exam (single student)
    const byExam: Record<string, Record<string, Record<string, { marks: number }>>> = {}

    for (const subject of subjects) {
      const sid = String(subject.id)
      for (const key of TERM_KEYS) {
        const exam = examByKey.get(key)
        if (!exam) continue // this exam doesn't exist in the DB
        const raw = values[sid]?.[key]
        if (raw === undefined || raw === "") continue
        const examId = String(exam.id)
        if (!byExam[examId]) byExam[examId] = {}
        if (!byExam[examId][studentId]) byExam[examId][studentId] = {}
        byExam[examId][studentId][sid] = { marks: Number(raw) }
      }
    }

    const examIds = Object.keys(byExam)
    if (examIds.length === 0) {
      toast({ title: "Nothing to save", description: "Enter at least one mark first." })
      return
    }

    setSaving(true)
    try {
      for (const examId of examIds) {
        const res = await ApiService.saveClassMarksGrid({
          class_id: classId,
          exam_id: examId,
          marks: byExam[examId],
        })
        if (!res.success) throw new Error(res.message || "Save failed")
      }
      toast({ title: "Marks Saved", description: "Student marks updated.", duration: 3000 })
      onSaved()
    } catch (error: any) {
      console.error("Error saving student marks:", error)
      toast({ title: "Error Saving Marks", description: error.message || "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Edit Marks</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            <X className="w-4 h-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Subject</th>
                {TERM_KEYS.map((key) => (
                  <th key={key} className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                    {TERM_LABELS[key]}
                    {!examByKey.has(key) && <div className="text-xs font-normal text-gray-400">(n/a)</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-gray-900 border-b">{subject.name}</td>
                  {TERM_KEYS.map((key) => {
                    const cap = capFor(subject, key)
                    const examExists = examByKey.has(key)
                    return (
                      <td key={key} className="px-2 py-2 text-center border-b border-l">
                        <Input
                          type="number"
                          min={0}
                          max={cap || undefined}
                          disabled={!examExists}
                          value={values[String(subject.id)]?.[key] ?? ""}
                          onChange={(e) => handleChange(subject, key, e.target.value)}
                          className="w-20 text-center mx-auto"
                          placeholder={cap ? `/${cap}` : "—"}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
