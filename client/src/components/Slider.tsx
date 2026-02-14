import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  leftLabel?: string;
  rightLabel?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, leftLabel, rightLabel, ...props }, ref) => (
  <div className="space-y-3 w-full">
    {(leftLabel || rightLabel) && (
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider px-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/40 shadow-inner">
        <SliderPrimitive.Range className="absolute h-full bg-primary/40 transition-all" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border border-primary/20 bg-[#e6ddd0] shadow-[0_2px_10px_rgba(0,0,0,0.2)] ring-offset-background transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95" />
    </SliderPrimitive.Root>
  </div>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
