"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, LogOut, ClipboardList, Megaphone, Calendar, UserCheck } from "lucide-react"

interface DashboardProps {
  teacher: {
    id: number
    username: string
    first_name: string
    last_name: string
    full_name: string
    role: string
  }
  onSelectModule: (module: "attendance" | "marks") => void
  onLogout: () => void
}

const MODULES = [
  {
    id: 'attendance',
    label: 'Attendance Management',
    description: 'Manage student attendance, mark present/absent, and track attendance records',
    icon: UserCheck,
    color: 'bg-blue-100 group-hover:bg-blue-200',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'marks',
    label: 'Marks Management',
    description: 'Enter student marks, calculate grades, generate reports and track academic performance',
    icon: BookOpen,
    color: 'bg-green-100 group-hover:bg-green-200',
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  {
    id: 'my_classes',
    label: 'My Classes',
    description: 'View your assigned classes, class timetable, and student lists for each class',
    icon: Users,
    color: 'bg-purple-100 group-hover:bg-purple-200',
    iconColor: 'text-purple-600',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
  },
  {
    id: 'announcements',
    label: 'Announcements',
    description: 'View announcements from the principal and administration, stay up to date with school notices',
    icon: Megaphone,
    color: 'bg-orange-100 group-hover:bg-orange-200',
    iconColor: 'text-orange-600',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
  },
]

export default function Dashboard({ teacher, onSelectModule, onLogout }: DashboardProps) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <img
              src="/images/sri-ravi-kiran-school-logo.jpeg"
              alt="Sri Ravi Kiran School Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sri Ravi Kiran School</h1>
              <p className="text-gray-600">Welcome, {teacher.full_name || teacher.username}</p>
            </div>
          </div>

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Quick Info Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm border border-white/40">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800">{dateStr}</p>
              <p className="text-xs text-gray-500">Academic Year 2025-26</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-medium text-gray-500">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">● Online</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Role: {teacher.role?.toUpperCase()}</span>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon
            return (
              <Card key={mod.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full transition-colors ${mod.color}`}>
                      <Icon className={`w-10 h-10 ${mod.iconColor}`} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {mod.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 text-sm">
                    {mod.description}
                  </p>
                  <Button
                    onClick={() => {
                      if (mod.id === 'attendance' || mod.id === 'marks') {
                        onSelectModule(mod.id as "attendance" | "marks")
                      } else {
                        // For future modules — navigate or show coming soon
                        console.log('Selected module:', mod.id)
                      }
                    }}
                    className={`w-full ${mod.buttonColor} text-white py-3 text-lg`}
                    size="lg"
                  >
                    {mod.id === 'my_classes' || mod.id === 'announcements' ? `View ${mod.label}` : `Open ${mod.label.split(' ')[0]}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Select a module to continue with your school management tasks
          </p>
        </div>
      </div>
    </div>
  )
}
