import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get query parameters for filtering
    const quarter = searchParams.get("quarter")
    const year = searchParams.get("year")
    const search = searchParams.get("search")
    const minSavings = searchParams.get("minSavings")
    const maxSavings = searchParams.get("maxSavings")

    // Build query
    let query = supabase.from("hospitals").select(`
        *,
        quarterly_hospital_data (
          quarter,
          year,
          savings,
          drug_spend,
          savings_to_spend_percent,
          eligible_percent,
          medicaid_percent
        ),
        pharmacies (
          id,
          name
        )
      `)

    // Apply filters
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: hospitals, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by quarterly data if specified
    let filteredHospitals = hospitals

    if (quarter || year || minSavings || maxSavings) {
      filteredHospitals = hospitals?.filter((hospital) => {
        const quarterlyData = hospital.quarterly_hospital_data

        if (!quarterlyData || quarterlyData.length === 0) return false

        return quarterlyData.some((data: any) => {
          if (quarter && data.quarter !== quarter) return false
          if (year && data.year.toString() !== year) return false
          if (minSavings && data.savings_to_spend_percent < Number.parseFloat(minSavings)) return false
          if (maxSavings && data.savings_to_spend_percent > Number.parseFloat(maxSavings)) return false
          return true
        })
      })
    }

    return NextResponse.json({ hospitals: filteredHospitals })
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
