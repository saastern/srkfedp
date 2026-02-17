"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import ClassSelection from "@/components/class-selection"
import AttendancePage from "@/components/attendance-page"
import { MarksStudentList } from "@/components/marks-student-list"
import ManageStudentsPage from "@/components/manage-students-page"
import { MarksClassDashboard } from "@/components/marks-class-dashboard"
import ApiService from "@/services/api"
import { MarksStudentMarks } from "@/components/marks-student-marks"
import FeeDashboard from "@/components/PrincipalDashboard/FeeDashboard"
import PrincipalDashboard from "@/components/PrincipalDashboard/PrincipalDashboard"
import { useRouter } from "next/navigation"


export type Student = {
  id: number
  name: string
  roll_number: string
  isPresent: boolean
}

export type Teacher = {
  id: number
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: string
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "dashboard" | "class-selection" | "attendance" | "manage-students" | "marks-classes" | "marks-students" | "principal" | "principal-fees" | "marks-student-details">("login")
  const [currentModule, setCurrentModule] = useState<"attendance" | "marks" | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [selectedClass, setSelectedClass] = useState<{ id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
  const router = useRouter()

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user_data')

      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          if (user.role === 'principal') {
            router.push('/principal')
          } else {
            router.push('/teacher')
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_data')
          setCurrentPage("login")
        }
      } else {
        setCurrentPage("login")
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [router])
  // Handle successful login from LoginPage
  const handleLogin = (userData: Teacher) => {
    setTeacher(userData)
    if (userData.role === 'principal') {
      router.push("/principal")
    } else {
      router.push("/teacher")
    }
  }



  // Handle module selection from dashboard
  const handleModuleSelect = (module: "attendance" | "marks") => {
    setCurrentModule(module)

    if (module === "attendance") {
      setCurrentPage("class-selection")
    } else if (module === "marks") {
      setCurrentPage("marks-classes")
    }
  }

  // Handle class selection for attendance
  const handleClassSelect = (classId: number, className: string) => {
    setSelectedClass({ id: classId.toString(), name: className })

    if (currentModule === "attendance") {
      setCurrentPage("attendance")
    } else if (currentModule === "marks") {
      setCurrentPage("marks-students")
    }
  }

  // Handle class selection for managing students
  const handleManageStudents = (classId: number, className: string) => {
    setSelectedClass({ id: classId.toString(), name: className })
    setCurrentPage("manage-students")
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
    setCurrentModule(null)
    setSelectedClass(null)
    setSelectedStudent(null)
  }

  // Handle back to class selection
  const handleBackToClasses = () => {
    setCurrentPage("class-selection")
    setSelectedClass(null)
    setSelectedStudent(null)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await ApiService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')

      setTeacher(null)
      setSelectedClass(null)
      setCurrentModule(null)
      setSelectedStudent(null)
      setCurrentPage("login")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {currentPage === "login" && (
        <LoginPage onLogin={handleLogin} />
      )}

      {currentPage === "dashboard" && teacher && (
        <Dashboard
          teacher={teacher}
          onSelectModule={handleModuleSelect}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "class-selection" && teacher && (
        <ClassSelection
          onClassSelect={handleClassSelect}
          onManageStudents={handleManageStudents}
          onLogout={handleLogout}
          onBack={handleBackToDashboard}
        />
      )}

      {currentPage === "attendance" && teacher && selectedClass && (
        <AttendancePage
          className={selectedClass.name}
          classId={(selectedClass.id)} // ✅ Fix: Convert back to number
          onBack={handleBackToClasses}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "principal" && teacher && teacher.role === 'principal' && (
        <PrincipalDashboard
          teacher={teacher}
          onLogout={handleLogout}
          onFeeDashboard={() => setCurrentPage("principal-fees")}
        />
      )}

      {currentPage === "principal-fees" && teacher && teacher.role === 'principal' && (
        <FeeDashboard
          teacher={teacher}
          onBack={() => setCurrentPage("principal")}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "manage-students" && teacher && selectedClass && (
        <ManageStudentsPage
          className={selectedClass.name}
          classId={parseInt(selectedClass.id)} // ✅ Fix: Convert back to number
          onBack={handleBackToClasses}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "marks-classes" && teacher && (
        <MarksClassDashboard
          teacher={teacher}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onClassSelect={(classId, className) => {
            setSelectedClass({ id: classId, name: className })
            setCurrentPage("marks-students")
          }}
        />
      )}

      {/* ✅ Marks Students List - KEEP ONLY THIS ONE */}
      {currentPage === "marks-students" && teacher && selectedClass && (
        <MarksStudentList
          classId={selectedClass.id}
          onBack={() => setCurrentPage("marks-classes")}
          onLogout={handleLogout}
          onStudentSelect={(studentId, studentName) => {
            setSelectedStudent({ id: studentId, name: studentName })
            setCurrentPage("marks-student-details")
          }}
        />
      )}

      {/* ✅ Individual Student Marks */}
      {currentPage === "marks-student-details" && teacher && selectedStudent && (
        <MarksStudentMarks
          studentId={selectedStudent.id}
          teacher={teacher}
          onBack={() => setCurrentPage("marks-students")}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
