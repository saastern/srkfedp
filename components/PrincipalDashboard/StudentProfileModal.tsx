'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, Phone, MapPin, Calendar, Droplet, BookOpen, Award, 
  DollarSign, TrendingUp, Mail, Clock, CheckCircle, AlertCircle
} from 'lucide-react'

export default function StudentProfileModal({ student, onClose }) {
  const [activeTab, setActiveTab] = useState('overview')

  if (!student) return null

  const feeProgress = ((student.fees_paid / (student.fees_paid + student.fees_due)) * 100) || 100
  const calculateAge = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl bg-white">
        
        {/* Header with Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-8 overflow-hidden">
          {/* Decorative background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                {/* Profile Photo */}
                <Avatar className="w-32 h-32 ring-4 ring-white/30 shadow-2xl">
                  <AvatarImage src={student.photo} alt={student.name} />
                  <AvatarFallback className="text-4xl bg-white/20 backdrop-blur-sm font-bold">
                    {student.photo_fallback}
                  </AvatarFallback>
                </Avatar>
                
                {/* Basic Info */}
                <div>
                  <h1 className="text-4xl font-black mb-2">{student.name}</h1>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge variant="secondary" className="text-base px-4 py-1.5 font-semibold">
                      {student.roll_no}
                    </Badge>
                    <Badge variant="outline" className="text-base px-4 py-1.5 border-white/50 text-white font-semibold">
                      Class {student.class_group}
                    </Badge>
                    <Badge 
                      variant={student.fee_status === 'paid' ? 'default' : 'secondary'}
                      className="text-base px-4 py-1.5 font-semibold"
                    >
                      {student.fee_status === 'paid' ? '✓ Fees Paid' : 'Fees Partial'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm opacity-90">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{student.parent_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{student.parent_phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-xl"
              >
                ✕
              </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Attendance</p>
                    <p className="text-2xl font-bold">{student.attendance_rate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-70" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Avg Marks</p>
                    <p className="text-2xl font-bold">{student.marks_avg}%</p>
                  </div>
                  <Award className="h-8 w-8 opacity-70" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80 mb-1">Age</p>
                    <p className="text-2xl font-bold">{calculateAge(student.dob)} years</p>
                  </div>
                  <Calendar className="h-8 w-8 opacity-70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-320px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <InfoRow icon={<Calendar className="h-4 w-4" />} label="Date of Birth" value={new Date(student.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                      <InfoRow icon={<User className="h-4 w-4" />} label="Age" value={`${calculateAge(student.dob)} years`} />
                      <InfoRow icon={<Droplet className="h-4 w-4" />} label="Blood Group" value={student.blood_group} />
                      <InfoRow icon={<MapPin className="h-4 w-4" />} label="Address" value={student.address} />
                    </div>
                  </CardContent>
                </Card>

                {/* Parent/Guardian Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-green-600" />
                      Parent/Guardian
                    </h3>
                    <div className="space-y-4">
                      <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={student.parent_name} />
                      <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={student.parent_phone} />
                      <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={`${student.parent_name.toLowerCase().replace(' ', '.')}@email.com`} />
                    </div>
                  </CardContent>
                </Card>

                {/* Admission Details */}
                <Card className="md:col-span-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Admission Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <InfoRow icon={<Calendar className="h-4 w-4" />} label="Admission Date" value={new Date(student.admission_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
                      <InfoRow icon={<Clock className="h-4 w-4" />} label="Years in School" value={`${new Date().getFullYear() - new Date(student.admission_date).getFullYear()} years`} />
                      <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Current Class" value={`Class ${student.class_group}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ACADEMICS TAB */}
            <TabsContent value="academics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Performance Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium">Overall Average</span>
                        <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                          {student.marks_avg}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Attendance Rate</span>
                        <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                          {student.attendance_rate}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Class Rank</span>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          3rd of 12
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Attendance Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Attendance Breakdown
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Days</span>
                        <span className="font-semibold">180</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Present</span>
                        <span className="font-semibold text-green-600">{Math.round(180 * student.attendance_rate / 100)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Absent</span>
                        <span className="font-semibold text-red-600">{180 - Math.round(180 * student.attendance_rate / 100)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subject-wise Performance */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    Recent Assessments
                  </h3>
                  <div className="space-y-3">
                    {[
                      { subject: 'Mathematics', marks: 92, max: 100, date: 'Jan 15, 2026', grade: 'A+' },
                      { subject: 'Science', marks: 87, max: 100, date: 'Jan 12, 2026', grade: 'A' },
                      { subject: 'English', marks: 89, max: 100, date: 'Jan 10, 2026', grade: 'A' },
                      { subject: 'Social Studies', marks: 85, max: 100, date: 'Jan 8, 2026', grade: 'A' },
                      { subject: 'Hindi', marks: 90, max: 100, date: 'Jan 5, 2026', grade: 'A+' }
                    ].map((assessment, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-semibold">{assessment.subject}</p>
                          <p className="text-sm text-muted-foreground">{assessment.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">{assessment.marks}/{assessment.max}</p>
                            <p className="text-xs text-muted-foreground">{Math.round((assessment.marks/assessment.max)*100)}%</p>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-800 font-bold">
                            {assessment.grade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FEES TAB */}
            <TabsContent value="fees" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fee Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      Fee Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                        <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                        <p className="text-3xl font-bold text-emerald-600">₹{student.fees_paid?.toLocaleString()}</p>
                      </div>
                      {student.fees_due > 0 && (
                        <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                          <p className="text-sm text-muted-foreground mb-1">Pending Amount</p>
                          <p className="text-3xl font-bold text-orange-600">₹{student.fees_due?.toLocaleString()}</p>
                        </div>
                      )}
                      <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Payment Status</span>
                          {student.fee_status === 'paid' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fee Structure */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Fee Structure (Annual)
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tuition Fee</span>
                        <span className="font-semibold">₹8,000</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Books & Materials</span>
                        <span className="font-semibold">₹2,000</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Activities</span>
                        <span className="font-semibold">₹1,500</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Transport</span>
                        <span className="font-semibold">₹1,500</span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold">Total Annual</span>
                        <span className="font-bold text-lg">₹13,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment History */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    Payment History
                  </h3>
                  <div className="space-y-3">
                    {[
                      { date: 'Jan 20, 2026', amount: 5000, method: 'Cash', receipt: 'SRKS-2026-01-123', status: 'Completed' },
                      { date: 'Dec 15, 2025', amount: 5000, method: 'UPI', receipt: 'SRKS-2025-12-456', status: 'Completed' },
                      { date: 'Nov 10, 2025', amount: 3000, method: 'Bank Transfer', receipt: 'SRKS-2025-11-789', status: 'Completed' }
                    ].map((payment, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-semibold">{payment.date}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {payment.method}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground">#{payment.receipt}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-emerald-600">₹{payment.amount.toLocaleString()}</p>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-12">
            📝 Update Details
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white h-12">
            💰 Record Payment
          </Button>
          <Button variant="outline" className="h-12 px-8" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper component for info rows
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  )
}