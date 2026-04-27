import { MapPin, Users, Zap, CheckCircle2, Clock, AlertTriangle, MessageSquare, Package } from "lucide-react";
import { Task, formatRelative, minutesBetween } from "@/lib/needfirst";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "./PriorityBadge";
import { ResourceBar } from "./ResourceBar";
import { TaskChat } from "./TaskChat";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  onFindVolunteers?: (task: Task) => void;
  onAccept?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onSendMessage?: (taskId: string, text: string, from: "ngo" | "volunteer") => void;
  onFulfillResource?: (taskId: string, label: string, amount: number) => void;
  variant?: "ngo" | "volunteer";
}

export const TaskCard = ({
  task,
  onFindVolunteers,
  onAccept,
  onComplete,
  onSendMessage,
  onFulfillResource,
  variant = "ngo",
}: Props) => {
  const [showChat, setShowChat] = useState(false);
  const ageMin = minutesBetween(task.createdAt, Date.now());
  const acceptedMin = task.acceptedAt ? minutesBetween(task.createdAt, task.acceptedAt) : null;
  const slow = !task.acceptedAt && ageMin > 10 && task.status === "open";
  const unassigned = task.team.length === 0 && task.status !== "completed";

  return (
    <div className={cn("card-soft p-5 hover:shadow-md transition-shadow flex flex-col gap-3",
      task.priority === "High" && task.status === "open" && "ring-1 ring-priority-high/30")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {task.need_type}
          </div>
          <p className="text-sm text-foreground/80 line-clamp-2">{task.raw}</p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> {task.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> {task.people_count}
        </span>
        <span className="inline-flex items-center gap-1.5 capitalize">
          <Zap className="w-3.5 h-3.5" /> {task.urgency}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Created {formatRelative(task.createdAt)}
        </span>
        {acceptedMin !== null && (
          <span className="inline-flex items-center gap-1.5 text-priority-low">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted in {acceptedMin} min
          </span>
        )}
      </div>

      {/* Alerts */}
      <div className="flex flex-wrap gap-1.5">
        {slow && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-priority-medium-bg text-priority-medium border border-priority-medium-border">
            <AlertTriangle className="w-3 h-3" /> Slow response (&gt;10 min)
          </span>
        )}
        {variant === "ngo" && unassigned && task.priority === "High" && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-priority-high-bg text-priority-high border border-priority-high-border">
            <AlertTriangle className="w-3 h-3" /> No volunteer assigned yet
          </span>
        )}
        {task.reassigned && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
            ↻ Reassigned due to delay
          </span>
        )}
      </div>

      {/* Resources */}
      {task.resources.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider inline-flex items-center gap-1">
            <Package className="w-3 h-3" /> Resources
          </div>
          {task.resources.map((r) => (
            <div key={r.label} className="space-y-1">
              <ResourceBar r={r} />
              {variant === "volunteer" && r.fulfilled < r.required && (
                <button
                  onClick={() => onFulfillResource?.(task.id, r.label, Math.min(r.required - r.fulfilled, Math.ceil(r.required / 4) || 1))}
                  className="text-[11px] text-primary hover:underline"
                >
                  + Fulfill
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Team */}
      {task.team.length > 0 && (
        <div className="text-xs">
          <span className="text-muted-foreground">Team Assigned ({task.team.length} volunteer{task.team.length !== 1 ? "s" : ""}): </span>
          <span className="font-medium">{task.team.join(", ")}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {variant === "ngo" ? (
          <>
            {task.status !== "completed" && (
              <Button size="sm" variant="secondary" onClick={() => onFindVolunteers?.(task)}>
                {task.team.length > 0 ? "Add Volunteer" : "Find Volunteers"}
              </Button>
            )}
            {task.status === "assigned" && (
              <Button size="sm" variant="outline" onClick={() => onComplete?.(task)}>
                Mark Complete
              </Button>
            )}
          </>
        ) : (
          <>
            {!task.team.includes("You") && task.status !== "completed" ? (
              <Button size="sm" onClick={() => onAccept?.(task)}>
                Accept Task
              </Button>
            ) : task.status !== "completed" ? (
              <Button size="sm" variant="outline" onClick={() => onComplete?.(task)}>
                Mark Complete
              </Button>
            ) : null}
          </>
        )}
        {onSendMessage && task.status !== "completed" && (
          <Button size="sm" variant="ghost" onClick={() => setShowChat((s) => !s)} className="gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Chat {task.messages.length > 0 && `(${task.messages.length})`}
          </Button>
        )}
        {task.status === "completed" && (
          <span className="inline-flex items-center gap-1.5 text-sm text-priority-low font-medium">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </span>
        )}
      </div>

      {showChat && onSendMessage && (
        <TaskChat
          messages={task.messages}
          as={variant}
          onSend={(text, from) => onSendMessage(task.id, text, from)}
        />
      )}
    </div>
  );
};
