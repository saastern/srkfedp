'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '@/components/dashboard'
import ApiService from '@/services/api'

export default function TeacherPage() {
    const [teacher, setTeacher] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const userData = localStorage.getItem('user_data')
        if (!userData) {
            router.push('/')
            return
        }

        const user = JSON.parse(userData)
        // Teachers and Principals can both access teacher tools sometimes, 
        // but here we check for teacher specific role if needed.
        // However, usually "teacher" is the default dashboard.

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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <Dashboard
            teacher={teacher}
            onSelectModule={(module) => {
                // Handle module selection logic if needed, 
                // or redirect to module specific pages
                console.log('Selected module:', module)
            }}
            onLogout={handleLogout}
        />
    )
}
