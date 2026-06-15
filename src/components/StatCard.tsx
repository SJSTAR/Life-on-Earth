import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  accent?: "primary" | "secondary" | "accent";
  decimals?: number;
  delay?: number;
}

const accentMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "from-primary/30 to-primary/0",
  secondary: "from-secondary/30 to-secondary/0",
  accent: "from-accent/30 to-accent/0",
};

const dotMap: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary shadow-[0_0_20px_hsl(var(--primary))]",
  secondary: "bg-secondary shadow-[0_0_20px_hsl(var(--secondary))]",
  accent: "bg-accent shadow-[0_0_20px_hsl(var(--accent))]",
};

export function StatCard({
  label,
  value,
  suffix,
  icon,
  accent = "primary",
  decimals = 0,
  delay = 0,
}: StatCardProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { damping: 30, stiffness: 80, mass: 1 });
  const display = useTransform(spring, (latest) =>
    latest.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  useEffect(() => {
    const unsub = display.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [display]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative"
    >
      <div className="glass relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-500 group-hover:border-primary/40">
        {/* gradient wash */}
        <div
          className={cn(
            "pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-radial blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100",
            "bg-gradient-to-br",
            accentMap[accent]
          )}
        />
        {/* shimmer line on hover */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className={cn("h-2 w-2 rounded-full", dotMap[accent])} />
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="text-muted-foreground/70 transition-colors duration-300 group-hover:text-primary">
            {icon}
          </div>
        </div>

        <div className="relative mt-4 flex items-baseline gap-1.5">
          <span
            ref={ref}
            className="mono text-3xl sm:text-4xl font-semibold text-gradient leading-none"
          >
            0
          </span>
          {suffix && (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
