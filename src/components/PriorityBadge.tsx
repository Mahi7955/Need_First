import { Priority } from "@/lib/needfirst";
import { cn } from "@/lib/utils";

const styles: Record<Priority, string> = {
  High: "bg-priority-high-bg text-priority-high border-priority-high-border",
  Medium: "bg-priority-medium-bg text-priority-medium border-priority-medium-border",
  Low: "bg-priority-low-bg text-priority-low border-priority-low-border",
};

export const PriorityBadge = ({ priority, className }: { priority: Priority; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
      styles[priority],
      className,
    )}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{
        backgroundColor:
          priority === "High"
            ? "hsl(var(--priority-high))"
            : priority === "Medium"
              ? "hsl(var(--priority-medium))"
              : "hsl(var(--priority-low))",
      }}
    />
    {priority}
  </span>
);
