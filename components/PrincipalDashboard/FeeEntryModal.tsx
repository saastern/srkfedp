'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Receipt, Search, User, CreditCard, CheckCircle, ArrowRight, ArrowLeft, History, Calculator } from 'lucide-react'
import ApiService from '@/services/api'

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI/Online' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' }
]

export default function FeeEntryModal({ onClose, onPaymentSuccess }: any) {
  const [step, setStep] = useState(1) // 1: Class, 2: Student, 3: Terminal
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Classes
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any>(null)

  // Step 2: Students
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Step 3: Fee Status & Form
  const [feeStatus, setFeeStatus] = useState<any>(null)
  const [formData, setFormData] = useState({
    total_fee: '',
    concession: '0',
    amount_paid: '',
    payment_method: 'CASH',
    receipt_no: `RCP-${Date.now().toString().slice(-6)}`,
    notes: ''
  })

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const resp = await ApiService.getMarksClasses()
        setClasses(resp.classes || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchClasses()
  }, [])

  // Fetch students when class is selected
  const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls)
    setLoading(true)
    try {
      const resp = await ApiService.getMarksStudents(cls.id)
      setStudents(resp.students || [])
      setStep(2)
    } catch (err) {
      setError('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  // Fetch fee status when student is selected
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student)
    setLoading(true)
    try {
      const resp = await ApiService.getStudentFeeStatus(student.id)
      setFeeStatus(resp)
      setStep(3)
    } catch (err) {
      setError('Failed to fetch fee status')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const isAssignment = !feeStatus?.exists
      const payload = isAssignment ? {
        student_id: selectedStudent.id,
        mode: 'ASSIGN',
        total_fee: parseFloat(formData.total_fee),
        concession: parseFloat(formData.concession) || 0
      } : {
        student_id: selectedStudent.id,
        mode: 'PAY',
        amount_paid: parseFloat(formData.amount_paid),
        payment_method: formData.payment_method,
        receipt_no: formData.receipt_no,
        notes: formData.notes
      }

      const resp = await ApiService.recordPayment(payload)
      if (resp.success) {
        if (isAssignment) {
          // If assigned, move to payment view or refresh
          const updatedStatus = await ApiService.getStudentFeeStatus(selectedStudent.id)
          setFeeStatus(updatedStatus)
        } else {
          setSuccess(true)
          setTimeout(() => onPaymentSuccess(), 1500)
        }
      } else {
        setError(resp.message || 'Action failed')
      }
    } catch (err) {
      setError('Connection error')
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
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Transaction Successful</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            <h2 className="font-black text-sm uppercase tracking-tighter">Fee Entry Terminal 2.0</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3].map(s => (
                <div key={s} className={`h-1.5 w-6 rounded-full ${step >= s ? 'bg-blue-500' : 'bg-gray-700'}`} />
              ))}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-black">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-none border-2">
              <AlertDescription className="font-bold text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: CLASS SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 text-blue-600 p-2 rounded"><ArrowRight className="h-4 w-4" /></div>
                <h3 className="font-black text-sm uppercase">Select Class</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {classes.map(cls => (
                  <button
                    key={cls.id}
                    onClick={() => handleSelectClass(cls)}
                    className="flex items-center justify-between p-4 border-2 border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div>
                      <div className="font-black text-lg group-hover:text-blue-700">{cls.name}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{cls.studentCount} Students</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: STUDENT SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-black"><ArrowLeft className="h-4 w-4" /></button>
                  <h3 className="font-black text-sm uppercase">Select Student from {selectedClass?.name}</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {students.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectStudent(s)}
                    className="flex items-center justify-between p-4 border border-gray-100 hover:border-blue-600 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-100 p-2 rounded text-xs font-black">#{s.rollNo}</div>
                      <div>
                        <div className="font-black text-sm text-gray-900">{s.name}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-transparent hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TERMINAL */}
          {step === 3 && feeStatus && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-blue-900 text-white p-4 rounded flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-800 p-3 rounded-full"><User className="h-6 w-6" /></div>
                  <div>
                    <div className="text-xl font-black uppercase">{selectedStudent?.name}</div>
                    <div className="text-xs font-bold text-blue-300">ROLL: {selectedStudent?.rollNo} | CLASS: {selectedClass?.name}</div>
                  </div>
                </div>
                {!feeStatus.exists && <div className="bg-orange-600 px-3 py-1 text-[10px] font-black rounded uppercase">No Fee Assigned</div>}
              </div>

              {/* Form Logic */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!feeStatus.exists ? (
                  /* INITIAL ASSIGNMENT FORM */
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-4 bg-orange-50 border border-orange-100 mb-4 rounded">
                      <div className="flex items-center gap-2 text-orange-900 mb-3">
                        <Calculator className="h-4 w-4" />
                        <h4 className="text-xs font-black uppercase">Assign Total Fees for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-gray-500">Gross Total Fee (₹)</Label>
                          <Input
                            type="number"
                            className="text-xl font-black h-12"
                            placeholder="0.00"
                            value={formData.total_fee}
                            onChange={e => setFormData({ ...formData, total_fee: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-black uppercase text-gray-500">Early Concession (₹)</Label>
                          <Input
                            type="number"
                            className="text-xl font-black h-12"
                            placeholder="0"
                            value={formData.concession}
                            onChange={e => setFormData({ ...formData, concession: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded" type="submit">
                        {loading ? 'ASSIGNING...' : 'SAVE & ASSIGN TOTAL FEES'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* PAYMENT TERMINAL */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Balance & Payment */}
                    <div className="space-y-4">
                      <div className="p-5 border-2 border-gray-900 bg-gray-50 flex flex-col items-center justify-center text-center">
                        <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Remaining Balance</div>
                        <div className="text-4xl font-black text-gray-900">₹{feeStatus.balance}</div>
                        <div className="text-[10px] font-bold text-gray-500 mt-1">Total Assigned: ₹{feeStatus.final_total}</div>
                      </div>

                      {feeStatus.balance > 0 ? (
                        <div className="space-y-4 mt-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase text-gray-500">Amount to Pay Today (₹)</Label>
                            <Input
                              type="number"
                              className="text-xl font-black h-12 border-blue-600 bg-blue-50"
                              placeholder="0.00"
                              value={formData.amount_paid}
                              onChange={e => setFormData({ ...formData, amount_paid: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Select value={formData.payment_method} onValueChange={v => setFormData({ ...formData, payment_method: v })}>
                              <SelectTrigger className="font-bold text-xs h-10 uppercase"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value} className="text-xs font-bold uppercase">{m.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="RECEIPT NO"
                              className="text-xs font-bold h-10 uppercase"
                              value={formData.receipt_no}
                              onChange={e => setFormData({ ...formData, receipt_no: e.target.value })}
                            />
                          </div>
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 text-sm rounded shadow-lg" type="submit">
                            {loading ? 'PROCESSING...' : 'CONFIRM & RECORD PAYMENT'}
                          </Button>
                        </div>
                      ) : (
                        <div className="p-6 bg-green-50 border-2 border-green-600 text-center rounded">
                          <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                          <div className="font-black text-green-900 uppercase">FULLY PAID</div>
                        </div>
                      )}
                    </div>

                    {/* Right: History */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <History className="h-4 w-4" />
                        <h4 className="text-[10px] font-black uppercase">Payment Timeline</h4>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {feeStatus.history && feeStatus.history.length > 0 ? (
                          feeStatus.history.map((tx: any, idx: number) => (
                            <div key={idx} className="p-3 bg-white border border-gray-100 flex justify-between items-center shadow-sm">
                              <div>
                                <div className="text-xs font-black text-gray-900">₹{tx.amount} <span className="text-[9px] text-blue-600 ml-1">({tx.method})</span></div>
                                <div className="text-[9px] font-bold text-gray-400">{tx.date}</div>
                              </div>
                              <div className="text-[9px] font-black text-gray-300 uppercase">{tx.receipt}</div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-300 text-[10px] font-black uppercase border-2 border-dashed border-gray-100">No Transactions Yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-[10px] font-bold text-gray-400">
          <div>Step {step} of 3</div>
          <div className="uppercase">Server Status: Online | Session {new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  )
}
