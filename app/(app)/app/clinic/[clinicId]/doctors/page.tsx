import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DoctorsClient } from "@/components/doctors-client"
import { ClinicRole } from "@prisma/client"

export default async function DoctorsPage({
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

  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId: session.user.id,
        clinicId,
      },
    },
    select: {
      role: true,
    },
  })

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  })

  return (
    <DoctorsClient
      clinicId={clinicId}
      initialDoctors={doctors}
      userRole={membership?.role || null}
    />
  )
}

