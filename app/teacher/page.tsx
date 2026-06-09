'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/dashboard'
import ClassSelection from '@/components/class-selection'
import AttendancePage from '@/components/attendance-page'
import { MarksClassDashboard } from '@/components/marks-class-dashboard'
import { MarksStudentList } from '@/components/marks-student-list'
import { MarksStudentMarks } from '@/components/marks-student-marks'
import { MarksEntryGrid } from '@/components/marks-entry-grid'
import ManageStudentsPage from '@/components/manage-students-page'
import ApiService from '@/services/api'

type PageView =
    | 'dashboard'
    | 'class-selection'
    | 'attendance'
    | 'manage-students'
    | 'marks-classes'
    | 'marks-students'
    | 'marks-student-details'
    | 'marks-entry-grid'

export default function TeacherPage() {
    const [teacher, setTeacher] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState<PageView>('dashboard')
    const [currentModule, setCurrentModule] = useState<'attendance' | 'marks' | null>(null)
    const [selectedClass, setSelectedClass] = useState<{ id: string; name: string } | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null)
    const router = useRouter()

    useEffect(() => {
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            router.push('/')
            return
        }

        const user = JSON.parse(userData)
        setTeacher(user)
        setLoading(false)
    }, [router])

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
            router.push('/')
        }
    }

    const handleModuleSelect = (module: "attendance" | "marks") => {
        setCurrentModule(module)
        if (module === "attendance") {
            setCurrentPage("class-selection")
        } else if (module === "marks") {
            setCurrentPage("marks-classes")
        }
    }

    const handleClassSelect = (classId: number, className: string) => {
        setSelectedClass({ id: classId.toString(), name: className })
        if (currentModule === "attendance") {
            setCurrentPage("attendance")
        } else if (currentModule === "marks") {
            setCurrentPage("marks-students")
        }
    }

    const handleBackToDashboard = () => {
        setCurrentPage("dashboard")
        setCurrentModule(null)
        setSelectedClass(null)
        setSelectedStudent(null)
    }

    const handleBackToClasses = () => {
        setCurrentPage("class-selection")
        setSelectedClass(null)
        setSelectedStudent(null)
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {currentPage === 'dashboard' && (
                <Dashboard
                    teacher={teacher}
                    onSelectModule={handleModuleSelect}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'class-selection' && teacher && (
                <ClassSelection
                    onClassSelect={handleClassSelect}
                    onManageStudents={(classId: number, className: string) => {
                        setSelectedClass({ id: classId.toString(), name: className })
                        setCurrentPage("manage-students")
                    }}
                    onLogout={handleLogout}
                    onBack={handleBackToDashboard}
                />
            )}

            {currentPage === 'manage-students' && teacher && selectedClass && (
                <ManageStudentsPage
                    className={selectedClass.name}
                    classId={Number(selectedClass.id)}
                    onBack={handleBackToClasses}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'attendance' && teacher && selectedClass && (
                <AttendancePage
                    className={selectedClass.name}
                    classId={selectedClass.id}
                    onBack={handleBackToClasses}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'marks-classes' && teacher && (
                <MarksClassDashboard
                    teacher={teacher}
                    onBack={handleBackToDashboard}
                    onLogout={handleLogout}
                    onClassSelect={(classId: string, className: string) => {
                        setSelectedClass({ id: classId, name: className })
                        setCurrentPage("marks-students")
                    }}
                />
            )}

            {currentPage === 'marks-students' && teacher && selectedClass && (
                <MarksStudentList
                    classId={selectedClass.id}
                    onBack={() => setCurrentPage("marks-classes")}
                    onLogout={handleLogout}
                    onStudentSelect={(studentId: string, studentName: string) => {
                        setSelectedStudent({ id: studentId, name: studentName })
                        setCurrentPage("marks-student-details")
                    }}
                    onEnterMarks={() => setCurrentPage("marks-entry-grid")}
                />
            )}

            {currentPage === 'marks-entry-grid' && teacher && selectedClass && (
                <MarksEntryGrid
                    classId={selectedClass.id}
                    className={selectedClass.name}
                    onBack={() => setCurrentPage("marks-students")}
                    onLogout={handleLogout}
                />
            )}

            {currentPage === 'marks-student-details' && teacher && selectedStudent && (
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
