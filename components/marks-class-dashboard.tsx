"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Users } from "lucide-react"
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

export function ClassDashboard() {
  const [classes, setClasses] = useState<ClassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()


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
    router.push(`/students?class_id=${classId}`)
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {teacher.name}</h1>
          <p className="text-gray-600 mt-1">Select a class to view students and their academic performance</p>
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
                  <div className="text-4xl mb-3">{classIcons[classData.id as keyof typeof classIcons] || "📖"}</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{classData.displayName}</h3>
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {classData.studentCount} students
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
