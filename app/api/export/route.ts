import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, quarters, hospitals, pharmacies, format } = body

    if (!type || !quarters || quarters.length === 0) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let data: any[] = []
    let filename = ""

    switch (type) {
      case "hospital_data":
        filename = "hospital_data_export"
        const { data: hospitalData, error: hospitalError } = await supabase
          .from("hospitals")
          .select(
            `
            name,
            pid,
            hospital_data!inner(
              savings,
              drug_spend,
              savings_to_spend_percent,
              eligible_percent,
              medicaid_percent,
              quarters(quarter, year)
            ),
            hospital_qualifications(
              qualified_percent,
              inpatient_percent,
              medicaid_percent,
              orphan_percent,
              non_340b_drug_percent,
              drug_exclude_percent,
              disqualified_percent
            )
          `,
          )
          .in("hospital_data.quarter_id", quarters)
          .in("id", hospitals || [])

        if (!hospitalError && hospitalData) {
          data = hospitalData.flatMap((hospital: any) =>
            hospital.hospital_data.map((hd: any) => ({
              Hospital: hospital.name,
              PID: hospital.pid,
              Quarter: `Q${hd.quarters.quarter} ${hd.quarters.year}`,
              Savings: hd.savings || 0,
              "Drug Spend": hd.drug_spend || 0,
              "Savings to Spend %": hd.savings_to_spend_percent || 0,
              "Eligible %": hd.eligible_percent || 0,
              "Medicaid %": hd.medicaid_percent || 0,
              "Qualified %": hospital.hospital_qualifications[0]?.qualified_percent || 0,
              "Inpatient %": hospital.hospital_qualifications[0]?.inpatient_percent || 0,
              "Orphan %": hospital.hospital_qualifications[0]?.orphan_percent || 0,
              "Non-340B Drug %": hospital.hospital_qualifications[0]?.non_340b_drug_percent || 0,
              "Drug Exclude %": hospital.hospital_qualifications[0]?.drug_exclude_percent || 0,
              "Disqualified %": hospital.hospital_qualifications[0]?.disqualified_percent || 0,
            })),
          )
        }
        break

      case "pharmacy_data":
        filename = "pharmacy_data_export"
        const { data: pharmacyData, error: pharmacyError } = await supabase
          .from("pharmacies")
          .select(
            `
            name,
            pid,
            hospitals(name, pid),
            pharmacy_data!inner(
              scripts,
              dispensing_fee_avg,
              ce_revenue_avg,
              drug_cost_avg,
              current_profit_avg,
              current_profit_median,
              brand_profit_avg,
              generic_profit_avg,
              ep_added_340b_benefit,
              ep_340b_bucket_split,
              quarters(quarter, year)
            ),
            pharmacy_qualifications(
              qualified_percent,
              inpatient_percent,
              medicaid_percent,
              orphan_percent,
              non_340b_drug_percent,
              drug_exclude_percent,
              disqualified_percent
            )
          `,
          )
          .in("pharmacy_data.quarter_id", quarters)
          .in("id", pharmacies || [])

        if (!pharmacyError && pharmacyData) {
          data = pharmacyData.flatMap((pharmacy: any) =>
            pharmacy.pharmacy_data.map((pd: any) => ({
              Pharmacy: pharmacy.name,
              "Pharmacy PID": pharmacy.pid,
              Hospital: pharmacy.hospitals.name,
              "Hospital PID": pharmacy.hospitals.pid,
              Quarter: `Q${pd.quarters.quarter} ${pd.quarters.year}`,
              Scripts: pd.scripts || 0,
              "Dispensing Fee Avg": pd.dispensing_fee_avg || 0,
              "CE Revenue Avg": pd.ce_revenue_avg || 0,
              "Drug Cost Avg": pd.drug_cost_avg || 0,
              "Current Profit Avg": pd.current_profit_avg || 0,
              "Current Profit Median": pd.current_profit_median || 0,
              "Brand Profit Avg": pd.brand_profit_avg || 0,
              "Generic Profit Avg": pd.generic_profit_avg || 0,
              "EP Added 340B Benefit": pd.ep_added_340b_benefit || 0,
              "EP 340B Bucket Split": pd.ep_340b_bucket_split || 0,
              "Qualified %": pharmacy.pharmacy_qualifications[0]?.qualified_percent || 0,
              "Inpatient %": pharmacy.pharmacy_qualifications[0]?.inpatient_percent || 0,
              "Medicaid %": pharmacy.pharmacy_qualifications[0]?.medicaid_percent || 0,
              "Orphan %": pharmacy.pharmacy_qualifications[0]?.orphan_percent || 0,
              "Non-340B Drug %": pharmacy.pharmacy_qualifications[0]?.non_340b_drug_percent || 0,
              "Drug Exclude %": pharmacy.pharmacy_qualifications[0]?.drug_exclude_percent || 0,
              "Disqualified %": pharmacy.pharmacy_qualifications[0]?.disqualified_percent || 0,
            })),
          )
        }
        break

      case "summary_report":
        filename = "summary_report_export"
        // Get summary data across all quarters
        const { data: summaryData, error: summaryError } = await supabase
          .from("quarters")
          .select(
            `
            quarter,
            year,
            hospital_data(
              savings,
              drug_spend,
              savings_to_spend_percent,
              hospitals(name, pid)
            )
          `,
          )
          .in("id", quarters)

        if (!summaryError && summaryData) {
          const summaryMap = new Map()

          summaryData.forEach((quarter: any) => {
            const key = `Q${quarter.quarter} ${quarter.year}`
            if (!summaryMap.has(key)) {
              summaryMap.set(key, {
                Quarter: key,
                "Total Hospitals": 0,
                "Total Savings": 0,
                "Total Drug Spend": 0,
                "Avg Savings %": 0,
                "Top Hospital": "",
                "Top Savings": 0,
              })
            }

            const summary = summaryMap.get(key)
            let topHospital = ""
            let topSavings = 0

            quarter.hospital_data.forEach((hd: any) => {
              summary["Total Hospitals"]++
              summary["Total Savings"] += hd.savings || 0
              summary["Total Drug Spend"] += hd.drug_spend || 0
              summary["Avg Savings %"] += hd.savings_to_spend_percent || 0

              if ((hd.savings || 0) > topSavings) {
                topSavings = hd.savings || 0
                topHospital = hd.hospitals.name
              }
            })

            summary["Top Hospital"] = topHospital
            summary["Top Savings"] = topSavings
            if (summary["Total Hospitals"] > 0) {
              summary["Avg Savings %"] = summary["Avg Savings %"] / summary["Total Hospitals"]
            }
          })

          data = Array.from(summaryMap.values())
        }
        break

      default:
        return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data found for export" }, { status: 404 })
    }

    // Generate file based on format
    if (format === "csv") {
      // Convert to CSV
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    } else {
      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" })

      return new NextResponse(excelBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
