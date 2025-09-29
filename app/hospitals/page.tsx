"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, TrendingUp, DollarSign, Percent, Eye } from "lucide-react"
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
import AdvancedFilters, { type FilterState } from "@/components/advanced-filters"
import { exportToExcel, exportToPDF, exportToCSV } from "@/lib/export-utils"

// Mock data - replace with actual API calls
const mockHospitalData = [
  {
    id: "1",
    pid: "H001",
    name: "Metro General Hospital",
    savings: 2450000,
    drugSpend: 8900000,
    savingsPercent: 27.5,
    eligiblePercent: 85.2,
    medicaidPercent: 42.1,
    pharmacyCount: 4,
    quarter: "Q4",
    year: 2024,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "2",
    pid: "H002",
    name: "Regional Medical Center",
    savings: 1890000,
    drugSpend: 6700000,
    savingsPercent: 28.2,
    eligiblePercent: 78.9,
    medicaidPercent: 38.7,
    pharmacyCount: 3,
    quarter: "Q4",
    year: 2024,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "3",
    pid: "H003",
    name: "Community Health System",
    savings: 3200000,
    drugSpend: 12100000,
    savingsPercent: 26.4,
    eligiblePercent: 91.3,
    medicaidPercent: 45.8,
    pharmacyCount: 6,
    quarter: "Q4",
    year: 2024,
    createdAt: new Date("2024-12-01"),
  },
  {
    id: "4",
    pid: "H004",
    name: "University Medical",
    savings: 1750000,
    drugSpend: 5800000,
    savingsPercent: 30.2,
    eligiblePercent: 88.7,
    medicaidPercent: 41.3,
    pharmacyCount: 2,
    quarter: "Q3",
    year: 2024,
    createdAt: new Date("2024-09-01"),
  },
  {
    id: "5",
    pid: "H005",
    name: "City General",
    savings: 980000,
    drugSpend: 4200000,
    savingsPercent: 23.3,
    eligiblePercent: 76.4,
    medicaidPercent: 35.9,
    pharmacyCount: 2,
    quarter: "Q4",
    year: 2024,
    createdAt: new Date("2024-12-01"),
  },
]

const mockTrendData = [
  { quarter: "Q1 2024", savings: 6.2, drugSpend: 25.8 },
  { quarter: "Q2 2024", savings: 6.8, drugSpend: 26.4 },
  { quarter: "Q3 2024", savings: 7.1, drugSpend: 27.1 },
  { quarter: "Q4 2024", savings: 7.5, drugSpend: 27.8 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function HospitalOverviewPage() {
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    quarters: [],
    years: [],
    savingsRange: [0, 50],
    hospitals: [],
    dateRange: { from: undefined, to: undefined },
    performanceThreshold: "all",
  })

  // Filter hospitals based on current filters
  const filteredHospitals = useMemo(() => {
    return mockHospitalData.filter((hospital) => {
      // Search term filter
      if (filters.searchTerm && !hospital.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }

      // Quarter filter
      if (filters.quarters.length > 0 && !filters.quarters.includes(hospital.quarter)) {
        return false
      }

      // Year filter
      if (filters.years.length > 0 && !filters.years.includes(hospital.year.toString())) {
        return false
      }

      // Hospital selection filter
      if (filters.hospitals.length > 0 && !filters.hospitals.includes(hospital.name)) {
        return false
      }

      // Savings range filter
      if (hospital.savingsPercent < filters.savingsRange[0] || hospital.savingsPercent > filters.savingsRange[1]) {
        return false
      }

      // Performance threshold filter
      if (filters.performanceThreshold === "above_target" && hospital.savingsPercent <= 25) {
        return false
      }
      if (filters.performanceThreshold === "below_target" && hospital.savingsPercent > 25) {
        return false
      }
      if (filters.performanceThreshold === "top_performers" && hospital.savingsPercent <= 30) {
        return false
      }

      // Date range filter
      if (filters.dateRange.from && hospital.createdAt < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to && hospital.createdAt > filters.dateRange.to) {
        return false
      }

      return true
    })
  }, [filters])

  const totalSavings = filteredHospitals.reduce((sum, h) => sum + h.savings, 0)
  const totalDrugSpend = filteredHospitals.reduce((sum, h) => sum + h.drugSpend, 0)
  const avgSavingsPercent = filteredHospitals.reduce((sum, h) => sum + h.savingsPercent, 0) / filteredHospitals.length

  const availableHospitals = [...new Set(mockHospitalData.map((h) => h.name))]

  const handleExport = (format: "excel" | "pdf" | "csv") => {
    const exportData = filteredHospitals.map((hospital) => ({
      "Hospital Name": hospital.name,
      PID: hospital.pid,
      "Savings ($)": hospital.savings,
      "Drug Spend ($)": hospital.drugSpend,
      "Savings %": hospital.savingsPercent,
      "Eligible %": hospital.eligiblePercent,
      "Medicaid %": hospital.medicaidPercent,
      "Pharmacy Count": hospital.pharmacyCount,
      Quarter: hospital.quarter,
      Year: hospital.year,
    }))

    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `Hospital_Data_${timestamp}`

    switch (format) {
      case "excel":
        exportToExcel({ hospitals: exportData }, `${filename}.xlsx`)
        break
      case "pdf":
        exportToPDF(exportData, "Hospital Performance Report")
        break
      case "csv":
        exportToCSV(exportData, `${filename}.csv`)
        break
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Overview</h1>
          <p className="text-slate-600">Monitor hospital performance and 340B savings</p>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        onExport={handleExport}
        availableHospitals={availableHospitals}
        totalRecords={mockHospitalData.length}
        filteredRecords={filteredHospitals.length}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(totalSavings / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-600">From {filteredHospitals.length} hospitals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drug Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalDrugSpend / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-600">Total drug expenditure</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Savings %</CardTitle>
            <Percent className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSavingsPercent ? avgSavingsPercent.toFixed(1) : "0.0"}%</div>
            <p className="text-xs text-slate-600">Average across filtered hospitals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHospitals.length}</div>
            <p className="text-xs text-slate-600">
              of {mockHospitalData.length} total (
              {((filteredHospitals.length / mockHospitalData.length) * 100).toFixed(0)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Hospital Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Savings by Hospital</CardTitle>
                <CardDescription>340B savings comparison across filtered hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredHospitals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, "Savings"]} />
                    <Bar dataKey="savings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Percentage Distribution</CardTitle>
                <CardDescription>Distribution of savings percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredHospitals}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, savingsPercent }) => `${name.split(" ")[0]}: ${savingsPercent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="savingsPercent"
                    >
                      {filteredHospitals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Trends</CardTitle>
              <CardDescription>Savings and drug spend trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`]} />
                  <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} name="Savings" />
                  <Line type="monotone" dataKey="drugSpend" stroke="#3b82f6" strokeWidth={2} name="Drug Spend" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4">
            {filteredHospitals.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hospitals found</h3>
                    <p className="text-slate-600">Try adjusting your filters to see more results.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredHospitals.map((hospital) => (
                <Card key={hospital.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{hospital.name}</CardTitle>
                        <CardDescription>
                          PID: {hospital.pid} • {hospital.pharmacyCount} Pharmacies
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedHospital(hospital.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Savings</p>
                        <p className="text-lg font-semibold text-green-600">
                          ${(hospital.savings / 1000000).toFixed(1)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Drug Spend</p>
                        <p className="text-lg font-semibold">${(hospital.drugSpend / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Savings %</p>
                        <p className="text-lg font-semibold text-orange-600">{hospital.savingsPercent}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Eligible %</p>
                        <p className="text-lg font-semibold text-blue-600">{hospital.eligiblePercent}%</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Badge variant="secondary">
                        Q{hospital.quarter} {hospital.year}
                      </Badge>
                      <Badge variant={hospital.savingsPercent > 25 ? "default" : "destructive"}>
                        {hospital.savingsPercent > 25 ? "Above Target" : "Below Target"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
