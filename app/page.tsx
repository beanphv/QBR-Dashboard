"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Pill, BarChart3, Upload, LogOut, Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  role: string
}

interface Hospital {
  id: string
  name: string
  pid: string
}

interface Pharmacy {
  id: string
  name: string
  pid: string
  hospital_id: string
}

interface HospitalData {
  id: string
  hospital_id: string
  savings: number
  drug_spend: number
  hospital_spend: number
  medicaid_total: number
  eligible_total: number
}

interface PharmacyData {
  id: string
  pharmacy_id: string
  scripts: number
  current_profit_avg: number
  ep_added_340b_benefit: number
}

export default function HealthcareDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([])
  const [pharmacyData, setPharmacyData] = useState<PharmacyData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, refreshKey])

  const checkUser = async () => {
    console.log("[v0] Checking user authentication...")
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      console.log("[v0] No authenticated user found")
      router.push("/auth/login")
      return
    }

    console.log("[v0] Authenticated user found:", authUser.email)

    // Get user profile
    const { data: profile } = await supabase.from("users").select("*").eq("id", authUser.id).single()

    if (profile) {
      console.log("[v0] User profile loaded:", profile)
      setUser(profile)
    } else {
      console.log("[v0] No user profile found, creating one...")
      // Create profile if it doesn't exist
      const { data: newProfile } = await supabase
        .from("users")
        .insert([
          {
            id: authUser.id,
            email: authUser.email!,
            role: "Data Analyst",
          },
        ])
        .select()
        .single()

      if (newProfile) {
        setUser(newProfile)
      }
    }
  }

  const fetchData = async () => {
    console.log("[v0] Fetching dashboard data...")
    setLoading(true)

    try {
      // Fetch hospitals
      const { data: hospitalsData } = await supabase.from("hospitals").select("*").order("name")

      // Fetch pharmacies
      const { data: pharmaciesData } = await supabase.from("pharmacies").select("*").order("name")

      // Fetch hospital data
      const { data: hospitalDataResult } = await supabase
        .from("hospital_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      // Fetch pharmacy data
      const { data: pharmacyDataResult } = await supabase
        .from("pharmacy_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      console.log("[v0] Data fetched successfully")
      console.log("[v0] Hospitals:", hospitalsData?.length || 0)
      console.log("[v0] Pharmacies:", pharmaciesData?.length || 0)
      console.log("[v0] Hospital data records:", hospitalDataResult?.length || 0)
      console.log("[v0] Pharmacy data records:", pharmacyDataResult?.length || 0)

      setHospitals(hospitalsData || [])
      setPharmacies(pharmaciesData || [])
      setHospitalData(hospitalDataResult || [])
      setPharmacyData(pharmacyDataResult || [])
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    console.log("[v0] Signing out...")
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleUploadComplete = () => {
    console.log("[v0] Upload completed, refreshing data...")
    setRefreshKey((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading healthcare dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Healthcare Data Portal</h1>
                <p className="text-sm text-gray-500">340B Program Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{user.role}</Badge>
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="hospitals" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hospitals
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Pharmacies
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hospitals.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pharmacies</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pharmacies.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hospital Records</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hospitalData.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pharmacy Records</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pharmacyData.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Hospital Data</CardTitle>
                  <CardDescription>Latest hospital performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hospital</TableHead>
                        <TableHead>Savings</TableHead>
                        <TableHead>Drug Spend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hospitalData.slice(0, 5).map((data) => {
                        const hospital = hospitals.find((h) => h.id === data.hospital_id)
                        return (
                          <TableRow key={data.id}>
                            <TableCell>{hospital?.name || "Unknown"}</TableCell>
                            <TableCell>${data.savings?.toLocaleString() || 0}</TableCell>
                            <TableCell>${data.drug_spend?.toLocaleString() || 0}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Pharmacy Data</CardTitle>
                  <CardDescription>Latest pharmacy performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pharmacy</TableHead>
                        <TableHead>Scripts</TableHead>
                        <TableHead>Profit Avg</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pharmacyData.slice(0, 5).map((data) => {
                        const pharmacy = pharmacies.find((p) => p.id === data.pharmacy_id)
                        return (
                          <TableRow key={data.id}>
                            <TableCell>{pharmacy?.name || "Unknown"}</TableCell>
                            <TableCell>{data.scripts?.toLocaleString() || 0}</TableCell>
                            <TableCell>${data.current_profit_avg?.toFixed(2) || 0}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hospitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Directory</CardTitle>
                <CardDescription>All registered hospitals in the 340B program</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hospital Name</TableHead>
                      <TableHead>PID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hospitals.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell className="font-medium">{hospital.name}</TableCell>
                        <TableCell>{hospital.pid}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pharmacy Directory</CardTitle>
                <CardDescription>All registered pharmacies in the 340B program</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pharmacy Name</TableHead>
                      <TableHead>PID</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pharmacies.map((pharmacy) => {
                      const hospital = hospitals.find((h) => h.id === pharmacy.hospital_id)
                      return (
                        <TableRow key={pharmacy.id}>
                          <TableCell className="font-medium">{pharmacy.name}</TableCell>
                          <TableCell>{pharmacy.pid}</TableCell>
                          <TableCell>{hospital?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Active</Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Upload</CardTitle>
                <CardDescription>Upload new healthcare data files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Healthcare Data</h3>
                  <p className="text-gray-500 mb-4">Upload CSV files containing hospital and pharmacy data</p>
                  <Button onClick={handleUploadComplete}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
