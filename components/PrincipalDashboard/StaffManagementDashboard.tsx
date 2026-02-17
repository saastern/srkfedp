'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search,
    Users,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    BookOpen,
    Calendar,
    ChevronRight,
    Filter,
    CheckCircle,
    Clock,
    Briefcase
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ApiService from '@/services/api'

export default function StaffManagementDashboard({ onClose }: { onClose: () => void }) {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchStaff()
    }, [])

    const fetchStaff = async () => {
        try {
            setLoading(true)
            const res = await ApiService.getStaffList()
            if (res.success) {
                setStaff(res.staff)
            }
        } catch (err) {
            console.error('Failed to fetch staff:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.subjects.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        STAFF REGISTRY
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Sri Ravi Kiran School / Personnel Management / Faculty
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none border-gray-300 font-bold text-xs h-10" onClick={onClose}>
                        BACK TO DASHBOARD
                    </Button>
                    <Button className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm">
                        <UserPlus className="mr-2 h-4 w-4" /> ADD NEW STAFF
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="rounded-none shadow-none border-gray-200">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase">Total Faculty</div>
                        <div className="text-2xl font-black text-blue-600">{staff.length}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-none shadow-none border-gray-200">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase">Attendance Today</div>
                        <div className="text-2xl font-black text-emerald-600">100%</div>
                    </CardContent>
                </Card>
                <Card className="rounded-none shadow-none border-gray-200">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase">On Leave</div>
                        <div className="text-2xl font-black text-orange-600">0</div>
                    </CardContent>
                </Card>
                <Card className="rounded-none shadow-none border-gray-200">
                    <CardContent className="p-4">
                        <div className="text-[10px] font-black text-gray-400 uppercase">Open Positions</div>
                        <div className="text-2xl font-black text-gray-400">2</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, subject, or role..."
                        className="pl-10 rounded-none border-gray-200 h-10 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none border-gray-200 h-10 px-4 flex items-center gap-2 font-bold text-xs">
                        <Filter className="h-3 w-3" /> FILTERS
                    </Button>
                </div>
            </div>

            {/* Staff List Table */}
            <Card className="rounded-none shadow-sm border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Member Name</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Role / Position</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Department / Subjects</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4 h-16 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredStaff.length > 0 ? (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-gray-100 shadow-sm rounded-none">
                                                    <AvatarFallback className="rounded-none bg-blue-100 text-blue-700 font-black text-xs">
                                                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{member.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600">{member.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {member.subjects.split(',').map((subj: string, idx: number) => (
                                                    <span key={idx} className="bg-gray-100 text-gray-500 text-[9px] font-black px-1.5 py-0.5 uppercase">
                                                        {subj.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-gray-100">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-gray-100">
                                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-sm font-bold text-gray-400 uppercase italic">No staff members matching your search criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Footer Info */}
            <div className="bg-gray-50 p-4 border border-dashed border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                    <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> SYSTEM UPTIME: 14D 2H</div>
                    <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> PAYROLL STATUS: VERIFIED</div>
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase">
                    ERP PERSONNEL MODULE V1.2
                </div>
            </div>
        </div>
    )
}
