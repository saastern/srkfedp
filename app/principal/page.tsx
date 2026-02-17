'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PrincipalDashboard from '@/components/PrincipalDashboard/PrincipalDashboard'
import ApiService from '@/services/api'

export default function PrincipalPage() {
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
        if (user.role !== 'principal') {
            router.push('/teacher')
            return
        }

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
        <PrincipalDashboard
            teacher={teacher}
            onLogout={handleLogout}
        />
    )
}
