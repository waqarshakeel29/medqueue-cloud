import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PatientsClient } from "@/components/patients-client"

export default async function PatientsPage({
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

  const patients = await prisma.patient.findMany({
    where: { clinicId },
    orderBy: { name: "asc" },
    take: 500,
  })

  return <PatientsClient clinicId={clinicId} initialPatients={patients} />
}

