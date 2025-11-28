"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  CreditCard,
  Settings,
  Ticket,
} from "lucide-react"
import { ClinicRole } from "@prisma/client"

interface AppSidebarProps {
  clinicId: string
  role?: ClinicRole | null
}

const navigation = [
  { name: "Dashboard", href: (id: string) => `/app/clinic/${id}`, icon: LayoutDashboard },
  { name: "Appointments", href: (id: string) => `/app/clinic/${id}/appointments`, icon: Calendar },
  { name: "Queue", href: (id: string) => `/app/clinic/${id}/queue`, icon: Ticket },
  { name: "Patients", href: (id: string) => `/app/clinic/${id}/patients`, icon: Users },
  { name: "Doctors", href: (id: string) => `/app/clinic/${id}/doctors`, icon: UserCheck },
  { name: "Billing", href: (id: string) => `/app/clinic/${id}/billing`, icon: CreditCard },
  { name: "Settings", href: (id: string) => `/app/clinic/${id}/settings`, icon: Settings },
]

export function AppSidebar({ clinicId, role }: AppSidebarProps) {
  const pathname = usePathname()

  // Filter out Settings for RECEPTION role
  const filteredNavigation = navigation.filter((item) => {
    if (item.name === "Settings" && role === ClinicRole.RECEPTION) {
      return false
    }
    return true
  })

  return (
    <div className="flex w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold text-primary">MedQueue Cloud</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const href = item.href(clinicId)
          const isActive = pathname === href || pathname?.startsWith(href + "/")
          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

