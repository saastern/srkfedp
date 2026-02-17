'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Search, Users, UserPlus, MoreVertical, Mail, Phone, BookOpen, Calendar,
    ChevronRight, Filter, CheckCircle, Clock, Briefcase, Trash2, Edit, X, Save, Eye, EyeOff
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ApiService from '@/services/api'

export default function StaffManagementDashboard({ onClose }: { onClose: () => void }) {
    const [staff, setStaff] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [addForm, setAddForm] = useState({ username: '', password: '', first_name: '', last_name: '', email: '', subjects: '' })
    const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', subjects: '', password: '' })
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => { fetchStaff() }, [])

    const fetchStaff = async () => {
        try {
            setLoading(true)
            const res = await ApiService.getStaffList()
            if (res.success) setStaff(res.staff)
        } catch (err) {
            console.error('Failed to fetch staff:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormLoading(true)
        setFormError('')
        try {
            const res = await ApiService.addStaff(addForm)
            if (res.success) {
                await fetchStaff()
                setShowAddModal(false)
                setAddForm({ username: '', password: '', first_name: '', last_name: '', email: '', subjects: '' })
            } else {
                setFormError(res.error || 'Failed to add staff')
            }
        } catch (err: any) {
            setFormError(err.message || 'Failed to add staff')
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditStaff = async (staffId: number) => {
        setFormLoading(true)
        setFormError('')
        try {
            const res = await ApiService.updateStaff(staffId, editForm)
            if (res.success) {
                await fetchStaff()
                setEditingId(null)
            } else {
                setFormError(res.error || 'Failed to update')
            }
        } catch (err: any) {
            setFormError(err.message || 'Update failed')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteStaff = async (staffId: number, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}? This will delete their account permanently.`)) return
        try {
            const res = await ApiService.deleteStaff(staffId)
            if (res.success) await fetchStaff()
        } catch (err) {
            alert('Failed to delete staff member')
        }
    }

    const startEdit = (member: any) => {
        setEditingId(member.id)
        setEditForm({
            first_name: member.name.split(' ')[0] || '',
            last_name: member.name.split(' ').slice(1).join(' ') || '',
            email: member.email,
            subjects: member.subjects,
            password: ''
        })
        setFormError('')
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
                    <Button
                        className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm"
                        onClick={() => { setShowAddModal(true); setFormError('') }}
                    >
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
                        <div className="text-[10px] font-black text-gray-400 uppercase">Active Staff</div>
                        <div className="text-2xl font-black text-emerald-600">{staff.filter(s => s.is_active !== false).length}</div>
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

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="bg-white border-2 border-blue-600 p-6 shadow-lg animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-sm uppercase text-gray-900 flex items-center gap-2">
                            <UserPlus className="h-4 w-4 text-blue-600" /> Add New Staff Member
                        </h3>
                        <button onClick={() => { setShowAddModal(false); setFormError('') }} className="text-gray-400 hover:text-black">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {formError && <div className="text-red-600 text-xs font-bold mb-3 bg-red-50 p-2 border border-red-200">{formError}</div>}
                    <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Username *</label>
                            <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" placeholder="e.g. ramesh_teacher" value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Password *</label>
                            <div className="relative">
                                <input required type={showPassword ? 'text' : 'password'} className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none pr-10" placeholder="Strong password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Email</label>
                            <input type="email" className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" placeholder="teacher@school.com" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">First Name *</label>
                            <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.first_name} onChange={e => setAddForm({ ...addForm, first_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Last Name *</label>
                            <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.last_name} onChange={e => setAddForm({ ...addForm, last_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Subjects (comma-separated)</label>
                            <input className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Math, Science" value={addForm.subjects} onChange={e => setAddForm({ ...addForm, subjects: e.target.value })} />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2 mt-2">
                            <Button type="button" variant="outline" className="rounded-none border-gray-300 font-bold text-xs" onClick={() => setShowAddModal(false)}>CANCEL</Button>
                            <Button type="submit" className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black" disabled={formLoading}>
                                {formLoading ? 'ADDING...' : 'CREATE STAFF ACCOUNT'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

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
            </div>

            {/* Staff List Table */}
            <Card className="rounded-none shadow-sm border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Member Name</th>
                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Username</th>
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
                                            {editingId === member.id ? (
                                                <div className="flex gap-2">
                                                    <input className="border border-blue-400 p-1 text-sm font-bold w-24" value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} placeholder="First" />
                                                    <input className="border border-blue-400 p-1 text-sm font-bold w-24" value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} placeholder="Last" />
                                                </div>
                                            ) : (
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
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1">{member.username}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === member.id ? (
                                                <input className="border border-blue-400 p-1 text-sm font-bold w-48" value={editForm.subjects} onChange={e => setEditForm({ ...editForm, subjects: e.target.value })} placeholder="Math, Science" />
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {member.subjects.split(',').map((subj: string, idx: number) => (
                                                        <span key={idx} className="bg-gray-100 text-gray-500 text-[9px] font-black px-1.5 py-0.5 uppercase">
                                                            {subj.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === member.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input type="password" className="border border-blue-400 p-1 text-sm w-28" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="New password" />
                                                    <Button size="sm" className="rounded-none bg-emerald-600 hover:bg-emerald-700 h-8 px-3" onClick={() => handleEditStaff(member.id)} disabled={formLoading}>
                                                        <Save className="h-3 w-3 mr-1" /> SAVE
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="rounded-none h-8 px-3" onClick={() => setEditingId(null)}>
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-blue-50" onClick={() => startEdit(member)} title="Edit">
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none hover:bg-red-50" onClick={() => handleDeleteStaff(member.id, member.name)} title="Delete">
                                                        <Trash2 className="h-4 w-4 text-red-400" />
                                                    </Button>
                                                </div>
                                            )}
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
                    ERP PERSONNEL MODULE V2.0
                </div>
            </div>
        </div>
    )
}
