"use client"

import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

const ReasoningState = () => {
  return (
   <Card className="p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-primary">Pensando na melhor solução</h4>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
          <p className="text-xs text-muted-foreground">Analisando sua solicitação...</p>
        </div>
      </div>
    </Card>
  )
}

export default ReasoningState;