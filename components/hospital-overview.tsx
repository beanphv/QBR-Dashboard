"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, DollarSign, Activity, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Hospital {
  id: string
  pid: string
  name: string
  savings?: number
  drug_spend?: number
  savings_to_spend_percent?: number
  eligible_percent?: number
  medicaid_percent?: number
  qualified_percent?: number
  pharmacy_count?: number
}

interface Quarter {
  id: string
  quarter: number
  year: number
}

export function HospitalOverview() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [selectedQuarter, setSelectedQuarter] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalSavings: 0,
    totalDrugSpend: 0,
    avgSavingsPercent: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    loadQuarters()
  }, [])

  useEffect(() => {
    if (selectedQuarter) {
      loadHospitals()
    }
  }, [selectedQuarter])

  const loadQuarters = async () => {
    const { data, error } = await supabase.from("quarters").select("*").order("year", { ascending: false })

    if (!error && data) {
      setQuarters(data)
      if (data.length > 0) {
        setSelectedQuarter(data[0].id)
      }
    }
  }

  const loadHospitals = async () => {
    if (!selectedQuarter) return

    setLoading(true)

    // Get hospitals with their data for the selected quarter
    const { data: hospitalData, error } = await supabase
      .from("hospitals")
      .select(
        `
        id,
        pid,
        name,
        hospital_data!inner(
          savings,
          drug_spend,
          savings_to_spend_percent,
          eligible_percent,
          medicaid_percent
        ),
        hospital_qualifications(
          qualified_percent
        ),
        pharmacies(count)
      `,
      )
      .eq("hospital_data.quarter_id", selectedQuarter)

    if (!error && hospitalData) {
      const processedHospitals = hospitalData.map((hospital: any) => ({
        id: hospital.id,
        pid: hospital.pid,
        name: hospital.name,
        savings: hospital.hospital_data[0]?.savings || 0,
        drug_spend: hospital.hospital_data[0]?.drug_spend || 0,
        savings_to_spend_percent: hospital.hospital_data[0]?.savings_to_spend_percent || 0,
        eligible_percent: hospital.hospital_data[0]?.eligible_percent || 0,
        medicaid_percent: hospital.hospital_data[0]?.medicaid_percent || 0,
        qualified_percent: hospital.hospital_qualifications[0]?.qualified_percent || 0,
        pharmacy_count: hospital.pharmacies?.length || 0,
      }))

      setHospitals(processedHospitals)

      // Calculate stats
      const totalSavings = processedHospitals.reduce((sum, h) => sum + (h.savings || 0), 0)
      const totalDrugSpend = processedHospitals.reduce((sum, h) => sum + (h.drug_spend || 0), 0)
      const avgSavingsPercent =
        processedHospitals.reduce((sum, h) => sum + (h.savings_to_spend_percent || 0), 0) / processedHospitals.length

      setStats({
        totalHospitals: processedHospitals.length,
        totalSavings,
        totalDrugSpend,
        avgSavingsPercent,
      })
    }

    setLoading(false)
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

  const selectedQuarterData = quarters.find((q) => q.id === selectedQuarter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-orange-500">Hospital Overview</h1>
          <p className="text-neutral-400">Healthcare data analytics dashboard</p>
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
            <CardTitle className="text-sm font-medium text-neutral-400">Total Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalHospitals}</div>
            <p className="text-xs text-neutral-500">
              Active in {selectedQuarterData?.quarter}Q{selectedQuarterData?.year}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalSavings)}</div>
            <p className="text-xs text-neutral-500">Quarterly savings</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Drug Spend</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalDrugSpend)}</div>
            <p className="text-xs text-neutral-500">Quarterly spend</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Avg Savings %</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatPercent(stats.avgSavingsPercent)}</div>
            <p className="text-xs text-neutral-500">Savings to spend ratio</p>
          </CardContent>
        </Card>
      </div>

      {/* Hospitals Table */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-orange-500">Hospitals</CardTitle>
          <CardDescription className="text-neutral-400">
            {selectedQuarterData && `Q${selectedQuarterData.quarter} ${selectedQuarterData.year} data`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-neutral-400">Loading hospitals...</div>
          ) : hospitals.length === 0 ? (
            <div className="text-center py-8 text-neutral-400">No hospital data found for the selected quarter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left py-3 px-4 text-neutral-400 font-medium">Hospital</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Savings</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Drug Spend</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Savings %</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Qualified %</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Pharmacies</th>
                    <th className="text-right py-3 px-4 text-neutral-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital) => (
                    <tr key={hospital.id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{hospital.name}</div>
                          <div className="text-sm text-neutral-500">PID: {hospital.pid}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-green-400 font-medium">
                        {formatCurrency(hospital.savings || 0)}
                      </td>
                      <td className="text-right py-3 px-4 text-white">{formatCurrency(hospital.drug_spend || 0)}</td>
                      <td className="text-right py-3 px-4">
                        <Badge
                          variant={
                            (hospital.savings_to_spend_percent || 0) > 10
                              ? "default"
                              : (hospital.savings_to_spend_percent || 0) > 5
                                ? "secondary"
                                : "destructive"
                          }
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                        >
                          {formatPercent(hospital.savings_to_spend_percent || 0)}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4">
                        <Badge
                          variant={
                            (hospital.qualified_percent || 0) > 80
                              ? "default"
                              : (hospital.qualified_percent || 0) > 60
                                ? "secondary"
                                : "destructive"
                          }
                          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                        >
                          {formatPercent(hospital.qualified_percent || 0)}
                        </Badge>
                      </td>
                      <td className="text-right py-3 px-4 text-white">{hospital.pharmacy_count}</td>
                      <td className="text-right py-3 px-4">
                        <Link href={`/dashboard/hospital/${hospital.id}`}>
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
