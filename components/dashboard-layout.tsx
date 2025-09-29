"use client"

import type React from "react"

import { useState } from "react"
import { ChevronRight, Database, Upload, Building2, Pill, BarChart3, Download, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
              <h1 className="text-orange-500 font-bold text-lg tracking-wider">HEALTHCARE DATA</h1>
              <p className="text-neutral-500 text-xs">ANALYTICS PORTAL</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-neutral-400 hover:text-orange-500"
            >
              <ChevronRight
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
              />
            </Button>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <Database className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">OVERVIEW</span>}
            </Link>
            <Link
              href="/dashboard/upload"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <Upload className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">UPLOAD DATA</span>}
            </Link>
            <Link
              href="/dashboard/hospitals"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <Building2 className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">HOSPITALS</span>}
            </Link>
            <Link
              href="/dashboard/pharmacies"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <Pill className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">PHARMACIES</span>}
            </Link>
            <Link
              href="/dashboard/analytics"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <BarChart3 className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">ANALYTICS</span>}
            </Link>
            <Link
              href="/dashboard/export"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <Download className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">EXPORT</span>}
            </Link>
          </nav>

          {!sidebarCollapsed && (
            <div className="mt-8 p-4 bg-neutral-800 border border-neutral-700 rounded">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-white">SYSTEM ONLINE</span>
              </div>
              <div className="text-xs text-neutral-500">
                <div>DATABASE: CONNECTED</div>
                <div>LAST SYNC: REAL-TIME</div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 rounded transition-colors text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="text-sm font-medium">SIGN OUT</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
        {/* Top Toolbar */}
        <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-400">
              HEALTHCARE DATA / <span className="text-orange-500">DASHBOARD</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-neutral-500">LAST UPDATE: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  )
}
