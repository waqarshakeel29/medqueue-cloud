import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { NewAppointmentClient } from "@/components/new-appointment-client"

export default async function NewAppointmentPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await auth()
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const [doctors, patients, services] = await Promise.all([
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
      take: 500,
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
    <NewAppointmentClient
      clinicId={clinicId}
      doctors={doctors}
      patients={patients}
      services={services}
    />
  )
}

