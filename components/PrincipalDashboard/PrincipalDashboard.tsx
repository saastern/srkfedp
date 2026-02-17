'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, BookOpen, GraduationCap, Receipt, Loader2, Menu, X, Megaphone } from 'lucide-react'
import FeeEntryModal from './FeeEntryModal'
import StudentManagementDashboard from './StudentManagementDashboard'
import FeeDashboard from './FeeDashboard'
import StaffManagementDashboard from './StaffManagementDashboard'
import StudentProfileModal from './StudentProfileModal'
import ApiService from '@/services/api'
import AcademicDashboard from './AcademicDashboard'
import AnnouncementsDashboard from './AnnouncementsDashboard'

interface PrincipalDashboardProps {
  teacher: any
  onLogout: () => void
}

export default function PrincipalDashboard({ teacher, onLogout }: PrincipalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showFeeEntry, setShowFeeEntry] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await ApiService.getPrincipalDashboardSummary()
        if (response.success) {
          setData(response.summary)
        }
      } catch (error) {
        console.error('Dashboard Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500 font-mono">LOADING ERP SYSTEM...</div>

  const NAV_ITEMS = [
    { id: 'overview', label: 'DASHBOARD HOME', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'fees', label: 'FEE COLLECTIONS', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'students', label: 'STUDENT RECORDS', icon: <Users className="h-4 w-4" /> },
    { id: 'staff', label: 'STAFF MANAGEMENT', icon: <Users className="h-4 w-4" /> },
    { id: 'academics', label: 'EXAMS & RESULTS', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'announcements', label: 'ANNOUNCEMENTS', icon: <Megaphone className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Top ERP Header — Mobile Responsive */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-600 hover:text-black p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="bg-blue-600 text-white p-1.5 md:p-2 rounded font-black text-lg md:text-xl">ERP</div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-xl font-bold tracking-tight truncate">
              <span className="hidden md:inline">Sri Ravi Kiran School - Principal Console</span>
              <span className="md:hidden">SRK Principal</span>
            </h1>
            <p className="text-[9px] md:text-xs text-gray-500 font-medium uppercase tracking-wider truncate">
              <span className="hidden md:inline">Academic Year 2025-26 | System Administrator: {teacher.full_name}</span>
              <span className="md:hidden">AY 2025-26</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            onClick={() => setShowFeeEntry(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold py-1 px-2 md:px-4 h-8 md:h-9 shadow-sm text-xs md:text-sm"
          >
            <span className="hidden md:inline">+ DIRECT FEE ENTRY</span>
            <span className="md:hidden">+ FEE</span>
          </Button>
          <Button onClick={onLogout} variant="outline" className="rounded-none border-gray-300 h-8 md:h-9 font-bold text-xs md:text-sm">
            <span className="hidden md:inline">LOGOUT</span>
            <span className="md:hidden">EXIT</span>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation — Responsive */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-64 bg-gray-900 text-gray-300 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:transition-none
        `}>
          {/* Mobile close button */}
          <div className="md:hidden flex justify-end p-3">
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 py-2 md:py-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-bold border-l-4 transition-colors ${activeTab === item.id
                  ? 'bg-gray-800 border-blue-500 text-white'
                  : 'border-transparent hover:bg-gray-800 hover:text-white'
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 bg-gray-950 text-[10px] text-gray-500 border-t border-gray-800">
            SYSTEM STATUS: ONLINE <br />
            LAST SYNC: {new Date().toLocaleTimeString()}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white border border-gray-200 p-3 md:p-4 shadow-sm">
                  <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Total Students</div>
                  <div className="text-xl md:text-3xl font-bold text-blue-700">{data?.students?.total_count}</div>
                  <div className="text-[9px] text-green-600 font-bold mt-1">ACTIVE</div>
                </div>
                <div className="bg-white border border-gray-200 p-3 md:p-4 shadow-sm">
                  <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Attendance</div>
                  <div className="text-xl md:text-3xl font-bold text-emerald-700">{data?.students?.attendance_rate}%</div>
                  <div className="text-[9px] text-gray-500 font-bold mt-1">{data?.students?.present_today}/{data?.students?.strength_today}</div>
                </div>
                <div className="bg-white border border-gray-200 p-3 md:p-4 shadow-sm">
                  <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Month Collection</div>
                  <div className="text-xl md:text-3xl font-bold text-orange-700">₹{data?.fees?.mtd_collected ? (data?.fees?.mtd_collected / 1000).toFixed(1) : '0'}K</div>
                  <div className="text-[9px] text-gray-500 font-bold mt-1">MTD REVENUE</div>
                </div>
                <div className="bg-white border border-gray-200 p-3 md:p-4 shadow-sm">
                  <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase mb-1">Total Teachers</div>
                  <div className="text-xl md:text-3xl font-bold text-purple-700">{data?.students?.total_teachers}</div>
                  <div className="text-[9px] text-gray-500 font-bold mt-1">ACTIVE FACULTY</div>
                </div>
              </div>

              {/* Functional Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <section className="bg-white border border-gray-200 shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">TODAY'S FEE COLLECTIONS</div>
                  <div className="p-4">
                    <div className="text-3xl md:text-4xl font-black text-gray-900 mb-2">₹{data?.fees?.today_collected?.toLocaleString()}</div>
                    <p className="text-xs text-gray-500 mb-4">Total amount collected across all payment modes today.</p>
                    <Button
                      className="w-full bg-gray-900 hover:bg-black text-white rounded-none font-bold"
                      onClick={() => setShowFeeEntry(true)}
                    >
                      COLLECT NEW PAYMENT
                    </Button>
                  </div>
                </section>

                <section className="bg-white border border-gray-200 shadow-sm">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">ACADEMIC SUMMARY</div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm font-medium">Overall Pass Percentage</span>
                      <span className="text-sm font-bold text-blue-600">{data?.academics?.pass_rate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-sm font-medium">Classes Configured</span>
                      <span className="text-sm font-bold">{data?.students?.total_classes}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium">Fee Collection Rate</span>
                      <span className="text-sm font-bold text-emerald-600">{data?.fees?.collection_rate}%</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Quick System Checks Table */}
              <section className="bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">QUICK SYSTEM CHECKS</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 uppercase font-black text-gray-400 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">Module</th>
                        <th className="px-4 py-3">Key Metric</th>
                        <th className="px-4 py-3">Value</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-bold">FEES</td>
                        <td className="px-4 py-3">Total Pending</td>
                        <td className="px-4 py-3">₹{data?.fees?.pending ? (data?.fees?.pending / 1000).toFixed(0) : '0'}K</td>
                        <td className="px-4 py-3"><span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">ACTION REQ</span></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-bold">ATTENDANCE</td>
                        <td className="px-4 py-3">Today's Present</td>
                        <td className="px-4 py-3">{data?.students?.present_today}</td>
                        <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">MONITORED</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'fees' && <FeeDashboard teacher={teacher} onBack={() => setActiveTab('overview')} onLogout={onLogout} />}
          {activeTab === 'students' && <StudentManagementDashboard onClose={() => setActiveTab('overview')} />}
          {activeTab === 'staff' && <StaffManagementDashboard onClose={() => setActiveTab('overview')} />}
          {activeTab === 'academics' && <AcademicDashboard onClose={() => setActiveTab('overview')} />}
          {activeTab === 'announcements' && <AnnouncementsDashboard onClose={() => setActiveTab('overview')} />}
        </main>
      </div>

      {/* Fee Entry Modal */}
      {showFeeEntry && (
        <FeeEntryModal
          onClose={() => setShowFeeEntry(false)}
          onPaymentSuccess={(paymentData: any) => {
            setShowFeeEntry(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
