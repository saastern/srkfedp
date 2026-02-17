'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, AlertCircle, Gift, Users, ArrowLeft } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ApiService from '@/services/api'

interface FeeDashboardProps {
  teacher: any
  onBack: () => void
  onLogout: () => void
}

export default function FeeDashboard({ teacher, onBack, onLogout }: FeeDashboardProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setLoading(true)
        const response = await ApiService.request('/api/fees/dashboard/')
        setData(response)
      } catch (error) {
        console.error('Error fetching fee dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeeData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const chartData = data?.charts?.monthly_collections || []
  const transactions = data?.recent_transactions || []

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ERP Header Strip */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-gray-100 rounded-none border border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Fee Ledger & Revenue Terminal</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase">System Console / Financials / Overview</p>
          </div>
        </div>
        <Button onClick={onLogout} variant="destructive" size="sm" className="rounded-none font-bold">LOGOUT</Button>
      </div>

      {/* High Density KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border-l-4 border-l-blue-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Total Expected</div>
          <div className="text-2xl font-black text-gray-900">₹{kpis.total_expected?.toLocaleString()}</div>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Collection Rate</div>
          <div className="text-2xl font-black text-emerald-600">{kpis.collection_rate}%</div>
          <div className="text-[10px] font-bold text-gray-500">₹{kpis.collected?.toLocaleString()} COLLECTED</div>
        </div>

        <div className="bg-white border-l-4 border-l-orange-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Total Pending</div>
          <div className="text-2xl font-black text-orange-600">₹{kpis.pending?.toLocaleString()}</div>
        </div>

        <div className="bg-white border-l-4 border-l-purple-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Total Concessions</div>
          <div className="text-2xl font-black text-purple-600">₹{kpis.concessions?.toLocaleString()}</div>
        </div>

        <div className="bg-white border-l-4 border-l-red-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Active Defaulters</div>
          <div className="text-2xl font-black text-red-600">{kpis.defaulters_count}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">Follow-up Required</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <section className="bg-white border border-gray-200 shadow-sm">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">MONTHLY REVENUE TREND (LAST 6 MONTHS)</div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold" tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="amount" fill="#2563eb" radius={[2, 2, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Activity Log */}
        <section className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">RECENT COLLECTIONS LOG</div>
          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[300px]">
            {transactions.map((tx: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors">
                <div>
                  <div className="text-xs font-black text-gray-900 uppercase">{tx.student}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-bold text-gray-500 uppercase">RECEIPT: {tx.receipt}</span>
                    <span className="bg-gray-200 text-gray-700 text-[8px] font-black px-1.5 py-0.5 rounded">AUTO-LOGGED</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600">₹{tx.amount.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase">{tx.date}</div>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-xs font-bold uppercase italic">No recent transactions located in ledger.</div>
            )}
          </div>
        </section>
      </div>

      {/* Collection Efficiency Terminal */}
      <section className="bg-white border border-gray-200 shadow-sm">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm">COLLECTION EFFICIENCY INDEX</div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} className="text-[10px] font-bold" tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb' }} />
              <Line
                type="stepAfter"
                dataKey="amount"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-bold text-blue-800 uppercase leading-relaxed">
              ANALYSIS: Current collection rate is {kpis.collection_rate}%. Automated follow-ups recommended for {kpis.defaulters_count} outstanding student accounts.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
