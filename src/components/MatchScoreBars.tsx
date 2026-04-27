import { MatchBreakdown } from "@/lib/needfirst";

const Row = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export const MatchScoreBars = ({ b }: { b: MatchBreakdown }) => (
  <div className="space-y-2">
    <Row label="Skill Match" value={b.skill} max={50} color="hsl(var(--primary))" />
    <Row label="Location Match" value={b.location} max={30} color="hsl(var(--priority-low))" />
    <Row label="Urgency Boost" value={b.urgency} max={20} color="hsl(var(--priority-medium))" />
  </div>
);
