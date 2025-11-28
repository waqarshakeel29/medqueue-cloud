"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { ClinicRole } from "@prisma/client"

interface Doctor {
  id: string
  name: string
  speciality?: string | null
  roomNumber?: string | null
  isActive: boolean
}

interface DoctorsClientProps {
  clinicId: string
  initialDoctors: Doctor[]
  userRole: ClinicRole | null
}

export function DoctorsClient({ clinicId, initialDoctors, userRole }: DoctorsClientProps) {
  const router = useRouter()
  const [doctors, setDoctors] = useState(initialDoctors)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    speciality: "",
    roomNumber: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/clinic/${clinicId}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const newDoctor = await response.json()
        setDoctors([...doctors, newDoctor])
        setIsDialogOpen(false)
        setFormData({
          name: "",
          speciality: "",
          roomNumber: "",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error creating doctor:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const canCreateDoctors = userRole !== ClinicRole.RECEPTION

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Doctors</h1>
          <p className="text-gray-600 mt-1">Manage your clinic's doctors</p>
        </div>
        {canCreateDoctors && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Enter doctor information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speciality">Speciality</Label>
                  <Input
                    id="speciality"
                    value={formData.speciality}
                    onChange={(e) =>
                      setFormData({ ...formData, speciality: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Doctor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          {doctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No doctors yet. Add your first doctor to get started.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="font-medium">{doctor.name}</div>
                  {doctor.speciality && (
                    <div className="text-sm text-gray-600 mt-1">
                      {doctor.speciality}
                    </div>
                  )}
                  {doctor.roomNumber && (
                    <div className="text-sm text-gray-600">Room {doctor.roomNumber}</div>
                  )}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        doctor.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {doctor.isActive ? "Active" : "Inactive"}
                    </span>
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

