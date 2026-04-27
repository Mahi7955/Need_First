import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onResult: (text: string) => void;
}

// Minimal types for Web Speech API
type SR = any;

export const VoiceInput = ({ onResult }: Props) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SR | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const w = window as any;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      toast.success("Voice captured");
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => {
      toast.error("Couldn't capture voice");
      setListening(false);
    };
    recognitionRef.current = rec;
    return () => rec.abort?.();
  }, [onResult]);

  const toggle = () => {
    if (!supported) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch {
        // already started
      }
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant={listening ? "default" : "outline"}
      onClick={toggle}
      className="gap-1.5"
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      {listening ? "Listening…" : "Voice"}
    </Button>
  );
};
