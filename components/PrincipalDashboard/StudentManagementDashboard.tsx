'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, Search, User, GraduationCap, ChevronRight, ChevronLeft, TrendingUp, Award, BookOpen, ArrowLeft, UserPlus, Trash2, X
} from 'lucide-react'
import StudentProfileModal from './StudentProfileModal'
import ApiService from '@/services/api'

// Visual configs for dynamic classes
const CLASS_STYLES = [
  { color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: '👶' },
  { color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: '👦' },
  { color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: '👧' },
  { color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: '🎓' },
  { color: 'from-orange-500 to-amber-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: '📝' },
  { color: 'from-cyan-500 to-sky-500', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: '🔬' },
]

// Custom class ordering: Nursery → LKG → UKG → 1st → ... → 10th
function getClassOrder(name: string): number {
  const lower = name.toLowerCase().trim()
  if (lower.includes('nursery')) return 1
  if (lower === 'lkg' || lower.includes('lower kg') || lower.includes('l.k.g')) return 2
  if (lower === 'ukg' || lower.includes('upper kg') || lower.includes('u.k.g')) return 3
  // Extract numeric class  
  const match = lower.match(/(\d+)/)
  if (match) return 10 + parseInt(match[1])
  return 100
}

export default function StudentManagementDashboard({ onClose }: any) {
  const [currentView, setCurrentView] = useState('classes')
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [addForm, setAddForm] = useState({ first_name: '', last_name: '', roll_number: '', father_phone: '', mother_phone: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const res = await ApiService.getMarksClasses()
      if (res.classes) {
        // Sort classes: Nursery → LKG → UKG → 1 → ... → 10
        const sorted = [...res.classes].sort((a: any, b: any) => getClassOrder(a.name) - getClassOrder(b.name))
        const styledClasses = sorted.map((cls: any, idx: number) => ({
          ...cls,
          ...CLASS_STYLES[idx % CLASS_STYLES.length]
        }))
        setClasses(styledClasses)
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClassClick = async (cls: any) => {
    setSelectedClass(cls)
    setCurrentView('students')
    setLoading(true)
    try {
      const res = await ApiService.getMarksStudents(cls.id)
      if (res.students) {
        setStudents(res.students)
      }
    } catch (err) {
      console.error('Failed to fetch students:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToClasses = () => {
    setCurrentView('classes')
    setSelectedClass(null)
    setStudents([])
    setSearchQuery('')
    setShowAddStudent(false)
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass) return
    setAddLoading(true)
    setAddError('')
    try {
      const payload = {
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        roll_number: addForm.roll_number,
        class_id: selectedClass.id,
        father_phone: addForm.father_phone || '',
        mother_phone: addForm.mother_phone || ''
      }
      await ApiService.addStudent(payload)
      // Refresh student list
      const res = await ApiService.getMarksStudents(selectedClass.id)
      if (res.students) setStudents(res.students)
      setShowAddStudent(false)
      setAddForm({ first_name: '', last_name: '', roll_number: '', father_phone: '', mother_phone: '' })
    } catch (err: any) {
      setAddError(err.message || 'Failed to add student')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return
    try {
      await ApiService.deleteStudent(studentId)
      // Refresh student list
      if (selectedClass) {
        const res = await ApiService.getMarksStudents(selectedClass.id)
        if (res.students) setStudents(res.students)
      }
    } catch (err) {
      console.error('Failed to delete student:', err)
      alert('Failed to delete student.')
    }
  }

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students
    const q = searchQuery.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q)
    )
  }, [students, searchQuery])

  if (loading && currentView === 'classes') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ERP Header Strip */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={currentView === 'students' ? handleBackToClasses : onClose}
            className="hover:bg-gray-100 rounded-none border border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentView === 'students' ? 'BACK TO CLASSES' : 'BACK TO OVERVIEW'}
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">
              {currentView === 'classes' ? 'Student Enrollment Registry' : `Class Ledger: ${selectedClass?.name}`}
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase">System Console / Academic Records / Students</p>
          </div>
        </div>
        {currentView === 'students' && (
          <Button
            className="rounded-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-sm"
            onClick={() => setShowAddStudent(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> ADD STUDENT
          </Button>
        )}
      </div>

      {currentView === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => handleClassClick(cls)}
              className="bg-white border border-gray-200 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-4xl p-3 bg-gray-50 border border-gray-100`}>
                    {cls.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-gray-400 uppercase">STRENGTH</div>
                    <div className="text-xl font-black text-blue-600">{cls.studentCount}</div>
                  </div>
                </div>
                <h3 className="font-black text-gray-900 group-hover:text-blue-600 uppercase tracking-tight">{cls.name}</h3>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-500">
                  <span className="uppercase">View Full Registry</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentView === 'students' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border border-gray-300 focus:border-blue-500 outline-none text-sm font-bold uppercase placeholder:text-gray-300"
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="text-[10px] font-black text-gray-500 uppercase">
              FILTERED: {filteredStudents.length} / TOTAL: {students.length}
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddStudent && (
            <div className="bg-white border-2 border-blue-600 p-6 shadow-lg animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-sm uppercase text-gray-900 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" /> Add New Student to {selectedClass?.name}
                </h3>
                <button onClick={() => { setShowAddStudent(false); setAddError('') }} className="text-gray-400 hover:text-black">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {addError && <div className="text-red-600 text-xs font-bold mb-3 bg-red-50 p-2 border border-red-200">{addError}</div>}
              <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">First Name *</label>
                  <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.first_name} onChange={e => setAddForm({ ...addForm, first_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Last Name *</label>
                  <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.last_name} onChange={e => setAddForm({ ...addForm, last_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Roll Number *</label>
                  <input required className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.roll_number} onChange={e => setAddForm({ ...addForm, roll_number: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Father Phone</label>
                  <input className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.father_phone} onChange={e => setAddForm({ ...addForm, father_phone: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Mother Phone</label>
                  <input className="w-full border border-gray-300 p-2 text-sm font-bold focus:border-blue-500 outline-none" value={addForm.mother_phone} onChange={e => setAddForm({ ...addForm, mother_phone: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-none font-black h-10" disabled={addLoading}>
                    {addLoading ? 'ADDING...' : 'ADD STUDENT'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white border border-gray-200 p-4 shadow-sm hover:border-blue-500 cursor-pointer group flex items-center gap-4 relative"
                >
                  <div
                    className="flex items-center gap-4 flex-1"
                    onClick={() => {
                      setSelectedStudent(student)
                      setShowStudentProfile(true)
                    }}
                  >
                    <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center font-black text-lg flex-shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-gray-900 uppercase group-hover:text-blue-600 transition-colors truncate">
                        {student.name}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500">ROLL: {student.rollNo}</div>
                      <div className="mt-1 flex gap-1">
                        <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1 py-0.5 rounded-none">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1"
                    title="Delete Student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {filteredStudents.length === 0 && !loading && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-xs font-black text-gray-400 uppercase italic">No matching records found in database.</p>
            </div>
          )}
        </div>
      )}

      {showStudentProfile && selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentProfile(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </div>
  )
}
