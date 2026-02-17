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
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})

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

  const fetchFilteredTransactions = async (newFilters: any) => {
    const activeFilters = { ...filters, ...newFilters }
    setFilters(activeFilters)
    try {
      const resp = await ApiService.getTransactions(activeFilters)
      setFilteredTransactions(resp.transactions || [])
    } catch (err) {
      console.error('Error filtering transactions:', err)
    }
  }

  useEffect(() => {
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

        <div className="bg-gray-900 border-l-4 border-l-yellow-400 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-yellow-400 uppercase">Received Today</div>
          <div className="text-2xl font-black text-white">₹{kpis.today_collected?.toLocaleString() || '0'}</div>
          <div className="text-[8px] font-bold text-gray-400 uppercase mt-1">Live Ledger Sync</div>
        </div>

        <div className="bg-white border-l-4 border-l-emerald-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Collection Rate</div>
          <div className="text-2xl font-black text-emerald-600">{kpis.collection_rate}%</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase">₹{kpis.collected?.toLocaleString()} COLLECTED</div>
        </div>

        <div className="bg-white border-l-4 border-l-orange-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Total Pending</div>
          <div className="text-2xl font-black text-orange-600">₹{kpis.pending?.toLocaleString()}</div>
        </div>

        <div className="bg-white border-l-4 border-l-purple-600 border border-gray-200 p-4 shadow-sm">
          <div className="text-[10px] font-black text-gray-400 uppercase">Defaulters</div>
          <div className="text-2xl font-black text-purple-600">{kpis.defaulters_count}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase italic">Follow-up Required</div>
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

      {/* Detailed Transaction History Section */}
      <section className="bg-white border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-black text-sm uppercase tracking-tight">Full Transaction Audit Ledger</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase">Financial Year 2024-25 / Live Transactions</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              className="text-[10px] font-bold border-2 border-gray-200 p-2 rounded-none focus:border-blue-600 outline-none"
              onChange={(e) => fetchFilteredTransactions({ date: e.target.value })}
            />
            <select
              className="text-[10px] font-bold border-2 border-gray-200 p-2 rounded-none focus:border-blue-600 outline-none uppercase"
              onChange={(e) => fetchFilteredTransactions({ method: e.target.value })}
            >
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI/Online</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            <Button size="sm" variant="outline" className="text-[10px] font-black rounded-none h-9" onClick={() => fetchFilteredTransactions({})}>REFRESH</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Date/Time</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Student Profile</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Method</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Receipt</th>
                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(filteredTransactions.length > 0 ? filteredTransactions : transactions).map((tx: any, i: number) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-500">{tx.date}</td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-black text-gray-900 uppercase">{tx.student || tx.student_name}</div>
                    <div className="text-[9px] font-bold text-gray-400">ROLL: {tx.roll_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[8px] font-black rounded-none ${tx.method === 'CASH' ? 'border-orange-200 text-orange-700 bg-orange-50' :
                        tx.method === 'UPI' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                          'border-gray-200 text-gray-600 bg-gray-50'
                      }`}>
                      {tx.method}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">{tx.receipt}</td>
                  <td className="px-6 py-4 text-sm font-black text-emerald-600 text-right">₹{tx.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(transactions.length === 0 && filteredTransactions.length === 0) && (
            <div className="p-12 text-center">
              <div className="text-[10px] font-black text-gray-300 uppercase italic">No transaction records found matching criteria.</div>
            </div>
          )}
        </div>
      </section>

      {/* Collection Efficiency Terminal */}
      <section className="bg-white border border-gray-200 shadow-sm">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 font-bold text-sm uppercase">Revenue Performance Matrix</div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold italic" />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} className="text-[10px] font-bold" tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ borderRadius: '0px', border: '1px solid #e5e7eb', fontSize: '10px', fontFamily: 'monospace' }} />
              <Line
                type="stepAfter"
                dataKey="amount"
                stroke="#059669"
                strokeWidth={4}
                dot={{ fill: '#059669', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-gray-900 border border-gray-800 flex items-center gap-4">
            <div className="h-2 w-2 bg-emerald-500 animate-pulse rounded-full" />
            <p className="text-[11px] font-black text-gray-100 uppercase tracking-tight">
              INSIGHT: EFFICIENCY INDEX IS {kpis.collection_rate}%. MONITORING {kpis.defaulters_count} ACCOUNTS FOR DELINQUENCY.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
