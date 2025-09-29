"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Building2, Upload, BarChart3, Settings, Bell, RefreshCw, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import HospitalDashboard from "./hospital-dashboard"
import UploadDashboard from "./upload-dashboard"
import AnalyticsDashboard from "./analytics-dashboard"
import AdminDashboard from "./admin-dashboard"

interface HealthcareDashboardProps {
  user: User
}

export default function HealthcareDashboard({ user }: HealthcareDashboardProps) {
  const [activeSection, setActiveSection] = useState("hospitals")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const userRole = user.user_metadata?.role || "hospital_admin"

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white border-r border-slate-200 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full shadow-sm`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-blue-600 font-bold text-lg">Healthcare Portal</h1>
              <p className="text-slate-500 text-xs">Data Tracking System</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-blue-600"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
            </Button>
          </div>

          <nav className="space-y-2">
            {[
              {
                id: "hospitals",
                icon: Building2,
                label: "Hospitals",
                roles: ["hospital_admin", "data_analyst", "super_admin"],
              },
              {
                id: "upload",
                icon: Upload,
                label: "Data Upload",
                roles: ["hospital_admin", "pharmacy_admin", "super_admin"],
              },
              { id: "analytics", icon: BarChart3, label: "Analytics", roles: ["data_analyst", "super_admin"] },
              { id: "admin", icon: Settings, label: "Administration", roles: ["super_admin"] },
            ]
              .filter((item) => item.roles.includes(userRole))
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-700 font-medium">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Role: {userRole.replace("_", " ").toUpperCase()}</div>
                <div>User: {user.email}</div>
                <div>Last Login: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {!sidebarCollapsed && (
            <div className="mt-4">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              Healthcare Portal /{" "}
              <span className="text-blue-600 font-medium">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">Last Update: {new Date().toLocaleString()}</div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          {activeSection === "hospitals" && <HospitalDashboard />}
          {activeSection === "upload" && <UploadDashboard />}
          {activeSection === "analytics" && <AnalyticsDashboard />}
          {activeSection === "admin" && <AdminDashboard />}
        </div>
      </div>
    </div>
  )
}
