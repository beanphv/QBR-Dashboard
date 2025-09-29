"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X, Download } from "lucide-react"
import { format } from "date-fns"

export interface FilterState {
  searchTerm: string
  quarters: string[]
  years: string[]
  savingsRange: [number, number]
  hospitals: string[]
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  performanceThreshold: string
}

interface AdvancedFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onExport: (format: "excel" | "pdf" | "csv") => void
  availableHospitals: string[]
  totalRecords: number
  filteredRecords: number
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onExport,
  availableHospitals,
  totalRecords,
  filteredRecords,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: "",
      quarters: [],
      years: [],
      savingsRange: [0, 100],
      hospitals: [],
      dateRange: { from: undefined, to: undefined },
      performanceThreshold: "all",
    })
  }

  const activeFilterCount = [
    filters.searchTerm,
    filters.quarters.length > 0,
    filters.years.length > 0,
    filters.hospitals.length > 0,
    filters.dateRange.from || filters.dateRange.to,
    filters.performanceThreshold !== "all",
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Showing {filteredRecords} of {totalRecords} records
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input
              placeholder="Search hospitals..."
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Quarter</Label>
            <Select
              value={filters.quarters[0] || "all"}
              onValueChange={(value) => updateFilters({ quarters: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All quarters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All quarters</SelectItem>
                <SelectItem value="Q1">Q1</SelectItem>
                <SelectItem value="Q2">Q2</SelectItem>
                <SelectItem value="Q3">Q3</SelectItem>
                <SelectItem value="Q4">Q4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Select
              value={filters.years[0] || "all"}
              onValueChange={(value) => updateFilters({ years: value ? [value] : [] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Performance</Label>
            <Select
              value={filters.performanceThreshold}
              onValueChange={(value) => updateFilters({ performanceThreshold: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hospitals</SelectItem>
                <SelectItem value="above_target">Above target &gt;25%</SelectItem>
                <SelectItem value="below_target">Below target &lt;25%</SelectItem>
                <SelectItem value="top_performers">Top performers &gt;30%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters - Expandable */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital Selection */}
              <div className="space-y-3">
                <Label>Hospitals</Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                  {availableHospitals.map((hospital) => (
                    <div key={hospital} className="flex items-center space-x-2">
                      <Checkbox
                        id={hospital}
                        checked={filters.hospitals.includes(hospital)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFilters({ hospitals: [...filters.hospitals, hospital] })
                          } else {
                            updateFilters({ hospitals: filters.hospitals.filter((h) => h !== hospital) })
                          }
                        }}
                      />
                      <Label htmlFor={hospital} className="text-sm">
                        {hospital}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <Label>Date Range</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, from: date } })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => updateFilters({ dateRange: { ...filters.dateRange, to: date } })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Savings Range Slider */}
            <div className="space-y-3">
              <Label>
                Savings Percentage Range: {filters.savingsRange[0]}% - {filters.savingsRange[1]}%
              </Label>
              <Slider
                value={filters.savingsRange}
                onValueChange={(value) => updateFilters({ savingsRange: value as [number, number] })}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            {filteredRecords !== totalRecords && (
              <span>
                Filtered: {filteredRecords} records ({((filteredRecords / totalRecords) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
              <Download className="w-4 h-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
              <Download className="w-4 h-4 mr-1" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
              <Download className="w-4 h-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
