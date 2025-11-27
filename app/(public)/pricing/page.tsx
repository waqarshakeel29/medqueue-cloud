"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "/month",
    description: "Perfect for small clinics",
    features: [
      "Up to 3 doctors",
      "Unlimited appointments",
      "Queue management",
      "Token printing",
      "Basic billing",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/month",
    description: "For growing clinics",
    features: [
      "Up to 10 doctors",
      "Everything in Basic",
      "Advanced reporting",
      "Multi-location support",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations",
    features: [
      "Unlimited doctors",
      "Everything in Pro",
      "Dedicated support",
      "SSO integration",
      "Custom deployment",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start with a 14-day free trial. No credit card required.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`h-full flex flex-col ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-600">{plan.period}</span>}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="px-6 pb-6">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <Link href={plan.name === "Enterprise" ? "/contact" : "/auth/register"}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center mt-16"
      >
        <p className="text-gray-600">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </motion.div>
    </div>
  )
}

