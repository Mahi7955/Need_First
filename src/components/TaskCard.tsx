import { MapPin, Users, Zap, CheckCircle2 } from "lucide-react";
import { Task } from "@/lib/needfirst";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./PriorityBadge";

interface Props {
  task: Task;
  onFindVolunteers?: (task: Task) => void;
  onAccept?: (task: Task) => void;
  variant?: "ngo" | "volunteer";
}

export const TaskCard = ({ task, onFindVolunteers, onAccept, variant = "ngo" }: Props) => {
  return (
    <div className="card-soft p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {task.need_type}
          </div>
          <p className="text-sm text-foreground/80 line-clamp-2">{task.raw}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {task.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> {task.people_count}
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Zap className="w-3.5 h-3.5" /> {task.urgency}
        </span>
      </div>

      {task.assigned ? (
        <div className="flex items-center gap-2 text-sm text-priority-low font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {variant === "volunteer" ? "Accepted" : `Assigned to ${task.assigned}`}
        </div>
      ) : variant === "ngo" ? (
        <Button size="sm" variant="secondary" onClick={() => onFindVolunteers?.(task)}>
          Find Volunteers
        </Button>
      ) : (
        <Button size="sm" onClick={() => onAccept?.(task)}>
          Accept Task
        </Button>
      )}
    </div>
  );
};
