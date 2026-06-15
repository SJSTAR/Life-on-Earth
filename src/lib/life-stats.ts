export interface LifeStats {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  heartbeats: number;
  breaths: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function calcLifeStats(dob: Date, now: Date = new Date()): LifeStats {
  const diffMs = Math.max(0, now.getTime() - dob.getTime());
  const seconds = diffMs / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = diffMs / MS_PER_DAY;
  const weeks = days / 7;
  const years = days / 365.25;
  const months = years * 12;
  // average resting heart rate ~72 bpm, breaths ~16/min
  const heartbeats = minutes * 72;
  const breaths = minutes * 16;
  return {
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    heartbeats,
    breaths,
  };
}

export const INSPIRATIONS = [
  "Every heartbeat is a quiet miracle — listen closely.",
  "Time is the most precious currency. Spend it on what matters.",
  "You are made of stardust, living a once-in-a-universe moment.",
  "The Earth has spun beneath you all these days. Make the next one count.",
  "Yesterday is a memory. Tomorrow is a possibility. Today is yours.",
  "A lifetime is not measured in years, but in moments of wonder.",
  "Breathe deeply — you are alive on a small blue planet in an endless cosmos.",
  "Each second is a gift the universe will never repeat.",
];
