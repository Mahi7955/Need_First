import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Volunteer, NeedType, KNOWN_LOCATIONS, LOCATION_COORDS } from "@/lib/needfirst";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onAdd: (v: Volunteer) => void;
}

const SKILL_OPTIONS: NeedType[] = ["food", "medical", "shelter", "other"];

export const AddVolunteerDialog = ({ onAdd }: Props) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState<string>(KNOWN_LOCATIONS[0]);
  const [skills, setSkills] = useState<NeedType[]>(["food"]);
  const [availability, setAvailability] = useState(true);

  const toggleSkill = (s: NeedType) => {
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  };

  const reset = () => {
    setName("");
    setLocation(KNOWN_LOCATIONS[0]);
    setSkills(["food"]);
    setAvailability(true);
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (skills.length === 0) {
      toast.error("Pick at least one skill");
      return;
    }
    const coord = LOCATION_COORDS[location] || LOCATION_COORDS.Unknown;
    const jx = (Math.random() - 0.5) * 6;
    const jy = (Math.random() - 0.5) * 6;
    const v: Volunteer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      skills,
      location,
      availability,
      completed: 0,
      impact: 0,
      x: Math.max(2, Math.min(98, coord.x + jx)),
      y: Math.max(2, Math.min(98, coord.y + jy)),
    };
    onAdd(v);
    toast.success(`${v.name} added as a volunteer`);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <UserPlus className="w-4 h-4" /> Add Volunteer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new volunteer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vname">Name</Label>
            <Input id="vname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meera" />
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KNOWN_LOCATIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => {
                const active = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border capitalize transition ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <div className="text-sm font-medium">Available now</div>
              <div className="text-xs text-muted-foreground">Toggle off to mark unavailable</div>
            </div>
            <Switch checked={availability} onCheckedChange={setAvailability} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Add Volunteer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
