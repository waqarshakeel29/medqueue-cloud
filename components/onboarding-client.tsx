"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Check } from "lucide-react"

interface OnboardingClientProps {
  clinicId: string
  clinicName: string
  existingDoctors: Array<{
    id: string
    name: string
    speciality?: string | null
    roomNumber?: string | null
  }>
}

export function OnboardingClient({
  clinicId,
  clinicName,
  existingDoctors,
}: OnboardingClientProps) {
  const router = useRouter()
  const [step, setStep] = useState(existingDoctors.length > 0 ? 2 : 1)
  const [doctors, setDoctors] = useState(existingDoctors)
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    speciality: "",
    roomNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/clinic/${clinicId}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm),
      })

      if (response.ok) {
        const newDoctor = await response.json()
        setDoctors([...doctors, newDoctor])
        setDoctorForm({ name: "", speciality: "", roomNumber: "" })
      }
    } catch (error) {
      console.error("Error adding doctor:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    router.push(`/app/clinic/${clinicId}`)
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to MedQueue Cloud!</h1>
        <p className="text-gray-600">
          Let's set up your clinic "{clinicName}" to get started.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Add Doctors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 1: Add Doctors</CardTitle>
                <CardDescription>
                  Add at least one doctor to your clinic
                </CardDescription>
              </div>
              {doctors.length > 0 && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctors.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Added Doctors:</h3>
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-3 bg-gray-50 rounded border"
                  >
                    <div className="font-medium">{doctor.name}</div>
                    {doctor.speciality && (
                      <div className="text-sm text-gray-600">
                        {doctor.speciality}
                      </div>
                    )}
                    {doctor.roomNumber && (
                      <div className="text-sm text-gray-600">
                        Room {doctor.roomNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddDoctor} className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-name">Name *</Label>
                  <Input
                    id="doctor-name"
                    value={doctorForm.name}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speciality">Speciality</Label>
                  <Input
                    id="speciality"
                    value={doctorForm.speciality}
                    onChange={(e) =>
                      setDoctorForm({ ...doctorForm, speciality: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  value={doctorForm.roomNumber}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, roomNumber: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Step 2: Working Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Step 2: Working Hours</CardTitle>
                <CardDescription>
                  Set your clinic's default working hours (optional)
                </CardDescription>
              </div>
              {step >= 2 && (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              You can set working hours for each doctor later in settings. For now,
              you can start scheduling appointments.
            </p>
          </CardContent>
        </Card>

        {/* Complete */}
        <Card>
          <CardHeader>
            <CardTitle>Ready to Start!</CardTitle>
            <CardDescription>
              You're all set. Start managing your clinic now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleComplete}
              disabled={doctors.length === 0}
              size="lg"
              className="w-full"
            >
              Go to Dashboard
            </Button>
            {doctors.length === 0 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Please add at least one doctor to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

