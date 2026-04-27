import { Task } from "@/lib/needfirst";
import { StatCard } from "./StatCard";
import { HeartHandshake, Utensils, CheckCircle2, Users } from "lucide-react";

export const ImpactAnalytics = ({ tasks }: { tasks: Task[] }) => {
  const completed = tasks.filter((t) => t.status === "completed");
  const peopleHelped = completed.reduce((s, t) => s + t.people_count, 0);
  const meals = completed
    .flatMap((t) => t.resources)
    .filter((r) => r.label === "Meals")
    .reduce((s, r) => s + r.fulfilled, 0);
  const allFulfilled = tasks.flatMap((t) => t.resources).reduce((s, r) => s + r.fulfilled, 0);

  return (
    <div className="card-elevated p-6">
      <h2 className="font-semibold mb-4">Impact Analytics</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="People Helped" value={peopleHelped} icon={Users} tone="primary" />
        <StatCard label="Meals Delivered" value={meals} icon={Utensils} tone="medium" />
        <StatCard label="Tasks Completed" value={completed.length} icon={CheckCircle2} tone="low" />
        <StatCard label="Resources Fulfilled" value={allFulfilled} icon={HeartHandshake} tone="primary" />
      </div>

      {tasks.length > 0 && (
        <div className="mt-6">
          <div className="text-xs text-muted-foreground mb-2">Completion progress</div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-priority-low transition-all"
              style={{ width: `${Math.round((completed.length / tasks.length) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {completed.length} of {tasks.length} tasks completed
          </div>
        </div>
      )}
    </div>
  );
};
