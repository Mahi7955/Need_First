export type NeedType = "food" | "medical" | "shelter" | "other";
export type Urgency = "high" | "medium" | "low";
export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "open" | "assigned" | "completed";

export interface ParsedNeed {
  need_type: NeedType;
  location: string;
  people_count: number;
  urgency: Urgency;
}

export interface ChatMessage {
  id: string;
  from: "ngo" | "volunteer";
  text: string;
  at: number;
}

export interface ResourceProgress {
  label: string;
  required: number;
  fulfilled: number;
}

export interface Task extends ParsedNeed {
  id: string;
  raw: string;
  score: number;
  priority: Priority;
  assigned?: string; // legacy single name
  team: string[]; // volunteer names
  accepted?: boolean;
  createdAt: number;
  acceptedAt?: number;
  completedAt?: number;
  status: TaskStatus;
  resources: ResourceProgress[];
  messages: ChatMessage[];
  reassigned?: boolean;
  // mock map coords (0-100 in svg space)
  x: number;
  y: number;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: NeedType[];
  location: string;
  availability: boolean;
  completed: number;
  impact: number;
  x: number;
  y: number;
}

export interface MatchBreakdown {
  skill: number;
  location: number;
  urgency: number;
}

export interface VolunteerMatch {
  volunteer: Volunteer;
  score: number;
  breakdown: MatchBreakdown;
  explanation: string;
}

export interface Suggestion {
  label: string;
  value: number;
}

export const KNOWN_LOCATIONS = ["Whitefield", "Indiranagar", "Marathahalli", "Koramangala", "HSR Layout"];

// Mock map coordinates per location (percent within svg viewbox 0-100)
export const LOCATION_COORDS: Record<string, { x: number; y: number }> = {
  Whitefield: { x: 78, y: 38 },
  Indiranagar: { x: 52, y: 30 },
  Marathahalli: { x: 68, y: 48 },
  Koramangala: { x: 42, y: 60 },
  "HSR Layout": { x: 50, y: 72 },
  Unknown: { x: 30, y: 50 },
};

export function parseRequest(text: string): ParsedNeed {
  const lower = text.toLowerCase();

  let need_type: NeedType = "other";
  if (/\b(food|meal|meals|hungry|grocery|groceries)\b/.test(lower)) need_type = "food";
  else if (/\b(medical|doctor|doctors|medicine|medicines|hospital|injur)/.test(lower)) need_type = "medical";
  else if (/\b(shelter|tent|tents|home|stay|accommodation|famil)/.test(lower)) need_type = "shelter";

  let urgency: Urgency = "medium";
  if (/\b(urgent|urgently|asap|immediately|emergency|now)\b/.test(lower)) urgency = "high";

  const numMatch = text.match(/\d+/);
  const people_count = numMatch ? Math.max(1, parseInt(numMatch[0], 10)) : 1;

  let location = "Unknown";
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  return { need_type, location, people_count, urgency };
}

export function scoreNeed(n: ParsedNeed): { score: number; priority: Priority } {
  const base = n.urgency === "high" ? 50 : n.urgency === "medium" ? 30 : 10;
  const score = base + n.people_count;
  const priority: Priority = score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
  return { score, priority };
}

export function suggestions(n: ParsedNeed): Suggestion[] {
  const out: Suggestion[] = [];
  if (n.need_type === "food") {
    out.push({ label: "Meals", value: n.people_count });
    out.push({ label: "Volunteers", value: Math.max(1, Math.ceil(n.people_count / 20)) });
  } else if (n.need_type === "medical") {
    out.push({ label: "Doctors", value: Math.max(1, Math.ceil(n.people_count / 10)) });
    out.push({ label: "Volunteers", value: Math.max(1, Math.ceil(n.people_count / 15)) });
  } else if (n.need_type === "shelter") {
    out.push({ label: "Tents", value: Math.max(1, Math.ceil(n.people_count / 5)) });
    out.push({ label: "Volunteers", value: Math.max(1, Math.ceil(n.people_count / 10)) });
  } else {
    out.push({ label: "Volunteers", value: Math.max(1, Math.ceil(n.people_count / 10)) });
  }
  return out;
}

export function buildResources(n: ParsedNeed): ResourceProgress[] {
  return suggestions(n).map((s) => ({ label: s.label, required: s.value, fulfilled: 0 }));
}

export const SAMPLE_VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Rahul",  skills: ["food"],    location: "Whitefield",   availability: true, completed: 12, impact: 240, x: 80, y: 36 },
  { id: "v2", name: "Sneha",  skills: ["food"],    location: "Whitefield",   availability: true, completed: 8,  impact: 160, x: 76, y: 42 },
  { id: "v3", name: "Ananya", skills: ["medical"], location: "Indiranagar",  availability: true, completed: 15, impact: 320, x: 54, y: 28 },
  { id: "v4", name: "Vikram", skills: ["medical"], location: "Whitefield",   availability: true, completed: 6,  impact: 120, x: 82, y: 40 },
  { id: "v5", name: "Arjun",  skills: ["other"],   location: "Marathahalli", availability: true, completed: 4,  impact: 60,  x: 70, y: 50 },
  { id: "v6", name: "Priya",  skills: ["shelter"], location: "Koramangala",  availability: true, completed: 10, impact: 200, x: 44, y: 62 },
  { id: "v7", name: "Karthik",skills: ["shelter","food"], location: "HSR Layout", availability: true, completed: 7, impact: 140, x: 52, y: 74 },
];

export function matchVolunteers(task: Task, volunteers: Volunteer[]): VolunteerMatch[] {
  const urgencyBoost = task.urgency === "high" ? 20 : task.urgency === "medium" ? 10 : 5;
  const matches = volunteers
    .filter((v) => v.availability)
    .map((v) => {
      const skillFit = v.skills.includes(task.need_type);
      const locFit = v.location === task.location;
      const breakdown: MatchBreakdown = {
        skill: skillFit ? 50 : 0,
        location: locFit ? 30 : 0,
        urgency: urgencyBoost,
      };
      const score = breakdown.skill + breakdown.location + breakdown.urgency;
      const reasons: string[] = [];
      if (skillFit) reasons.push("skill fit");
      if (locFit) reasons.push("nearby");
      if (task.urgency === "high") reasons.push("high urgency");
      const explanation = reasons.length
        ? `Matched because ${reasons.join(" + ")}`
        : "Available volunteer";
      return { volunteer: v, score, breakdown, explanation };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return matches;
}

export function topTasksForVolunteer(tasks: Task[]): Task[] {
  return [...tasks]
    .filter((t) => t.status !== "completed")
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function formatRelative(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min${m !== 1 ? "s" : ""} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h !== 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

export function minutesBetween(a: number, b: number): number {
  return Math.max(0, Math.floor((b - a) / 60000));
}
