import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className = "" }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 sm:p-8 ${className}`}>
      <div className="w-full max-w-md mx-auto relative z-10 flex flex-col h-full min-h-[600px]">
        {children}
      </div>
      
      {/* Background Texture/Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      {children}
    </motion.div>
  );
}
