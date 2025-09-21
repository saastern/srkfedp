"use client"

import { useState, useEffect } from "react"
import LoginPage from "@/components/login-page"
import Dashboard from "@/components/dashboard"
import ClassSelection from "@/components/class-selection"
import AttendancePage from "@/components/attendance-page"
import StudentList from "@/components/marks-student-list"
import ManageStudentsPage from "@/components/manage-students-page"
import { MarksClassDashboard } from "@/components/marks-class-dashboard" // ✅ Add this import
import ApiService from "@/services/api"

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
  const [currentPage, setCurrentPage] = useState<"login" | "dashboard" | "class-selection" | "attendance" | "manage-students" | "marks-classes" | "marks-students">("login")
  const [currentModule, setCurrentModule] = useState<"attendance" | "marks" | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is authenticated on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          // Verify token is still valid by making an API call
          const response = await ApiService.getProfile()
          
          // If profile call succeeds, user is authenticated
          const parsedUser = JSON.parse(userData)
          setTeacher(parsedUser)
          setCurrentPage("dashboard")
        } catch (error) {
          console.error('Token validation failed:', error)
          // Clear invalid token data
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
  }, [])

  // Handle successful login from LoginPage
  const handleLogin = (userData: Teacher) => {
    setTeacher(userData)
    setCurrentPage("dashboard")
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
    setSelectedClass({ id: classId, name: className })
    
    if (currentModule === "attendance") {
      setCurrentPage("attendance")
    } else if (currentModule === "marks") {
      // Handle marks class selection
      setCurrentPage("marks-students") // You may need to create this page/component
    }
  }

  // Handle class selection for managing students
  const handleManageStudents = (classId: number, className: string) => {
    setSelectedClass({ id: classId, name: className })
    setCurrentPage("manage-students")
  }

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setCurrentPage("dashboard")
    setCurrentModule(null)
    setSelectedClass(null)
  }

  // Handle back to class selection
  const handleBackToClasses = () => {
    setCurrentPage("class-selection")
    setSelectedClass(null)
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
      // Clear all stored data
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      
      // Reset state
      setTeacher(null)
      setSelectedClass(null)
      setCurrentModule(null)
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
          classId={selectedClass.id}
          onBack={handleBackToClasses} 
          onLogout={handleLogout} 
        />
      )}

      {currentPage === "manage-students" && teacher && selectedClass && (
        <ManageStudentsPage 
          className={selectedClass.name}
          classId={selectedClass.id}
          onBack={handleBackToClasses} 
          onLogout={handleLogout} 
        />
      )}

      {/* ✅ Fixed: Only one marks-classes block */}
      {currentPage === "marks-classes" && teacher && (
        <MarksClassDashboard
          teacher={teacher}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onClassSelect={(classId, className) => {
      // Convert string to number for selectedClass
            setSelectedClass({ id: parseInt(classId), name: className })
            setCurrentPage("marks-students")
          }}
        />
      )}
      
    </div>
  )
}
