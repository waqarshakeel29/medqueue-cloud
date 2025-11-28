"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface QueueClientProps {
  clinicId: string
  initialAppointments: Array<{
    id: string
    tokenNumber: number
    status: string
    doctor: { id: string; name: string }
    patient: { id: string; name: string; phone: string }
  }>
  doctors: Array<{ id: string; name: string }>
  selectedDoctorId: string | null
}

export function QueueClient({
  clinicId,
  initialAppointments,
  doctors,
  selectedDoctorId: initialDoctorId,
}: QueueClientProps) {
  const router = useRouter()
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId)
  const [appointments, setAppointments] = useState(initialAppointments)

  useEffect(() => {
    const fetchAppointments = () => {
      fetch(
        `/api/clinic/${clinicId}/appointments?date=${new Date()
          .toISOString()
          .split("T")[0]}${selectedDoctorId ? `&doctorId=${selectedDoctorId}` : ""}`
      )
        .then((res) => res.json())
        .then((data) => {
          setAppointments(
            data.filter((a: any) =>
              ["SCHEDULED", "CHECKED_IN", "IN_CONSULTATION"].includes(a.status)
            )
          )
        })
    }

    fetchAppointments()
    const interval = setInterval(fetchAppointments, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [clinicId, selectedDoctorId])

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
        const updatedAppointment = await response.json()
        setAppointments((prev) => {
          const next = prev.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: updatedAppointment.status } : apt
          )
          return next.filter((apt) =>
            ["SCHEDULED", "CHECKED_IN", "IN_CONSULTATION"].includes(apt.status)
          )
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const groupedByDoctor = appointments.reduce((acc, apt) => {
    const doctorId = apt.doctor.id
    if (!acc[doctorId]) {
      acc[doctorId] = {
        doctor: apt.doctor,
        appointments: [],
      }
    }
    acc[doctorId].appointments.push(apt)
    return acc
  }, {} as Record<string, { doctor: { id: string; name: string }; appointments: typeof appointments }>)

  const activeDoctors = Object.values(groupedByDoctor)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Queue</h1>
        <p className="text-gray-600 mt-1">Real-time queue management</p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={selectedDoctorId === null ? "default" : "outline"}
          onClick={() => {
            setSelectedDoctorId(null)
            router.push(`/app/clinic/${clinicId}/queue`)
          }}
        >
          All Doctors
        </Button>
        {doctors.map((doctor) => (
          <Button
            key={doctor.id}
            variant={selectedDoctorId === doctor.id ? "default" : "outline"}
            onClick={() => {
              setSelectedDoctorId(doctor.id)
              router.push(`/app/clinic/${clinicId}/queue?doctorId=${doctor.id}`)
            }}
          >
            {doctor.name}
          </Button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(selectedDoctorId
          ? activeDoctors.filter((d) => d.doctor.id === selectedDoctorId)
          : activeDoctors
        ).map(({ doctor, appointments: doctorAppointments }) => {
          const nowServing = doctorAppointments.find(
            (a) => a.status === "IN_CONSULTATION"
          )
          const checkedIn = doctorAppointments.filter(
            (a) => a.status === "CHECKED_IN"
          )
          const scheduled = doctorAppointments.filter(
            (a) => a.status === "SCHEDULED"
          )

          return (
            <Card key={doctor.id}>
              <CardHeader>
                <CardTitle>{doctor.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nowServing && (
                  <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">
                    <div className="text-sm font-medium mb-1">Now Serving</div>
                    <div className="text-4xl font-bold">#{nowServing.tokenNumber}</div>
                    <div className="text-sm mt-2">{nowServing.patient.name}</div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() =>
                        handleStatusChange(nowServing.id, "COMPLETED")
                      }
                    >
                      Complete
                    </Button>
                  </div>
                )}

                {checkedIn.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Checked In
                    </div>
                    <div className="space-y-2">
                      {checkedIn.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded"
                        >
                          <div>
                            <span className="font-bold text-primary">
                              #{apt.tokenNumber}
                            </span>
                            <span className="ml-2 text-sm">{apt.patient.name}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusChange(apt.id, "IN_CONSULTATION")
                            }
                          >
                            Start
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scheduled.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      Scheduled
                    </div>
                    <div className="space-y-1">
                      {scheduled.slice(0, 5).map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-sm">
                            <span className="font-bold">#{apt.tokenNumber}</span> -{" "}
                            {apt.patient.name}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusChange(apt.id, "CHECKED_IN")
                            }
                          >
                            Check In
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {activeDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No active appointments in queue
          </CardContent>
        </Card>
      )}
    </div>
  )
}

