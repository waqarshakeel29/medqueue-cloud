import { redirect } from "next/navigation"
import { getSession, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clinicId: string }>
}) {
  const session = await getSession()
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const hasAccess = await hasClinicAccess(session.user.id, clinicId)
  if (!hasAccess) {
    redirect("/app")
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!clinic) {
    redirect("/app")
  }

  const membership = await prisma.clinicMembership.findUnique({
    where: {
      userId_clinicId: {
        userId: session.user.id,
        clinicId: clinic.id,
      },
    },
    select: {
      role: true,
    },
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar clinicId={clinicId} role={membership?.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader clinic={clinic} user={session.user} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

