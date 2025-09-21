"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, User, Search } from "lucide-react"
import ApiService from "@/services/api"

interface Student {
  id: string
  rollNo: string
  name: string
  className: string
}

interface MarksStudentListProps {
  classId: string
  onBack: () => void
  onLogout: () => void
  onStudentSelect?: (studentId: string, studentName: string) => void // ✅ Add this prop
}

// ✅ Add onStudentSelect to destructuring
export function MarksStudentList({ classId, onBack, onLogout, onStudentSelect }: MarksStudentListProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [className, setClassName] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 Component mounted with classId:', classId)
    fetchStudents()
  }, [classId])

  useEffect(() => {
    const filtered = students.filter(
      (student) => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.rollNo.includes(searchTerm)
    )
    setFilteredStudents(filtered)
  }, [students, searchTerm])

  const fetchStudents = async () => {
    try {
      console.log('📡 Calling API for classId:', classId)
      const data = await ApiService.getMarksStudents(classId)
      console.log('📡 API Response:', data)
      
      setStudents(data.students || [])
      setFilteredStudents(data.students || [])
      setClassName(data.className || '')
    } catch (error) {
      console.error("❌ API Error:", error)
    } finally {
      console.log('✅ Setting loading to false')
      setIsLoading(false)
    }
  }

  // ✅ Fixed handleStudentClick function
  const handleStudentClick = (studentId: string) => {
    if (onStudentSelect) {
      const student = students.find(s => s.id === studentId)
      onStudentSelect(studentId, student?.name || 'Student')
    } else {
      alert(`Selected student: ${studentId}. Student marks functionality coming soon!`)
    }
  }

  console.log('🎯 Current state:', { isLoading, studentsCount: students.length })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2 bg-white w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Class {className} - Students
            </h1>
            <p className="text-gray-600 mt-1">
              Click on a student to view their marks
            </p>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Student Grid */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading students..." />
          </div>
        )}

        {!isLoading && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? "No students found" : "No Students Found"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms." : "This class doesn't have any students yet."}
            </p>
          </div>
        )}

        {!isLoading && filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md bg-white"
                onClick={() => handleStudentClick(student.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-blue-600 mb-1">
                    Roll No: {student.rollNo}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                    {student.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {!isLoading && filteredStudents.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {searchTerm ? (
                <>
                  Showing <span className="font-semibold">{filteredStudents.length}</span> of{" "}
                  <span className="font-semibold">{students.length}</span> students
                </>
              ) : (
                <>
                  Total Students: <span className="font-semibold">{students.length}</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
