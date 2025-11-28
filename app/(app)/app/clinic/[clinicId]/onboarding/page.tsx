import { redirect } from "next/navigation"
import { auth, hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OnboardingClient } from "@/components/onboarding-client"

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await auth()
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!hasAccess) {
    redirect("/app")
  }

  const [doctors, clinic] = await Promise.all([
    prisma.doctor.findMany({
      where: { clinicId },
      orderBy: { name: "asc" },
    }),
    prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true },
    }),
  ])

  if (!clinic) {
    redirect("/app")
  }

  return <OnboardingClient clinicId={clinicId} clinicName={clinic.name} existingDoctors={doctors} />
}

