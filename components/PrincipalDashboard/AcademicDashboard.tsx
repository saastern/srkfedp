'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    BookOpen, ChevronDown, ChevronRight, FileText, ClipboardList, Award, ArrowLeft,
    Users, PenTool, BarChart3, Loader2
} from 'lucide-react'
import ApiService from '@/services/api'

// Custom class ordering
function getClassOrder(name: string): number {
    const lower = name.toLowerCase().trim()
    if (lower.includes('nursery')) return 1
    if (lower === 'lkg' || lower.includes('lower kg') || lower.includes('l.k.g')) return 2
    if (lower === 'ukg' || lower.includes('upper kg') || lower.includes('u.k.g')) return 3
    const match = lower.match(/(\d+)/)
    if (match) return 10 + parseInt(match[1])
    return 100
}

interface ExamSection {
    label: string
    key: string
    icon: React.ReactNode
    color: string
    bgColor: string
    borderColor: string
    items: { label: string; key: string }[]
}

const EXAM_STRUCTURE: ExamSection[] = [
    {
        label: 'Formative Assessment',
        key: 'FA',
        icon: <PenTool className="h-5 w-5" />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        items: [
            { label: 'FA-1 (Unit Test 1)', key: 'FA1' },
            { label: 'FA-2 (Unit Test 2)', key: 'FA2' },
            { label: 'FA-3 (Unit Test 3)', key: 'FA3' },
            { label: 'FA-4 (Unit Test 4)', key: 'FA4' },
        ]
    },
    {
        label: 'Summative Assessment',
        key: 'SA',
        icon: <Award className="h-5 w-5" />,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        items: [
            { label: 'SA-1 (Half Yearly)', key: 'SA1' },
            { label: 'SA-2 (Annual Exam)', key: 'SA2' },
        ]
    },
    {
        label: 'Assignments & Projects',
        key: 'ASSIGN',
        icon: <ClipboardList className="h-5 w-5" />,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        items: [
            { label: 'Assignment 1', key: 'ASSIGN1' },
            { label: 'Assignment 2', key: 'ASSIGN2' },
            { label: 'Project Work', key: 'PROJECT' },
        ]
    }
]

export default function AcademicDashboard({ onClose }: any) {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ FA: true })
    const [classes, setClasses] = useState<any[]>([])
    const [selectedExam, setSelectedExam] = useState<string | null>(null)
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [marks, setMarks] = useState<Record<string, Record<string, string>>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [mode, setMode] = useState<'browse' | 'marks' | 'results'>('browse')
    const [actionType, setActionType] = useState<'input' | 'view'>('input')

    useEffect(() => {
        fetchClasses()
    }, [])

    const fetchClasses = async () => {
        try {
            const res = await ApiService.getMarksClasses()
            if (res.classes) {
                const sorted = [...res.classes].sort((a: any, b: any) => getClassOrder(a.name) - getClassOrder(b.name))
                setClasses(sorted)
            }
        } catch (err) {
            console.error('Failed to fetch classes:', err)
        }
    }

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const handleExamAction = (examKey: string, action: 'input' | 'view') => {
        setSelectedExam(examKey)
        setActionType(action)
        setMode('marks')
        setSelectedClass(null)
        setStudents([])
        setSubjects([])
        setMarks({})
    }

    const handleClassSelect = async (cls: any) => {
        setSelectedClass(cls)
        setLoading(true)
        try {
            const [studentsRes, subjectsRes] = await Promise.all([
                ApiService.getMarksStudents(cls.id),
                ApiService.getClassSubjects(cls.id)
            ])
            if (studentsRes.students) setStudents(studentsRes.students)
            if (subjectsRes.subjects) setSubjects(subjectsRes.subjects)

            // Initialize empty marks grid
            const initMarks: Record<string, Record<string, string>> = {}
            studentsRes.students?.forEach((s: any) => {
                initMarks[s.id] = {}
                subjectsRes.subjects?.forEach((subj: any) => {
                    initMarks[s.id][subj.id] = ''
                })
            })
            setMarks(initMarks)
        } catch (err) {
            console.error('Failed to fetch students/subjects:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subjectId]: value
            }
        }))
    }

    const handleSaveMarks = async () => {
        if (!selectedExam || !selectedClass) return
        setSaving(true)
        try {
            const bulkData = {
                exam_type: selectedExam,
                class_id: selectedClass.id,
                marks: Object.entries(marks).flatMap(([studentId, subjMarks]) =>
                    Object.entries(subjMarks)
                        .filter(([, value]) => value !== '')
                        .map(([subjectId, value]) => ({
                            student_id: studentId,
                            subject_id: subjectId,
                            marks_obtained: parseFloat(value)
                        }))
                )
            }
            await ApiService.saveBulkMarks(bulkData)
            alert('Marks saved successfully!')
        } catch (err) {
            console.error('Failed to save marks:', err)
            alert('Failed to save marks. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleBack = () => {
        if (selectedClass) {
            setSelectedClass(null)
            setStudents([])
            setSubjects([])
            setMarks({})
        } else if (mode !== 'browse') {
            setMode('browse')
            setSelectedExam(null)
        } else {
            onClose()
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-gray-100 rounded-none border border-gray-300">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {selectedClass ? 'BACK TO CLASSES' : mode !== 'browse' ? 'BACK TO EXAMS' : 'BACK TO OVERVIEW'}
                    </Button>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter">
                            {selectedClass ? `${selectedExam} — ${selectedClass.name}` : mode !== 'browse' ? `${selectedExam} — Select Class` : 'Examinations & Results'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">System Console / Academic Assessment Module</p>
                    </div>
                </div>
            </div>

            {/* BROWSE MODE: Collapsible exam sections */}
            {mode === 'browse' && (
                <div className="space-y-4">
                    {EXAM_STRUCTURE.map((section) => (
                        <div key={section.key} className={`bg-white border ${section.borderColor} overflow-hidden shadow-sm`}>
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.key)}
                                className={`w-full flex items-center justify-between p-5 ${section.bgColor} hover:opacity-90 transition-all`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`${section.color}`}>{section.icon}</div>
                                    <div className="text-left">
                                        <div className={`font-black text-sm uppercase tracking-tight ${section.color}`}>{section.label}</div>
                                        <div className="text-[10px] font-bold text-gray-500">{section.items.length} Components</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase ${section.color} bg-white px-3 py-1 border ${section.borderColor}`}>
                                        {section.items.length} Tests
                                    </span>
                                    {expandedSections[section.key] ? (
                                        <ChevronDown className={`h-5 w-5 ${section.color}`} />
                                    ) : (
                                        <ChevronRight className={`h-5 w-5 ${section.color}`} />
                                    )}
                                </div>
                            </button>

                            {/* Expanded sub-items */}
                            {expandedSections[section.key] && (
                                <div className="divide-y divide-gray-100">
                                    {section.items.map((item) => (
                                        <div key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">{item.label}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">Exam Code: {item.key}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] h-8 px-3"
                                                    onClick={() => handleExamAction(item.key, 'input')}
                                                >
                                                    <PenTool className="h-3 w-3 mr-1" /> INPUT MARKS
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-none border-gray-300 font-black text-[10px] h-8 px-3"
                                                    onClick={() => handleExamAction(item.key, 'view')}
                                                >
                                                    <BarChart3 className="h-3 w-3 mr-1" /> VIEW RESULTS
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* MARKS MODE: Class selection + Marks grid */}
            {mode === 'marks' && !selectedClass && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                            <div className="font-black text-sm text-blue-900 uppercase">
                                {actionType === 'input' ? 'Select class to enter marks for' : 'Select class to view results for'} — {selectedExam}
                            </div>
                            <div className="text-[10px] font-bold text-blue-500">Choose from the classes below</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => handleClassSelect(cls)}
                                className="bg-white border border-gray-200 p-4 hover:border-blue-500 transition-all text-left group"
                            >
                                <div className="font-black text-lg group-hover:text-blue-600">{cls.name}</div>
                                <div className="text-[10px] font-bold text-gray-400">{cls.studentCount} Students</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* MARKS ENTRY: Grid of students x subjects */}
            {mode === 'marks' && selectedClass && (
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 font-black text-gray-500 uppercase text-sm">Loading data...</span>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white border border-gray-200 overflow-x-auto shadow-sm">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase sticky left-0 bg-gray-50 z-10">Roll No</th>
                                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase sticky left-[60px] bg-gray-50 z-10">Student Name</th>
                                            {subjects.map((subj: any) => (
                                                <th key={subj.id} className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase text-center">{subj.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {students.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-blue-50/30">
                                                <td className="px-4 py-3 text-xs font-black text-gray-500 sticky left-0 bg-white">{student.rollNo}</td>
                                                <td className="px-4 py-3 text-xs font-bold text-gray-900 sticky left-[60px] bg-white">{student.name}</td>
                                                {subjects.map((subj: any) => (
                                                    <td key={subj.id} className="px-2 py-2 text-center">
                                                        {actionType === 'input' ? (
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="w-16 border border-gray-300 p-1 text-center text-sm font-bold focus:border-blue-500 outline-none"
                                                                value={marks[student.id]?.[subj.id] || ''}
                                                                onChange={(e) => handleMarkChange(student.id, subj.id, e.target.value)}
                                                                placeholder="—"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-black text-gray-700">
                                                                {marks[student.id]?.[subj.id] || '—'}
                                                            </span>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {actionType === 'input' && (
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" className="rounded-none border-gray-300 font-bold" onClick={handleBack}>
                                        CANCEL
                                    </Button>
                                    <Button
                                        className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-black shadow-sm"
                                        onClick={handleSaveMarks}
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> SAVING...</>
                                        ) : (
                                            'SAVE ALL MARKS'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
