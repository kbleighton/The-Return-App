import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TreeDeciduous } from "lucide-react";

export default function Splash() {
  const [_, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation
      setTimeout(() => setLocation("/welcome"), 800); 
    }, 2500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <TreeDeciduous className="w-16 h-16 text-primary relative z-10" strokeWidth={1} />
            </div>
            
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-display text-primary-foreground tracking-tight">
                The Return
              </h1>
              <p className="text-lg text-muted-foreground font-light max-w-xs mx-auto text-balance">
                Calm your mind and body in under 5 minutes.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
