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
    case "GROUND": return "You've been in your head. Let's reconnect with the ground.";
    case "ACTIVATE": return "System seems low on energy. Let's bring some fire.";
    case "DEEP_REST": return "Your body is tired. There is nothing left to do but rest.";
    default: return "Let's return to center.";
  }
};

// Helper to format seconds to m:ss
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export default function Practice() {
  const [match, params] = useRoute("/practice/:id");
  const [_, setLocation] = useLocation();
  const { data: checkin, isLoading } = useLastCheckin();

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // If we don't have a checkin or id doesn't match (basic validation)
  useEffect(() => {
    if (!isLoading && !checkin) {
      setLocation("/");
    }
  }, [checkin, isLoading, setLocation]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setLocation(`/integration/${params?.id}`);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [setLocation, params?.id]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  };

  const handleSkip = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setLocation(`/integration/${params?.id}`);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const seekToPosition = (clientX: number) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !duration || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    seekToPosition(e.clientX);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekToPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      seekToPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse move/up listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, duration]);

  if (isLoading || !checkin) return null;

  return (
    <Layout>
      <PageTransition>
        <div className="flex-1 flex flex-col justify-between py-8">
          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src="/audio/4%20minute%20grounding%20breath.m4a"
            preload="metadata"
          />

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
              <div
                ref={progressBarRef}
                className={`py-3 group ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}`}
                onMouseDown={handleMouseDown}
              >
                <div className="h-1 bg-secondary rounded-full overflow-hidden group-hover:h-1.5 transition-all">
                  <motion.div
                    className="h-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>

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
