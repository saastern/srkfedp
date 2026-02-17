'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Receipt, Search, User, CreditCard, CheckCircle } from 'lucide-react'
import ApiService from '@/services/api'

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI/Online' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' }
]

export default function FeeEntryModal({ onClose, onPaymentSuccess }: any) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [formData, setFormData] = useState({
    student_id: '',
    total_amount: '',
    discount: '0',
    payment_method: 'CASH',
    receipt_no: `RCP-${Date.now().toString().slice(-6)}`,
    notes: ''
  })

  // Basic student search
  const handleSearch = async (query: string) => {
    if (query.length < 2) return
    try {
      const resp = await ApiService.searchStudents(query)
      if (resp.success) setStudents(resp.students)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !formData.total_amount) {
      setError('Please select a student and enter an amount.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        student_id: selectedStudent.id,
        amount_paid: parseFloat(formData.total_amount) - (parseFloat(formData.discount) || 0),
        concession: parseFloat(formData.discount) || 0,
        payment_method: formData.payment_method,
        receipt_no: formData.receipt_no,
        notes: formData.notes
      }

      const resp = await ApiService.recordPayment(payload)
      if (resp.success) {
        setSuccess(true)
        setTimeout(() => onPaymentSuccess(resp.payment), 1500)
      } else {
        setError(resp.message || 'Failed to record payment')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 font-sans">
        <div className="bg-white p-8 text-center rounded shadow-xl border-t-4 border-green-600">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900 mb-2">PAYMENT RECORDED</h2>
          <p className="text-gray-500 font-bold uppercase text-xs">Receipt Number: {formData.receipt_no}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white w-full max-w-xl rounded shadow-2xl overflow-hidden border-t-4 border-blue-600">
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="font-black text-sm uppercase tracking-tighter">Direct Fee Entry Terminal</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-black">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <Alert variant="destructive" className="rounded-none border-2">
              <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Student Search */}
          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-gray-400">Search Student (Name/Roll)</Label>
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="TYPE NAME OR ROLL NUMBER..."
                className="pl-10 rounded-none border-gray-300 focus:border-blue-600 focus:ring-0 text-sm font-bold h-10"
                onChange={(e) => handleSearch(e.target.value)}
              />

              {students.length > 0 && !selectedStudent && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-xl z-10 max-h-40 overflow-y-auto">
                  {students.map((s: any) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSelectedStudent(s); setStudents([]); }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0 text-xs font-bold"
                    >
                      {s.full_name} ({s.roll_number}) - Class {s.class_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-blue-50 p-3 flex items-center justify-between border border-blue-100 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded text-xs font-black"><User className="h-4 w-4" /></div>
                <div>
                  <div className="text-sm font-black text-blue-900 uppercase">{(selectedStudent as any).full_name}</div>
                  <div className="text-[10px] font-bold text-blue-600">ROLL: {(selectedStudent as any).roll_number} | CLASS: {(selectedStudent as any).class_name}</div>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedStudent(null)} className="text-[10px] font-black text-blue-700 underline">CHANGE</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-gray-400">Total Fee Amount (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                className="rounded-none border-gray-300 text-lg font-black h-12"
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-gray-400">Discount/Concession (₹)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                className="rounded-none border-gray-300 text-lg font-black h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-gray-400">Payment Mode</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
                <SelectTrigger className="rounded-none border-gray-300 font-bold text-xs h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-xs font-bold uppercase">{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-gray-400">Receipt Number</Label>
              <Input
                value={formData.receipt_no}
                onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                className="rounded-none border-gray-300 text-xs font-mono font-bold h-10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-black uppercase text-gray-400">Notes / Remarks</Label>
            <Input
              placeholder="E.G. JAN FEE, ADMISSION FEE..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-none border-gray-300 text-xs font-bold h-10"
            />
          </div>

          <div className="pt-4 flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gray-900 hover:bg-black text-white rounded-none font-black py-4 h-14 shadow-lg text-sm"
            >
              {loading ? 'PROCESSING...' : 'CONFIRM & SAVE PAYMENT'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-none border-gray-300 font-black h-14 px-6"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
