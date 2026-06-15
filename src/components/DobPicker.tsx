import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM_H = 44;

type ColumnProps = {
  items: (string | number)[];
  value: number; // index
  onChange: (idx: number) => void;
  ariaLabel: string;
  width: string;
};

function Wheel({ items, value, onChange, ariaLabel, width }: ColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tid = useRef<number | null>(null);

  // Scroll to value when it changes externally
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = value * ITEM_H;
    if (Math.abs(el.scrollTop - target) > 2) {
      el.scrollTo({ top: target, behavior: "smooth" });
    }
  }, [value]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    if (tid.current) window.clearTimeout(tid.current);
    tid.current = window.setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      if (clamped !== value) onChange(clamped);
      el.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
    }, 110);
  };

  return (
    <div className={cn("relative", width)} aria-label={ariaLabel}>
      {/* Selection band */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-xl border border-primary/40 bg-primary/5 shadow-glow"
        style={{ height: ITEM_H }}
      />
      {/* Fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background/90 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 to-transparent z-10" />

      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar relative h-[220px] overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory" }}
        tabIndex={0}
        role="listbox"
      >
        <div style={{ height: ITEM_H * 2 }} />
        {items.map((it, i) => {
          const dist = Math.abs(i - value);
          return (
            <button
              type="button"
              key={`${ariaLabel}-${i}`}
              onClick={() => onChange(i)}
              className={cn(
                "block w-full snap-center text-center mono transition-all duration-200",
                dist === 0
                  ? "text-foreground text-lg font-medium"
                  : dist === 1
                  ? "text-muted-foreground text-base opacity-70"
                  : "text-muted-foreground/50 text-sm opacity-40"
              )}
              style={{ height: ITEM_H, lineHeight: `${ITEM_H}px` }}
              aria-selected={dist === 0}
              role="option"
            >
              {it}
            </button>
          );
        })}
        <div style={{ height: ITEM_H * 2 }} />
      </div>
    </div>
  );
}

type Props = {
  value?: Date;
  onChange: (d: Date) => void;
};

export function DobPicker({ value, onChange }: Props) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const years = useMemo(
    () => Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i),
    [currentYear]
  );

  const [draft, setDraft] = useState<Date>(value ?? new Date(1995, 0, 1));

  useEffect(() => {
    if (value) setDraft(value);
  }, [value]);

  const year = draft.getFullYear();
  const month = draft.getMonth();
  const day = draft.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const updateDraft = (y: number, m: number, d: number) => {
    const maxDay = new Date(y, m + 1, 0).getDate();
    const safeDay = Math.min(d, maxDay);
    const next = new Date(y, m, safeDay);
    if (next > today) return;
    setDraft(next);
  };

  const handleSubmit = () => {
    onChange(draft);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong relative w-full max-w-xl rounded-3xl border-primary/20 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Date of Birth
          </div>
          <div className="mono text-lg text-gradient mt-0.5">
            {MONTHS[month]} {day}, {year}
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          {[
            { l: "Today", d: new Date() },
            { l: "1990", d: new Date(1990, 0, 1) },
            { l: "2000", d: new Date(2000, 0, 1) },
          ].map((p) => (
            <button
              key={p.l}
              type="button"
              onClick={() => setDraft(p.d)}
              className="glass rounded-lg px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              {p.l}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex items-stretch justify-between gap-2 sm:gap-4">
        <Wheel
          items={MONTHS}
          value={month}
          onChange={(i) => updateDraft(year, i, day)}
          ariaLabel="Month"
          width="flex-[1.6]"
        />
        <Wheel
          items={days}
          value={day - 1}
          onChange={(i) => updateDraft(year, month, i + 1)}
          ariaLabel="Day"
          width="flex-1"
        />
        <Wheel
          items={years}
          value={years.indexOf(year)}
          onChange={(i) => updateDraft(years[i], month, day)}
          ariaLabel="Year"
          width="flex-1"
        />
      </div>

      <motion.button
        type="button"
        onClick={handleSubmit}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-5 w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-glow transition-colors hover:bg-primary/90"
      >
        Calculate My Time
      </motion.button>

      <div className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Scroll · tap · or use arrow keys
      </div>
    </motion.div>
  );
}

export default DobPicker;
