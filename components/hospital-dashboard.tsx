"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, DollarSign, Percent } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// Mock data for demonstration
const mockHospitals = [
  {
    id: 1,
    name: "St. Mary's Medical Center",
    location: "California",
    totalSavings: 2450000,
    drugSpend: 12500000,
    qualificationRate: 85,
    lastQuarter: "Q4 2024",
    status: "active",
  },
  {
    id: 2,
    name: "General Hospital Network",
    location: "Texas",
    totalSavings: 1890000,
    drugSpend: 9800000,
    qualificationRate: 78,
    lastQuarter: "Q4 2024",
    status: "active",
  },
  {
    id: 3,
    name: "Regional Medical Center",
    location: "Florida",
    totalSavings: 3200000,
    drugSpend: 15600000,
    qualificationRate: 92,
    lastQuarter: "Q4 2024",
    status: "active",
  },
]

const chartData = [
  { quarter: "Q1 2024", savings: 1800000, spend: 11200000 },
  { quarter: "Q2 2024", savings: 2100000, spend: 11800000 },
  { quarter: "Q3 2024", savings: 2300000, spend: 12100000 },
  { quarter: "Q4 2024", savings: 2450000, spend: 12500000 },
]

export default function HospitalDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLocation, setFilterLocation] = useState("all")
  const [hospitals, setHospitals] = useState(mockHospitals)

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = filterLocation === "all" || hospital.location === filterLocation
    return matchesSearch && matchesLocation
  })

  const totalSavings = hospitals.reduce((sum, h) => sum + h.totalSavings, 0)
  const totalSpend = hospitals.reduce((sum, h) => sum + h.drugSpend, 0)
  const avgQualification = hospitals.reduce((sum, h) => sum + h.qualificationRate, 0) / hospitals.length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Dashboard</h1>
          <p className="text-slate-600">Monitor 340B savings and drug spend across hospitals</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Building2 className="w-4 h-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total 340B Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(totalSavings / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-600">+12.5% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drug Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${(totalSpend / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-600">+8.2% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Qualification Rate</CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgQualification.toFixed(1)}%</div>
            <p className="text-xs text-slate-600">+2.1% from last quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>340B Savings Trend</CardTitle>
            <CardDescription>Quarterly savings performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, "Savings"]} />
                <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drug Spend vs Savings</CardTitle>
            <CardDescription>Quarterly comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`]} />
                <Bar dataKey="spend" fill="#3b82f6" />
                <Bar dataKey="savings" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Hospital Directory</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="California">California</SelectItem>
                <SelectItem value="Texas">Texas</SelectItem>
                <SelectItem value="Florida">Florida</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{hospital.name}</h3>
                    <p className="text-sm text-slate-600">{hospital.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${(hospital.totalSavings / 1000000).toFixed(1)}M saved
                    </p>
                    <p className="text-xs text-slate-600">{hospital.qualificationRate}% qualified</p>
                  </div>
                  <Badge variant="secondary">{hospital.status}</Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
