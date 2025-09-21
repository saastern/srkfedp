"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, LogOut } from "lucide-react"

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

export default function Dashboard({ teacher, onSelectModule, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img
              src="/images/sri-ravi-kiran-school-logo.jpeg"
              alt="Sri Ravi Kiran School Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sri Ravi Kiran School</h1>
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

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Attendance Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Users className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Attendance Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Manage student attendance, mark present/absent, and track attendance records
              </p>
              <Button 
                onClick={() => onSelectModule("attendance")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                size="lg"
              >
                Open Attendance
              </Button>
            </CardContent>
          </Card>

          {/* Marks Module */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <BookOpen className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Marks Management
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Enter student marks, calculate grades, generate reports and track academic performance
              </p>
              <Button 
                onClick={() => onSelectModule("marks")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                size="lg"
              >
                Open Marks
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats or Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Select a module to continue with your school management tasks
          </p>
        </div>
      </div>
    </div>
  )
}
