import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "high" | "medium" | "low" | "primary";
}

const tones: Record<string, string> = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  high: "bg-priority-high-bg text-priority-high",
  medium: "bg-priority-medium-bg text-priority-medium",
  low: "bg-priority-low-bg text-priority-low",
};

export const StatCard = ({ label, value, icon: Icon, tone = "default" }: Props) => (
  <div className="card-soft p-4 flex items-center gap-3">
    <div className={cn("w-11 h-11 rounded-xl grid place-items-center shrink-0", tones[tone])}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight leading-tight">{value}</div>
    </div>
  </div>
);
