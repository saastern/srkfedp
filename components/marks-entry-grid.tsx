"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, Save, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"

interface MarksEntryGridProps {
  classId: string
  className: string
  onBack: () => void
  onLogout: () => void
}

interface Exam {
  id: number
  name: string
  type?: string
}

interface Subject {
  id: number
  name: string
  is_main: boolean
  max_marks: number
}

interface StudentRow {
  id: number
  name: string
  roll_number: string
}

// marks state: { [studentId]: { [subjectId]: string } }
type MarksState = Record<string, Record<string, string>>

export function MarksEntryGrid({ classId, className, onBack, onLogout }: MarksEntryGridProps) {
  const { toast } = useToast()

  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>("")

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [marks, setMarks] = useState<MarksState>({})

  const [loadingExams, setLoadingExams] = useState(true)
  const [loadingGrid, setLoadingGrid] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load the list of exams once
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await ApiService.getExams()
        setExams(data.exams || [])
      } catch (error) {
        console.error("Error loading exams:", error)
        toast({ title: "Error", description: "Could not load exams", variant: "destructive" })
      } finally {
        setLoadingExams(false)
      }
    }
    fetchExams()
  }, [])

  // Load the grid whenever the exam changes
  useEffect(() => {
    if (!selectedExamId) return
    fetchGrid(selectedExamId)
  }, [selectedExamId, classId])

  const fetchGrid = async (examId: string) => {
    setLoadingGrid(true)
    try {
      const data = await ApiService.getClassMarksGrid(classId, examId)
      if (!data.success) throw new Error(data.message || "Failed to load grid")

      setSubjects(data.subjects || [])
      setStudents(data.students || [])

      // Seed the marks state from existing_marks
      const seeded: MarksState = {}
      const existing = data.existing_marks || {}
      for (const student of data.students || []) {
        const sid = String(student.id)
        seeded[sid] = {}
        const studentExisting = existing[sid] || {}
        for (const subject of data.subjects || []) {
          const subjId = String(subject.id)
          const cell = studentExisting[subjId]
          seeded[sid][subjId] = cell && cell.marks != null ? String(cell.marks) : ""
        }
      }
      setMarks(seeded)
    } catch (error: any) {
      console.error("Error loading grid:", error)
      toast({ title: "Error", description: error.message || "Could not load marks", variant: "destructive" })
      setSubjects([])
      setStudents([])
      setMarks({})
    } finally {
      setLoadingGrid(false)
    }
  }

  const handleCellChange = (studentId: number, subject: Subject, value: string) => {
    // Allow empty, otherwise clamp to [0, max_marks]
    if (value !== "") {
      const num = Number(value)
      if (Number.isNaN(num)) return
      if (num < 0) value = "0"
      else if (num > subject.max_marks) value = String(subject.max_marks)
    }
    setMarks((prev) => ({
      ...prev,
      [String(studentId)]: { ...prev[String(studentId)], [String(subject.id)]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Only send cells that have a value
      const payloadMarks: Record<string, Record<string, { marks: number }>> = {}
      for (const student of students) {
        const sid = String(student.id)
        const studentMarks = marks[sid] || {}
        for (const subject of subjects) {
          const subjId = String(subject.id)
          const raw = studentMarks[subjId]
          if (raw !== undefined && raw !== "") {
            if (!payloadMarks[sid]) payloadMarks[sid] = {}
            payloadMarks[sid][subjId] = { marks: Number(raw) }
          }
        }
      }

      const data = await ApiService.saveClassMarksGrid({
        class_id: classId,
        exam_id: selectedExamId,
        marks: payloadMarks,
      })

      if (!data.success) throw new Error(data.message || "Save failed")

      toast({
        title: "Marks Saved",
        description: data.message || "Marks saved successfully",
        duration: 3000,
      })
    } catch (error: any) {
      console.error("Error saving marks:", error)
      toast({ title: "Error Saving Marks", description: error.message || "Save failed", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const selectedExam = exams.find((e) => String(e.id) === selectedExamId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" className="bg-white w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Enter Marks — {className}</h1>
            <p className="text-gray-600 mt-1">Pick an exam, fill in marks, then save the whole class at once.</p>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        {/* Exam picker + Save */}
        <Card className="shadow-md border-0 mb-6">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Exam</label>
              {loadingExams ? (
                <div className="text-sm text-gray-500">Loading exams…</div>
              ) : (
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={String(exam.id)}>
                        {exam.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex-1" />
            <Button
              onClick={handleSave}
              disabled={!selectedExamId || saving || students.length === 0 || subjects.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Marks
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Grid */}
        {!selectedExamId ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Select an exam to start entering marks</p>
            </CardContent>
          </Card>
        ) : loadingGrid ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading marks sheet…" />
          </div>
        ) : students.length === 0 || subjects.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                {students.length === 0 ? "No students in this class yet." : "No subjects configured for this class."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">
                {selectedExam?.name} — Marks Sheet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b sticky left-0 bg-gray-50 z-10">
                        Roll
                      </th>
                      <th className="px-3 py-3 text-left font-semibold text-gray-900 border-b">Student</th>
                      {subjects.map((subject) => (
                        <th key={subject.id} className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                          {subject.name}
                          <div className="text-xs font-normal text-gray-500">Max: {subject.max_marks}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className={`px-3 py-2 font-medium text-blue-600 border-b sticky left-0 z-10 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                          {student.roll_number}
                        </td>
                        <td className="px-3 py-2 text-gray-900 border-b whitespace-nowrap">{student.name}</td>
                        {subjects.map((subject) => (
                          <td key={subject.id} className="px-2 py-2 text-center border-b border-l">
                            <Input
                              type="number"
                              min={0}
                              max={subject.max_marks}
                              value={marks[String(student.id)]?.[String(subject.id)] ?? ""}
                              onChange={(e) => handleCellChange(student.id, subject, e.target.value)}
                              className="w-20 text-center mx-auto"
                              placeholder="—"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
