"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, Download } from "lucide-react"
import type { Student } from "@/app/page"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api"

interface AttendancePageProps {
  className: string
  classId: number
  onBack: () => void
  onLogout: () => void
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const day = today.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function AttendancePage({ className, classId, onBack, onLogout }: AttendancePageProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false)
  const [selectedSession, setSelectedSession] = useState<"morning" | "afternoon">("morning")

  // Fetch real students from Django API
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Fetching students for classId:', classId)
      
      const response = await ApiService.getClassStudents(classId)
      console.log('📥 Students API response:', response)
      
      if (response.success && response.students) {
        const fetchedStudents: Student[] = response.students.map((student: any) => ({
          id: student.id,
          name: student.name,
          rollNumber: student.roll_number,
          isPresent: true, // Default to present
          fatherName: student.father_name || '',
          motherName: student.mother_name || '',
          parentPhone: student.parent_phone || student.mother_phone || student.father_phone || '',
          parentEmail: student.parent_email || '',
          address: student.address || '',
          gender: student.gender || '',
        }))
        
        setStudents(fetchedStudents)
        console.log('✅ Students loaded:', fetchedStudents.length)
      } else {
        throw new Error(response.message || 'Failed to fetch students')
      }
    } catch (error: any) {
      console.error('❌ Error fetching students:', error)
      setError(error.message || 'Failed to load students')
      
      toast({
        title: "Error Loading Students",
        description: error.message || 'Failed to load students for this class',
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [classId, toast])

  // Load attendance from database and fetch students
  useEffect(() => {
    const loadAttendanceAndStudents = async () => {
      // First, fetch real students from API
      await fetchStudents()
      
      // Then, check if attendance already exists in database
      try {
        const todayDate = getTodayDate()
        console.log('🔍 Checking existing attendance for:', todayDate, selectedSession)
        
        const attendanceResponse = await ApiService.getAttendance(classId, todayDate, selectedSession)
        console.log('📥 Existing attendance response:', attendanceResponse)
        
        if (attendanceResponse.success && attendanceResponse.attendance && Object.keys(attendanceResponse.attendance).length > 0) {
          // Update students with existing attendance data from database
          setStudents(prevStudents => 
            prevStudents.map(student => ({
              ...student,
              isPresent: attendanceResponse.attendance[student.id] !== undefined 
                ? attendanceResponse.attendance[student.id] 
                : true,
            }))
          )
          setAttendanceSubmitted(true)
          console.log('✅ Loaded existing attendance from database')
        } else {
          console.log('ℹ️ No existing attendance found, using defaults')
          setAttendanceSubmitted(false)
        }
      } catch (error) {
        console.log('ℹ️ No existing attendance found, using defaults:', error)
        setAttendanceSubmitted(false)
      }
      
      setIsEditMode(false)
    }

    loadAttendanceAndStudents()
  }, [className, selectedSession, fetchStudents, classId])

  const toggleAttendance = (studentId: number) => {
    setStudents((prev) => {
      const updatedStudents = prev.map((student) =>
        student.id === studentId ? { ...student, isPresent: !student.isPresent } : student,
      )
      return updatedStudents
    })
  }

  const handleSubmitAttendance = async () => {
    const absentCount = students.filter((student) => !student.isPresent).length
    
    try {
      const attendanceData = {
        class_id: classId,
        session: selectedSession,
        date: getTodayDate(),
        attendance: students.map(student => ({
          student_id: student.id,
          is_present: student.isPresent
        }))
      }
      
      console.log('📤 Submitting attendance:', attendanceData)
      
      const response = await ApiService.markAttendance(attendanceData)
      console.log('📥 Attendance submit response:', response)
      
      if (response.success) {
        setAttendanceSubmitted(true)
        setShowSuccessModal(true)

        toast({
          title: "Attendance Submitted",
          description: `Attendance saved successfully to database. ${absentCount > 0 ? `Absent SMS sent to ${absentCount} parents.` : 'All students present!'}`,
          duration: 3000,
        })
      } else {
        throw new Error(response.message || 'Failed to submit attendance')
      }
    } catch (error: any) {
      console.error('❌ Error submitting attendance:', error)
      toast({
        title: "Error Submitting Attendance",
        description: error.message || 'Failed to submit attendance to database',
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleEditAttendance = () => {
    setIsEditMode(true)
    setShowSuccessModal(false)
  }

  const handleSaveChanges = async () => {
    const absentCount = students.filter((student) => !student.isPresent).length
    
    try {
      const attendanceData = {
        class_id: classId,
        session: selectedSession,
        date: getTodayDate(),
        attendance: students.map(student => ({
          student_id: student.id,
          is_present: student.isPresent
        }))
      }
      
      console.log('📤 Updating attendance:', attendanceData)
      
      const response = await ApiService.markAttendance(attendanceData)
      console.log('📥 Attendance update response:', response)
      
      if (response.success) {
        setIsEditMode(false)

        toast({
          title: "Attendance Updated",
          description: `Changes saved successfully to database. ${absentCount > 0 ? `Absent SMS sent to ${absentCount} parents.` : 'All students present!'}`,
          duration: 3000,
        })
      } else {
        throw new Error(response.message || 'Failed to update attendance')
      }
    } catch (error: any) {
      console.error('❌ Error updating attendance:', error)
      toast({
        title: "Error Updating Attendance",
        description: error.message || 'Failed to update attendance in database',
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  // ENHANCED ABSENTEE REPORT WITH MORNING/AFTERNOON SECTIONS
  const handleDownloadAbsenteeReport = () => {
    const absentStudents = students.filter((student) => !student.isPresent)
    const presentStudents = students.filter((student) => student.isPresent)
    const todayDate = getTodayDate()

    if (students.length === 0) {
      toast({
        title: "No Data Available",
        description: "No student data available for this session.",
        duration: 3000,
      })
      return
    }

    // Create comprehensive report with sections
    const reportContent = []
    
    // Report Header
    reportContent.push(`SCHOOL ATTENDANCE REPORT`)
    reportContent.push(`===========================`)
    reportContent.push(`Class: ${className}`)
    reportContent.push(`Date: ${todayDate}`)
    reportContent.push(`Session: ${selectedSession.charAt(0).toUpperCase() + selectedSession.slice(1)}`)
    reportContent.push(`Total Students: ${students.length}`)
    reportContent.push(`Present: ${presentStudents.length}`)
    reportContent.push(`Absent: ${absentStudents.length}`)
    reportContent.push(`Attendance Rate: ${((presentStudents.length / students.length) * 100).toFixed(1)}%`)
    reportContent.push('')
    reportContent.push('')
    
    // Present Students Section
    reportContent.push('=== PRESENT STUDENTS ===')
    reportContent.push('Roll Number,Student Name,Father Name,Mother Name,Phone Number,Email,Address,Gender')
    
    presentStudents.forEach(student => {
      const row = [
        student.rollNumber,
        student.name,
        student.fatherName || "N/A",
        student.motherName || "N/A", 
        student.parentPhone || "N/A",
        student.parentEmail || "N/A",
        student.address || "N/A",
        student.gender || "N/A"
      ].map(field => `"${String(field).replace(/"/g, '""')}"`)
      
      reportContent.push(row.join(','))
    })
    
    reportContent.push('')
    reportContent.push('')
    
    // Absent Students Section
    reportContent.push('=== ABSENT STUDENTS ===')
    if (absentStudents.length === 0) {
      reportContent.push('No absent students - Perfect attendance!')
    } else {
      reportContent.push('Roll Number,Student Name,Father Name,Mother Name,Phone Number,Email,Address,Gender')
      
      absentStudents.forEach(student => {
        const row = [
          student.rollNumber,
          student.name,
          student.fatherName || "N/A",
          student.motherName || "N/A",
          student.parentPhone || "N/A", 
          student.parentEmail || "N/A",
          student.address || "N/A",
          student.gender || "N/A"
        ].map(field => `"${String(field).replace(/"/g, '""')}"`)
        
        reportContent.push(row.join(','))
      })
    }
    
    reportContent.push('')
    reportContent.push('')
    reportContent.push('=== SUMMARY BY SESSION ===')
    reportContent.push(`${selectedSession.charAt(0).toUpperCase() + selectedSession.slice(1)} Session Summary:`)
    reportContent.push(`- Total Students: ${students.length}`)
    reportContent.push(`- Present: ${presentStudents.length}`)
    reportContent.push(`- Absent: ${absentStudents.length}`)
    reportContent.push(`- Attendance Percentage: ${((presentStudents.length / students.length) * 100).toFixed(1)}%`)
    
    // Generate CSV
    const csvContent = reportContent.join('\n')
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${className}_${selectedSession}_comprehensive_attendance_report_${todayDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Comprehensive Report Downloaded",
      description: `Complete attendance report for ${selectedSession} session downloaded with both present and absent students.`,
      duration: 4000,
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading students...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchStudents}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{className}</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Mark attendance for today ({students.length} students)
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex items-center space-x-1 bg-transparent text-xs md:text-sm px-2 py-1 md:px-3 md:py-2"
          >
            <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Session Selection */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-3">Select Session</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setSelectedSession("morning")}
              className={`text-sm px-3 py-2 ${
                selectedSession === "morning"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              🌅 Morning
            </Button>
            <Button
              onClick={() => setSelectedSession("afternoon")}
              className={`text-sm px-3 py-2 ${
                selectedSession === "afternoon"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              🌇 Afternoon
            </Button>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c0-2.21-1.79-4-4-4H4V7zm0 0c0-2.21 1.79-4 4-4h8c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4"></path>
            </svg>
            <span className="text-blue-800 font-medium text-sm">
              {attendanceSubmitted ? 
                `✅ Attendance already recorded in database for ${selectedSession} session` : 
                `📝 Ready to record ${selectedSession} attendance to database`
              }
            </span>
          </div>
        </div>

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              <span className="text-yellow-800 font-medium">
                Edit Mode: Updating {selectedSession} attendance - Click on student circles to update
              </span>
            </div>
          </div>
        )}

        {/* Students Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          {students.map((student) => (
            <div key={student.id} className="flex flex-col items-center space-y-2">
              <button
                onClick={() => (attendanceSubmitted && !isEditMode ? null : toggleAttendance(student.id))}
                disabled={attendanceSubmitted && !isEditMode}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-200 transform shadow-lg ${
                  attendanceSubmitted && !isEditMode
                    ? "cursor-not-allowed opacity-75"
                    : "hover:scale-110 cursor-pointer"
                } ${student.isPresent ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
              >
                {student.rollNumber}
              </button>
              <div className="text-center w-24">
                <p className="text-xs font-medium text-gray-700 leading-tight break-words">{student.name}</p>
                <p className={`text-xs mt-1 font-semibold ${student.isPresent ? "text-green-600" : "text-red-600"}`}>
                  {student.isPresent ? "Present" : "Absent"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit/Edit/Download Button */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {!attendanceSubmitted ? (
            <Button
              onClick={handleSubmitAttendance}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              size="lg"
            >
              Submit Attendance to Database
            </Button>
          ) : isEditMode ? (
            <>
              <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 px-6 py-3" size="lg">
                Save Changes to Database
              </Button>
              <Button onClick={() => setIsEditMode(false)} variant="outline" className="px-6 py-3" size="lg">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleEditAttendance} variant="outline" className="px-6 py-3 bg-transparent" size="lg">
                Edit Attendance
              </Button>
              <Button
                onClick={handleDownloadAbsenteeReport}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 text-white"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Comprehensive Report
              </Button>
            </>
          )}
        </div>

        {/* Attendance Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{students.filter((s) => s.isPresent).length}</div>
              <div className="text-sm text-green-700">Present</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{students.filter((s) => !s.isPresent).length}</div>
              <div className="text-sm text-red-700">Absent</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-gray-700">
              Attendance Rate: {students.length > 0 ? ((students.filter((s) => s.isPresent).length / students.length) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Attendance Saved to Database!</h3>
                <p className="text-gray-600 mb-6">
                  {selectedSession.charAt(0).toUpperCase() + selectedSession.slice(1)} attendance for {className} has
                  been recorded in the database.
                  {students.filter((s) => !s.isPresent).length > 0 &&
                    ` SMS notifications sent to ${students.filter((s) => !s.isPresent).length} parents.`}
                </p>
                <div className="flex space-x-3">
                  <Button onClick={closeSuccessModal} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Done
                  </Button>
                  <Button onClick={handleEditAttendance} variant="outline" className="flex-1 bg-transparent">
                    Edit Attendance
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
