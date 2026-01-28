'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, AlertCircle, Gift, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FeeDashboardProps {
  teacher: any
  onBack: () => void
  onLogout: () => void
}

// Monthly collection data
const MONTHLY_DATA = [
  { month: 'Jul', collected: 185000, expected: 220000 },
  { month: 'Aug', collected: 195000, expected: 225000 },
  { month: 'Sep', collected: 210000, expected: 230000 },
  { month: 'Oct', collected: 198000, expected: 235000 },
  { month: 'Nov', collected: 205000, expected: 240000 },
  { month: 'Dec', collected: 215000, expected: 245000 },
  { month: 'Jan', collected: 198000, expected: 245000 },
]

export default function FeeDashboard({ teacher, onBack, onLogout }: FeeDashboardProps) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data for now (replace with API later)
  useEffect(() => {
    setTimeout(() => {
      setData({
        kpis: {
          total_expected: 245000,
          collected: 198000,
          pending: 47000,
          concessions: 12500,
          defaulters_count: 23,
          collection_rate: 80.8
        }
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">💰 Fee Dashboard</h1>
          <p className="text-muted-foreground">Real-time fee collection overview</p>
        </div>
        <Button onClick={onLogout}>Logout</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.kpis.total_expected?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data?.kpis.collection_rate}%</div>
            <p className="text-sm text-muted-foreground">₹{data?.kpis.collected?.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{data?.kpis.pending?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concessions</CardTitle>
            <Gift className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{data?.kpis.concessions?.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Defaulters</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data?.kpis.defaulters_count}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collections Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Monthly Collections</CardTitle>
            <p className="text-sm text-muted-foreground">Collected vs Expected (Jul - Jan)</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#888"
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  formatter={(value) => `₹${value.toLocaleString()}`}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar 
                  dataKey="collected" 
                  fill="#10b981" 
                  name="Collected"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="expected" 
                  fill="#6366f1" 
                  name="Expected"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>💳 Recent Transactions</CardTitle>
            <p className="text-sm text-muted-foreground">Latest fee payments</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { student: 'Ravi Kumar', roll: 'CT-101', amount: 5000, date: '2026-01-20', method: 'Cash' },
              { student: 'Priya Sharma', roll: 'CT-102', amount: 4500, date: '2026-01-19', method: 'UPI' },
              { student: 'Amit Patel', roll: 'CT-201', amount: 7500, date: '2026-01-18', method: 'Bank Transfer' },
              { student: 'Sneha Gupta', roll: 'CT-202', amount: 3750, date: '2026-01-17', method: 'Cash' },
              { student: 'Rahul Singh', roll: 'CT-301', amount: 10000, date: '2026-01-16', method: 'UPI' }
            ].map((tx, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="font-semibold">{tx.student}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{tx.roll}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {tx.method}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₹{tx.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Collection Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Collection Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Monthly collection rate over time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
                domain={[70, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Collection Rate') {
                    return [`${value.toFixed(1)}%`, name]
                  }
                  return [value, name]
                }}
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <Legend   
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
              <Line 
                type="monotone" 
                dataKey={(data) => ((data.collected / data.expected) * 100).toFixed(1)}
                name="Collection Rate"
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}