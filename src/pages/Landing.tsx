import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  HeartHandshake,
  Sparkles,
  MapPin,
  Users,
  Zap,
  ListChecks,
  Trophy,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  { icon: Sparkles, title: "Smart Parsing", desc: "Turn messy WhatsApp-style text into structured needs in one click." },
  { icon: Zap, title: "Priority Scoring", desc: "Auto-rank requests as High, Medium or Low based on urgency and people count." },
  { icon: Users, title: "Volunteer Matching", desc: "Match the best 3 volunteers per task by skill, location and urgency." },
  { icon: MapPin, title: "Live Map View", desc: "See needs and volunteers on a map with clustered hotspots." },
  { icon: BarChart3, title: "Impact Analytics", desc: "Track people helped, meals delivered and tasks completed in real time." },
  { icon: Trophy, title: "Leaderboard", desc: "Celebrate top volunteers ranked by impact score." },
];

const STEPS = [
  { n: "01", title: "Ingest", desc: "Paste or speak a request like \"Need food for 20 in Whitefield urgently\"." },
  { n: "02", title: "Analyze", desc: "We extract need type, location, urgency and people count instantly." },
  { n: "03", title: "Match & Act", desc: "Top 3 volunteers are surfaced with explainable match scores." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span>NeedFirst</span>
            <span className="text-muted-foreground text-sm font-normal">· AidMatch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
          </nav>
          <Link to="/app">
            <Button size="sm" className="gap-1.5">
              Open App <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--accent))_0%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Hackathon-ready NGO triage platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            From messy messages to <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-priority-high bg-clip-text text-transparent">
              real help, in seconds.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            NeedFirst converts raw WhatsApp-style requests into prioritized, structured tasks
            and matches the right volunteers automatically — so NGOs can focus on impact.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/app">
              <Button size="lg" className="gap-2">
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline">See how it works</Button>
            </a>
          </div>

          {/* Mock chat preview */}
          <div className="mt-16 max-w-3xl mx-auto card-soft p-6 text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Incoming request
            </div>
            <div className="space-y-3">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-md text-sm">
                Need food for 20 people in Whitefield urgently 🙏
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Parsed automatically
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-priority-high-bg text-priority-high border border-priority-high-border font-medium">High Priority</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary"><MapPin className="w-3 h-3 inline mr-1" />Whitefield</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary"><Users className="w-3 h-3 inline mr-1" />20 people</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-secondary">Food</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-priority-low-bg text-priority-low border border-priority-low-border"><CheckCircle2 className="w-3 h-3 inline mr-1" />3 volunteers matched</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything an NGO needs, in one workspace</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Built for speed during crises — clean UI, explainable logic, zero setup.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-soft p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-accent text-accent-foreground grid place-items-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
            <p className="text-muted-foreground">Three steps from chaos to coordinated relief.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card-soft p-6">
                <div className="text-xs font-mono text-primary mb-2">{s.n}</div>
                <h3 className="font-semibold text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section id="impact" className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-4 text-center">
          {[
            { v: "3×", l: "Faster triage" },
            { v: "100%", l: "Explainable matches" },
            { v: "0", l: "Setup required" },
            { v: "∞", l: "Lives touched" },
          ].map((s) => (
            <div key={s.l} className="card-soft p-8">
              <div className="text-4xl font-bold text-primary mb-1">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="card-soft p-10 md:p-14 text-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <ListChecks className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Ready to triage your first request?</h2>
          <p className="opacity-90 mb-6 max-w-xl mx-auto">Jump into the live dashboard — no signup, no setup. Just paste a message and watch the magic.</p>
          <Link to="/app">
            <Button size="lg" variant="secondary" className="gap-2">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-muted-foreground flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} NeedFirst · AidMatch</div>
          <div className="flex items-center gap-1.5">
            Built with <HeartHandshake className="w-4 h-4 text-priority-high" /> for NGOs
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
