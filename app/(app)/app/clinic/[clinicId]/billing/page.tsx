import { redirect } from "next/navigation"
import { auth, hasClinicAccess } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function BillingPage({
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

  const invoices = await prisma.invoice.findMany({
    where: { clinicId },
    include: {
      patient: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-gray-600 mt-1">View and manage invoices</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Recent invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No invoices yet
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {invoice.invoiceNumber} - {invoice.patient.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${Number(invoice.totalAmount).toFixed(2)}
                    </div>
                    <div
                      className={`text-sm ${
                        invoice.status === "PAID"
                          ? "text-green-600"
                          : invoice.status === "UNPAID"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

