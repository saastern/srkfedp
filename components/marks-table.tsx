"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SubjectMarks {
  name: string
  fa1: { marks: number; grade: string; maxMarks: number }
  fa2: { marks: number; grade: string; maxMarks: number }
  fa3: { marks: number; grade: string; maxMarks: number }
  fa4: { marks: number; grade: string; maxMarks: number }
  sa1: { marks: number; grade: string; maxMarks: number }
  sa2: { marks: number; grade: string; maxMarks: number }
}

interface MarksTableProps {
  subjects: SubjectMarks[]
  classConfig?: {
    faMarks: number
    saMarks: number
    excludeFromTotal: string[]
  }
}

export function MarksTable({ subjects, classConfig }: MarksTableProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-green-700 bg-green-100"
      case "A":
        return "text-green-600 bg-green-50"
      case "B+":
        return "text-blue-700 bg-blue-100"
      case "B":
        return "text-blue-600 bg-blue-50"
      case "C+":
        return "text-yellow-700 bg-yellow-100"
      case "C":
        return "text-yellow-600 bg-yellow-50"
      case "D":
        return "text-orange-600 bg-orange-50"
      case "F":
        return "text-red-600 bg-red-50"
      case "N/A":
        return "text-gray-500 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const formatMarksDisplay = (termData: { marks: number; grade: string; maxMarks: number }) => {
    if (termData.maxMarks === 0) {
      return {
        marksText: "N/A",
        gradeText: "N/A",
      }
    }
    return {
      marksText: `${termData.marks}/${termData.maxMarks}`,
      gradeText: termData.grade,
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl">Subject-wise Academic Performance</CardTitle>
        {classConfig && classConfig.excludeFromTotal.length > 0 && (
          <p className="text-sm text-gray-600">
            Note: {classConfig.excludeFromTotal.join(", ")} excluded from total calculation
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 border-b">Subject</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  FA-1
                  {classConfig && (
                    <div className="text-xs font-normal text-gray-500">
                      {classConfig.faMarks > 0 ? `(Max: ${classConfig.faMarks})` : "(N/A)"}
                    </div>
                  )}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  FA-2
                  {classConfig && (
                    <div className="text-xs font-normal text-gray-500">
                      {classConfig.faMarks > 0 ? `(Max: ${classConfig.faMarks})` : "(N/A)"}
                    </div>
                  )}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  FA-3
                  {classConfig && (
                    <div className="text-xs font-normal text-gray-500">
                      {classConfig.faMarks > 0 ? `(Max: ${classConfig.faMarks})` : "(N/A)"}
                    </div>
                  )}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  FA-4
                  {classConfig && (
                    <div className="text-xs font-normal text-gray-500">
                      {classConfig.faMarks > 0 ? `(Max: ${classConfig.faMarks})` : "(N/A)"}
                    </div>
                  )}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  SA-1
                  {classConfig && <div className="text-xs font-normal text-gray-500">(Max: {classConfig.saMarks})</div>}
                </th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 border-b border-l">
                  SA-2
                  {classConfig && <div className="text-xs font-normal text-gray-500">(Max: {classConfig.saMarks})</div>}
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.name} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-4 font-medium text-gray-900 border-b">
                    {subject.name}
                    {classConfig && classConfig.excludeFromTotal.includes(subject.name) && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Not in total</span>
                    )}
                  </td>
                  {[subject.fa1, subject.fa2, subject.fa3, subject.fa4, subject.sa1, subject.sa2].map(
                    (termData, termIndex) => {
                      const { marksText, gradeText } = formatMarksDisplay(termData)
                      return (
                        <td key={termIndex} className="px-3 py-4 text-center border-b border-l">
                          <div className="space-y-2">
                            <div className="font-semibold text-gray-900">{marksText}</div>
                            <div
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                                gradeText,
                              )}`}
                            >
                              {gradeText}
                            </div>
                          </div>
                        </td>
                      )
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
