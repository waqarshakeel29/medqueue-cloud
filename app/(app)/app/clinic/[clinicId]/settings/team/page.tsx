import { redirect } from "next/navigation"
import { auth, hasClinicAccess, ClinicRole } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TeamClient } from "@/components/team-client"

export default async function TeamSettingsPage({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const { clinicId } = await params

  const isAdmin = await hasClinicAccess(session.user.id, clinicId, ClinicRole.ADMIN)
  if (!isAdmin) {
    redirect("/app")
  }

  const members = await prisma.clinicMembership.findMany({
    where: { clinicId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const formattedMembers = members.map((member) => ({
    id: member.id,
    role: member.role,
    createdAt: member.createdAt.toISOString(),
    user: member.user,
  }))

  return (
    <TeamClient
      clinicId={clinicId}
      currentUserId={session.user.id}
      initialMembers={formattedMembers}
    />
  )
}

