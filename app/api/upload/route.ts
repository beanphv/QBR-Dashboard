import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { parseExcelFile } from "@/lib/excel-parser"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and has admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const quarter = formData.get("quarter") as string
    const year = Number.parseInt(formData.get("year") as string)

    if (!file || !quarter || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Parse Excel file
    const parsedData = await parseExcelFile(file)

    // Start transaction
    const { data: uploadRecord, error: uploadError } = await supabase
      .from("data_uploads")
      .insert({
        uploaded_by: user.id,
        quarter,
        year,
        filename: file.name,
        status: "pending",
      })
      .select()
      .single()

    if (uploadError) {
      return NextResponse.json({ error: "Failed to create upload record" }, { status: 500 })
    }

    let recordsProcessed = 0

    // Process hospital data
    for (const hospitalData of parsedData.hospitalData) {
      // Insert or update hospital
      const { data: hospital, error: hospitalError } = await supabase
        .from("hospitals")
        .upsert(
          {
            pid: hospitalData.pharmacyPid, // Using pharmacy PID as hospital identifier
            name: hospitalData.hospital,
          },
          { onConflict: "pid" },
        )
        .select()
        .single()

      if (hospitalError) continue

      // Insert quarterly hospital data
      await supabase.from("quarterly_hospital_data").upsert(
        {
          hospital_id: hospital.id,
          quarter,
          year,
          savings: hospitalData.savings,
          drug_spend: hospitalData.drugSpend,
          savings_to_spend_percent: hospitalData.savingsToSpendPercent,
          eligible_percent: hospitalData.eligiblePercent,
          medicaid_percent: hospitalData.medicaidPercent,
          macro_savings: hospitalData.macroSavings,
        },
        { onConflict: "hospital_id,quarter,year" },
      )

      recordsProcessed++
    }

    // Process hospital qualifications
    for (const qualData of parsedData.hospitalQualifications) {
      const { data: hospital } = await supabase.from("hospitals").select("id").eq("pid", qualData.pid).single()

      if (hospital) {
        await supabase.from("hospital_qualifications").upsert(
          {
            hospital_id: hospital.id,
            quarter,
            year,
            qualified_percent: qualData.qualified,
            inpatient_percent: qualData.inpatient,
            medicaid_percent: qualData.medicaid,
            orphan_percent: qualData.orphan,
            non_340b_drug_percent: qualData.non340bDrug,
            drug_exclude_percent: qualData.drugExclude,
            disqualified_percent: qualData.disqualified,
          },
          { onConflict: "hospital_id,quarter,year" },
        )

        recordsProcessed++
      }
    }

    // Process pharmacy data
    for (const pharmacyData of parsedData.pharmacyQualifications) {
      // Find or create hospital
      const { data: hospital } = await supabase
        .from("hospitals")
        .select("id")
        .eq("name", pharmacyData.hospital)
        .single()

      if (hospital) {
        // Insert or update pharmacy
        const { data: pharmacy, error: pharmacyError } = await supabase
          .from("pharmacies")
          .upsert(
            {
              pid: pharmacyData.pharmacyPid,
              name: `${pharmacyData.hospital} Pharmacy`,
              hospital_id: hospital.id,
            },
            { onConflict: "pid" },
          )
          .select()
          .single()

        if (pharmacy) {
          await supabase.from("pharmacy_qualifications").upsert(
            {
              pharmacy_id: pharmacy.id,
              quarter,
              year,
              qualified_percent: pharmacyData.qualified,
              inpatient_percent: pharmacyData.inpatient,
              medicaid_percent: pharmacyData.medicaid,
              orphan_percent: pharmacyData.orphan,
              non_340b_drug_percent: pharmacyData.non340bDrug,
              drug_exclude_percent: pharmacyData.drugExclude,
              disqualified_percent: pharmacyData.disqualified,
            },
            { onConflict: "pharmacy_id,quarter,year" },
          )

          recordsProcessed++
        }
      }
    }

    // Process pharmacy profit data
    for (const profitData of parsedData.pharmacyProfitData) {
      const { data: pharmacy } = await supabase
        .from("pharmacies")
        .select("id")
        .eq("pid", profitData.pharmacyPid)
        .single()

      if (pharmacy) {
        await supabase.from("quarterly_pharmacy_data").upsert(
          {
            pharmacy_id: pharmacy.id,
            quarter,
            year,
            scripts: profitData.scripts,
            dispensing_fee: profitData.dispensingFee,
            ce_revenue: profitData.ceRevenue,
            drug_cost: profitData.drugCost,
            current_profit: profitData.currentProfit,
            current_profit_median: profitData.currentProfitMedian,
            brand_profit: profitData.brandProfit,
            brand_profit_avg: profitData.brandProfitAvg,
            generic_profit: profitData.genericProfit,
            generic_profit_avg: profitData.genericProfitAvg,
            ep_added_340b_benefit: profitData.epAdded340bBenefit,
            ep_340b_bucket_split: profitData.ep340bBucketSplit,
          },
          { onConflict: "pharmacy_id,quarter,year" },
        )

        recordsProcessed++
      }
    }

    // Update upload record
    await supabase
      .from("data_uploads")
      .update({
        records_processed: recordsProcessed,
        status: "approved",
      })
      .eq("id", uploadRecord.id)

    return NextResponse.json({
      success: true,
      recordsProcessed,
      uploadId: uploadRecord.id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
