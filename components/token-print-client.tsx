"use client"

import { useEffect } from "react"
import { format } from "date-fns"

interface TokenPrintClientProps {
  appointment: {
    tokenNumber: number
    date: Date | string
    startTime: Date | string
    clinic: { name: string }
    doctor: { name: string; speciality?: string | null }
    patient: { name: string }
    primaryService?: { name: string } | null
  }
}

export function TokenPrintClient({ appointment }: TokenPrintClientProps) {
  useEffect(() => {
    window.print()
  }, [])

  const formatTime = (time: Date | string) => {
    const date = typeof time === "string" ? new Date(time) : time
    return format(date, "HH:mm")
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date
    return format(d, "dd MMM yyyy")
  }

  return (
    <div className="print-container">
      <style jsx>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 80mm;
            padding: 10mm;
            font-family: monospace;
          }
          .no-print {
            display: none;
          }
        }
        .print-container {
          text-align: center;
          font-family: monospace;
        }
      `}</style>
      <div className="no-print mb-4">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Print Token
        </button>
      </div>
      <div className="print-container border-2 border-black p-4">
        <div className="text-xl font-bold mb-2">{appointment.clinic.name}</div>
        <div className="border-t border-b border-black my-4 py-2">
          <div className="text-6xl font-bold">{appointment.tokenNumber}</div>
        </div>
        <div className="text-left space-y-1 mb-4">
          <div>
            <strong>Doctor:</strong> {appointment.doctor.name}
          </div>
          {appointment.doctor.speciality && (
            <div>
              <strong>Speciality:</strong> {appointment.doctor.speciality}
            </div>
          )}
          <div>
            <strong>Patient:</strong> {appointment.patient.name}
          </div>
          {appointment.primaryService && (
            <div>
              <strong>Service:</strong> {appointment.primaryService.name}
            </div>
          )}
          <div>
            <strong>Date:</strong> {formatDate(appointment.date)}
          </div>
          <div>
            <strong>Time:</strong> {formatTime(appointment.startTime)}
          </div>
        </div>
        <div className="border-t border-black pt-2 text-xs">
          Please wait for your token to be called
        </div>
      </div>
    </div>
  )
}

