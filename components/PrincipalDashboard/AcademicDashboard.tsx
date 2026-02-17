'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Trophy, BookOpen, Clipboard, CheckCircle2,
    ChevronRight, Calendar, Users, Award,
    BarChart3, Save, ArrowLeft
} from 'lucide-react'
import ApiService from '@/services/api'

export default function AcademicDashboard({ onClose }: { onClose: () => void }) {
    const [view, setView] = useState<'exams' | 'marks' | 'results'>('exams')
    const [loading, setLoading] = useState(true)
    const [exams, setExams] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [selectedExam, setSelectedExam] = useState<any>(null)
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [marksData, setMarksData] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])

    useEffect(() => {
        fetchExams()
        fetchClasses()
    }, [])

    const fetchExams = async () => {
        try {
            const res = await ApiService.getExams()
            setExams(res.exams || [])
        } catch (err) {
            console.error('Exams fetch failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchClasses = async () => {
        try {
            const res = await ApiService.getMarksClasses()
            setClasses(res.classes || [])
        } catch (err) {
            console.error('Classes fetch failed:', err)
        }
    }

    const handleStartMarksEntry = async (exam: any, cls: any) => {
        setSelectedExam(exam)
        setSelectedClass(cls)
        setLoading(true)
        try {
            // 1. Fetch Students
            const studentsRes = await ApiService.getMarksStudents(cls.id)
            // 2. Fetch Subjects
            const subjectsRes = await ApiService.getClassSubjects(cls.id)
            setSubjects(subjectsRes.subjects || [])

            // Initialize marks grid
            const students = studentsRes.students || []
            setMarksData(students.map((s: any) => ({
                id: s.id,
                name: s.name,
                rollNo: s.rollNo,
                marks: subjectsRes.subjects.reduce((acc: any, sub: any) => ({ ...acc, [sub.id]: '' }), {})
            })))

            setView('marks')
        } catch (err) {
            console.error('Entry setup failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewResults = async (exam: any, cls: any) => {
        setSelectedExam(exam)
        setSelectedClass(cls)
        setLoading(true)
        try {
            const res = await ApiService.request(`/api/assessments/class-results/?class_id=${cls.id}&exam_id=${exam.id}`)
            setMarksData(res.results || [])
            setView('results')
        } catch (err) {
            console.error('Results fetch failed:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveMarks = async () => {
        setLoading(true)
        try {
            const payload = {
                exam_id: selectedExam.id,
                class_id: selectedClass.id,
                marks: marksData.reduce((acc: any, student: any) => {
                    acc[student.id] = student.marks
                    return acc
                }, {})
            }
            const res = await ApiService.request('/api/assessments/save-sheet/', {
                method: 'POST',
                body: JSON.stringify(payload)
            })
            if (res.success) {
                alert('Marks saved and results generated!')
                setView('exams')
            }
        } catch (err) {
            console.error('Save failed:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && view !== 'marks') return (
        <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <div className="grid grid-cols-3 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-900 px-6 py-4 flex justify-between items-center shadow-lg border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase">Academic & Assessments</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Exam Cycle Manager v2.0</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {['exams', 'results'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setView(t as any)}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${view === t ? 'bg-amber-400 text-black' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto">
                {view === 'exams' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {exams.map((exam) => (
                                <Card key={exam.id} className="border-2 border-gray-100 shadow-sm hover:border-amber-400 transition-all group overflow-hidden">
                                    <div className="bg-gray-50 h-2 w-full" />
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                                                <Trophy className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-gray-400 border-gray-200">
                                                {exam.term || 'Annual'}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-lg font-black mt-4 uppercase tracking-tight">{exam.name}</CardTitle>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            {exam.start_date || 'TBD'} - {exam.end_date || 'TBD'}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="bg-gray-50 p-3 rounded space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 uppercase">Input Marks</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {classes.map(cls => (
                                                        <button
                                                            key={cls.id}
                                                            onClick={() => handleStartMarksEntry(exam, cls)}
                                                            className="bg-white border border-gray-200 py-1 text-[9px] font-black text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all uppercase"
                                                        >
                                                            {cls.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t border-gray-200">
                                                <label className="text-[9px] font-black text-amber-600 uppercase">View Results</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {classes.map(cls => (
                                                        <button
                                                            key={cls.id}
                                                            onClick={() => handleViewResults(exam, cls)}
                                                            className="bg-amber-50 border border-amber-200 py-1 text-[9px] font-black text-amber-700 hover:bg-amber-100 transition-all uppercase"
                                                        >
                                                            {cls.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'marks' && (
                    <div className="space-y-6">
                        <div className="bg-gray-100 p-6 border-l-4 border-amber-400 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{selectedExam?.name}</h2>
                                <p className="text-[10px] font-black text-gray-500 uppercase">Class: {selectedClass?.name} • Marks Entry Sheet</p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => setView('exams')} className="rounded-none border-2 font-black uppercase text-xs">Cancel</Button>
                                <Button onClick={handleSaveMarks} className="rounded-none bg-emerald-600 hover:bg-emerald-700 font-black uppercase text-xs flex gap-2">
                                    <Save className="w-4 h-4" /> Save & Finalize
                                </Button>
                            </div>
                        </div>

                        <div className="border border-gray-200 bg-white overflow-x-auto shadow-2xl">
                            <table className="w-full text-left">
                                <thead className="bg-gray-900 text-white">
                                    <tr>
                                        <th className="px-4 py-4 text-[10px] font-black uppercase sticky left-0 bg-gray-900 z-10 w-48">Student Info</th>
                                        {subjects.map(sub => (
                                            <th key={sub.id} className="px-4 py-4 text-[10px] font-black uppercase text-center min-w-[100px] border-l border-gray-800">
                                                {sub.name}
                                                <div className="text-[8px] text-gray-500 mt-1">MAX: {sub.max_marks || 100}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {marksData.map((student, sIdx) => (
                                        <tr key={student.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-4 py-3 sticky left-0 bg-white border-r border-gray-100 shadow-sm z-10">
                                                <div className="text-[11px] font-black text-gray-900 uppercase">{student.name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase">Roll: {student.rollNo}</div>
                                            </td>
                                            {subjects.map(sub => (
                                                <td key={sub.id} className="px-2 py-2 border-l border-gray-100">
                                                    <input
                                                        type="number"
                                                        value={student.marks[sub.id]}
                                                        onChange={(e) => {
                                                            const newMarks = [...marksData]
                                                            newMarks[sIdx].marks[sub.id] = e.target.value
                                                            setMarksData(newMarks)
                                                        }}
                                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-400 focus:bg-white p-2 text-center text-sm font-black transition-all outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {view === 'results' && (
                    <div className="space-y-6">
                        <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Result Sheet: {selectedExam?.name}</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Class: {selectedClass?.name}</p>
                            </div>
                            <Button onClick={() => setView('exams')} variant="outline" className="border-gray-700 text-white hover:bg-white hover:text-black rounded-none uppercase font-black text-xs">Close</Button>
                        </div>

                        <div className="bg-white border-2 border-gray-900 shadow-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b-2 border-gray-900">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase">Rank / Student</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Score</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Percentage</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {marksData.sort((a, b) => b.percentage - a.percentage).map((student, idx) => (
                                        <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black text-gray-300 w-8">#{idx + 1}</span>
                                                    <div>
                                                        <div className="text-[11px] font-black text-gray-900 uppercase">{student.studentName}</div>
                                                        <div className="text-[9px] font-bold text-gray-400 uppercase">Roll: {student.rollNo}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-black text-gray-900">{student.totalObtained} / {student.totalMax}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-block px-3 py-1 bg-gray-900 text-white font-black text-xs italic">
                                                    {student.percentage}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.percentage >= 33 ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black uppercase text-[8px]">PROMOTED</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200 font-black uppercase text-[8px]">DETAINED</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
