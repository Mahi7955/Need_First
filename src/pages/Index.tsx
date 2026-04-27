import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles, MapPin, Users, Zap, HeartHandshake, Building2, UserRound } from "lucide-react";
import {
  parseRequest,
  scoreNeed,
  suggestions,
  Task,
  VolunteerMatch,
  SAMPLE_VOLUNTEERS,
  topTasksForVolunteer,
  ParsedNeed,
} from "@/lib/needfirst";
import { PriorityBadge } from "@/components/PriorityBadge";
import { TaskCard } from "@/components/TaskCard";
import { VolunteerMatchDialog } from "@/components/VolunteerMatchDialog";

const EXAMPLES = [
  "Need food for 20 people in Whitefield urgently",
  "Medical help needed for 10 in Indiranagar",
  "Shelter required for 5 families",
];

const Index = () => {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastParsed, setLastParsed] = useState<{ parsed: ParsedNeed; priority: Task["priority"] } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const handleAnalyze = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Please paste a request first");
      return;
    }
    const parsed = parseRequest(trimmed);
    const { score, priority } = scoreNeed(parsed);
    const task: Task = {
      ...parsed,
      id: crypto.randomUUID(),
      raw: trimmed,
      score,
      priority,
      createdAt: Date.now(),
    };
    setTasks((t) => [task, ...t]);
    setLastParsed({ parsed, priority });
    setText("");
    toast.success(`Added as ${priority} priority task`);
  };

  const grouped = useMemo(() => {
    return {
      High: tasks.filter((t) => t.priority === "High"),
      Medium: tasks.filter((t) => t.priority === "Medium"),
      Low: tasks.filter((t) => t.priority === "Low"),
    };
  }, [tasks]);

  const handleAssign = (task: Task, match: VolunteerMatch) => {
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, assigned: match.volunteer.name } : t)));
    setActiveTask(null);
    toast.success(`${match.volunteer.name} assigned to task`);
  };

  const handleAccept = (task: Task) => {
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, assigned: "You", accepted: true } : t)));
    toast.success("Task accepted");
  };

  const lastSuggestions = lastParsed ? suggestions(lastParsed.parsed) : [];
  const volunteerTasks = topTasksForVolunteer(tasks);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-6xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight">NeedFirst</h1>
              <p className="text-xs text-muted-foreground -mt-0.5">AidMatch · Smart NGO triage</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · {SAMPLE_VOLUNTEERS.length} volunteers
          </div>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        <Tabs defaultValue="ngo" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="ngo" className="gap-2">
              <Building2 className="w-4 h-4" /> NGO Dashboard
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="gap-2">
              <UserRound className="w-4 h-4" /> Volunteer Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ngo" className="space-y-8">
            {/* Input */}
            <section className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-1">Analyze a request</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste any messy WhatsApp / SMS message — we'll structure it.
              </p>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste WhatsApp request…"
                rows={3}
                className="resize-none mb-3"
              />
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setText(ex)}
                      className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <Button onClick={handleAnalyze} className="gap-1.5">
                  <Sparkles className="w-4 h-4" /> Analyze Request
                </Button>
              </div>
            </section>

            {/* Last parsed result */}
            {lastParsed && (
              <section className="grid md:grid-cols-2 gap-4">
                <div className="card-soft p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Parsed Result</h3>
                    <PriorityBadge priority={lastParsed.priority} />
                  </div>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground mb-0.5">Need Type</dt>
                      <dd className="font-medium capitalize">{lastParsed.parsed.need_type}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground mb-0.5 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </dt>
                      <dd className="font-medium">{lastParsed.parsed.location}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground mb-0.5 inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> People
                      </dt>
                      <dd className="font-medium">{lastParsed.parsed.people_count}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground mb-0.5 inline-flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Urgency
                      </dt>
                      <dd className="font-medium capitalize">{lastParsed.parsed.urgency}</dd>
                    </div>
                  </dl>
                </div>

                <div className="card-soft p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">AI Suggestions</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {lastSuggestions.map((s) => (
                      <div key={s.label} className="rounded-xl bg-accent/50 p-3">
                        <div className="text-xs text-muted-foreground">{s.label}</div>
                        <div className="text-2xl font-bold text-accent-foreground">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Task groups */}
            <section className="space-y-6">
              {(["High", "Medium", "Low"] as const).map((p) => (
                <div key={p}>
                  <div className="flex items-center gap-2 mb-3">
                    <PriorityBadge priority={p} />
                    <span className="text-sm text-muted-foreground">
                      {grouped[p].length} task{grouped[p].length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {grouped[p].length === 0 ? (
                    <div className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-6 text-center">
                      No {p.toLowerCase()} priority tasks yet
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[p].map((t) => (
                        <TaskCard key={t.id} task={t} onFindVolunteers={setActiveTask} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </TabsContent>

          <TabsContent value="volunteer">
            <section className="card-elevated p-6 mb-6">
              <h2 className="text-lg font-semibold mb-1">Nearby tasks for you</h2>
              <p className="text-sm text-muted-foreground">Top 3 tasks ranked by priority and urgency.</p>
            </section>

            {volunteerTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-10 text-center">
                No open tasks. Analyze a request from the NGO dashboard to populate.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volunteerTasks.map((t) => (
                  <TaskCard key={t.id} task={t} variant="volunteer" onAccept={handleAccept} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <VolunteerMatchDialog
        task={activeTask}
        volunteers={SAMPLE_VOLUNTEERS}
        onClose={() => setActiveTask(null)}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default Index;
