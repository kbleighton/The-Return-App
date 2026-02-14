import { useState } from "react";
import { useLocation } from "wouter";
import { Layout, PageTransition } from "@/components/Layout";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";
import { useCreateCheckin, useLastCheckin } from "@/hooks/use-checkins";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckIn() {
  const [_, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const createCheckin = useCreateCheckin();
  const { data: lastCheckin } = useLastCheckin();

  const [values, setValues] = useState({
    grounded: 50,
    calm: 50,
    present: 50,
    energized: 50,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate "Analysis" pause for UX
      const checkin = await createCheckin.mutateAsync(values);
      
      // Artificial delay to let user read the "tuning in" message
      setTimeout(() => {
        setLocation(`/practice/${checkin.id}`);
      }, 2500);
    } catch (e) {
      setIsAnalyzing(false);
      // Toast handled in hook
    }
  };

  if (isAnalyzing) {
    return (
      <Layout>
        <PageTransition>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display">Tuning in...</h2>
              <p className="text-muted-foreground">Finding the right practice for your nervous system.</p>
            </div>
          </div>
        </PageTransition>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <header className="flex justify-between items-center py-4 mb-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
               {user?.profileImageUrl ? (
                 <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                   {user?.firstName?.[0] || "U"}
                 </div>
               )}
             </div>
             <span className="text-sm font-medium text-muted-foreground">
               Hi, {user?.firstName || "Traveler"}
             </span>
          </div>
          <button onClick={() => logout()} className="p-2 hover:bg-white/5 rounded-full text-muted-foreground transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 flex flex-col gap-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-display leading-tight">
              How are you arriving right now?
            </h1>
            <p className="text-muted-foreground">
              Take a second. There’s nothing to solve — just notice.
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <Slider
                value={[values.grounded]}
                onValueChange={([v]) => setValues(prev => ({ ...prev, grounded: v }))}
                min={0} max={100} step={1}
                leftLabel="Grounded"
                rightLabel="Scattered"
              />
              <Slider
                value={[values.calm]}
                onValueChange={([v]) => setValues(prev => ({ ...prev, calm: v }))}
                min={0} max={100} step={1}
                leftLabel="Calm"
                rightLabel="Anxious"
              />
              <Slider
                value={[values.present]}
                onValueChange={([v]) => setValues(prev => ({ ...prev, present: v }))}
                min={0} max={100} step={1}
                leftLabel="Present"
                rightLabel="In my head"
              />
              <Slider
                value={[values.energized]}
                onValueChange={([v]) => setValues(prev => ({ ...prev, energized: v }))}
                min={0} max={100} step={1}
                leftLabel="Energized"
                rightLabel="Exhausted"
              />
            </div>
          </div>

          <div className="mt-auto pt-4">
            <Button 
              onClick={handleSubmit} 
              size="lg" 
              className="w-full"
              disabled={createCheckin.isPending}
            >
              Let's begin
            </Button>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
