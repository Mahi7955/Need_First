import { ResourceProgress } from "@/lib/needfirst";

export const ResourceBar = ({ r }: { r: ResourceProgress }) => {
  const pct = r.required > 0 ? Math.min(100, Math.round((r.fulfilled / r.required) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{r.label}</span>
        <span className="font-medium">
          {r.fulfilled} / {r.required}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
