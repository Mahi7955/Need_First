import { Volunteer } from "@/lib/needfirst";
import { Trophy, Medal } from "lucide-react";

export const Leaderboard = ({ volunteers }: { volunteers: Volunteer[] }) => {
  const ranked = [...volunteers].sort((a, b) => b.impact - a.impact || b.completed - a.completed);
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-priority-medium" />
        <h2 className="font-semibold">Volunteer Leaderboard</h2>
      </div>
      <div className="space-y-2">
        {ranked.map((v, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
          return (
            <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
              <div className="w-8 text-center font-semibold text-muted-foreground">
                {medal || `#${i + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{v.name}</div>
                <div className="text-xs text-muted-foreground">{v.location} · {v.skills.join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Impact</div>
                <div className="font-bold">{v.impact}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Tasks</div>
                <div className="font-bold">{v.completed}</div>
              </div>
            </div>
          );
        })}
      </div>
      {ranked[0] && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Medal className="w-4 h-4 text-priority-medium" />
          Top Volunteer: <span className="font-medium text-foreground">{ranked[0].name}</span>
        </div>
      )}
    </div>
  );
};
