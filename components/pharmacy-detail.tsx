"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Pill, Building2, TrendingUp, DollarSign, Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import Link from "next/link"

interface PharmacyDetailProps {
  pharmacyId: string
}

interface Pharmacy {
  id: string
  pid: string
  name: string
  hospital_id: string
  hospital_name: string
  hospital_pid: string
}

interface PharmacyData {
  quarter: number
  year: number
  scripts: number
  current_profit_avg: number
  dispensing_fee_avg: number
  ce_revenue_avg: number
  brand_profit_avg: number
  generic_profit_avg: number
  qualified_percent: number
}

export function PharmacyDetail({ pharmacyId }: PharmacyDetailProps) {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null)
  const [pharmacyData, setPharmacyData] = useState<PharmacyData[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [quarters, setQuarters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadPharmacyData()
    loadQuarters()
  }, [pharmacyId])

  const loadPharmacyData = async () => {
    // Get pharmacy info
    const { data: pharmacyInfo, error: pharmacyError } = await supabase
      .from("pharmacies")
      .select(
        `
        *,
        hospitals(
          id,
          name,
          pid
        )
      `,
      )
      .eq("id", pharmacyId)
      .single()

    if (!pharmacyError && pharmacyInfo) {
      setPharmacy({
        id: pharmacyInfo.id,
        pid: pharmacyInfo.pid,
        name: pharmacyInfo.name,
        hospital_id: pharmacyInfo.hospitals.id,
        hospital_name: pharmacyInfo.hospitals.name,
        hospital_pid: pharmacyInfo.hospitals.pid,
      })
    }

    // Get historical data
    const { data: historicalData, error: dataError } = await supabase
      .from("pharmacy_data")
      .select(
        `
        *,
        quarters(quarter, year),
        pharmacy_qualifications(qualified_percent)
      `,
      )
      .eq("pharmacy_id", pharmacyId)
      .order("quarters(year)", { ascending: true })
      .order("quarters(quarter)", { ascending: true })

    if (!dataError && historicalData) {
      const processedData = historicalData.map((item: any) => ({
        quarter: item.quarters.quarter,
        year: item.quarters.year,
        scripts: item.scripts || 0,
        current_profit_avg: item.current_profit_avg || 0,
        dispensing_fee_avg: item.dispensing_fee_avg || 0,
        ce_revenue_avg: item.ce_revenue_avg || 0,
        brand_profit_avg: item.brand_profit_avg || 0,
        generic_profit_avg: item.generic_profit_avg || 0,
        qualified_percent: item.pharmacy_qualifications?.[0]?.qualified_percent || 0,
      }))

      setPharmacyData(processedData)
    }

    setLoading(false)
  }

  const loadQuarters = async () => {
    const { data, error } = await supabase.from("quarters").select("*").order("year", { ascending: false })

    if (!error && data) {
      setQuarters(data)
      if (data.length > 0) {
        setSelectedQuarter(data[0].id)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  const chartData = pharmacyData.map((data) => ({
    period: `Q${data.quarter} ${data.year}`,
    scripts: data.scripts,
    currentProfit: data.current_profit_avg,
    brandProfit: data.brand_profit_avg,
    genericProfit: data.generic_profit_avg,
    dispensingFee: data.dispensing_fee_avg,
    ceRevenue: data.ce_revenue_avg,
    qualifiedPercent: data.qualified_percent,
  }))

  const selectedQuarterData = quarters.find((q) => q.id === selectedQuarter)
  const currentData = pharmacyData.find(
    (d) => d.quarter === selectedQuarterData?.quarter && d.year === selectedQuarterData?.year,
  )

  if (loading) {
    return <div className="text-center py-8 text-neutral-400">Loading pharmacy details...</div>
  }

  if (!pharmacy) {
    return <div className="text-center py-8 text-red-400">Pharmacy not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-neutral-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-orange-500">{pharmacy.name}</h1>
            <div className="flex items-center gap-4 text-neutral-400">
              <span>PID: {pharmacy.pid}</span>
              <span>•</span>
              <Link
                href={`/dashboard/hospital/${pharmacy.hospital_id}`}
                className="hover:text-orange-500 flex items-center gap-1"
              >
                <Building2 className="w-4 h-4" />
                {pharmacy.hospital_name}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-48 bg-neutral-800 border-neutral-600 text-white">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-neutral-600">
              {quarters.map((quarter) => (
                <SelectItem key={quarter.id} value={quarter.id} className="text-white">
                  Q{quarter.quarter} {quarter.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Quarter Stats */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Scripts</CardTitle>
              <Pill className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{currentData.scripts.toLocaleString()}</div>
              <p className="text-xs text-neutral-500">
                Q{currentData.quarter} {currentData.year}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Current Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentData.current_profit_avg)}</div>
              <p className="text-xs text-neutral-500">Average</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Brand Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentData.brand_profit_avg)}</div>
              <p className="text-xs text-neutral-500">Average</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Generic Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentData.generic_profit_avg)}</div>
              <p className="text-xs text-neutral-500">Average</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Qualified %</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatPercent(currentData.qualified_percent)}</div>
              <p className="text-xs text-neutral-500">Qualification rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-neutral-800 border-neutral-700">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-500">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="financial" className="data-[state=active]:bg-orange-500">
            Financial Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Scripts & Profit Trend</CardTitle>
                <CardDescription className="text-neutral-400">Quarterly volume and profit metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="period" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#262626",
                        border: "1px solid #404040",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="scripts" fill="#3b82f6" name="Scripts" />
                    <Bar dataKey="currentProfit" fill="#10b981" name="Current Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Profit Breakdown</CardTitle>
                <CardDescription className="text-neutral-400">Brand vs Generic profit comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                    <XAxis dataKey="period" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#262626",
                        border: "1px solid #404040",
                        borderRadius: "6px",
                      }}
                    />
                    <Line type="monotone" dataKey="brandProfit" stroke="#3b82f6" strokeWidth={2} name="Brand Profit" />
                    <Line
                      type="monotone"
                      dataKey="genericProfit"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Generic Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Qualification Trend */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-orange-500">Qualification Rate Trend</CardTitle>
              <CardDescription className="text-neutral-400">Quarterly qualification percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="period" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#262626",
                      border: "1px solid #404040",
                      borderRadius: "6px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="qualifiedPercent"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Qualified %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-orange-500">Financial History</CardTitle>
              <CardDescription className="text-neutral-400">Detailed quarterly financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {pharmacyData.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">No financial data available.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-700">
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">Quarter</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Scripts</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Current Profit</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Brand Profit</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Generic Profit</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Dispensing Fee</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">CE Revenue</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Qualified %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pharmacyData
                        .slice()
                        .reverse()
                        .map((data, index) => (
                          <tr key={index} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                            <td className="py-3 px-4 text-white font-medium">
                              Q{data.quarter} {data.year}
                            </td>
                            <td className="text-right py-3 px-4 text-white">{data.scripts.toLocaleString()}</td>
                            <td className="text-right py-3 px-4 text-green-400">
                              {formatCurrency(data.current_profit_avg)}
                            </td>
                            <td className="text-right py-3 px-4 text-blue-400">
                              {formatCurrency(data.brand_profit_avg)}
                            </td>
                            <td className="text-right py-3 px-4 text-purple-400">
                              {formatCurrency(data.generic_profit_avg)}
                            </td>
                            <td className="text-right py-3 px-4 text-white">
                              {formatCurrency(data.dispensing_fee_avg)}
                            </td>
                            <td className="text-right py-3 px-4 text-white">{formatCurrency(data.ce_revenue_avg)}</td>
                            <td className="text-right py-3 px-4">
                              <Badge
                                variant={
                                  data.qualified_percent > 80
                                    ? "default"
                                    : data.qualified_percent > 60
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                              >
                                {formatPercent(data.qualified_percent)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
