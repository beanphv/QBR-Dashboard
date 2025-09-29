"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pill, TrendingUp, DollarSign, Activity, Eye, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Pharmacy {
  id: string
  pid: string
  name: string
  hospital_name: string
  hospital_pid: string
  scripts?: number
  current_profit_avg?: number
  dispensing_fee_avg?: number
  ce_revenue_avg?: number
  qualified_percent?: number
  brand_profit_avg?: number
  generic_profit_avg?: number
}

interface Quarter {
  id: string
  quarter: number
  year: number
}

export function PharmacyOverview() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([])
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPharmacies: 0,
    totalScripts: 0,
    avgProfit: 0,
    avgQualified: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    loadQuarters()
  }, [])

  useEffect(() => {
    if (selectedQuarter) {
      loadPharmacies()
    }
  }, [selectedQuarter])

  useEffect(() => {
    filterPharmacies()
  }, [pharmacies, searchTerm])

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

    setLoading(true)

    // Get pharmacies with their data for the selected quarter
    const { data: pharmacyData, error } = await supabase
      .from("pharmacies")
      .select(
        `
        id,
        pid,
        name,
        hospitals!inner(
          name,
          pid
        ),
        pharmacy_data!inner(
          scripts,
          current_profit_avg,
          dispensing_fee_avg,
          ce_revenue_avg,
          brand_profit_avg,
          generic_profit_avg
        ),
        pharmacy_qualifications(
          qualified_percent
        )
      `,
      )
      .eq("pharmacy_data.quarter_id", selectedQuarter)

    if (!error && pharmacyData) {
      const processedPharmacies = pharmacyData.map((pharmacy: any) => ({
        id: pharmacy.id,
        pid: pharmacy.pid,
        name: pharmacy.name,
        hospital_name: pharmacy.hospitals.name,
        hospital_pid: pharmacy.hospitals.pid,
        scripts: pharmacy.pharmacy_data[0]?.scripts || 0,
        current_profit_avg: pharmacy.pharmacy_data[0]?.current_profit_avg || 0,
        dispensing_fee_avg: pharmacy.pharmacy_data[0]?.dispensing_fee_avg || 0,
        ce_revenue_avg: pharmacy.pharmacy_data[0]?.ce_revenue_avg || 0,
        brand_profit_avg: pharmacy.pharmacy_data[0]?.brand_profit_avg || 0,
        generic_profit_avg: pharmacy.pharmacy_data[0]?.generic_profit_avg || 0,
        qualified_percent: pharmacy.pharmacy_qualifications[0]?.qualified_percent || 0,
      }))

      setPharmacies(processedPharmacies)

      // Calculate stats
      const totalScripts = processedPharmacies.reduce((sum, p) => sum + (p.scripts || 0), 0)
      const avgProfit =
        processedPharmacies.reduce((sum, p) => sum + (p.current_profit_avg || 0), 0) / processedPharmacies.length
      const avgQualified =
        processedPharmacies.reduce((sum, p) => sum + (p.qualified_percent || 0), 0) / processedPharmacies.length

      setStats({
        totalPharmacies: processedPharmacies.length,
        totalScripts,
        avgProfit,
        avgQualified,
      })
    }

    setLoading(false)
  }

  const filterPharmacies = () => {
    if (!searchTerm) {
      setFilteredPharmacies(pharmacies)
    } else {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pharmacy.pid.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pharmacy.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPharmacies(filtered)
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

  const selectedQuarterData = quarters.find((q) => q.id === selectedQuarter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">Pharmacy Overview</h1>
          <p className="text-neutral-400">Pharmacy performance and profit analytics</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Pharmacies</CardTitle>
            <Pill className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalPharmacies}</div>
            <p className="text-xs text-neutral-500">
              Active in {selectedQuarterData?.quarter}Q{selectedQuarterData?.year}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Scripts</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalScripts.toLocaleString()}</div>
            <p className="text-xs text-neutral-500">Quarterly volume</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.avgProfit)}</div>
            <p className="text-xs text-neutral-500">Per pharmacy</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg Qualified %</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatPercent(stats.avgQualified)}</div>
            <p className="text-xs text-neutral-500">Qualification rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-orange-500">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                placeholder="Search by pharmacy name, PID, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pharmacies Table */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-orange-500">Pharmacies</CardTitle>
          <CardDescription className="text-neutral-400">
            {selectedQuarterData && `Q${selectedQuarterData.quarter} ${selectedQuarterData.year} data`} •{" "}
            {filteredPharmacies.length} of {pharmacies.length} pharmacies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-neutral-400">Loading pharmacies...</div>
          ) : filteredPharmacies.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">
              {searchTerm ? "No pharmacies match your search." : "No pharmacy data found for the selected quarter."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Pharmacy</th>
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Hospital</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Scripts</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Avg Profit</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Brand Profit</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Generic Profit</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Qualified %</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{pharmacy.name}</div>
                          <div className="text-sm text-neutral-500">PID: {pharmacy.pid}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-white">{pharmacy.hospital_name}</div>
                          <div className="text-sm text-neutral-500">{pharmacy.hospital_pid}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-white">{pharmacy.scripts?.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-green-400 font-medium">
                        {formatCurrency(pharmacy.current_profit_avg || 0)}
                      </td>
                      <td className="text-right py-3 px-4 text-blue-400">
                        {formatCurrency(pharmacy.brand_profit_avg || 0)}
                      </td>
                      <td className="text-right py-3 px-4 text-purple-400">
                        {formatCurrency(pharmacy.generic_profit_avg || 0)}
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
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                        >
                          {formatPercent(pharmacy.qualified_percent || 0)}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <Link href={`/dashboard/pharmacy/${pharmacy.id}`}>
                          <Button size="sm" variant="ghost" className="text-orange-500 hover:text-orange-400">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
