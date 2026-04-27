import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Sparkles,
  MapPin,
  Users,
  Zap,
  HeartHandshake,
  Building2,
  UserRound,
  Map as MapIcon,
  BarChart3,
  Trophy,
  AlertTriangle,
  ListChecks,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  parseRequest,
  scoreNeed,
  suggestions,
  buildResources,
  Task,
  VolunteerMatch,
  SAMPLE_VOLUNTEERS,
  topTasksForVolunteer,
  ParsedNeed,
  KNOWN_LOCATIONS,
  LOCATION_COORDS,
  NeedType,
  Priority,
  TaskStatus,
} from "@/lib/needfirst";
import { PriorityBadge } from "@/components/PriorityBadge";
import { TaskCard } from "@/components/TaskCard";
import { VolunteerMatchDialog } from "@/components/VolunteerMatchDialog";
import { StatCard } from "@/components/StatCard";
import { MapView } from "@/components/MapView";
import { Leaderboard } from "@/components/Leaderboard";
import { ImpactAnalytics } from "@/components/ImpactAnalytics";
import { VoiceInput } from "@/components/VoiceInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXAMPLES = [
  "Need food for 20 people in Whitefield urgently",
  "Medical help needed for 10 in Indiranagar",
  "Shelter required for 5 families in Koramangala",
];

const Index = () => {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastParsed, setLastParsed] = useState<{ parsed: ParsedNeed; priority: Priority } | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [, forceTick] = useState(0);

  // Filters
  const [fLocation, setFLocation] = useState<string>("all");
  const [fNeed, setFNeed] = useState<string>("all");
  const [fPriority, setFPriority] = useState<string>("all");
  const [fStatus, setFStatus] = useState<string>("all");

  // Tick every 30s so "X mins ago" updates
  useEffect(() => {
    const i = setInterval(() => forceTick((n) => n + 1), 30_000);
    return () => clearInterval(i);
  }, []);

  // Auto-reassignment: bump alert for high tasks unassigned >10 min
  useEffect(() => {
    const i = setInterval(() => {
      setTasks((ts) =>
        ts.map((t) => {
          if (
            t.status === "open" &&
            t.priority === "High" &&
            t.team.length === 0 &&
            !t.reassigned &&
            Date.now() - t.createdAt > 10 * 60 * 1000
          ) {
            toast.message("↻ Reassigned due to delay", {
              description: `Suggesting new volunteers for ${t.need_type} in ${t.location}`,
            });
            return { ...t, reassigned: true };
          }
          return t;
        }),
      );
    }, 60_000);
    return () => clearInterval(i);
  }, []);

  const handleAnalyze = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error("Please paste a request first");
      return;
    }
    const parsed = parseRequest(trimmed);
    const { score, priority } = scoreNeed(parsed);
    const coord = LOCATION_COORDS[parsed.location] || LOCATION_COORDS.Unknown;
    // jitter so overlapping locations don't stack identically
    const jx = (Math.random() - 0.5) * 6;
    const jy = (Math.random() - 0.5) * 6;
    const task: Task = {
      ...parsed,
      id: crypto.randomUUID(),
      raw: trimmed,
      score,
      priority,
      createdAt: Date.now(),
      team: [],
      status: "open",
      resources: buildResources(parsed),
      messages: [],
      x: Math.max(2, Math.min(98, coord.x + jx)),
      y: Math.max(2, Math.min(98, coord.y + jy)),
    };
    setTasks((t) => [task, ...t]);
    setLastParsed({ parsed, priority });
    setText("");
    if (priority === "High") {
      toast.warning("⚠ Urgent request needs attention", {
        description: `${parsed.need_type} for ${parsed.people_count} in ${parsed.location}`,
      });
    } else {
      toast.success(`Added as ${priority} priority task`);
    }
  };

  const handleAssign = (task: Task, match: VolunteerMatch) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== task.id) return t;
        const team = [...t.team, match.volunteer.name];
        return {
          ...t,
          team,
          assigned: team[0],
          status: "assigned",
          acceptedAt: t.acceptedAt ?? Date.now(),
        };
      }),
    );
    setActiveTask(null);
    toast.success(`${match.volunteer.name} assigned`);
  };

  const handleAccept = (task: Task) => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === task.id
          ? {
              ...t,
              team: t.team.includes("You") ? t.team : [...t.team, "You"],
              assigned: t.assigned ?? "You",
              accepted: true,
              status: "assigned",
              acceptedAt: t.acceptedAt ?? Date.now(),
            }
          : t,
      ),
    );
    toast.success("Task accepted");
  };

  const handleComplete = (task: Task) => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: "completed",
              completedAt: Date.now(),
              resources: t.resources.map((r) => ({ ...r, fulfilled: r.required })),
            }
          : t,
      ),
    );
    toast.success("Task marked complete");
  };

  const handleSendMessage = (taskId: string, text: string, from: "ngo" | "volunteer") => {
    setTasks((ts) =>
      ts.map((t) =>
        t.id === taskId
          ? {
              ...t,
              messages: [...t.messages, { id: crypto.randomUUID(), from, text, at: Date.now() }],
            }
          : t,
      ),
    );
  };

  const handleFulfillResource = (taskId: string, label: string, amount: number) => {
    setTasks((ts) =>
      ts.map((t) => {
        if (t.id !== taskId) return t;
        const resources = t.resources.map((r) =>
          r.label === label ? { ...r, fulfilled: Math.min(r.required, r.fulfilled + amount) } : r,
        );
        const allFull = resources.every((r) => r.fulfilled >= r.required);
        return {
          ...t,
          resources,
          status: allFull && t.status !== "completed" ? "completed" : t.status,
          completedAt: allFull ? t.completedAt ?? Date.now() : t.completedAt,
        };
      }),
    );
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (fLocation !== "all" && t.location !== fLocation) return false;
      if (fNeed !== "all" && t.need_type !== fNeed) return false;
      if (fPriority !== "all" && t.priority !== fPriority) return false;
      if (fStatus !== "all" && t.status !== fStatus) return false;
      return true;
    });
  }, [tasks, fLocation, fNeed, fPriority, fStatus]);

  const grouped = useMemo(
    () => ({
      High: filteredTasks.filter((t) => t.priority === "High"),
      Medium: filteredTasks.filter((t) => t.priority === "Medium"),
      Low: filteredTasks.filter((t) => t.priority === "Low"),
    }),
    [filteredTasks],
  );

  const lastSuggestions = lastParsed ? suggestions(lastParsed.parsed) : [];
  const volunteerTasks = topTasksForVolunteer(tasks);

  // Stats
  const totalRequests = tasks.length;
  const highCount = tasks.filter((t) => t.priority === "High" && t.status !== "completed").length;
  const activeVolunteers = new Set(tasks.flatMap((t) => t.team)).size;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const urgentBanner = tasks.find(
    (t) => t.priority === "High" && t.status === "open" && t.team.length === 0,
  );

  return (
    <div className="min-h-screen bg-background">
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
          <TabsList className="mb-6 flex-wrap h-auto">
            <TabsTrigger value="ngo" className="gap-2">
              <Building2 className="w-4 h-4" /> NGO
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="gap-2">
              <UserRound className="w-4 h-4" /> Volunteer
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapIcon className="w-4 h-4" /> Map
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Trophy className="w-4 h-4" /> Leaderboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" /> Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ngo" className="space-y-6">
            {/* Stat Cards */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Requests" value={totalRequests} icon={ListChecks} tone="primary" />
              <StatCard label="High Priority" value={highCount} icon={AlertTriangle} tone="high" />
              <StatCard label="Active Volunteers" value={activeVolunteers} icon={Users} tone="medium" />
              <StatCard label="Completed Tasks" value={completedCount} icon={CheckCircle2} tone="low" />
            </section>

            {/* Urgent banner */}
            {urgentBanner && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-priority-high-bg border border-priority-high-border text-priority-high">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <div className="font-semibold">⚠ Urgent request needs attention</div>
                  <div className="opacity-90">
                    {urgentBanner.need_type} for {urgentBanner.people_count} people in {urgentBanner.location}
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp-style Input */}
            <section className="card-elevated p-6">
              <h2 className="text-lg font-semibold mb-1">New incoming request</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste any messy WhatsApp / SMS message — we'll structure it.
              </p>

              <div className="rounded-2xl bg-secondary/40 border border-border p-4 mb-3">
                <div className="text-[11px] text-muted-foreground mb-2">📱 Incoming message</div>
                <div className="bg-card rounded-2xl rounded-tl-sm border border-border p-3 max-w-[85%]">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste an incoming WhatsApp request…"
                    rows={3}
                    className="resize-none border-0 p-0 focus-visible:ring-0 bg-transparent text-sm shadow-none"
                  />
                </div>
              </div>

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
                <div className="flex gap-2">
                  <VoiceInput onResult={(t) => setText((cur) => (cur ? cur + " " + t : t))} />
                  <Button onClick={handleAnalyze} className="gap-1.5">
                    <Sparkles className="w-4 h-4" /> Analyze Request
                  </Button>
                </div>
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

            {/* Filters */}
            <section className="card-soft p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground mr-2">
                  <Filter className="w-4 h-4" /> Filters
                </span>
                <Select value={fLocation} onValueChange={setFLocation}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="Location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {KNOWN_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fNeed} onValueChange={setFNeed}>
                  <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Need" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All needs</SelectItem>
                    {(["food","medical","shelter","other"] as NeedType[]).map((n) => (
                      <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={fPriority} onValueChange={setFPriority}>
                  <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    {(["High","Medium","Low"] as Priority[]).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={fStatus} onValueChange={setFStatus}>
                  <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {(["open","assigned","completed"] as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

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
                      No {p.toLowerCase()} priority tasks
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[p].map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          onFindVolunteers={setActiveTask}
                          onComplete={handleComplete}
                          onSendMessage={handleSendMessage}
                          onFulfillResource={handleFulfillResource}
                        />
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
                  <TaskCard
                    key={t.id}
                    task={t}
                    variant="volunteer"
                    onAccept={handleAccept}
                    onComplete={handleComplete}
                    onSendMessage={handleSendMessage}
                    onFulfillResource={handleFulfillResource}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <MapView tasks={tasks} volunteers={SAMPLE_VOLUNTEERS} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard volunteers={SAMPLE_VOLUNTEERS} />
          </TabsContent>

          <TabsContent value="analytics">
            <ImpactAnalytics tasks={tasks} />
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
