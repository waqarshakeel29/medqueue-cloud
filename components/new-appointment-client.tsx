"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface NewAppointmentClientProps {
  clinicId: string
  doctors: Array<{ id: string; name: string; speciality?: string | null }>
  patients: Array<{ id: string; name: string; phone: string }>
  services: Array<{ id: string; name: string }>
}

export function NewAppointmentClient({
  clinicId,
  doctors,
  patients,
  services,
}: NewAppointmentClientProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    doctorId: "",
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    primaryServiceId: "",
    visitType: "NEW" as "NEW" | "FOLLOW_UP",
    notesForReception: "",
    notesForDoctor: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/clinic/${clinicId}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create appointment")
        return
      }

      router.push(`/app/clinic/${clinicId}/appointments`)
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/app/clinic/${clinicId}/appointments`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Appointment</h1>
          <p className="text-gray-600 mt-1">Schedule a new appointment</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor *</Label>
                <select
                  id="doctorId"
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                      {doctor.speciality && ` - ${doctor.speciality}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <select
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visitType">Visit Type</Label>
                <select
                  id="visitType"
                  value={formData.visitType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      visitType: e.target.value as "NEW" | "FOLLOW_UP",
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="NEW">New</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryServiceId">Service</Label>
                <select
                  id="primaryServiceId"
                  value={formData.primaryServiceId}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryServiceId: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select service (optional)</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notesForReception">Notes for Reception</Label>
              <textarea
                id="notesForReception"
                value={formData.notesForReception}
                onChange={(e) =>
                  setFormData({ ...formData, notesForReception: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notesForDoctor">Notes for Doctor</Label>
              <textarea
                id="notesForDoctor"
                value={formData.notesForDoctor}
                onChange={(e) =>
                  setFormData({ ...formData, notesForDoctor: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Appointment"}
              </Button>
              <Link href={`/app/clinic/${clinicId}/appointments`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

