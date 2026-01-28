'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Receipt, Search, User, Calendar, Gift, Printer, CheckCircle } from 'lucide-react'

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: '🏦' },
  { value: 'CHEQUE', label: 'Cheque', icon: '📄' }
]

export default function FeeEntryModal({ onClose, onPaymentSuccess }) {
  const [step, setStep] = useState(1) // 1=Search, 2=Form, 3=Receipt
  const [studentData, setStudentData] = useState(null)
  const [formData, setFormData] = useState({
    student_search: '',
    student_id: '',
    fee_month: '',
    amount_due: 0,
    concession: 0,
    payment_method: 'CASH',
    receipt_no: ''
  })
  const [loading, setLoading] = useState(false)

  // Auto current month + receipt number
  useEffect(() => {
    const now = new Date()
    const monthYear = now.toISOString().slice(0, 7) // 2026-01
    const receipt = `SRKS-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`
    
    setFormData(prev => ({
      ...prev,
      fee_month: monthYear,
      receipt_no: receipt
    }))
  }, [])

  // Mock student search (replace with API)
  const searchStudent = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    
    // Mock data - replace with your API
    setStudentData({
      id: 101,
      name: 'Ravi Kumar',
      roll_no: 'CT-101',
      class_group: '6-10',
      parent_name: 'Suresh Kumar',
      parent_phone: '9876543210',
      amount_due: 5000,
      fee_month: '2026-01'
    })
    setStep(2)
    setLoading(false)
  }

  // Record payment
  const recordPayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    await new Promise(r => setTimeout(r, 1500))
    
    const paymentData = {
      student_id: studentData.id,
      receipt_no: formData.receipt_no,
      amount_paid: formData.amount_due - formData.concession,
      concession: formData.concession,
      payment_method: formData.payment_method,
      fee_month: formData.fee_month,
      date: new Date().toISOString()
    }
    
    onPaymentSuccess(paymentData)
    setStep(3)
    setLoading(false)
  }

  const finalAmount = formData.amount_due - formData.concession

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Fee Entry Counter</h2>
                <p className="text-emerald-100">Parent payment processing</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-10 w-10 p-0">
              ✕
            </Button>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2 mt-4">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-background p-8 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="text-center space-y-6">
              <User className="h-24 w-24 mx-auto text-gray-300" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Enter Student Details</h3>
                <p className="text-muted-foreground">Search by name, roll number, or class</p>
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 h-14 text-lg"
                    placeholder="Ravi Kumar, CT-101, Class 6..."
                    value={formData.student_search}
                    onChange={(e) => setFormData({...formData, student_search: e.target.value})}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg" 
                  onClick={searchStudent}
                  disabled={!formData.student_search || loading}
                >
                  {loading ? 'Searching...' : '🔍 Find Student'}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && studentData && (
            <form onSubmit={recordPayment}>
              {/* Student Info Card */}
              <Card className="border-2 border-emerald-200 bg-emerald-50 mb-6">
                <CardContent className="p-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 truncate">{studentData.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span className="font-mono">{studentData.roll_no}</span>
                        <span>•</span>
                        <span>{studentData.class_group}</span>
                      </div>
                      <p className="text-sm text-gray-600">Parent: {studentData.parent_name}</p>
                      <p className="text-sm text-gray-500">{studentData.parent_phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <Label>Fee Month</Label>
                  <Input value={formData.fee_month} readOnly className="bg-muted" />
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          <span className="mr-2">{method.icon}</span>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Amount Due <Badge>₹{formData.amount_due?.toLocaleString()}</Badge>
                  </Label>
                  <Input value={formData.amount_due} readOnly className="bg-muted text-lg font-bold" />
                </div>

                <div className="space-y-2">
                  <Label>Concession/Discount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.concession}
                    onChange={(e) => setFormData({...formData, concession: parseFloat(e.target.value) || 0})}
                    min="0"
                    max={formData.amount_due}
                    className="text-lg"
                  />
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
                  <div className="flex justify-between items-center text-3xl font-black">
                    <span>Final Amount:</span>
                    <span className={finalAmount > 0 ? 'text-emerald-600' : 'text-gray-500 line-through'}>
                      ₹{finalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-sm text-muted-foreground mt-1">
                    Receipt: <span className="font-mono bg-muted px-2 py-1 rounded">{formData.receipt_no}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 text-lg h-14" disabled={loading || finalAmount <= 0}>
                  {loading ? (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-5 w-5 mr-2" />
                      Record Payment & Print Receipt
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-14">
                  Back
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-3xl mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-600 mb-2">Payment Recorded Successfully!</h3>
                <p className="text-muted-foreground mb-6">Receipt generated and dashboard updated</p>
              </div>
              <div className="space-y-3">
                <Button size="lg" className="w-full" onClick={onClose}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt & Close
                </Button>
                <Button variant="link" onClick={() => setStep(1)}>
                  New Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
