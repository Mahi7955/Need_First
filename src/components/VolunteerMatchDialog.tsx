import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Sparkles } from "lucide-react";
import { Task, VolunteerMatch, matchVolunteers, Volunteer } from "@/lib/needfirst";
import { useMemo } from "react";

interface Props {
  task: Task | null;
  volunteers: Volunteer[];
  onClose: () => void;
  onAssign: (task: Task, match: VolunteerMatch) => void;
}

export const VolunteerMatchDialog = ({ task, volunteers, onClose, onAssign }: Props) => {
  const matches = useMemo(() => (task ? matchVolunteers(task, volunteers) : []), [task, volunteers]);

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Top Volunteer Matches</DialogTitle>
          <DialogDescription>
            {task && (
              <>
                For: <span className="font-medium text-foreground">{task.need_type}</span> in {task.location}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {matches.map((m) => (
            <div key={m.volunteer.id} className="card-soft p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-foreground">{m.volunteer.name}</div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {m.volunteer.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Match</div>
                  <div className="text-lg font-bold text-primary">{m.score}</div>
                </div>
              </div>
              <div className="flex gap-1.5 mb-3">
                {m.volunteer.skills.map((s) => (
                  <span key={s} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full capitalize">
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3 h-3 text-primary" />
                {m.explanation}
              </p>
              <Button size="sm" className="w-full" onClick={() => task && onAssign(task, m)}>
                Assign Volunteer
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
