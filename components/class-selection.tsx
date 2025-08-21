"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, Download, Loader2 } from "lucide-react"
import ApiService from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface Class {
  id: number
  name: string
  student_count: number
}

interface TeacherData {
  id: number
  full_name: string
  all_classes: Class[]
}

interface ClassSelectionProps {
  onClassSelect: (classId: number, className: string) => void
  onManageStudents: (classId: number, className: string) => void
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

export default function ClassSelection({ onClassSelect, onManageStudents, onLogout }: ClassSelectionProps) {
  const { toast } = useToast()
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadingReport, setDownloadingReport] = useState(false)

  // Fetch teacher dashboard data on component mount
  useEffect(() => {
    const fetchTeacherDashboard = async () => {
      try {
        setLoading(true)
        const response = await ApiService.getTeacherDashboard()
        
        if (response.success) {
          setTeacherData(response.teacher)
        } else {
          setError(response.message || 'Failed to load dashboard')
        }
      } catch (error: any) {
        console.error('Dashboard fetch error:', error)
        setError(error.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherDashboard()
  }, [])

  // ENHANCED ALL ABSENTEE REPORT WITH MORNING/AFTERNOON SECTIONS
  const handleDownloadAllAbsenteeReport = async () => {
    setDownloadingReport(true)
    
    try {
      const todayDate = getTodayDate()
      
      // Get attendance report for both sessions
      console.log('📤 Fetching morning attendance report...')
      const morningReportPromise = ApiService.getAttendanceReport(todayDate, 'morning')
      
      console.log('📤 Fetching afternoon attendance report...')
      const afternoonReportPromise = ApiService.getAttendanceReport(todayDate, 'afternoon')
      
      const [morningResponse, afternoonResponse] = await Promise.all([
        morningReportPromise.catch(err => ({ success: false, error: err.message })),
        afternoonReportPromise.catch(err => ({ success: false, error: err.message }))
      ])
      
      console.log('📥 Morning report response:', morningResponse)
      console.log('📥 Afternoon report response:', afternoonResponse)
      
      // Create comprehensive report
      const reportContent = []
      
      // Report Header
      reportContent.push(`COMPREHENSIVE SCHOOL ATTENDANCE REPORT`)
      reportContent.push(`==========================================`)
      reportContent.push(`Date: ${todayDate}`)
      reportContent.push(`Generated: ${new Date().toLocaleString()}`)
      reportContent.push('')
      reportContent.push('')
      
      // Morning Session Section
      reportContent.push('=== MORNING SESSION REPORT ===')
      if (morningResponse.success && morningResponse.data) {
        reportContent.push(`Total Classes: ${morningResponse.data.total_classes || 0}`)
        reportContent.push(`Total Students: ${morningResponse.data.total_students || 0}`)
        reportContent.push(`Total Present: ${morningResponse.data.total_present || 0}`)
        reportContent.push(`Total Absent: ${morningResponse.data.total_absent || 0}`)
        reportContent.push(`Overall Attendance Rate: ${morningResponse.data.overall_attendance_rate || '0'}%`)
        reportContent.push('')
        
        if (morningResponse.data.classes && morningResponse.data.classes.length > 0) {
          reportContent.push('Class,Total Students,Present,Absent,Attendance Rate')
          morningResponse.data.classes.forEach((classData: any) => {
            reportContent.push(`${classData.name},${classData.total_students},${classData.present_count},${classData.absent_count},${classData.attendance_rate}%`)
          })
        } else {
          reportContent.push('No morning attendance data recorded yet.')
        }
      } else {
        reportContent.push('No morning attendance data available.')
        reportContent.push('Error: ' + (morningResponse.error || 'Unknown error'))
      }
      
      reportContent.push('')
      reportContent.push('')
      
      // Afternoon Session Section
      reportContent.push('=== AFTERNOON SESSION REPORT ===')
      if (afternoonResponse.success && afternoonResponse.data) {
        reportContent.push(`Total Classes: ${afternoonResponse.data.total_classes || 0}`)
        reportContent.push(`Total Students: ${afternoonResponse.data.total_students || 0}`)
        reportContent.push(`Total Present: ${afternoonResponse.data.total_present || 0}`)
        reportContent.push(`Total Absent: ${afternoonResponse.data.total_absent || 0}`)
        reportContent.push(`Overall Attendance Rate: ${afternoonResponse.data.overall_attendance_rate || '0'}%`)
        reportContent.push('')
        
        if (afternoonResponse.data.classes && afternoonResponse.data.classes.length > 0) {
          reportContent.push('Class,Total Students,Present,Absent,Attendance Rate')
          afternoonResponse.data.classes.forEach((classData: any) => {
            reportContent.push(`${classData.name},${classData.total_students},${classData.present_count},${classData.absent_count},${classData.attendance_rate}%`)
          })
        } else {
          reportContent.push('No afternoon attendance data recorded yet.')
        }
      } else {
        reportContent.push('No afternoon attendance data available.')
        reportContent.push('Error: ' + (afternoonResponse.error || 'Unknown error'))
      }
      
      reportContent.push('')
      reportContent.push('')
      
      // Combined Summary
      reportContent.push('=== DAILY SUMMARY ===')
      const morningTotal = morningResponse.success ? (morningResponse.data?.total_students || 0) : 0
      const afternoonTotal = afternoonResponse.success ? (afternoonResponse.data?.total_students || 0) : 0
      const morningPresent = morningResponse.success ? (morningResponse.data?.total_present || 0) : 0
      const afternoonPresent = afternoonResponse.success ? (afternoonResponse.data?.total_present || 0) : 0
      const morningAbsent = morningResponse.success ? (morningResponse.data?.total_absent || 0) : 0
      const afternoonAbsent = afternoonResponse.success ? (afternoonResponse.data?.total_absent || 0) : 0
      
      reportContent.push(`Morning Session - Students: ${morningTotal}, Present: ${morningPresent}, Absent: ${morningAbsent}`)
      reportContent.push(`Afternoon Session - Students: ${afternoonTotal}, Present: ${afternoonPresent}, Absent: ${afternoonAbsent}`)
      
      if (teacherData?.all_classes) {
        reportContent.push('')
        reportContent.push('Available Classes:')
        teacherData.all_classes.forEach(cls => {
          reportContent.push(`- ${cls.name} (${cls.student_count} students)`)
        })
      }
      
      // Generate CSV
      const csvContent = reportContent.join('\n')
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `School_Comprehensive_Attendance_Report_${todayDate}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Comprehensive Report Downloaded",
        description: `Complete attendance report for both morning and afternoon sessions has been downloaded.`,
        duration: 4000,
      })
      
    } catch (error: any) {
      console.error('❌ Error downloading report:', error)
      toast({
        title: "Error Downloading Report",
        description: error.message || 'Failed to generate attendance report. Some data may not be available yet.',
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDownloadingReport(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // No teacher data
  if (!teacherData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No teacher data found</p>
          <Button onClick={onLogout} className="mt-4">Logout</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {/* School Logo */}
            <img
              src="/images/sri-ravi-kiran-school-logo.jpeg"
              alt="Sri Ravi Kiran School Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {teacherData.full_name}
              </h1>
              <p className="text-gray-600">
                Select any class to take attendance or manage students
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              onClick={handleDownloadAllAbsenteeReport}
              disabled={downloadingReport}
              className="flex items-center space-x-2 bg-purple-600 text-white hover:bg-purple-700 px-3 py-2 text-sm sm:text-base"
            >
              {downloadingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Generating Report...</span>
                  <span className="inline sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">All Attendance Report</span>
                  <span className="inline sm:hidden">Full Report</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex items-center space-x-2 bg-transparent px-3 py-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Today's Date Info */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-blue-800 font-medium">
              📅 Today: {getTodayDate()} - Attendance data is automatically saved to database
            </span>
          </div>
        </div>

        {/* Classes Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Total classes available: {teacherData.all_classes.length}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            You can take attendance for any class as needed. Data is automatically saved to the database.
          </p>
        </div>

        {/* No Classes Available */}
        {teacherData.all_classes.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 inline-block">
              <p>No classes have been created yet.</p>
              <p className="text-sm mt-1">Please contact the administrator to create classes.</p>
            </div>
          </div>
        )}

        {/* Class Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherData.all_classes.map((classData) => (
            <Card key={classData.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">
                    {classData.name.length <= 3 ? classData.name : classData.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Class {classData.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {classData.student_count} students
                </p>

                <div className="space-y-2">
                  <Button 
                    onClick={() => onClassSelect(classData.id, classData.name)} 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Take Attendance
                  </Button>
                  <Button 
                    onClick={() => onManageStudents(classData.id, classData.name)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Manage Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
