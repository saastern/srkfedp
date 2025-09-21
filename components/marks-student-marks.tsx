"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { ArrowLeft } from "lucide-react"
import { MarksTable } from "@/components/marks-table"
import { TermSummaryCard } from "@/components/term-summary-card"
import ApiService from "@/services/api"

interface StudentMarksData {
  student: {
    id: string
    name: string
    rollNo: string
    className: string
  }
  subjects: Array<{
    name: string
    fa1: { marks: number; grade: string; rank: number; maxMarks: number }
    fa2: { marks: number; grade: string; rank: number; maxMarks: number }
    fa3: { marks: number; grade: string; rank: number; maxMarks: number }
    fa4: { marks: number; grade: string; rank: number; maxMarks: number }
    sa1: { marks: number; grade: string; rank: number; maxMarks: number }
    sa2: { marks: number; grade: string; rank: number; maxMarks: number }
  }>
  termSummaries: Array<{
    term: string
    totalMarks: number
    maxMarks: number
    percentage: number
    grade: string
    classRank: number
    totalStudents: number
  }>
  classConfig: {
    faMarks: number
    saMarks: number
    excludeFromTotal: string[]
  }
}

interface StudentMarksProps {
  studentId: string
}

export function StudentMarks({ studentId }: StudentMarksProps) {
  const [marksData, setMarksData] = useState<StudentMarksData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()


  const fetchStudentMarks = async () => {
    try {
      const data = await ApiService.getStudentMarks(studentId)
      setMarksData(data)
    } catch (error) {
      console.error("Error fetching student marks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!marksData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Student Not Found</h3>
            <p className="text-gray-500 mb-4">Unable to load student marks data.</p>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 bg-white">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{marksData.student.name} - Academic Performance</h1>
            <p className="text-gray-600 mt-1">
              Roll No: {marksData.student.rollNo} | Class: {marksData.student.className}
            </p>
          </div>
        </div>

        {/* Marks Table */}
        <div className="mb-8">
          <MarksTable subjects={marksData.subjects} classConfig={marksData.classConfig} />
        </div>

        {/* Term Summaries */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Term-wise Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marksData.termSummaries.map((summary) => (
              <TermSummaryCard key={summary.term} summary={summary} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
