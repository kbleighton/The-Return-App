import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout, PageTransition } from "@/components/Layout";
import { Button } from "@/components/Button";
import { useCompleteCheckin } from "@/hooks/use-checkins";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const FEELING_OPTIONS = ["Grounded", "Clear", "About the same", "Still tense"];
const INTENTION_OPTIONS = [
  "Send a message", 
  "Start a task", 
  "Rest intentionally", 
  "Move my body",
  "Drink water",
  "Just be"
];

export default function PostPractice() {
  const [match, params] = useRoute("/integration/:id");
  const [_, setLocation] = useLocation();
  const completeCheckin = useCompleteCheckin();
  
  const [step, setStep] = useState<'PAUSE' | 'FEELING' | 'INTENTION' | 'CLOSURE'>('PAUSE');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [intention, setIntention] = useState<string | null>(null);

  // Auto-advance pause screen
  useEffect(() => {
    if (step === 'PAUSE') {
      const timer = setTimeout(() => setStep('FEELING'), 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Handle final submission
  const handleComplete = async (selectedIntention: string) => {
    setIntention(selectedIntention);
    if (params?.id && feeling) {
      try {
        await completeCheckin.mutateAsync({
          id: parseInt(params.id),
          postFeeling: feeling,
          intention: selectedIntention
        });
        setStep('CLOSURE');
        
        // Auto redirect after closure
        setTimeout(() => {
          setLocation("/");
        }, 3000);
      } catch (e) {
        // Error handled in hook
      }
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {step === 'PAUSE' && (
          <motion.div
            key="pause"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4"
          >
            <h1 className="text-3xl font-display text-primary">Just observe.</h1>
            <p className="text-muted-foreground">Take a moment to feel the shift.</p>
          </motion.div>
        )}

        {step === 'FEELING' && (
          <motion.div
            key="feeling"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col py-8 gap-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display">How do you feel now?</h2>
              <p className="text-muted-foreground">Be honest—there's no right answer.</p>
            </div>
            
            <div className="grid gap-3">
              {FEELING_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFeeling(opt)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    feeling === opt
                      ? "border-primary bg-primary/10 text-primary-foreground"
                      : "border-white/10 hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="mt-auto">
              <Button 
                onClick={() => setStep('INTENTION')} 
                disabled={!feeling}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'INTENTION' && (
          <motion.div
            key="intention"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col py-8 gap-8"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-display">Carry this forward.</h2>
              <p className="text-muted-foreground">What is one small thing to move into next?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {INTENTION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleComplete(opt)}
                  className={cn(
                    "p-4 rounded-xl border text-left text-sm transition-all h-24 flex items-end",
                    intention === opt
                      ? "border-primary bg-primary/10 text-primary-foreground"
                      : "border-white/10 hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'CLOSURE' && (
          <motion.div
            key="closure"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-4"
          >
            <h1 className="text-3xl font-display text-primary">You have arrived.</h1>
            <p className="text-muted-foreground">You can return anytime today.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
