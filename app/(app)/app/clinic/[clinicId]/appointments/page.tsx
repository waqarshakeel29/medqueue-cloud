import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AppointmentsClient } from "@/components/appointments-client"
import { format } from "date-fns"

export default async function AppointmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicId: string }>
  searchParams: Promise<{ date?: string; doctorId?: string }>
}) {
  const session = await auth()
  const { clinicId } = await params
  const { date, doctorId } = await searchParams

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const selectedDate = date ? new Date(date) : new Date()

  const [appointments, doctors, patients, services] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        clinicId,
        date: selectedDate,
        ...(doctorId && { doctorId }),
      },
      include: {
        doctor: true,
        patient: true,
        primaryService: true,
      },
      orderBy: [
        { startTime: "asc" },
        { tokenNumber: "asc" },
      ],
    }),
    prisma.doctor.findMany({
      where: {
        clinicId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.patient.findMany({
      where: {
        clinicId,
      },
      orderBy: {
        name: "asc",
      },
      take: 100, // Limit for performance
    }),
    prisma.service.findMany({
      where: {
        clinicId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return (
    <AppointmentsClient
      clinicId={clinicId}
      initialAppointments={appointments}
      doctors={doctors}
      patients={patients}
      services={services}
      selectedDate={format(selectedDate, "yyyy-MM-dd")}
    />
  )
}

