'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, Search, User, GraduationCap, ChevronRight, ChevronLeft, TrendingUp, Award, BookOpen
} from 'lucide-react'
import StudentProfileModal from './StudentProfileModal'

const CLASSES = [
  { id: 1, name: '1-2', display: 'Class 1-2', icon: '👶', color: 'from-rose-500 to-pink-500', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  { id: 2, name: '3-5', display: 'Class 3-5', icon: '👦', color: 'from-blue-500 to-indigo-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 3, name: '6-8', display: 'Class 6-8', icon: '👧', color: 'from-emerald-500 to-teal-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 4, name: '9-10', display: 'Class 9-10', icon: '🎓', color: 'from-purple-500 to-violet-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
]

const ALL_STUDENTS = [
  // Class 1-2
  { id: 1, name: 'Ravi Kumar', roll_no: 'CT-101', class_group: '1-2', photo_fallback: 'RK', parent_name: 'Suresh Kumar', parent_phone: '9876543210', attendance_rate: 95, marks_avg: 88, fees_due: 0, fees_paid: 5000, fee_status: 'paid', address: '123 MG Road, Hyderabad', dob: '2018-05-15', blood_group: 'O+', admission_date: '2024-04-01' },
  { id: 2, name: 'Priya Sharma', roll_no: 'CT-102', class_group: '1-2', photo_fallback: 'PS', parent_name: 'Anita Sharma', parent_phone: '9876543201', attendance_rate: 92, marks_avg: 85, fees_due: 2500, fees_paid: 2500, fee_status: 'partial', address: '456 Banjara Hills, Hyderabad', dob: '2018-08-22', blood_group: 'A+', admission_date: '2024-04-01' },
  { id: 3, name: 'Arjun Reddy', roll_no: 'CT-103', class_group: '1-2', photo_fallback: 'AR', parent_name: 'Vikram Reddy', parent_phone: '9876543211', attendance_rate: 88, marks_avg: 82, fees_due: 1000, fees_paid: 4000, fee_status: 'partial', address: '789 Jubilee Hills, Hyderabad', dob: '2018-11-10', blood_group: 'B+', admission_date: '2024-04-01' },
  
  // Class 3-5
  { id: 4, name: 'Amit Patel', roll_no: 'CT-201', class_group: '3-5', photo_fallback: 'AP', parent_name: 'Rajesh Patel', parent_phone: '9876543202', attendance_rate: 98, marks_avg: 92, fees_due: 0, fees_paid: 7500, fee_status: 'paid', address: '321 Kukatpally, Hyderabad', dob: '2016-03-12', blood_group: 'AB+', admission_date: '2022-06-15' },
  { id: 5, name: 'Sneha Gupta', roll_no: 'CT-202', class_group: '3-5', photo_fallback: 'SG', parent_name: 'Meena Gupta', parent_phone: '9876543203', attendance_rate: 89, marks_avg: 78, fees_due: 3750, fees_paid: 3750, fee_status: 'partial', address: '654 Gachibowli, Hyderabad', dob: '2016-07-25', blood_group: 'O-', admission_date: '2022-06-15' },
  { id: 6, name: 'Rohan Singh', roll_no: 'CT-203', class_group: '3-5', photo_fallback: 'RS', parent_name: 'Ajay Singh', parent_phone: '9876543212', attendance_rate: 94, marks_avg: 86, fees_due: 0, fees_paid: 7500, fee_status: 'paid', address: '987 Madhapur, Hyderabad', dob: '2016-01-18', blood_group: 'A-', admission_date: '2022-06-15' },
  
  // Class 6-8
  { id: 7, name: 'Rahul Singh', roll_no: 'CT-301', class_group: '6-8', photo_fallback: 'RS', parent_name: 'Vijay Singh', parent_phone: '9876543204', attendance_rate: 96, marks_avg: 91, fees_due: 0, fees_paid: 10000, fee_status: 'paid', address: '111 Hitech City, Hyderabad', dob: '2014-09-05', blood_group: 'B-', admission_date: '2020-04-01' },
  { id: 8, name: 'Neha Reddy', roll_no: 'CT-302', class_group: '6-8', photo_fallback: 'NR', parent_name: 'Kiran Reddy', parent_phone: '9876543205', attendance_rate: 94, marks_avg: 87, fees_due: 5000, fees_paid: 5000, fee_status: 'partial', address: '222 Kondapur, Hyderabad', dob: '2014-12-30', blood_group: 'O+', admission_date: '2020-04-01' },
  { id: 9, name: 'Ananya Joshi', roll_no: 'CT-303', class_group: '6-8', photo_fallback: 'AJ', parent_name: 'Deepak Joshi', parent_phone: '9876543213', attendance_rate: 91, marks_avg: 84, fees_due: 2000, fees_paid: 8000, fee_status: 'partial', address: '333 Miyapur, Hyderabad', dob: '2014-04-14', blood_group: 'A+', admission_date: '2020-04-01' },
  
  // Class 9-10
  { id: 10, name: 'Karan Joshi', roll_no: 'CT-401', class_group: '9-10', photo_fallback: 'KJ', parent_name: 'Mohan Joshi', parent_phone: '9876543206', attendance_rate: 93, marks_avg: 89, fees_due: 0, fees_paid: 12000, fee_status: 'paid', address: '444 Ameerpet, Hyderabad', dob: '2012-06-20', blood_group: 'AB-', admission_date: '2018-04-01' },
  { id: 11, name: 'Divya Nair', roll_no: 'CT-402', class_group: '9-10', photo_fallback: 'DN', parent_name: 'Sunil Nair', parent_phone: '9876543207', attendance_rate: 97, marks_avg: 94, fees_due: 0, fees_paid: 12000, fee_status: 'paid', address: '555 Secunderabad, Hyderabad', dob: '2012-02-08', blood_group: 'B+', admission_date: '2018-04-01' },
  { id: 12, name: 'Aditya Kumar', roll_no: 'CT-403', class_group: '9-10', photo_fallback: 'AK', parent_name: 'Ramesh Kumar', parent_phone: '9876543214', attendance_rate: 90, marks_avg: 87, fees_due: 3000, fees_paid: 9000, fee_status: 'partial', address: '666 LB Nagar, Hyderabad', dob: '2012-10-11', blood_group: 'O-', admission_date: '2018-04-01' },
]

export default function StudentManagementDashboard({ onClose }) {
  const [currentView, setCurrentView] = useState('classes') // 'classes' | 'students'
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showStudentProfile, setShowStudentProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Memoized filtered students for performance
  const filteredStudents = useMemo(() => {
    if (!selectedClass) return []
    
    const classStudents = ALL_STUDENTS.filter(s => s.class_group === selectedClass.name)
    
    if (!searchQuery) return classStudents
    
    const query = searchQuery.toLowerCase()
    return classStudents.filter(student => 
      student.name.toLowerCase().includes(query) ||
      student.roll_no.toLowerCase().includes(query)
    )
  }, [selectedClass, searchQuery])

  // Calculate class stats
  const getClassStats = (className) => {
    const students = ALL_STUDENTS.filter(s => s.class_group === className)
    return {
      total: students.length,
      avgAttendance: Math.round(students.reduce((sum, s) => sum + s.attendance_rate, 0) / students.length),
      avgMarks: Math.round(students.reduce((sum, s) => sum + s.marks_avg, 0) / students.length),
      feePaid: students.filter(s => s.fee_status === 'paid').length
    }
  }

  const handleClassClick = (cls) => {
    setSelectedClass(cls)
    setCurrentView('students')
    setSearchQuery('')
  }

  const handleBackToClasses = () => {
    setCurrentView('classes')
    setSelectedClass(null)
    setSearchQuery('')
  }

  const handleStudentClick = (student) => {
    setSelectedStudent(student)
    setShowStudentProfile(true)
  }

  // Overall stats
  const totalStudents = ALL_STUDENTS.length
  const overallAvgAttendance = Math.round(ALL_STUDENTS.reduce((sum, s) => sum + s.attendance_rate, 0) / totalStudents)
  const overallAvgMarks = Math.round(ALL_STUDENTS.reduce((sum, s) => sum + s.marks_avg, 0) / totalStudents)

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            {currentView === 'students' && (
              <Button variant="outline" onClick={handleBackToClasses} className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Classes
              </Button>
            )}
            {currentView === 'classes' && (
              <Button variant="outline" onClick={onClose} className="mb-4">
                ← Back to Dashboard
              </Button>
            )}
            <h1 className="text-3xl font-bold">
              {currentView === 'classes' ? '👥 Student Management' : `📚 ${selectedClass?.display}`}
            </h1>
            <p className="text-muted-foreground">
              {currentView === 'classes' 
                ? 'Select a class to view students' 
                : `${filteredStudents.length} students`}
            </p>
          </div>
        </div>

        {/* VIEW 1: CLASSES GRID */}
        {currentView === 'classes' && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Across {CLASSES.length} classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Classes</CardTitle>
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{CLASSES.length}</div>
                  <p className="text-xs text-muted-foreground">Active classes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{overallAvgAttendance}%</div>
                  <p className="text-xs text-muted-foreground">Overall average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{overallAvgMarks}%</div>
                  <p className="text-xs text-muted-foreground">Overall marks</p>
                </CardContent>
              </Card>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {CLASSES.map((cls) => {
                const stats = getClassStats(cls.name)
                return (
                  <Card 
                    key={cls.id}
                    className="hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-blue-300"
                    onClick={() => handleClassClick(cls)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`text-5xl p-4 rounded-2xl bg-gradient-to-r ${cls.color} bg-opacity-10`}>
                          {cls.icon}
                        </div>
                        <Badge className="text-lg px-3 py-1 font-bold">
                          {stats.total}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                        {cls.display}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="font-semibold text-green-600">{stats.avgAttendance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Marks</span>
                          <span className="font-semibold text-purple-600">{stats.avgMarks}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fee Paid</span>
                          <span className="font-semibold text-emerald-600">{stats.feePaid}/{stats.total}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4 group-hover:bg-blue-50">
                        View Students
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* VIEW 2: STUDENTS LIST */}
        {currentView === 'students' && selectedClass && (
          <>
            {/* Class Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className={`${selectedClass.bgColor} border-2 ${selectedClass.borderColor}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Students</CardTitle>
                  <Users className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredStudents.length}</div>
                  <p className="text-xs text-muted-foreground">In {selectedClass.display}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(filteredStudents.reduce((sum, s) => sum + s.attendance_rate, 0) / filteredStudents.length)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Marks</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(filteredStudents.reduce((sum, s) => sum + s.marks_avg, 0) / filteredStudents.length)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Fees Paid</CardTitle>
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {filteredStudents.filter(s => s.fee_status === 'paid').length}/{filteredStudents.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Students List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    {selectedClass.icon} {selectedClass.display} - Students
                  </CardTitle>
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-[300px]"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card
                      key={student.id}
                      className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-300"
                      onClick={() => handleStudentClick(student)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
                            {student.photo_fallback}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors truncate">
                              {student.name}
                            </h4>
                            <p className="text-sm font-mono text-muted-foreground">{student.roll_no}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Attendance</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {student.attendance_rate}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Marks</span>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {student.marks_avg}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Fee Status</span>
                            <Badge variant={student.fee_status === 'paid' ? 'default' : 'secondary'}>
                              {student.fee_status === 'paid' ? '✓ Paid' : 'Partial'}
                            </Badge>
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="w-full mt-4 group-hover:bg-blue-50">
                          View Profile
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No students found{searchQuery && ` matching "${searchQuery}"`}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* VIEW 3: STUDENT PROFILE MODAL */}
      {showStudentProfile && selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent}
          onClose={() => {
            setShowStudentProfile(false)
            setSelectedStudent(null)
          }}
        />
      )}
    </>
  )
}