"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, LogOut, Sliders, GraduationCap, BookOpen } from "lucide-react"
import { SettingsGradeConfig } from "@/components/settings-grade-config"
import { SettingsSubjectConfig } from "@/components/settings-subject-config"
import { SettingsPromotion } from "@/components/settings-promotion"

interface SettingsPageProps {
  onBack: () => void
  onLogout: () => void
}

export function SettingsPage({ onBack, onLogout }: SettingsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button onClick={onBack} variant="outline" className="bg-white w-fit">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Settings & Modifications</h1>
            <p className="text-gray-600 mt-1">Configure grade scales and run end-of-year student promotion.</p>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grades">
              <Sliders className="w-4 h-4 mr-2" /> Grade Configuration
            </TabsTrigger>
            <TabsTrigger value="subjects">
              <BookOpen className="w-4 h-4 mr-2" /> Subject Configuration
            </TabsTrigger>
            <TabsTrigger value="promotion">
              <GraduationCap className="w-4 h-4 mr-2" /> Promote Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            <SettingsGradeConfig />
          </TabsContent>

          <TabsContent value="subjects">
            <SettingsSubjectConfig />
          </TabsContent>

          <TabsContent value="promotion">
            <SettingsPromotion />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
