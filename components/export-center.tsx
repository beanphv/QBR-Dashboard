"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, FileText, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Quarter {
  id: string
  quarter: number
  year: number
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
  hospital_name: string
}

export function ExportCenter() {
  const [quarters, setQuarters] = useState<Quarter[]>([])
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([])
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([])
  const [selectedPharmacies, setSelectedPharmacies] = useState<string[]>([])
  const [exportType, setExportType] = useState<string>("")
  const [exportFormat, setExportFormat] = useState<string>("xlsx")
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Load quarters
    const { data: quarterData } = await supabase.from("quarters").select("*").order("year", { ascending: false })

    if (quarterData) {
      setQuarters(quarterData)
      // Select current quarter by default
      if (quarterData.length > 0) {
        setSelectedQuarters([quarterData[0].id])
      }
    }

    // Load hospitals
    const { data: hospitalData } = await supabase.from("hospitals").select("id, name, pid").order("name")

    if (hospitalData) {
      setHospitals(hospitalData)
    }

    // Load pharmacies
    const { data: pharmacyData } = await supabase
      .from("pharmacies")
      .select("id, name, pid, hospitals(name)")
      .order("name")

    if (pharmacyData) {
      const processedPharmacies = pharmacyData.map((pharmacy: any) => ({
        id: pharmacy.id,
        name: pharmacy.name,
        pid: pharmacy.pid,
        hospital_name: pharmacy.hospitals.name,
      }))
      setPharmacies(processedPharmacies)
    }

    setLoading(false)
  }

  const handleQuarterToggle = (quarterId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuarters([...selectedQuarters, quarterId])
    } else {
      setSelectedQuarters(selectedQuarters.filter((id) => id !== quarterId))
    }
  }

  const handleHospitalToggle = (hospitalId: string, checked: boolean) => {
    if (checked) {
      setSelectedHospitals([...selectedHospitals, hospitalId])
    } else {
      setSelectedHospitals(selectedHospitals.filter((id) => id !== hospitalId))
    }
  }

  const handlePharmacyToggle = (pharmacyId: string, checked: boolean) => {
    if (checked) {
      setSelectedPharmacies([...selectedPharmacies, pharmacyId])
    } else {
      setSelectedPharmacies(selectedPharmacies.filter((id) => id !== pharmacyId))
    }
  }

  const selectAllQuarters = () => {
    setSelectedQuarters(quarters.map((q) => q.id))
  }

  const selectAllHospitals = () => {
    setSelectedHospitals(hospitals.map((h) => h.id))
  }

  const selectAllPharmacies = () => {
    setSelectedPharmacies(pharmacies.map((p) => p.id))
  }

  const clearAllSelections = () => {
    setSelectedQuarters([])
    setSelectedHospitals([])
    setSelectedPharmacies([])
  }

  const handleExport = async () => {
    if (!exportType || selectedQuarters.length === 0) {
      setExportResult({
        success: false,
        message: "Please select export type and at least one quarter",
      })
      return
    }

    setIsExporting(true)
    setExportResult(null)

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: exportType,
          quarters: selectedQuarters,
          hospitals: exportType === "hospital_data" ? selectedHospitals : undefined,
          pharmacies: exportType === "pharmacy_data" ? selectedPharmacies : undefined,
          format: exportFormat,
        }),
      })

      if (response.ok) {
        // Download the file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = response.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || "export"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setExportResult({
          success: true,
          message: "Export completed successfully",
        })
      } else {
        const error = await response.json()
        setExportResult({
          success: false,
          message: error.error || "Export failed",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      setExportResult({
        success: false,
        message: "Network error. Please try again.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-neutral-400">Loading export options...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-orange-500">Export Center</h1>
        <p className="text-neutral-400">Export healthcare data in various formats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Export Type */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-orange-500">Export Type</CardTitle>
              <CardDescription className="text-neutral-400">Select what data to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    exportType === "hospital_data"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                  onClick={() => setExportType("hospital_data")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-5 h-5 text-orange-500" />
                    <span className="font-medium text-white">Hospital Data</span>
                  </div>
                  <p className="text-sm text-neutral-400">Savings, drug spend, qualifications</p>
                </div>

                <div
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    exportType === "pharmacy_data"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                  onClick={() => setExportType("pharmacy_data")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-white">Pharmacy Data</span>
                  </div>
                  <p className="text-sm text-neutral-400">Scripts, profits, qualifications</p>
                </div>

                <div
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    exportType === "summary_report"
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-neutral-600 hover:border-neutral-500"
                  }`}
                  onClick={() => setExportType("summary_report")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-white">Summary Report</span>
                  </div>
                  <p className="text-sm text-neutral-400">Quarterly summaries</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="text-neutral-300">Format:</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="w-32 bg-neutral-800 border-neutral-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-600">
                    <SelectItem value="xlsx" className="text-white">
                      Excel (.xlsx)
                    </SelectItem>
                    <SelectItem value="csv" className="text-white">
                      CSV (.csv)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quarter Selection */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-orange-500 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Quarter Selection
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Select quarters to include in export • {selectedQuarters.length} selected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={selectAllQuarters}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedQuarters([])}>
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                {quarters.map((quarter) => (
                  <div key={quarter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`quarter-${quarter.id}`}
                      checked={selectedQuarters.includes(quarter.id)}
                      onCheckedChange={(checked) => handleQuarterToggle(quarter.id, checked as boolean)}
                    />
                    <Label htmlFor={`quarter-${quarter.id}`} className="text-sm text-neutral-300">
                      Q{quarter.quarter} {quarter.year}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hospital Selection */}
          {exportType === "hospital_data" && (
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Hospital Selection</CardTitle>
                <CardDescription className="text-neutral-400">
                  Select hospitals to include • {selectedHospitals.length} selected (leave empty for all)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllHospitals}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedHospitals([])}>
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {hospitals.map((hospital) => (
                    <div key={hospital.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`hospital-${hospital.id}`}
                        checked={selectedHospitals.includes(hospital.id)}
                        onCheckedChange={(checked) => handleHospitalToggle(hospital.id, checked as boolean)}
                      />
                      <Label htmlFor={`hospital-${hospital.id}`} className="text-sm text-neutral-300">
                        {hospital.name} ({hospital.pid})
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pharmacy Selection */}
          {exportType === "pharmacy_data" && (
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-orange-500">Pharmacy Selection</CardTitle>
                <CardDescription className="text-neutral-400">
                  Select pharmacies to include • {selectedPharmacies.length} selected (leave empty for all)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex\
