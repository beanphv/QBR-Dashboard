import * as XLSX from "xlsx"

export interface HospitalData {
  hospital: string
  pharmacyPid: string
  qualified: number
  inpatient: number
  medicaid: number
  orphan: number
  non340bDrug: number
  drugExclude: number
  disqualified: number
  // Add other metrics from the Hospital sheet
  savings?: number
  drugSpend?: number
  savingsToSpendPercent?: number
  eligiblePercent?: number
  medicaidPercent?: number
  macroSavings?: number
}

export interface HospitalQualificationData {
  hospital: string
  pid: string
  qualified: number
  inpatient: number
  medicaid: number
  orphan: number
  non340bDrug: number
  drugExclude: number
  disqualified: number
}

export interface PharmacyQualificationData {
  hospital: string
  pharmacyPid: string
  qualified: number
  inpatient: number
  medicaid: number
  orphan: number
  non340bDrug: number
  drugExclude: number
  disqualified: number
}

export interface PharmacyProfitData {
  hospital: string
  pharmacyPid: string
  scripts: number
  dispensingFee: number
  ceRevenue: number
  drugCost: number
  currentProfit: number
  currentProfitMedian: number
  brandProfit: number
  brandProfitAvg: number
  genericProfit: number
  genericProfitAvg: number
  epAdded340bBenefit: number
  ep340bBucketSplit: number
}

export interface ParsedExcelData {
  hospitalData: HospitalData[]
  hospitalQualifications: HospitalQualificationData[]
  pharmacyQualifications: PharmacyQualificationData[]
  pharmacyProfitData: PharmacyProfitData[]
}

export function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        const result: ParsedExcelData = {
          hospitalData: [],
          hospitalQualifications: [],
          pharmacyQualifications: [],
          pharmacyProfitData: [],
        }

        // Parse Hospital sheet
        if (workbook.SheetNames.includes("Data - Hospital")) {
          const hospitalSheet = workbook.Sheets["Data - Hospital"]
          const hospitalJson = XLSX.utils.sheet_to_json(hospitalSheet, { header: 1 }) as any[][]

          // Skip header row and parse data
          for (let i = 1; i < hospitalJson.length; i++) {
            const row = hospitalJson[i]
            if (row[0]) {
              // Check if hospital name exists
              result.hospitalData.push({
                hospital: row[0],
                pharmacyPid: row[1],
                qualified: Number.parseFloat(row[2]) || 0,
                inpatient: Number.parseFloat(row[3]) || 0,
                medicaid: Number.parseFloat(row[4]) || 0,
                orphan: Number.parseFloat(row[5]) || 0,
                non340bDrug: Number.parseFloat(row[6]) || 0,
                drugExclude: Number.parseFloat(row[7]) || 0,
                disqualified: Number.parseFloat(row[8]) || 0,
                // Add other metrics based on your Excel structure
                savings: Number.parseFloat(row[9]) || 0,
                drugSpend: Number.parseFloat(row[10]) || 0,
                savingsToSpendPercent: Number.parseFloat(row[11]) || 0,
                eligiblePercent: Number.parseFloat(row[12]) || 0,
                medicaidPercent: Number.parseFloat(row[13]) || 0,
                macroSavings: Number.parseFloat(row[14]) || 0,
              })
            }
          }
        }

        // Parse Hospital Qualifications sheet
        if (workbook.SheetNames.includes("Data - Hospital Qualifications")) {
          const qualSheet = workbook.Sheets["Data - Hospital Qualifications"]
          const qualJson = XLSX.utils.sheet_to_json(qualSheet, { header: 1 }) as any[][]

          for (let i = 1; i < qualJson.length; i++) {
            const row = qualJson[i]
            if (row[0]) {
              result.hospitalQualifications.push({
                hospital: row[0],
                pid: row[1],
                qualified: Number.parseFloat(row[2]) || 0,
                inpatient: Number.parseFloat(row[3]) || 0,
                medicaid: Number.parseFloat(row[4]) || 0,
                orphan: Number.parseFloat(row[5]) || 0,
                non340bDrug: Number.parseFloat(row[6]) || 0,
                drugExclude: Number.parseFloat(row[7]) || 0,
                disqualified: Number.parseFloat(row[8]) || 0,
              })
            }
          }
        }

        // Parse Retail Qualifications sheet
        if (workbook.SheetNames.includes("Data - Retail Qualifications")) {
          const retailQualSheet = workbook.Sheets["Data - Retail Qualifications"]
          const retailQualJson = XLSX.utils.sheet_to_json(retailQualSheet, { header: 1 }) as any[][]

          for (let i = 1; i < retailQualJson.length; i++) {
            const row = retailQualJson[i]
            if (row[0]) {
              result.pharmacyQualifications.push({
                hospital: row[0],
                pharmacyPid: row[1],
                qualified: Number.parseFloat(row[2]) || 0,
                inpatient: Number.parseFloat(row[3]) || 0,
                medicaid: Number.parseFloat(row[4]) || 0,
                orphan: Number.parseFloat(row[5]) || 0,
                non340bDrug: Number.parseFloat(row[6]) || 0,
                drugExclude: Number.parseFloat(row[7]) || 0,
                disqualified: Number.parseFloat(row[8]) || 0,
              })
            }
          }
        }

        // Parse Retail Profit sheet
        if (workbook.SheetNames.includes("Data - Retail Profit")) {
          const profitSheet = workbook.Sheets["Data - Retail Profit"]
          const profitJson = XLSX.utils.sheet_to_json(profitSheet, { header: 1 }) as any[][]

          for (let i = 1; i < profitJson.length; i++) {
            const row = profitJson[i]
            if (row[0]) {
              result.pharmacyProfitData.push({
                hospital: row[0],
                pharmacyPid: row[1],
                scripts: Number.parseInt(row[2]) || 0,
                dispensingFee: Number.parseFloat(row[3]) || 0,
                ceRevenue: Number.parseFloat(row[4]) || 0,
                drugCost: Number.parseFloat(row[5]) || 0,
                currentProfit: Number.parseFloat(row[6]) || 0,
                currentProfitMedian: Number.parseFloat(row[7]) || 0,
                brandProfit: Number.parseFloat(row[8]) || 0,
                brandProfitAvg: Number.parseFloat(row[9]) || 0,
                genericProfit: Number.parseFloat(row[10]) || 0,
                genericProfitAvg: Number.parseFloat(row[11]) || 0,
                epAdded340bBenefit: Number.parseFloat(row[12]) || 0,
                ep340bBucketSplit: Number.parseFloat(row[13]) || 0,
              })
            }
          }
        }

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsArrayBuffer(file)
  })
}
