"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IActionCard {
  title: string
  description?: string
  actions: {
    label: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onClick: () => void
    icon?: React.ReactNode
  }[]
  children?: React.ReactNode
  className?: string
}

const ActionCard = ({ title, description, actions, children, className }: IActionCard) => {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      {children && <CardContent className="py-3">{children}</CardContent>}

      <CardContent className="pt-3 space-y-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            className="w-full justify-start"
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

export default ActionCard;