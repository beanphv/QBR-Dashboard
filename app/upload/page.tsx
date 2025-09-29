"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Clock } from "lucide-react"

export default function DataUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [quarter, setQuarter] = useState("")
  const [year, setYear] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [uploadMessage, setUploadMessage] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!file || !quarter || !year) {
      setUploadStatus("error")
      setUploadMessage("Please select a file, quarter, and year")
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("quarter", quarter)
      formData.append("year", year)

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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadStatus("success")
        setUploadMessage(`Successfully processed ${result.recordsProcessed} records`)
      } else {
        const error = await response.json()
        setUploadStatus("error")
        setUploadMessage(error.error || "Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
      setUploadMessage("Network error occurred")
    } finally {
      setUploading(false)
    }
  }

  const recentUploads = [
    {
      id: 1,
      filename: "Q4_2024_Data.xlsx",
      quarter: "Q4",
      year: 2024,
      status: "approved",
      recordsProcessed: 156,
      uploadedAt: "2024-12-15",
    },
    {
      id: 2,
      filename: "Q3_2024_Data.xlsx",
      quarter: "Q3",
      year: 2024,
      status: "approved",
      recordsProcessed: 142,
      uploadedAt: "2024-09-15",
    },
    {
      id: 3,
      filename: "Q2_2024_Data.xlsx",
      quarter: "Q2",
      year: 2024,
      status: "pending",
      recordsProcessed: 138,
      uploadedAt: "2024-06-15",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Upload</h1>
        <p className="text-slate-600">Upload quarterly Excel files with hospital and pharmacy data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Data</CardTitle>
            <CardDescription>
              Upload Excel files containing Hospital, Hospital Qualifications, Retail Qualifications, and Retail Profit
              sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Excel File</Label>
              <div className="flex items-center gap-2">
                <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={uploading} />
                <FileSpreadsheet className="w-5 h-5 text-slate-400" />
              </div>
              {file && (
                <p className="text-sm text-slate-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quarter">Quarter</Label>
                <Select value={quarter} onValueChange={setQuarter} disabled={uploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={setYear} disabled={uploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Processing upload...</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {uploadStatus !== "idle" && (
              <Alert
                className={uploadStatus === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={uploadStatus === "success" ? "text-green-800" : "text-red-800"}>
                  {uploadMessage}
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleUpload} disabled={!file || !quarter || !year || uploading} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Uploads</CardTitle>
            <CardDescription>Track the status of your recent data uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">{upload.filename}</p>
                      <p className="text-xs text-slate-600">
                        {upload.quarter} {upload.year} • {upload.recordsProcessed} records
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        upload.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : upload.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {upload.status}
                    </span>
                    <span className="text-xs text-slate-500">{upload.uploadedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Required Excel Sheets:</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>
                  • <strong>Data - Hospital:</strong> Hospital-level metrics and savings data
                </li>
                <li>
                  • <strong>Data - Hospital Qualifications:</strong> Hospital qualification percentages
                </li>
                <li>
                  • <strong>Data - Retail Qualifications:</strong> Pharmacy qualification data
                </li>
                <li>
                  • <strong>Data - Retail Profit:</strong> Pharmacy profit and revenue metrics
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Validation:</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• All required columns must be present</li>
                <li>• Hospital and Pharmacy PIDs must be unique</li>
                <li>• Numeric values will be validated for proper format</li>
                <li>• Duplicate quarter/year data requires approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
