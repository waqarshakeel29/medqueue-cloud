import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getUserClinicMemberships } from "@/lib/auth"

export default async function AppPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const memberships = await getUserClinicMemberships(session.user.id)

  if (memberships.length === 0) {
    redirect("/auth/register")
  }

  // Redirect to first clinic
  redirect(`/app/clinic/${memberships[0].clinic.id}`)
}

