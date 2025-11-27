"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Printer } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Appointment {
  id: string
  date: Date | string
  startTime: Date | string
  tokenNumber: number
  status: string
  doctor: { id: string; name: string; speciality?: string | null }
  patient: { id: string; name: string; phone: string }
  primaryService?: { id: string; name: string } | null
}

interface AppointmentsClientProps {
  clinicId: string
  initialAppointments: Appointment[]
  doctors: Array<{ id: string; name: string; speciality?: string | null }>
  patients: Array<{ id: string; name: string; phone: string }>
  services: Array<{ id: string; name: string }>
  selectedDate: string
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-gray-100 text-gray-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  IN_CONSULTATION: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  NO_SHOW: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
}

export function AppointmentsClient({
  clinicId,
  initialAppointments,
  doctors,
  patients,
  services,
  selectedDate: initialDate,
}: AppointmentsClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedDate, setSelectedDate] = useState(initialDate)

  useEffect(() => {
    // Refresh appointments when date changes
    fetch(`/api/clinic/${clinicId}/appointments?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
  }, [selectedDate, clinicId])

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `/api/clinic/${clinicId}/appointments/${appointmentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const formatTime = (time: Date | string) => {
    const date = typeof time === "string" ? new Date(time) : time
    return format(date, "HH:mm")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your clinic appointments</p>
        </div>
        <Button asChild>
          <Link href={`/app/clinic/${clinicId}/appointments/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointments</CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No appointments scheduled for this date
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">
                      #{appointment.tokenNumber}
                    </div>
                    <div>
                      <div className="font-medium">
                        {appointment.patient.name} - {appointment.patient.phone}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(appointment.startTime)} - {appointment.doctor.name}
                        {appointment.doctor.speciality && ` (${appointment.doctor.speciality})`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[appointment.status] || statusColors.SCHEDULED}`}
                    >
                      {appointment.status.replace("_", " ")}
                    </span>
                    <Link
                      href={`/app/clinic/${clinicId}/token/${appointment.id}/print`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </Link>
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        handleStatusChange(appointment.id, e.target.value)
                      }
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="CHECKED_IN">Checked In</option>
                      <option value="IN_CONSULTATION">In Consultation</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="NO_SHOW">No Show</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

