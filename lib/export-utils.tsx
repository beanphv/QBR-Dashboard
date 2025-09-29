import * as XLSX from "xlsx"

export interface ExportData {
  hospitals?: any[]
  pharmacies?: any[]
  quarterlyData?: any[]
  qualifications?: any[]
}

export function exportToExcel(data: ExportData, filename: string) {
  const workbook = XLSX.utils.book_new()

  // Hospital data sheet
  if (data.hospitals && data.hospitals.length > 0) {
    const hospitalSheet = XLSX.utils.json_to_sheet(data.hospitals)
    XLSX.utils.book_append_sheet(workbook, hospitalSheet, "Hospitals")
  }

  // Pharmacy data sheet
  if (data.pharmacies && data.pharmacies.length > 0) {
    const pharmacySheet = XLSX.utils.json_to_sheet(data.pharmacies)
    XLSX.utils.book_append_sheet(workbook, pharmacySheet, "Pharmacies")
  }

  // Quarterly data sheet
  if (data.quarterlyData && data.quarterlyData.length > 0) {
    const quarterlySheet = XLSX.utils.json_to_sheet(data.quarterlyData)
    XLSX.utils.book_append_sheet(workbook, quarterlySheet, "Quarterly Data")
  }

  // Qualifications sheet
  if (data.qualifications && data.qualifications.length > 0) {
    const qualSheet = XLSX.utils.json_to_sheet(data.qualifications)
    XLSX.utils.book_append_sheet(workbook, qualSheet, "Qualifications")
  }

  // Write and download file
  XLSX.writeFile(workbook, filename)
}

export function exportToPDF(data: any[], title: string) {
  // Create a simple HTML table for PDF export
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e293b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background-color: #f8fafc; font-weight: bold; }
          .number { text-align: right; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${generateTableHTML(data)}
      </body>
    </html>
  `

  // Create blob and download
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function generateTableHTML(data: any[]): string {
  if (!data || data.length === 0) return "<p>No data available</p>"

  const headers = Object.keys(data[0])
  const headerRow = headers.map((header) => `<th>${header}</th>`).join("")
  const dataRows = data
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header]
          const isNumber = typeof value === "number"
          return `<td class="${isNumber ? "number" : ""}">${value}</td>`
        })
        .join("")
      return `<tr>${cells}</tr>`
    })
    .join("")

  return `
    <table>
      <thead>
        <tr>${headerRow}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  `
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
