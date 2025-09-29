"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { createBrowserClient } from "@supabase/ssr"
import { Upload, FileText, CheckCircle, AlertCircle, Database } from "lucide-react"

interface UploadDashboardProps {
  onUploadComplete: () => void
}

export default function UploadDashboard({ onUploadComplete }: UploadDashboardProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")
  const [selectedDataType, setSelectedDataType] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedDataType) {
      setUploadStatus("error")
      setUploadMessage("Please select a file and data type")
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setUploadStatus("idle")

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Parse CSV file
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      console.log("[v0] Processing file:", file.name, "Type:", selectedDataType)
      console.log("[v0] Headers found:", headers)

      // Process data based on type
      const processedData = []
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || null
          })
          processedData.push(row)
        }
      }

      console.log("[v0] Processed rows:", processedData.length)

      // Insert data based on selected type
      let result
      if (selectedDataType === "hospital_data") {
        result = await supabase.from("hospital_data").insert(processedData)
      } else if (selectedDataType === "pharmacy_data") {
        result = await supabase.from("pharmacy_data").insert(processedData)
      } else if (selectedDataType === "hospital_qualifications") {
        result = await supabase.from("hospital_qualifications").insert(processedData)
      } else if (selectedDataType === "pharmacy_qualifications") {
        result = await supabase.from("pharmacy_qualifications").insert(processedData)
      } else if (selectedDataType === "hospitals") {
        result = await supabase.from("hospitals").insert(processedData)
      } else if (selectedDataType === "pharmacies") {
        result = await supabase.from("pharmacies").insert(processedData)
      }

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result?.error) {
        console.error("[v0] Upload error:", result.error)
        setUploadStatus("error")
        setUploadMessage(`Upload failed: ${result.error.message}`)
      } else {
        console.log("[v0] Upload successful:", result)
        setUploadStatus("success")
        setUploadMessage(`Successfully uploaded ${processedData.length} records`)
        onUploadComplete()
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadStatus("error")
      setUploadMessage(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setUploading(false)
      setTimeout(() => {
        setUploadProgress(0)
        setUploadStatus("idle")
        setUploadMessage("")
      }, 3000)
    }
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadMessage("")
    setUploadProgress(0)
    setSelectedDataType("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Upload</h1>
          <p className="text-slate-400">Upload CSV files to update 340B program data</p>
        </div>
        <Button onClick={resetUpload} variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
          <Database className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Upload Status */}
      {uploadStatus !== "idle" && (
        <Alert
          className={`border ${
            uploadStatus === "success" ? "border-green-600 bg-green-900/20" : "border-red-600 bg-red-900/20"
          }`}
        >
          {uploadStatus === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400" />
          )}
          <AlertDescription className={uploadStatus === "success" ? "text-green-300" : "text-red-300"}>
            {uploadMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Uploading...</span>
                <span className="text-slate-300">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="upload" className="data-[state=active]:bg-slate-700">
            Upload Data
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload CSV Data
              </CardTitle>
              <CardDescription className="text-slate-400">
                Select the data type and upload a CSV file with the corresponding format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataType" className="text-slate-300">
                  Data Type
                </Label>
                <Select value={selectedDataType} onValueChange={setSelectedDataType}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select data type to upload" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="hospitals">Hospitals</SelectItem>
                    <SelectItem value="pharmacies">Pharmacies</SelectItem>
                    <SelectItem value="hospital_data">Hospital Data</SelectItem>
                    <SelectItem value="pharmacy_data">Pharmacy Data</SelectItem>
                    <SelectItem value="hospital_qualifications">Hospital Qualifications</SelectItem>
                    <SelectItem value="pharmacy_qualifications">Pharmacy Qualifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file" className="text-slate-300">
                  CSV File
                </Label>
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading || !selectedDataType}
                  className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
                />
              </div>

              <div className="text-sm text-slate-500">
                <p>• CSV files should include headers in the first row</p>
                <p>• Make sure column names match the database schema</p>
                <p>• Maximum file size: 10MB</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                CSV Templates
              </CardTitle>
              <CardDescription className="text-slate-400">
                Download template files to ensure proper data formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Hospitals", desc: "Hospital information and IDs" },
                  { name: "Pharmacies", desc: "Pharmacy locations and details" },
                  { name: "Hospital Data", desc: "Financial and operational metrics" },
                  { name: "Pharmacy Data", desc: "Prescription and profit data" },
                  { name: "Hospital Qualifications", desc: "340B qualification percentages" },
                  { name: "Pharmacy Qualifications", desc: "Pharmacy compliance metrics" },
                ].map((template) => (
                  <div key={template.name} className="p-4 border border-slate-600 rounded-lg">
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{template.desc}</p>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                      Download Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
