"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { parseExcelFile, type ParsedExcelData } from "@/lib/excel-parser"

interface UploadResult {
  success: boolean
  message: string
  results?: {
    hospitalData: number
    hospitalQualifications: number
    pharmacyData: number
    pharmacyQualifications: number
  }
}

export function DataUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [quarter, setQuarter] = useState<string>("")
  const [year, setYear] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      setResult({
        success: false,
        message: "Please select a valid Excel file (.xlsx or .xls)",
      })
      return
    }

    setFile(selectedFile)
    setResult(null)

    // Parse file preview
    try {
      const parsed = await parseExcelFile(selectedFile)
      setParsedData(parsed)
    } catch (error) {
      console.error("Parse error:", error)
      setResult({
        success: false,
        message: "Failed to parse Excel file. Please check the file format.",
      })
    }
  }

  const handleUpload = async () => {
    if (!file || !quarter || !year || !parsedData) {
      setResult({
        success: false,
        message: "Please select a file, quarter, and year",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quarter: Number.parseInt(quarter),
          year: Number.parseInt(year),
          data: parsedData,
        }),
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const uploadResult = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: uploadResult.message,
          results: uploadResult.results,
        })
        // Reset form
        setFile(null)
        setQuarter("")
        setYear("")
        setParsedData(null)
        // Reset file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setResult({
          success: false,
          message: uploadResult.error || "Upload failed",
        })
      }
    } catch (error) {
      console.error("Upload error:", error)
      setResult({
        success: false,
        message: "Network error. Please try again.",
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 2000)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-orange-500 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Quarterly Data Upload
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Upload Excel workbook with quarterly hospital and pharmacy data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quarter and Year Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quarter" className="text-neutral-300">
              Quarter
            </Label>
            <Select value={quarter} onValueChange={setQuarter}>
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                <SelectItem value="1" className="text-white">
                  Q1
                </SelectItem>
                <SelectItem value="2" className="text-white">
                  Q2
                </SelectItem>
                <SelectItem value="3" className="text-white">
                  Q3
                </SelectItem>
                <SelectItem value="4" className="text-white">
                  Q4
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year" className="text-neutral-300">
              Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()} className="text-white">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-neutral-300">
            Excel File
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="bg-neutral-800 border-neutral-600 text-white file:bg-orange-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1"
            />
            {file && (
              <div className="flex items-center gap-2 text-green-500">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Data Preview */}
        {parsedData && (
          <div className="space-y-2">
            <Label className="text-neutral-300">Data Preview</Label>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-neutral-800 p-3 rounded border border-neutral-600">
                <div className="text-orange-500 font-medium">Hospital Data</div>
                <div className="text-neutral-400">{parsedData.hospitalData.length} records</div>
              </div>
              <div className="bg-neutral-800 p-3 rounded border border-neutral-600">
                <div className="text-orange-500 font-medium">Hospital Qualifications</div>
                <div className="text-neutral-400">{parsedData.hospitalQualifications.length} records</div>
              </div>
              <div className="bg-neutral-800 p-3 rounded border border-neutral-600">
                <div className="text-orange-500 font-medium">Retail Qualifications</div>
                <div className="text-neutral-400">{parsedData.retailQualifications.length} records</div>
              </div>
              <div className="bg-neutral-800 p-3 rounded border border-neutral-600">
                <div className="text-orange-500 font-medium">Retail Profit</div>
                <div className="text-neutral-400">{parsedData.retailProfit.length} records</div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <Label className="text-neutral-300">Upload Progress</Label>
            <Progress value={uploadProgress} className="bg-neutral-800" />
            <div className="text-sm text-neutral-400">
              {uploadProgress < 100 ? "Processing data..." : "Upload complete!"}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !quarter || !year || isUploading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700"
        >
          {isUploading ? "Uploading..." : "Upload Data"}
        </Button>

        {/* Result Message */}
        {result && (
          <Alert
            className={`border ${result.success ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}`}
          >
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <AlertDescription className={result.success ? "text-green-400" : "text-red-400"}>
                {result.message}
              </AlertDescription>
            </div>
            {result.success && result.results && (
              <div className="mt-2 text-sm text-neutral-400">
                <div>Hospital Data: {result.results.hospitalData} records</div>
                <div>Hospital Qualifications: {result.results.hospitalQualifications} records</div>
                <div>Pharmacy Data: {result.results.pharmacyData} records</div>
                <div>Pharmacy Qualifications: {result.results.pharmacyQualifications} records</div>
              </div>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
