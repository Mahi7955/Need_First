import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/lib/needfirst";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK = ["On the way", "Need more info", "Task completed"];

interface Props {
  messages: ChatMessage[];
  onSend: (text: string, from: "ngo" | "volunteer") => void;
  as: "ngo" | "volunteer";
}

export const TaskChat = ({ messages, onSend, as }: Props) => {
  const [text, setText] = useState("");
  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t, as);
    setText("");
  };
  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
      <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
        {messages.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-2">No messages yet</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "max-w-[85%] text-xs px-2.5 py-1.5 rounded-2xl",
                m.from === as
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border rounded-bl-sm",
              )}
            >
              {m.text}
            </div>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => onSend(q, as)}
            className="text-[11px] px-2 py-0.5 rounded-full bg-card border border-border hover:bg-accent transition"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Type a message…"
          className="h-8 text-xs"
        />
        <Button size="sm" className="h-8 px-2" onClick={submit}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
