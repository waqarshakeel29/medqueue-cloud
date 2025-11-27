"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, FileText, Printer, DollarSign, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Modern Clinic Management
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Manage appointments, queue tokens, patients, and billing all in one place.
              Start your 14-day free trial today.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Dr. Smith - Room 101</span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                      <span className="text-sm">Now Serving</span>
                      <span className="text-2xl font-bold text-primary">#5</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Next: #6 - John Doe</div>
                      <div>#7 - Jane Smith</div>
                      <div>#8 - Bob Johnson</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to run your clinic
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your operations
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Appointments & Queue",
                description: "Schedule appointments, manage daily queues, and track patient visits with ease.",
              },
              {
                icon: Printer,
                title: "Token Printing",
                description: "Print queue tokens on 80mm thermal printers. Simple, fast, and reliable.",
              },
              {
                icon: DollarSign,
                title: "Billing & Invoices",
                description: "Create invoices, track payments, and manage your clinic's financial records.",
              },
              {
                icon: Users,
                title: "Multi-Doctor Support",
                description: "Manage multiple doctors, each with their own schedule and queue system.",
              },
              {
                icon: FileText,
                title: "Patient Records",
                description: "Maintain comprehensive patient records with visit history and notes.",
              },
              {
                icon: Clock,
                title: "Real-Time Updates",
                description: "Live queue updates help keep staff and patients informed.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Get started in minutes, not days
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: "1", title: "Sign Up", description: "Create your account and clinic in under 2 minutes." },
            { step: "2", title: "Set Up", description: "Add your doctors, services, and customize settings." },
            { step: "3", title: "Start Managing", description: "Begin scheduling appointments and managing your queue." },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your clinic?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your 14-day free trial. No credit card required.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">Get Started Free</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

