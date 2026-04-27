export type NeedType = "food" | "medical" | "shelter" | "other";
export type Urgency = "high" | "medium" | "low";
export type Priority = "High" | "Medium" | "Low";

export interface ParsedNeed {
  need_type: NeedType;
  location: string;
  people_count: number;
  urgency: Urgency;
}

export interface Task extends ParsedNeed {
  id: string;
  raw: string;
  score: number;
  priority: Priority;
  assigned?: string;
  accepted?: boolean;
  createdAt: number;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: NeedType[];
  location: string;
  availability: boolean;
}

export interface VolunteerMatch {
  volunteer: Volunteer;
  score: number;
  explanation: string;
}

export interface Suggestion {
  label: string;
  value: number;
}

const KNOWN_LOCATIONS = ["Whitefield", "Indiranagar", "Marathahalli", "Koramangala", "HSR Layout"];

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

export const SAMPLE_VOLUNTEERS: Volunteer[] = [
  { id: "v1", name: "Rahul", skills: ["food"], location: "Whitefield", availability: true },
  { id: "v2", name: "Sneha", skills: ["food"], location: "Whitefield", availability: true },
  { id: "v3", name: "Ananya", skills: ["medical"], location: "Indiranagar", availability: true },
  { id: "v4", name: "Vikram", skills: ["medical"], location: "Whitefield", availability: true },
  { id: "v5", name: "Arjun", skills: ["other"], location: "Marathahalli", availability: true },
];

export function matchVolunteers(task: Task, volunteers: Volunteer[]): VolunteerMatch[] {
  const urgencyBoost = task.urgency === "high" ? 20 : task.urgency === "medium" ? 10 : 5;
  const matches = volunteers
    .filter((v) => v.availability)
    .map((v) => {
      let score = 0;
      const reasons: string[] = [];
      const skillFit = v.skills.includes(task.need_type);
      if (skillFit) {
        score += 50;
        reasons.push("skill fit");
      }
      if (v.location === task.location) {
        score += 30;
        reasons.push("nearby");
      }
      score += urgencyBoost;
      if (task.urgency === "high") reasons.push("high urgency");
      const explanation = reasons.length
        ? `Matched because ${reasons.join(" + ")}`
        : "Available volunteer";
      return { volunteer: v, score, explanation };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return matches;
}

export function topTasksForVolunteer(tasks: Task[]): Task[] {
  return [...tasks]
    .filter((t) => !t.assigned)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
