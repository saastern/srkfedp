"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ArrowLeft, Users } from "lucide-react"
import ApiService from "@/services/api"

interface ClassData {
  id: string
  name: string
  displayName: string
  studentCount: number
}

const classIcons = {
  nursery: "🌱",
  lkg: "🎨",
  ukg: "📚",
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
  "4": "4️⃣",
  "5": "5️⃣",
  "6": "6️⃣",
  "7": "7️⃣",
  "8": "8️⃣",
  "9": "9️⃣",
  "10": "🔟",
}

// ✅ Updated props interface
interface MarksClassDashboardProps {
  teacher: {
    id: number
    username: string
    first_name: string
    last_name: string
    full_name: string
    role: string
  }
  onBack: () => void
  onLogout: () => void
  onClassSelect?: (classId: string, className: string) => void // ✅ Added callback
}

export function MarksClassDashboard({ teacher, onBack, onLogout, onClassSelect }: MarksClassDashboardProps) {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await ApiService.getMarksClasses()
      setClasses(data.classes)
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassSelect = (classId: string) => {
    // ✅ Use callback instead of alert
    if (onClassSelect) {
      const classData = classes.find(c => c.id === classId)
      onClassSelect(classId, classData?.displayName || classId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Marks Management
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {teacher.full_name || teacher.username} - Select a class to view students and their academic performance
              </p>
            </div>
          </div>
          
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <span>Logout</span>
          </Button>
        </div>

        {/* Class Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading classes..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {classes.map((classData) => (
              <Card
                key={classData.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md"
                onClick={() => handleClassSelect(classData.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">
                    {classIcons[classData.id as keyof typeof classIcons] || "📖"}
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {classData.displayName}
                  </h3>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {classData.studentCount} students
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No classes message */}
        {!isLoading && classes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No classes found</p>
          </div>
        )}
      </div>
    </div>
  )
}
