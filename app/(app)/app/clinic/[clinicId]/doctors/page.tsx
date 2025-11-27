import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DoctorsClient } from "@/components/doctors-client"

export default async function DoctorsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await getServerSession(authOptions)
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const doctors = await prisma.doctor.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
  })

  return <DoctorsClient clinicId={clinicId} initialDoctors={doctors} />
}

