import { useEffect, useState, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout, PageTransition } from "@/components/Layout";
import { Button } from "@/components/Button";
import { useLastCheckin } from "@/hooks/use-checkins";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

// Helper to format category for display
const formatCategory = (cat: string) => {
  switch (cat) {
    case "CALM": return "Calming Practice";
    case "GROUND": return "Grounding Practice";
    case "ACTIVATE": return "Activation Practice";
    case "DEEP_REST": return "Deep Rest";
    default: return "Breathwork";
  }
};

const getGuidanceMessage = (cat: string) => {
  switch (cat) {
    case "CALM": return "Your mind looks active. Let's slow things down.";
    case "GROUND": return "You’ve been in your head. Let's reconnect with the ground.";
    case "ACTIVATE": return "System seems low on energy. Let's bring some fire.";
    case "DEEP_REST": return "Your body is tired. There is nothing left to do but rest.";
    default: return "Let's return to center.";
  }
};

export default function Practice() {
  const [match, params] = useRoute("/practice/:id");
  const [_, setLocation] = useLocation();
  const { data: checkin, isLoading } = useLastCheckin();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const duration = 180; // 3 minutes in seconds
  const intervalRef = useRef<NodeJS.Timeout>();

  // If we don't have a checkin or id doesn't match (basic validation)
  useEffect(() => {
    if (!isLoading && !checkin) {
      setLocation("/");
    }
  }, [checkin, isLoading, setLocation]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            setLocation(`/integration/${params?.id}`);
            return 100;
          }
          return p + (100 / duration);
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, setLocation, params?.id]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleSkip = () => {
    setLocation(`/integration/${params?.id}`);
  };

  if (isLoading || !checkin) return null;

  return (
    <Layout>
      <PageTransition>
        <div className="flex-1 flex flex-col justify-between py-8">
          {/* Header Area */}
          <div className="text-center space-y-6 pt-10">
            <span className="inline-block px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs tracking-widest uppercase">
              {formatCategory(checkin.recommendedPractice)}
            </span>
            
            <h1 className="text-2xl sm:text-3xl font-display leading-relaxed text-balance">
              {getGuidanceMessage(checkin.recommendedPractice)}
            </h1>
          </div>

          {/* Visualizer / Centerpiece */}
          <div className="flex-1 flex items-center justify-center py-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Expanding Circles Animation */}
              {isPlaying && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                    className="absolute inset-4 bg-primary/10 rounded-full"
                  />
                </>
              )}
              
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/80 to-primary shadow-[0_0_40px_rgba(230,221,208,0.3)] flex items-center justify-center backdrop-blur-sm z-10">
                <button 
                  onClick={togglePlay}
                  className="text-primary-foreground hover:scale-110 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 fill-current" />
                  ) : (
                    <Play className="w-10 h-10 fill-current ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>{Math.floor((progress / 100) * duration / 60)}:{String(Math.floor(((progress / 100) * duration) % 60)).padStart(2, '0')}</span>
                <span>3:00</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
              
              <Button variant="ghost" onClick={handleSkip} className="text-sm font-normal text-muted-foreground hover:text-foreground">
                Finish Early <SkipForward className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    </Layout>
  );
}
