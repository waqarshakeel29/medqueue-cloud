"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calendar,
  Users,
  FileText,
  Printer,
  DollarSign,
  Clock,
  Shield,
  BarChart3,
  Smartphone,
} from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Smart Appointment Scheduling",
    description: "Efficiently schedule appointments with drag-and-drop interface. Avoid double-booking and manage doctor availability seamlessly.",
  },
  {
    icon: Clock,
    title: "Real-Time Queue Management",
    description: "Track patient queue in real-time. See who's next, who's being seen, and who's completed their visit.",
  },
  {
    icon: Printer,
    title: "Token Printing",
    description: "Print queue tokens on standard 80mm thermal printers. Patients get physical tokens they can hold on to.",
  },
  {
    icon: Users,
    title: "Patient Management",
    description: "Comprehensive patient records with visit history, medical notes, and contact information all in one place.",
  },
  {
    icon: FileText,
    title: "Multi-Doctor Support",
    description: "Manage multiple doctors, each with their own schedule, queue, and specialty. Perfect for multi-specialty clinics.",
  },
  {
    icon: DollarSign,
    title: "Billing & Invoices",
    description: "Generate professional invoices, track payments, and manage your clinic's financial records effortlessly.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with data encryption. Built with healthcare compliance in mind.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Track your clinic's performance with detailed reports on appointments, revenue, and patient visits.",
  },
  {
    icon: Smartphone,
    title: "Responsive Design",
    description: "Access your clinic management system from any device - desktop, tablet, or mobile phone.",
  },
]

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Everything you need to run your clinic efficiently
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <Card className="h-full">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <Button size="lg" asChild>
          <Link href="/auth/register">Start Free Trial</Link>
        </Button>
      </motion.div>
    </div>
  )
}

