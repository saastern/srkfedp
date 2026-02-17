'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Megaphone, Send, Pin, Trash2, X, Users, Clock, MessageSquare, AlertCircle, Loader2
} from 'lucide-react'
import ApiService from '@/services/api'

const TARGET_OPTIONS = [
    { value: 'all', label: 'All Staff' },
    { value: 'teachers', label: 'Teachers Only' },
    { value: 'students', label: 'Students Only' },
]

export default function AnnouncementsDashboard({ onClose }: { onClose: () => void }) {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCompose, setShowCompose] = useState(false)
    const [composeData, setComposeData] = useState({ title: '', message: '', target_role: 'all', is_pinned: false })
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchAnnouncements() }, [])

    const fetchAnnouncements = async () => {
        try {
            setLoading(true)
            const res = await ApiService.getAnnouncements()
            if (res.success) setAnnouncements(res.announcements)
        } catch (err) {
            console.error('Failed to fetch announcements:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!composeData.title.trim() || !composeData.message.trim()) {
            setError('Title and message are required')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const res = await ApiService.createAnnouncement(composeData)
            if (res.success) {
                await fetchAnnouncements()
                setShowCompose(false)
                setComposeData({ title: '', message: '', target_role: 'all', is_pinned: false })
            }
        } catch (err: any) {
            setError(err.message || 'Failed to send announcement')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this announcement?')) return
        try {
            await ApiService.deleteAnnouncement(id)
            await fetchAnnouncements()
        } catch (err) {
            alert('Failed to delete announcement')
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Megaphone className="h-6 w-6 text-blue-600" />
                        ANNOUNCEMENTS
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Communication Hub / Broadcast Messages
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-none border-gray-300 font-bold text-xs h-10" onClick={onClose}>
                        BACK TO DASHBOARD
                    </Button>
                    <Button
                        className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm"
                        onClick={() => { setShowCompose(true); setError('') }}
                    >
                        <Send className="mr-2 h-4 w-4" /> NEW ANNOUNCEMENT
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 p-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase">Total Announcements</div>
                    <div className="text-2xl font-black text-blue-600">{announcements.length}</div>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase">Pinned</div>
                    <div className="text-2xl font-black text-orange-600">{announcements.filter(a => a.is_pinned).length}</div>
                </div>
                <div className="bg-white border border-gray-200 p-4">
                    <div className="text-[10px] font-black text-gray-400 uppercase">This Month</div>
                    <div className="text-2xl font-black text-emerald-600">
                        {announcements.filter(a => {
                            const d = new Date(a.created_at)
                            const now = new Date()
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                        }).length}
                    </div>
                </div>
            </div>

            {/* Compose Form */}
            {showCompose && (
                <div className="bg-white border-2 border-blue-600 p-6 shadow-lg animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-black text-sm uppercase text-gray-900 flex items-center gap-2">
                            <Send className="h-4 w-4 text-blue-600" /> Compose Announcement
                        </h3>
                        <button onClick={() => { setShowCompose(false); setError('') }} className="text-gray-400 hover:text-black">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-600 text-xs font-bold mb-3 bg-red-50 p-2 border border-red-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Title *</label>
                            <input
                                required
                                className="w-full border border-gray-300 p-3 text-sm font-bold focus:border-blue-500 outline-none"
                                placeholder="Announcement title..."
                                value={composeData.title}
                                onChange={e => setComposeData({ ...composeData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Message *</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full border border-gray-300 p-3 text-sm font-medium focus:border-blue-500 outline-none resize-none"
                                placeholder="Type your message here..."
                                value={composeData.message}
                                onChange={e => setComposeData({ ...composeData, message: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Target Audience</label>
                                <div className="flex gap-2">
                                    {TARGET_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setComposeData({ ...composeData, target_role: opt.value })}
                                            className={`px-4 py-2 text-[10px] font-black uppercase border-2 transition-all ${composeData.target_role === opt.value
                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                    : 'border-gray-200 bg-white text-gray-400 hover:border-blue-200'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={composeData.is_pinned}
                                    onChange={e => setComposeData({ ...composeData, is_pinned: e.target.checked })}
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                                    <Pin className="h-3 w-3" /> Pin this announcement
                                </span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" className="rounded-none border-gray-300 font-bold text-xs" onClick={() => setShowCompose(false)}>
                                CANCEL
                            </Button>
                            <Button type="submit" className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black" disabled={submitting}>
                                {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> SENDING...</> : 'SEND ANNOUNCEMENT'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Announcements List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-gray-200 p-6 animate-pulse h-24" />
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-16 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase">No announcements yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click "New Announcement" to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((a: any) => (
                        <div
                            key={a.id}
                            className={`bg-white border p-5 transition-all hover:shadow-sm ${a.is_pinned ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {a.is_pinned && <Pin className="h-3 w-3 text-orange-500" />}
                                        <h4 className="font-black text-sm text-gray-900 uppercase">{a.title}</h4>
                                        <span className={`text-[8px] font-black px-1.5 py-0.5 uppercase ${a.target_role === 'all' ? 'bg-blue-100 text-blue-600'
                                                : a.target_role === 'teachers' ? 'bg-emerald-100 text-emerald-600'
                                                    : 'bg-purple-100 text-purple-600'
                                            }`}>
                                            {a.target_role === 'all' ? 'ALL' : a.target_role.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{a.message}</p>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-gray-400">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {a.created_by}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.created_at}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
