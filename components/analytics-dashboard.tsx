"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Percent, Building2, Pill } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const quarterlyData = [
  { quarter: "Q1 2024", savings: 1800000, spend: 11200000, hospitals: 45, pharmacies: 23 },
  { quarter: "Q2 2024", savings: 2100000, spend: 11800000, hospitals: 48, pharmacies: 25 },
  { quarter: "Q3 2024", savings: 2300000, spend: 12100000, hospitals: 52, pharmacies: 28 },
  { quarter: "Q4 2024", savings: 2450000, spend: 12500000, hospitals: 55, pharmacies: 30 },
]

const hospitalPerformance = [
  { name: "St. Mary's Medical", savings: 2450000, qualification: 85 },
  { name: "General Hospital", savings: 1890000, qualification: 78 },
  { name: "Regional Medical", savings: 3200000, qualification: 92 },
  { name: "City Hospital", savings: 1650000, qualification: 73 },
  { name: "University Medical", savings: 2800000, qualification: 88 },
]

const savingsBreakdown = [
  { name: "Oncology", value: 35, amount: 8575000 },
  { name: "Cardiology", value: 25, amount: 6125000 },
  { name: "Infectious Disease", value: 20, amount: 4900000 },
  { name: "Neurology", value: 12, amount: 2940000 },
  { name: "Other", value: 8, amount: 1960000 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function AnalyticsDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Comprehensive 340B program performance analysis</p>
        </div>
        <Select defaultValue="Q4-2024">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Q4-2024">Q4 2024</SelectItem>
            <SelectItem value="Q3-2024">Q3 2024</SelectItem>
            <SelectItem value="Q2-2024">Q2 2024</SelectItem>
            <SelectItem value="Q1-2024">Q1 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$24.5M</div>
            <div className="flex items-center text-xs text-slate-600">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +12.5% vs Q3
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Qualification Rate</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">83.2%</div>
            <div className="flex items-center text-xs text-slate-600">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +2.1% vs Q3
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">55</div>
            <div className="flex items-center text-xs text-slate-600">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +3 new this quarter
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Pharmacies</CardTitle>
            <Pill className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">30</div>
            <div className="flex items-center text-xs text-slate-600">
              <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
              +2 new partnerships
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Performance Trend</CardTitle>
            <CardDescription>340B savings and drug spend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`]} />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} name="Savings" />
                <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={2} name="Drug Spend" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings by Therapeutic Area</CardTitle>
            <CardDescription>Distribution of 340B savings across specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={savingsBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {savingsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hospital Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Hospitals</CardTitle>
          <CardDescription>Hospitals ranked by 340B savings and qualification rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hospitalPerformance.map((hospital, index) => (
              <div
                key={hospital.name}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{hospital.name}</h4>
                    <p className="text-sm text-slate-600">${(hospital.savings / 1000000).toFixed(1)}M saved</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      hospital.qualification >= 85
                        ? "default"
                        : hospital.qualification >= 75
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {hospital.qualification}% qualified
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      ${(hospital.savings / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Network Growth</CardTitle>
          <CardDescription>Expansion of hospitals and contract pharmacies</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hospitals" fill="#3b82f6" name="Hospitals" />
              <Bar dataKey="pharmacies" fill="#10b981" name="Contract Pharmacies" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
