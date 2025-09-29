"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Percent, Building2, Download } from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"

// Mock analytics data
const performanceData = [
  { quarter: "Q1 2024", totalSavings: 6.2, totalSpend: 25.8, avgSavingsPercent: 24.0 },
  { quarter: "Q2 2024", totalSavings: 6.8, totalSpend: 26.4, avgSavingsPercent: 25.8 },
  { quarter: "Q3 2024", totalSavings: 7.1, totalSpend: 27.1, avgSavingsPercent: 26.2 },
  { quarter: "Q4 2024", totalSavings: 7.5, totalSpend: 27.8, avgSavingsPercent: 27.0 },
]

const hospitalComparison = [
  { name: "Metro General", savings: 2.45, spend: 8.9, savingsPercent: 27.5, eligible: 85.2 },
  { name: "Regional Medical", savings: 1.89, spend: 6.7, savingsPercent: 28.2, eligible: 78.9 },
  { name: "Community Health", savings: 3.2, spend: 12.1, savingsPercent: 26.4, eligible: 91.3 },
]

const qualificationTrends = [
  { quarter: "Q1", qualified: 82.5, inpatient: 45.2, medicaid: 38.7, orphan: 12.3 },
  { quarter: "Q2", qualified: 84.1, inpatient: 46.8, medicaid: 40.1, orphan: 13.1 },
  { quarter: "Q3", qualified: 85.7, inpatient: 48.2, medicaid: 41.5, orphan: 13.8 },
  { quarter: "Q4", qualified: 87.2, inpatient: 49.6, medicaid: 42.9, orphan: 14.2 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("2024")
  const [comparisonType, setComparisonType] = useState("quarterly")

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Advanced analytics and performance insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Savings Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+21.0%</div>
            <p className="text-xs text-slate-600">vs. previous year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Savings Rate</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27.0%</div>
            <p className="text-xs text-slate-600">+3.0% from Q3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Regional Medical</div>
            <p className="text-xs text-slate-600">28.2% savings rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualification Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.2%</div>
            <p className="text-xs text-slate-600">+4.7% YTD improvement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Hospital Comparison</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance Trends</CardTitle>
                <CardDescription>Savings and spend trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis tickFormatter={(value) => `$${value}M`} />
                    <Tooltip formatter={(value) => [`$${value}M`]} />
                    <Area
                      type="monotone"
                      dataKey="totalSavings"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Savings"
                    />
                    <Area
                      type="monotone"
                      dataKey="totalSpend"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Spend"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings Percentage Trend</CardTitle>
                <CardDescription>Average savings percentage across all hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Avg Savings %"]} />
                    <Line
                      type="monotone"
                      dataKey="avgSavingsPercent"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: "#f59e0b", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Performance Comparison</CardTitle>
              <CardDescription>Compare key metrics across hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hospitalComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" tickFormatter={(value) => `$${value}M`} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="savings" fill="#10b981" name="Savings ($M)" />
                  <Bar yAxisId="left" dataKey="spend" fill="#3b82f6" name="Spend ($M)" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="savingsPercent"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Savings %"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitalComparison.map((hospital, index) => (
              <Card key={hospital.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{hospital.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Savings</span>
                    <span className="font-semibold text-green-600">${hospital.savings}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Savings %</span>
                    <span className="font-semibold">{hospital.savingsPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Eligible %</span>
                    <span className="font-semibold text-blue-600">{hospital.eligible}%</span>
                  </div>
                  <Badge
                    variant={hospital.savingsPercent > 27 ? "default" : "secondary"}
                    className="w-full justify-center"
                  >
                    {hospital.savingsPercent > 27 ? "Above Average" : "Below Average"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Qualification Trends</CardTitle>
              <CardDescription>Track qualification percentages over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={qualificationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`]} />
                  <Line type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={2} name="Qualified" />
                  <Line type="monotone" dataKey="inpatient" stroke="#3b82f6" strokeWidth={2} name="Inpatient" />
                  <Line type="monotone" dataKey="medicaid" stroke="#f59e0b" strokeWidth={2} name="Medicaid" />
                  <Line type="monotone" dataKey="orphan" stroke="#ef4444" strokeWidth={2} name="Orphan" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Savings Forecast</CardTitle>
              <CardDescription>Projected savings based on current trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-green-600 mb-2">$8.2M</div>
                <p className="text-slate-600 mb-4">Projected Q1 2025 Savings</p>
                <div className="flex justify-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>+9.3% growth expected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">95% confidence</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
