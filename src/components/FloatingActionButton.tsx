import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Plus, FileText, Upload, Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onNewReport?: () => void;
  onUploadDocument?: () => void;
  onQuickAnalyze?: () => void;
  className?: string;
}

export function FloatingActionButton({ 
  onNewReport, 
  onUploadDocument, 
  onQuickAnalyze,
  className 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: FileText,
      label: "New Report",
      onClick: onNewReport,
      color: "bg-primary hover:bg-primary/90"
    },
    {
      icon: Upload,
      label: "Upload Document",
      onClick: onUploadDocument,
      color: "bg-secondary hover:bg-secondary/90"
    },
    {
      icon: Brain,
      label: "Quick Analyze",
      onClick: onQuickAnalyze,
      color: "bg-accent hover:bg-accent/90"
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        {/* Action Buttons */}
        <div className={cn(
          "flex flex-col gap-3 mb-3 transition-all duration-300 ease-out",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.label}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full shadow-lg soft-hover",
                      action.color,
                      "animate-scale-in"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  {action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Main FAB */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300",
                isOpen && "rotate-45"
              )}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-primary-foreground" />
              ) : (
                <Plus className="h-6 w-6 text-primary-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isOpen ? "Close" : "Quick Actions"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}