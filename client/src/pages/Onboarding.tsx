import { useState } from "react";
import { useLocation } from "wouter";
import { Layout, PageTransition } from "@/components/Layout";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

// === STEP 1: WELCOME ===
function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <PageTransition>
      <div className="flex-1 flex flex-col justify-center gap-8 py-12">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-display leading-[1.1]">
            Welcome to <br />
            <span className="text-primary italic">The Return</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light leading-relaxed">
            At the end of the day, your body arrives home before your mind does.
          </p>
          <p className="text-lg text-muted-foreground/80 font-light">
            We help you close the gap.
          </p>
        </div>
        <div className="mt-auto">
          <Button onClick={onNext} size="lg" className="w-full group">
            Start my first check-in
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

// === STEP 2: PERSONALIZATION ===
const WHEN_OPTIONS = [
  "After my day ends",
  "When my mind won’t stop thinking",
  "After a stressful interaction",
  "Before sleep",
  "When I feel stuck or unmotivated",
  "When starting my day"
];

function Personalization({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      if (selected.length < 2) {
        setSelected([...selected, opt]);
      }
    }
  };

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col py-8 gap-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-display">When do you most want support?</h2>
          <p className="text-muted-foreground">Select up to 2</p>
        </div>

        <div className="flex flex-col gap-3">
          {WHEN_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group",
                selected.includes(opt)
                  ? "border-primary bg-primary/10 text-primary-foreground shadow-sm"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
              )}
            >
              <span className="font-medium text-lg">{opt}</span>
              {selected.includes(opt) && (
                <div className="bg-primary rounded-full p-1">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button 
            onClick={onNext} 
            size="lg" 
            className="w-full"
            disabled={selected.length === 0}
          >
            Continue
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

// === STEP 3: RECOGNITION ===
const HABIT_OPTIONS = [
  "I scroll my phone",
  "I overthink",
  "I shut down or withdraw",
  "I distract myself",
  "I react quickly",
  "I avoid what I need to do"
];

function Recognition({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((s) => s !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  return (
    <PageTransition>
      <div className="flex-1 flex flex-col py-8 gap-8">
        <div className="space-y-4">
          <h2 className="text-3xl font-display">What usually happens instead?</h2>
          <p className="text-muted-foreground">Select all that apply</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {HABIT_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between",
                selected.includes(opt)
                  ? "border-primary bg-primary/10 text-primary-foreground shadow-sm"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground"
              )}
            >
              <span className="font-medium">{opt}</span>
              {selected.includes(opt) && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Button onClick={onNext} size="lg" className="w-full" disabled={selected.length === 0}>
            Continue
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}

// === STEP 4: AUTH ===
function AuthScreen() {
  return (
    <PageTransition>
      <div className="flex-1 flex flex-col justify-center py-12 gap-10 text-center">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display">
            Save your practice
          </h2>
          <p className="text-muted-foreground text-lg text-balance">
            Create an account to track your nervous system patterns over time.
          </p>
        </div>

        <div className="space-y-4 w-full max-w-sm mx-auto">
          <a href="/api/login" className="block w-full">
            <Button size="lg" className="w-full bg-white text-black hover:bg-white/90">
              Continue without Account
            </Button>
          </a>
          <p className="text-xs text-muted-foreground/60">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [_, setLocation] = useLocation();

  const next = () => setStep(s => s + 1);

  // Simple state machine for onboarding steps
  switch (step) {
    case 0: return <Layout><Welcome onNext={next} /></Layout>;
    case 1: return <Layout><Personalization onNext={next} /></Layout>;
    case 2: return <Layout><Recognition onNext={next} /></Layout>;
    case 3: return <Layout><AuthScreen /></Layout>;
    default: return null;
  }
}
