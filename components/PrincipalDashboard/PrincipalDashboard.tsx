'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, BookOpen, GraduationCap, Receipt } from 'lucide-react'
import FeeEntryModal from './FeeEntryModal'
import StudentManagementDashboard from './StudentManagementDashboard'
import FeeDashboard from './FeeDashboard'

interface PrincipalDashboardProps {
  teacher: any
  onLogout: () => void
}

export default function PrincipalDashboard({ teacher, onLogout }: PrincipalDashboardProps) {
  const [currentView, setCurrentView] = useState('main') // 'main' | 'fees' | 'students'
  const [showFeeEntry, setShowFeeEntry] = useState(false)

  // If viewing Fee Dashboard
  if (currentView === 'fees') {
    return (
      <FeeDashboard 
        teacher={teacher}
        onBack={() => setCurrentView('main')}
        onLogout={onLogout}
      />
    )
  }

  // If viewing Students
  if (currentView === 'students') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                👑 Principal Dashboard
              </h1>
            </div>
            <Button onClick={onLogout} variant="destructive">
              Logout
            </Button>
          </div>
          <StudentManagementDashboard onClose={() => setCurrentView('main')} />
        </div>
      </div>
    )
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              👑 Principal Dashboard
            </h1>
            <p className="text-xl text-gray-600 mt-3">
              Welcome back, {teacher.full_name}
            </p>
          </div>
          <Button onClick={onLogout} variant="destructive">
            Logout
          </Button>
        </div>

        {/* Main Actions Grid - 5 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {/* 1. Fee Management */}
          <Card 
            className="hover:shadow-xl transition-all cursor-pointer group" 
            onClick={() => setCurrentView('fees')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-lg font-bold">Fee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700">
                💰 View Fees
              </Button>
            </CardContent>
          </Card>

          {/* 2. Fee Entry */}
          <Card 
            className="hover:shadow-xl transition-all cursor-pointer group" 
            onClick={() => setShowFeeEntry(true)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Receipt className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-lg font-bold">Fee Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                💳 Parent Payment
              </Button>
            </CardContent>
          </Card>

          {/* 3. Students */}
          <Card 
            className="hover:shadow-xl transition-all cursor-pointer group" 
            onClick={() => setCurrentView('students')}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Users className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <CardTitle className="text-lg font-bold">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                👥 View Students
              </Button>
            </CardContent>
          </Card>

          {/* 4. Academics */}
          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle className="text-lg font-bold">Academics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2">
                <p className="text-3xl font-black text-gray-900">94%</p>
                <p className="text-xs text-muted-foreground mt-1">Pass Rate</p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Classes */}
          <Card className="hover:shadow-xl transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <GraduationCap className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle className="text-lg font-bold">Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-2">
                <p className="text-3xl font-black text-gray-900">12</p>
                <p className="text-xs text-muted-foreground mt-1">Active Classes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students Present</span>
                  <span className="font-bold">186/240</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Collections</span>
                  <span className="font-bold text-green-600">₹45,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Classes</span>
                  <span className="font-bold">8/12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Attendance</span>
                  <span className="font-bold text-green-600">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Collection</span>
                  <span className="font-bold text-emerald-600">₹1.98L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending Fees</span>
                  <span className="font-bold text-orange-600">₹47K</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📝 Mark Attendance
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📢 Send Announcement
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📄 Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fee Entry Modal */}
      {showFeeEntry && (
        <FeeEntryModal 
          onClose={() => setShowFeeEntry(false)}
          onPaymentSuccess={(paymentData) => {
            console.log('Payment saved:', paymentData)
            setShowFeeEntry(false)
          }}
        />
      )}
    </div>
  )
}