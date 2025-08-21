"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, LogOut, Plus, Upload, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ApiService from "@/services/api" // Import your API service
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ManageStudentsPageProps {
  className: string
  classId: number // Add classId prop
  onBack: () => void
  onLogout: () => void
}

interface StudentForm {
  firstName: string
  lastName: string
  rollNumber: string
  fatherName: string
  motherName: string
  parentPhone: string
  parentEmail: string
  address: string
  gender: string
}

interface Student {
  id: number
  name: string
  roll_number: string
  father_name?: string
  mother_name?: string
  parent_phone?: string
  parent_email?: string
  address?: string
  gender?: string
}

export default function ManageStudentsPage({ className, classId, onBack, onLogout }: ManageStudentsPageProps) {
  const [studentForm, setStudentForm] = useState<StudentForm>({
    firstName: "",
    lastName: "",
    rollNumber: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
    gender: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingCSV, setIsUploadingCSV] = useState(false)
  const [currentStudents, setCurrentStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch students from Django API
  const fetchStudents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Fetching students for classId:', classId)
      const response = await ApiService.getClassStudents(classId)
      console.log('📥 Students API response:', response)
      
      if (response.success && response.students) {
        setCurrentStudents(response.students)
        console.log('✅ Students loaded:', response.students.length)
      } else {
        throw new Error(response.message || 'Failed to fetch students')
      }
    } catch (error: any) {
      console.error('❌ Error fetching students:', error)
      setError(error.message || 'Failed to load students')
      
      toast({
        title: "Error Loading Students",
        description: error.message || 'Failed to load students for this class',
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Load students when component mounts
  useEffect(() => {
    fetchStudents()
  }, [classId])

  const handleInputChange = (field: keyof StudentForm, value: string) => {
    setStudentForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const newStudentData = {
        class_id: classId,
        name: `${studentForm.firstName} ${studentForm.lastName}`,
        roll_number: studentForm.rollNumber,
        father_name: studentForm.fatherName,
        mother_name: studentForm.motherName,
        parent_phone: studentForm.parentPhone,
        parent_email: studentForm.parentEmail,
        address: studentForm.address,
        gender: studentForm.gender,
      }

      console.log('📤 Adding student:', newStudentData)

      // Call your Django API to add student
      const response = await ApiService.addStudent(newStudentData)
      
      if (response.success) {
        // Refresh the students list
        await fetchStudents()
        
        toast({
          title: "Student Added Successfully!",
          description: `${studentForm.firstName} ${studentForm.lastName} has been added to ${className}.`,
          duration: 3000,
        })

        // Reset form
        setStudentForm({
          firstName: "",
          lastName: "",
          rollNumber: "",
          fatherName: "",
          motherName: "",
          parentPhone: "",
          parentEmail: "",
          address: "",
          gender: "",
        })
      } else {
        throw new Error(response.message || 'Failed to add student')
      }
    } catch (error: any) {
      console.error('❌ Error adding student:', error)
      toast({
        title: "Error Adding Student",
        description: error.message || 'Failed to add student',
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingCSV(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim() !== "")

        if (lines.length < 2) {
          toast({
            title: "Empty or Invalid CSV",
            description: "CSV must contain a header row and at least one student record.",
            variant: "destructive",
          })
          return
        }

        const headers = lines[0].split(",").map((h) => h.trim())
        const requiredHeaders = ["rollNumber", "firstName", "lastName", "parentPhone"]
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

        if (missingHeaders.length > 0) {
          toast({
            title: "Missing CSV Headers",
            description: `Required headers missing: ${missingHeaders.join(", ")}`,
            variant: "destructive",
          })
          return
        }

        const studentsToAdd = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",")
          if (values.length !== headers.length) continue

          const studentData: { [key: string]: string } = {}
          headers.forEach((header, index) => {
            studentData[header] = values[index].trim()
          })

          if (!studentData.rollNumber || !studentData.firstName || !studentData.lastName || !studentData.parentPhone) {
            continue
          }

          studentsToAdd.push({
            class_id: classId,
            name: `${studentData.firstName} ${studentData.lastName}`,
            roll_number: studentData.rollNumber,
            father_name: studentData.fatherName || "",
            mother_name: studentData.motherName || "",
            parent_phone: studentData.parentPhone,
            parent_email: studentData.parentEmail || "",
            address: studentData.address || "",
            gender: studentData.gender || "",
          })
        }

        if (studentsToAdd.length > 0) {
          // Call your Django API for bulk add
          const response = await ApiService.addStudentsBulk({
            class_id: classId,
            students: studentsToAdd
          })
          
          if (response.success) {
            await fetchStudents() // Refresh the list
            
            toast({
              title: "CSV Upload Successful",
              description: `${studentsToAdd.length} students added to ${className}.`,
              duration: 5000,
            })
          } else {
            throw new Error(response.message || 'Failed to add students')
          }
        } else {
          toast({
            title: "No Students Added",
            description: "No valid student records found in the CSV file.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error('❌ CSV upload error:', error)
        toast({
          title: "CSV Upload Failed",
          description: error.message || 'Failed to process CSV file',
          variant: "destructive",
          duration: 5000,
        })
      } finally {
        setIsUploadingCSV(false)
        // Clear file input
        if (event.target) {
          event.target.value = ""
        }
      }
    }

    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the CSV file.",
        variant: "destructive",
      })
      setIsUploadingCSV(false)
    }

    reader.readAsText(file)
  }

  const handleDeleteStudent = async (studentId: number, studentName: string) => {
    try {
      console.log('🗑️ Deleting student:', studentId)
      
      const response = await ApiService.deleteStudent(studentId)
      
      if (response.success) {
        // Refresh the students list
        await fetchStudents()
        
        toast({
          title: "Student Removed",
          description: `${studentName} has been removed from ${className}.`,
          duration: 3000,
        })
      } else {
        throw new Error(response.message || 'Failed to remove student')
      }
    } catch (error: any) {
      console.error('❌ Error deleting student:', error)
      toast({
        title: "Error Removing Student",
        description: error.message || 'Failed to remove student',
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const isFormValid = studentForm.firstName && studentForm.lastName && studentForm.rollNumber && studentForm.parentPhone

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Students in {className}</h1>
              <p className="text-gray-600">Add or remove students from this class ({currentStudents.length} students)</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Add Student Form */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Add Single Student</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    value={studentForm.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={studentForm.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    placeholder="e.g., 01, 02, 03"
                    value={studentForm.rollNumber}
                    onChange={(e) => handleInputChange("rollNumber", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={studentForm.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parent/Guardian Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      placeholder="Enter father's name"
                      value={studentForm.fatherName}
                      onChange={(e) => handleInputChange("fatherName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      placeholder="Enter mother's name"
                      value={studentForm.motherName}
                      onChange={(e) => handleInputChange("motherName", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone Number *</Label>
                    <Input
                      id="parentPhone"
                      placeholder="Enter phone number"
                      value={studentForm.parentPhone}
                      onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Email Address</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      placeholder="Enter email address"
                      value={studentForm.parentEmail}
                      onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter complete address"
                  value={studentForm.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!isFormValid || isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding Student...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Student
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* CSV Upload Section */}
        <Card className="shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Bulk Add Students (CSV)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Upload a CSV file to add multiple students at once.</p>
            <div className="space-y-2">
              <Label htmlFor="csv-upload" className="sr-only">
                Select CSV File
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={isUploadingCSV}
              />
              {isUploadingCSV && (
                <div className="flex items-center text-blue-600 text-sm mt-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading and processing...
                </div>
              )}
            </div>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
              <p className="font-semibold mb-1">CSV Format:</p>
              <p className="font-mono text-xs break-all">
                <code className="bg-gray-200 p-1 rounded">
                  rollNumber,firstName,lastName,fatherName,motherName,parentPhone,parentEmail,address,gender
                </code>
              </p>
              <p className="mt-2">
                <span className="font-semibold">Required fields:</span> rollNumber, firstName, lastName, parentPhone
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Students List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5" />
              <span>Current Students ({currentStudents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStudents.length === 0 ? (
              <p className="text-gray-600">No students in this class yet. Add some above!</p>
            ) : (
              <div className="space-y-3">
                {currentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {student.roll_number} - {student.name}
                      </p>
                      <p className="text-sm text-gray-600">{student.parent_phone}</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="ml-4">
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Remove {student.name}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove {student.name} (Roll No: {student.roll_number}) from {className}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteStudent(student.id, student.name)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Add Tips */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Quick Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Fields marked with * are required for single student entry.</li>
              <li>• Roll numbers should be unique within the class.</li>
              <li>• Parent phone number is required for SMS notifications.</li>
              <li>• For CSV, ensure headers match the specified format.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
