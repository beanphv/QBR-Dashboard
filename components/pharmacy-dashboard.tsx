"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"
import { Search, TrendingUp, DollarSign, Pill, Activity } from "lucide-react"

interface Pharmacy {
  id: string
  name: string
  pid: string
  hospital_id: string
  hospitals: {
    name: string
  }
}

interface PharmacyData {
  id: string
  pharmacy_id: string
  scripts: number
  dispensing_fee_avg: number
  ce_revenue_avg: number
  drug_cost_avg: number
  current_profit_avg: number
  current_profit_median: number
  brand_profit_avg: number
  generic_profit_avg: number
  ep_added_340b_benefit: number
  ep_340b_bucket_split: number
  pharmacies: {
    name: string
    pid: string
  }
}

interface PharmacyQualifications {
  id: string
  pharmacy_id: string
  qualified_percent: number
  disqualified_percent: number
  medicaid_percent: number
  inpatient_percent: number
  drug_exclude_percent: number
  non_340b_drug_percent: number
  orphan_percent: number
  pharmacies: {
    name: string
    pid: string
  }
}

export default function PharmacyDashboard() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [pharmacyData, setPharmacyData] = useState<PharmacyData[]>([])
  const [pharmacyQualifications, setPharmacyQualifications] = useState<PharmacyQualifications[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch pharmacies
      const { data: pharmaciesData } = await supabase
        .from("pharmacies")
        .select(`
          *,
          hospitals (name)
        `)
        .order("name")

      // Fetch pharmacy data
      const { data: dataResults } = await supabase
        .from("pharmacy_data")
        .select(`
          *,
          pharmacies (name, pid)
        `)
        .order("created_at", { ascending: false })

      // Fetch pharmacy qualifications
      const { data: qualResults } = await supabase
        .from("pharmacy_qualifications")
        .select(`
          *,
          pharmacies (name, pid)
        `)
        .order("created_at", { ascending: false })

      setPharmacies(pharmaciesData || [])
      setPharmacyData(dataResults || [])
      setPharmacyQualifications(qualResults || [])
    } catch (error) {
      console.error("Error fetching pharmacy data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPharmacies = pharmacies.filter(
    (pharmacy) =>
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.pid.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalScripts = pharmacyData.reduce((sum, data) => sum + (data.scripts || 0), 0)
  const avgProfit =
    pharmacyData.length > 0
      ? pharmacyData.reduce((sum, data) => sum + (data.current_profit_avg || 0), 0) / pharmacyData.length
      : 0
  const total340bBenefit = pharmacyData.reduce((sum, data) => sum + (data.ep_added_340b_benefit || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading pharmacy data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy Dashboard</h1>
          <p className="text-slate-400">340B pharmacy performance and qualification tracking</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Pharmacies</CardTitle>
            <Pill className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pharmacies.length}</div>
            <p className="text-xs text-slate-500">Active pharmacy locations</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Scripts</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalScripts.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Prescriptions processed</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Avg Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${avgProfit.toFixed(2)}</div>
            <p className="text-xs text-slate-500">Per prescription</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">340B Benefit</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${total340bBenefit.toLocaleString()}</div>
            <p className="text-xs text-slate-500">Total program benefit</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search pharmacies by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-slate-800 border-slate-600 text-white"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700">
            Performance Data
          </TabsTrigger>
          <TabsTrigger value="qualifications" className="data-[state=active]:bg-slate-700">
            Qualifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Pharmacy Locations</CardTitle>
              <CardDescription className="text-slate-400">
                All registered pharmacy locations in the 340B program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Pharmacy ID</TableHead>
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Hospital</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPharmacies.map((pharmacy) => (
                    <TableRow key={pharmacy.id} className="border-slate-700">
                      <TableCell className="text-slate-300 font-mono">{pharmacy.pid}</TableCell>
                      <TableCell className="text-white font-medium">{pharmacy.name}</TableCell>
                      <TableCell className="text-slate-300">{pharmacy.hospitals?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-900 text-green-300">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
              <CardDescription className="text-slate-400">Financial and operational performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Pharmacy</TableHead>
                    <TableHead className="text-slate-300">Scripts</TableHead>
                    <TableHead className="text-slate-300">Avg Profit</TableHead>
                    <TableHead className="text-slate-300">Brand Profit</TableHead>
                    <TableHead className="text-slate-300">Generic Profit</TableHead>
                    <TableHead className="text-slate-300">340B Benefit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacyData.map((data) => (
                    <TableRow key={data.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {data.pharmacies?.name || "Unknown"}
                        <div className="text-xs text-slate-500">{data.pharmacies?.pid}</div>
                      </TableCell>
                      <TableCell className="text-slate-300">{data.scripts?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-slate-300">${data.current_profit_avg?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="text-slate-300">${data.brand_profit_avg?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="text-slate-300">${data.generic_profit_avg?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="text-green-400 font-medium">
                        ${data.ep_added_340b_benefit?.toLocaleString() || "0"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">340B Qualification Status</CardTitle>
              <CardDescription className="text-slate-400">
                Qualification percentages and compliance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Pharmacy</TableHead>
                    <TableHead className="text-slate-300">Qualified %</TableHead>
                    <TableHead className="text-slate-300">Medicaid %</TableHead>
                    <TableHead className="text-slate-300">Inpatient %</TableHead>
                    <TableHead className="text-slate-300">Disqualified %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacyQualifications.map((qual) => (
                    <TableRow key={qual.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {qual.pharmacies?.name || "Unknown"}
                        <div className="text-xs text-slate-500">{qual.pharmacies?.pid}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={qual.qualified_percent > 80 ? "default" : "destructive"}
                          className={
                            qual.qualified_percent > 80 ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                          }
                        >
                          {qual.qualified_percent?.toFixed(1) || "0.0"}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{qual.medicaid_percent?.toFixed(1) || "0.0"}%</TableCell>
                      <TableCell className="text-slate-300">{qual.inpatient_percent?.toFixed(1) || "0.0"}%</TableCell>
                      <TableCell className="text-red-400">{qual.disqualified_percent?.toFixed(1) || "0.0"}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
