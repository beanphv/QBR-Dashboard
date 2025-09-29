"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Users, Shield, Database, Settings, UserPlus, Download } from "lucide-react"

const mockUsers = [
  {
    id: 1,
    email: "admin@hospital.com",
    role: "super_admin",
    status: "active",
    lastLogin: "2024-12-15",
    organization: "System Admin",
  },
  {
    id: 2,
    email: "john.doe@stmarys.com",
    role: "hospital_admin",
    status: "active",
    lastLogin: "2024-12-14",
    organization: "St. Mary's Medical Center",
  },
  {
    id: 3,
    email: "jane.smith@pharmacy.com",
    role: "pharmacy_admin",
    status: "active",
    lastLogin: "2024-12-13",
    organization: "Regional Pharmacy Network",
  },
  {
    id: 4,
    email: "analyst@healthcare.com",
    role: "data_analyst",
    status: "pending",
    lastLogin: "Never",
    organization: "Healthcare Analytics Corp",
  },
]

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    email: "",
    role: "",
    organization: "",
  })

  const handleAddUser = () => {
    if (newUser.email && newUser.role && newUser.organization) {
      const user = {
        id: users.length + 1,
        ...newUser,
        status: "pending" as const,
        lastLogin: "Never",
      }
      setUsers([...users, user])
      setNewUser({ email: "", role: "", organization: "" })
      setShowAddUser(false)
    }
  }

  const toggleUserStatus = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: user.status === "active" ? "inactive" : ("active" as const) } : user,
      ),
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive"
      case "hospital_admin":
        return "default"
      case "pharmacy_admin":
        return "secondary"
      case "data_analyst":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administration</h1>
          <p className="text-slate-600">Manage users, permissions, and system settings</p>
        </div>
        <Button onClick={() => setShowAddUser(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <p className="text-xs text-slate-600">{users.filter((u) => u.status === "active").length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.role.includes("admin")).length}
            </div>
            <p className="text-xs text-slate-600">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2.4GB</div>
            <p className="text-xs text-slate-600">Database size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-slate-600">Uptime this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account with appropriate permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@organization.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hospital_admin">Hospital Administrator</SelectItem>
                    <SelectItem value="pharmacy_admin">Pharmacy Administrator</SelectItem>
                    <SelectItem value="data_analyst">Data Analyst</SelectItem>
                    <SelectItem value="super_admin">Super Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  placeholder="Organization name"
                  value={newUser.organization}
                  onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                Create User
              </Button>
              <Button variant="outline" onClick={() => setShowAddUser(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{user.email}</h4>
                    <p className="text-sm text-slate-600">{user.organization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getRoleBadgeColor(user.role)}>{user.role.replace("_", " ").toUpperCase()}</Badge>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Last login: {user.lastLogin}</p>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                  </div>
                  <Switch checked={user.status === "active"} onCheckedChange={() => toggleUserStatus(user.id)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Actions</CardTitle>
          <CardDescription>Administrative tools and data management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <Download className="w-6 h-6" />
              <span>Export All Data</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <Database className="w-6 h-6" />
              <span>Database Backup</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
              <Settings className="w-6 h-6" />
              <span>System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
