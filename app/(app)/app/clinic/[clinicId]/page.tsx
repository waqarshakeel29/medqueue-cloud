import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, DollarSign, XCircle } from "lucide-react"
import { format, startOfDay, endOfDay } from "date-fns"

async function getDashboardData(clinicId: string) {
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const [
    totalAppointments,
    completedVisits,
    noShows,
    revenue,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        clinicId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.appointment.count({
      where: {
        clinicId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "COMPLETED",
      },
    }),
    prisma.appointment.count({
      where: {
        clinicId,
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: "NO_SHOW",
      },
    }),
    prisma.invoice.aggregate({
      where: {
        clinicId,
        status: "PAID",
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ])

  return {
    totalAppointments,
    completedVisits,
    noShows,
    revenue: revenue._sum.totalAmount || 0,
  }
}

export default async function ClinicDashboard({
  params,
}: {
  params: Promise<{ clinicId: string }>
}) {
  const session = await getServerSession(authOptions)
  const { clinicId } = await params

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const data = await getDashboardData(clinicId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your clinic's activity today
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.completedVisits}</div>
            <p className="text-xs text-muted-foreground">
              Visits completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.noShows}</div>
            <p className="text-xs text-muted-foreground">
              Patients who didn't show
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(data.revenue).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From paid invoices today
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

