"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, Target } from "lucide-react"

interface TermSummary {
  term: string
  totalMarks: number
  maxMarks: number
  percentage: number
  grade: string
  classRank: number
  totalStudents: number
}

interface TermSummaryCardProps {
  summary: TermSummary
}

export function TermSummaryCard({ summary }: TermSummaryCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-green-700 bg-green-100 border-green-200"
      case "A":
        return "text-green-600 bg-green-50 border-green-200"
      case "B+":
        return "text-blue-700 bg-blue-100 border-blue-200"
      case "B":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "C+":
        return "text-yellow-700 bg-yellow-100 border-yellow-200"
      case "C":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "D":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "F":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-5 h-5 text-yellow-500" />
    return <Target className="w-5 h-5 text-gray-500" />
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 60) return "text-yellow-600"
    if (percentage >= 40) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {getRankIcon(summary.classRank)}
          {summary.term} Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Marks */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Marks:</span>
          <span className="font-semibold text-gray-900">
            {summary.totalMarks}/{summary.maxMarks}
          </span>
        </div>

        {/* Percentage */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Percentage:</span>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${getPerformanceColor(summary.percentage)}`}>
              {summary.percentage.toFixed(1)}%
            </span>
            <TrendingUp className={`w-4 h-4 ${getPerformanceColor(summary.percentage)}`} />
          </div>
        </div>

        {/* Grade */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Grade:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(summary.grade)}`}>
            {summary.grade}
          </span>
        </div>

        {/* Class Rank */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Class Rank:</span>
          <span className="font-semibold text-gray-900">
            {summary.classRank} of {summary.totalStudents}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
