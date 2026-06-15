import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Heart,
  Sparkles,
  Sun,
  Moon,
  Hourglass,
  Clock,
  CalendarDays,
  Wind,
} from "lucide-react";
import EarthScene from "@/components/EarthScene";
import { StatCard } from "@/components/StatCard";
import { DobPicker } from "@/components/DobPicker";
import { calcLifeStats, INSPIRATIONS } from "@/lib/life-stats";
import { cn } from "@/lib/utils";

const Index = () => {
  const [dob, setDob] = useState<Date | undefined>();
  const [now, setNow] = useState(new Date());
  const [inspirationIdx, setInspirationIdx] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Live tick
  useEffect(() => {
    if (!dob) return;
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [dob]);

  // Rotate inspirations
  useEffect(() => {
    if (!dob) return;
    const id = window.setInterval(
      () => setInspirationIdx((i) => (i + 1) % INSPIRATIONS.length),
      6000
    );
    return () => window.clearInterval(id);
  }, [dob]);

  const stats = useMemo(() => (dob ? calcLifeStats(dob, now) : null), [dob, now]);

  // Smooth-scroll to results
  useEffect(() => {
    if (dob && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [dob]);

  return (
    <>
      <EarthScene />

      <main className="relative min-h-dvh">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="container flex items-center justify-between pt-8"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
              <span className="relative h-3 w-3 rounded-full bg-primary shadow-glow" />
            </span>
            <span className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Life on Earth
            </span>
          </div>
          <span className="hidden sm:block mono text-xs text-muted-foreground/80">
            {format(now, "yyyy.MM.dd · HH:mm:ss")}
          </span>
        </motion.header>

        {/* Hero */}
        <section className="container flex min-h-[calc(100dvh-6rem)] flex-col items-start justify-center py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              A moment of perspective
            </span>

            <h1 className="mt-6 text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02] text-gradient">
              How many days
              <br />
              have you orbited
              <br />
              <span className="text-aurora">the Sun?</span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Pick the day you arrived on Earth. We&apos;ll show you the full shape of your time
              here — down to the second, and every heartbeat in between.
            </p>

            <div className="mt-10 flex flex-col gap-4 items-start">
              <DobPicker value={dob} onChange={setDob} />

              {dob && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mono text-xs text-muted-foreground"
                >
                  Live · updating every second · {format(dob, "MMMM d, yyyy")}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Floating hint card while no DOB */}
          {!dob && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 grid w-full max-w-3xl grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {[
                { v: "365.25", l: "Days / Year" },
                { v: "8,760", l: "Hours / Year" },
                { v: "72", l: "Beats / Min" },
                { v: "1", l: "Life" },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="glass rounded-2xl p-4 animate-float"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <div className="mono text-2xl text-gradient">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                    {s.l}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Results */}
        <section ref={resultsRef} className="container pb-32">
          <AnimatePresence mode="wait">
            {dob && stats && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hero number */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center"
                >
                  <div className="pointer-events-none absolute inset-0 bg-aurora opacity-10" />
                  <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-primary/30 blur-3xl" />

                  <div className="relative">
                    <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      You have lived on Earth for
                    </div>
                    <div className="mt-6 mono text-6xl sm:text-8xl lg:text-9xl font-semibold text-gradient leading-none tabular-nums">
                      {Math.floor(stats.days).toLocaleString()}
                    </div>
                    <div className="mt-4 text-xl sm:text-2xl text-aurora font-medium">days</div>

                    <div className="mt-8 mono text-sm text-muted-foreground">
                      since{" "}
                      <span className="text-foreground">{format(dob, "MMMM d, yyyy")}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Stats grid */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Years"
                    value={stats.years}
                    decimals={2}
                    icon={<Sun className="h-4 w-4" />}
                    accent="primary"
                    delay={0.05}
                  />
                  <StatCard
                    label="Months"
                    value={stats.months}
                    decimals={1}
                    icon={<Moon className="h-4 w-4" />}
                    accent="secondary"
                    delay={0.1}
                  />
                  <StatCard
                    label="Weeks"
                    value={Math.floor(stats.weeks)}
                    icon={<CalendarDays className="h-4 w-4" />}
                    accent="accent"
                    delay={0.15}
                  />
                  <StatCard
                    label="Days"
                    value={Math.floor(stats.days)}
                    icon={<CalendarIcon className="h-4 w-4" />}
                    accent="primary"
                    delay={0.2}
                  />
                  <StatCard
                    label="Hours"
                    value={Math.floor(stats.hours)}
                    icon={<Clock className="h-4 w-4" />}
                    accent="secondary"
                    delay={0.25}
                  />
                  <StatCard
                    label="Minutes"
                    value={Math.floor(stats.minutes)}
                    icon={<Hourglass className="h-4 w-4" />}
                    accent="accent"
                    delay={0.3}
                  />
                  <StatCard
                    label="Heartbeats"
                    value={Math.floor(stats.heartbeats)}
                    suffix="~"
                    icon={<Heart className="h-4 w-4" />}
                    accent="primary"
                    delay={0.35}
                  />
                  <StatCard
                    label="Breaths"
                    value={Math.floor(stats.breaths)}
                    suffix="~"
                    icon={<Wind className="h-4 w-4" />}
                    accent="secondary"
                    delay={0.4}
                  />
                </div>

                {/* Inspiration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-6 glass rounded-2xl p-6 sm:p-8 overflow-hidden relative"
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-aurora" />
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-aurora text-primary-foreground shadow-glow">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-h-[3rem]">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        Reflection
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.p
                          key={inspirationIdx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.5 }}
                          className="mt-1.5 text-base sm:text-lg text-foreground/90 leading-relaxed"
                        >
                          {INSPIRATIONS[inspirationIdx]}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <footer className="container pb-10 text-center">
          <div className="mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Made with light, time & gravity
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
