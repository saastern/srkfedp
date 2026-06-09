"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, Calendar, BookOpen, Pencil } from "lucide-react"
import { MarksTable } from "@/components/marks-table" // ✅ Import your existing table
import { MarksStudentEditTable } from "@/components/marks-student-edit-table"
import { TermSummaryCard } from "@/components/term-summary-card" // ✅ Import your existing cards
import ApiService from "@/services/api"

interface MarksStudentMarksProps {
  studentId: string
  teacher: any
  onBack: () => void
  onLogout: () => void
}

export function MarksStudentMarks({ studentId, teacher, onBack, onLogout }: MarksStudentMarksProps) {
  const [marksData, setMarksData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    console.log('🔍 Loading marks for student:', studentId)
    fetchStudentMarks()
  }, [studentId])

  const fetchStudentMarks = async () => {
    try {
      console.log('📡 Calling API for student marks:', studentId)
      const data = await ApiService.getStudentMarks(studentId)
      console.log('📊 API Response:', data)
      setMarksData(data)
    } catch (error) {
      console.error("❌ Error fetching student marks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <LoadingSpinner size="lg" text="Loading student marks..." />
      </div>
    )
  }

  if (!marksData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button onClick={onBack} variant="outline" className="bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
            </Button>
            <h1 className="text-2xl font-bold">Student Marks</h1>
            <Button onClick={onLogout} variant="outline" size="sm">Logout</Button>
          </div>
          
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Failed to load student marks</p>
            <p className="text-gray-500 mt-2">Student ID: {studentId}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* ✅ Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Button onClick={onBack} variant="outline" className="bg-white w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {marksData.student?.name || 'Student'}
            </h1>
            <p className="text-gray-600 mt-1">
              Roll No: {marksData.student?.rollNo || 'N/A'} |
              Class: {marksData.student?.className || 'N/A'}
            </p>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 w-fit">
              <Pencil className="w-4 h-4 mr-2" />
              Edit Marks
            </Button>
          )}

          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        {/* ✅ SECTION 1: Subject Marks Table (Top) — read-only or editable */}
        {marksData.subjects && marksData.subjects.length > 0 ? (
          <div className="mb-8">
            {isEditing ? (
              <MarksStudentEditTable
                studentId={studentId}
                classId={marksData.student?.classId || ""}
                subjects={marksData.subjects}
                exams={marksData.exams || []}
                onCancel={() => setIsEditing(false)}
                onSaved={() => {
                  setIsEditing(false)
                  fetchStudentMarks()
                }}
              />
            ) : (
              <MarksTable
                subjects={marksData.subjects}
                classConfig={marksData.classConfig}
              />
            )}
          </div>
        ) : (
          <Card className="shadow-lg border-0 mb-8">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No subject marks available</p>
              <p className="text-gray-400 text-sm mt-2">
                Click "Edit Marks" above to enter marks for this student
              </p>
            </CardContent>
          </Card>
        )}

        {/* ✅ SECTION 2: Term Summary Cards (Bottom) */}
        {marksData.termSummaries && marksData.termSummaries.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Term-wise Performance Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marksData.termSummaries.map((summary: any, index: number) => (
                <TermSummaryCard
                  key={`${summary.term}-${index}`}
                  summary={{
                    term: summary.term,
                    totalMarks: summary.totalMarks,
                    maxMarks: summary.maxMarks,
                    percentage: summary.percentage,
                    grade: summary.grade,
                    classRank: summary.classRank,
                    totalStudents: summary.totalStudents
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
