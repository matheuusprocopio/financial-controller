import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoadingState = () => {
  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-muted-foreground/20 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </Card>
  );
};

export default LoadingState;
