import { useState } from "react";
import { Task, Volunteer, LOCATION_COORDS, KNOWN_LOCATIONS } from "@/lib/needfirst";
import { MapPin, Users } from "lucide-react";

interface Props {
  tasks: Task[];
  volunteers: Volunteer[];
}

export const MapView = ({ tasks, volunteers }: Props) => {
  const [selected, setSelected] = useState<Task | null>(null);

  // Cluster detection: any location with >= 2 open tasks
  const clusterLocations = KNOWN_LOCATIONS.filter(
    (loc) => tasks.filter((t) => t.location === loc && t.status !== "completed").length >= 2,
  );

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <div className="card-elevated p-4">
        <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-br from-accent/40 to-secondary/30 relative overflow-hidden border border-border">
          {/* Decorative grid */}
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={i}>
                <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="hsl(var(--border))" strokeWidth="0.1" />
                <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="hsl(var(--border))" strokeWidth="0.1" />
              </g>
            ))}
          </svg>

          {/* Cluster halos */}
          {clusterLocations.map((loc) => {
            const c = LOCATION_COORDS[loc];
            return (
              <div
                key={loc}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-priority-high/50 bg-priority-high/5"
                style={{ left: `${c.x}%`, top: `${c.y}%`, width: "14%", height: "18%" }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-priority-high bg-card px-2 py-0.5 rounded-full border border-priority-high/30">
                  ⚠ Clustered Needs Area
                </div>
              </div>
            );
          })}

          {/* Volunteer pins */}
          {volunteers.map((v) => (
            <div
              key={v.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${v.x}%`, top: `${v.y}%` }}
              title={`${v.name} · ${v.location}`}
            >
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-card shadow" />
            </div>
          ))}

          {/* Task pins */}
          {tasks.map((t) => {
            const color =
              t.priority === "High"
                ? "bg-priority-high"
                : t.priority === "Medium"
                  ? "bg-priority-medium"
                  : "bg-priority-low";
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${t.x}%`, top: `${t.y}%` }}
              >
                <span className={`block w-5 h-5 rounded-full ${color} border-2 border-card shadow-md ${t.priority === "High" ? "animate-pulse" : ""}`} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground mt-3">
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-priority-high" /> High</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-priority-medium" /> Medium</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-priority-low" /> Low</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Volunteer</span>
        </div>
      </div>

      <div className="card-soft p-5">
        <h3 className="font-semibold mb-3">Pin details</h3>
        {selected ? (
          <div className="space-y-3 text-sm">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{selected.need_type}</div>
            <p className="text-foreground/80">{selected.raw}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {selected.location}</div>
              <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-muted-foreground" /> People: {selected.people_count}</div>
              <div className="flex items-center gap-2 capitalize">⚡ Urgency: {selected.urgency}</div>
              <div>Priority: <span className="font-medium">{selected.priority}</span></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Click any task pin on the map to see details.</p>
        )}
        {clusterLocations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-priority-high mb-1">Clusters detected</div>
            <div className="text-xs text-muted-foreground">{clusterLocations.join(", ")}</div>
          </div>
        )}
      </div>
    </div>
  );
};
