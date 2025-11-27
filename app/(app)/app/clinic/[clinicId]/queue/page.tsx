import { getSession, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { QueueClient } from "@/components/queue-client"
import { format } from "date-fns"

export default async function QueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicId: string }>
  searchParams: Promise<{ doctorId?: string }>
}) {
  const session = await getSession()
  const { clinicId } = await params
  const { doctorId } = await searchParams

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const today = new Date()
  const selectedDoctorId = doctorId

  const [appointments, doctors] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        clinicId,
        date: today,
        ...(selectedDoctorId && { doctorId: selectedDoctorId }),
        status: {
          in: ["SCHEDULED", "CHECKED_IN", "IN_CONSULTATION"],
        },
      },
      include: {
        doctor: true,
        patient: true,
      },
      orderBy: [
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
  ])

  return (
    <QueueClient
      clinicId={clinicId}
      initialAppointments={appointments}
      doctors={doctors}
      selectedDoctorId={selectedDoctorId || null}
    />
  )
}

