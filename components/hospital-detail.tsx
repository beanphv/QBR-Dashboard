"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Building2, Pill, TrendingUp, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface HospitalDetailProps {
  hospitalId: string
}

interface Hospital {
  id: string
  pid: string
  name: string
}

interface HospitalData {
  quarter: number
  year: number
  savings: number
  drug_spend: number
  savings_to_spend_percent: number
  eligible_percent: number
  medicaid_percent: number
  qualified_percent: number
}

interface Pharmacy {
  id: string
  pid: string
  name: string
  scripts?: number
  current_profit_avg?: number
  dispensing_fee_avg?: number
  qualified_percent?: number
}

export function HospitalDetail({ hospitalId }: HospitalDetailProps) {
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [quarters, setQuarters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadHospitalData()
    loadQuarters()
  }, [hospitalId])

  useEffect(() => {
    if (selectedQuarter) {
      loadPharmacies()
    }
  }, [selectedQuarter])

  const loadHospitalData = async () => {
    // Get hospital info
    const { data: hospitalInfo, error: hospitalError } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", hospitalId)
      .single()

    if (!hospitalError && hospitalInfo) {
      setHospital(hospitalInfo)
    }

    // Get historical data
    const { data: historicalData, error: dataError } = await supabase
      .from("hospital_data")
      .select(
        `
        *,
        quarters(quarter, year),
        hospital_qualifications(qualified_percent)
      `,
      )
      .eq("hospital_id", hospitalId)
      .order("quarters(year)", { ascending: true })
      .order("quarters(quarter)", { ascending: true })

    if (!dataError && historicalData) {
      const processedData = historicalData.map((item: any) => ({
        quarter: item.quarters.quarter,
        year: item.quarters.year,
        savings: item.savings || 0,
        drug_spend: item.drug_spend || 0,
        savings_to_spend_percent: item.savings_to_spend_percent || 0,
        eligible_percent: item.eligible_percent || 0,
        medicaid_percent: item.medicaid_percent || 0,
        qualified_percent: item.hospital_qualifications?.[0]?.qualified_percent || 0,
      }))

      setHospitalData(processedData)
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

  const loadPharmacies = async () => {
    if (!selectedQuarter) return

    const { data, error } = await supabase
      .from("pharmacies")
      .select(
        `
        id,
        pid,
        name,
        pharmacy_data(
          scripts,
          current_profit_avg,
          dispensing_fee_avg
        ),
        pharmacy_qualifications(
          qualified_percent
        )
      `,
      )
      .eq("hospital_id", hospitalId)
      .eq("pharmacy_data.quarter_id", selectedQuarter)

    if (!error && data) {
      const processedPharmacies = data.map((pharmacy: any) => ({
        id: pharmacy.id,
        pid: pharmacy.pid,
        name: pharmacy.name,
        scripts: pharmacy.pharmacy_data[0]?.scripts || 0,
        current_profit_avg: pharmacy.pharmacy_data[0]?.current_profit_avg || 0,
        dispensing_fee_avg: pharmacy.pharmacy_data[0]?.dispensing_fee_avg || 0,
        qualified_percent: pharmacy.pharmacy_qualifications[0]?.qualified_percent || 0,
      }))

      setPharmacies(processedPharmacies)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`
  }

  const chartData = hospitalData.map((data) => ({
    period: `Q${data.quarter} ${data.year}`,
    savings: data.savings,
    drugSpend: data.drug_spend,
    savingsPercent: data.savings_to_spend_percent,
    qualifiedPercent: data.qualified_percent,
  }))

  const selectedQuarterData = quarters.find((q) => q.id === selectedQuarter)
  const currentData = hospitalData.find(
    (d) => d.quarter === selectedQuarterData?.quarter && d.year === selectedQuarterData?.year,
  )

  if (loading) {
    return <div className="text-center py-8 text-neutral-400">Loading hospital details...</div>
  }

  if (!hospital) {
    return <div className="text-center py-8 text-red-400">Hospital not found</div>
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
            <h1 className="text-2xl font-bold text-orange-500">{hospital.name}</h1>
            <p className="text-neutral-400">PID: {hospital.pid}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentData.savings)}</div>
              <p className="text-xs text-neutral-500">
                Q{currentData.quarter} {currentData.year}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Drug Spend</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentData.drug_spend)}</div>
              <p className="text-xs text-neutral-500">Quarterly spend</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Savings %</CardTitle>
              <Building2 className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatPercent(currentData.savings_to_spend_percent)}</div>
              <p className="text-xs text-neutral-500">Savings to spend</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">Qualified %</CardTitle>
              <Pill className="h-4 w-4 text-purple-500" />
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
          <TabsTrigger value="pharmacies" className="data-[state=active]:bg-orange-500">
            Pharmacies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Savings & Drug Spend Trend</CardTitle>
                <CardDescription className="text-neutral-400">Quarterly financial metrics</CardDescription>
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
                    <Bar dataKey="savings" fill="#10b981" name="Savings" />
                    <Bar dataKey="drugSpend" fill="#3b82f6" name="Drug Spend" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Performance Metrics</CardTitle>
                <CardDescription className="text-neutral-400">Savings & qualification percentages</CardDescription>
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
                    <Line type="monotone" dataKey="savingsPercent" stroke="#f97316" strokeWidth={2} name="Savings %" />
                    <Line
                      type="monotone"
                      dataKey="qualifiedPercent"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Qualified %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pharmacies" className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-orange-500">Associated Pharmacies</CardTitle>
              <CardDescription className="text-neutral-400">
                {selectedQuarterData && `Q${selectedQuarterData.quarter} ${selectedQuarterData.year} data`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pharmacies.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  No pharmacy data found for the selected quarter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-700">
                        <th className="text-left py-3 px-4 text-neutral-400 font-medium">Pharmacy</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Scripts</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Avg Profit</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Dispensing Fee</th>
                        <th className="text-right py-3 px-4 text-neutral-400 font-medium">Qualified %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pharmacies.map((pharmacy) => (
                        <tr key={pharmacy.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-white">{pharmacy.name}</div>
                              <div className="text-sm text-neutral-500">PID: {pharmacy.pid}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4 text-white">{pharmacy.scripts?.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-green-400">
                            {formatCurrency(pharmacy.current_profit_avg || 0)}
                          </td>
                          <td className="text-right py-3 px-4 text-white">
                            {formatCurrency(pharmacy.dispensing_fee_avg || 0)}
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge
                              variant={
                                (pharmacy.qualified_percent || 0) > 80
                                  ? "default"
                                  : (pharmacy.qualified_percent || 0) > 60
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                              {formatPercent(pharmacy.qualified_percent || 0)}
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
