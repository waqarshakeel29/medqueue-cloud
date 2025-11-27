import { getSession, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TokenPrintClient } from "@/components/token-print-client"
import { format } from "date-fns"

export default async function TokenPrintPage({
  params,
}: {
  params: Promise<{ clinicId: string; appointmentId: string }>
}) {
  const session = await getSession()
  const { clinicId, appointmentId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      clinic: true,
      doctor: true,
      patient: true,
      primaryService: true,
    },
  })

  if (!appointment || appointment.clinicId !== clinicId) {
    redirect("/app")
  }

  return <TokenPrintClient appointment={appointment} />
}

