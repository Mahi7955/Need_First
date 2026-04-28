import { Volunteer, Task } from "@/lib/needfirst";
import { MapPin, CheckCircle2, Clock, Award, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { AddVolunteerDialog } from "./AddVolunteerDialog";

interface Props {
  volunteers: Volunteer[];
  tasks: Task[];
  onAdd: (v: Volunteer) => void;
  onToggleAvailability: (id: string) => void;
}

export const VolunteerTracker = ({ volunteers, tasks, onAdd, onToggleAvailability }: Props) => {
  const stats = (v: Volunteer) => {
    const assigned = tasks.filter((t) => t.team.includes(v.name));
    const active = assigned.filter((t) => t.status !== "completed");
    const completed = assigned.filter((t) => t.status === "completed");
    return { assigned: assigned.length, active: active.length, completed: completed.length };
  };

  const totalActive = volunteers.filter((v) => v.availability).length;
  const totalAssignments = tasks.reduce((acc, t) => acc + t.team.length, 0);

  return (
    <div className="space-y-6">
      <section className="card-elevated p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Volunteer Directory</h2>
          <p className="text-sm text-muted-foreground">
            {volunteers.length} total · {totalActive} available · {totalAssignments} active assignments
          </p>
        </div>
        <AddVolunteerDialog onAdd={onAdd} />
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((v) => {
          const s = stats(v);
          const liveCompleted = v.completed + s.completed;
          const liveImpact = v.impact + s.completed * 20;
          return (
            <div key={v.id} className="card-soft p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground grid place-items-center font-semibold shrink-0">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {v.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-medium ${v.availability ? "text-priority-low" : "text-muted-foreground"}`}>
                    {v.availability ? "ON" : "OFF"}
                  </span>
                  <Switch
                    checked={v.availability}
                    onCheckedChange={() => onToggleAvailability(v.id)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {v.skills.map((sk) => (
                  <span key={sk} className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                    {sk}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Active
                  </div>
                  <div className="text-lg font-bold">{s.active}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done
                  </div>
                  <div className="text-lg font-bold text-priority-low">{liveCompleted}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1">
                    <Award className="w-3 h-3" /> Impact
                  </div>
                  <div className="text-lg font-bold text-primary">{liveImpact}</div>
                </div>
              </div>
            </div>
          );
        })}
        {volunteers.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-sm text-muted-foreground border border-dashed border-border rounded-xl p-10 text-center inline-flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> No volunteers yet. Add your first one.
          </div>
        )}
      </div>
    </div>
  );
};
