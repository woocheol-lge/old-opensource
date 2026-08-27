import { CAUTION_YEARS, DANGER_YEARS, type WarningLevel } from "@/lib/repo-lookup";
import { cn } from "@/lib/utils";

const LABELS: Record<Exclude<WarningLevel, "none">, string> = {
  danger: `${DANGER_YEARS}년 넘게 멈춤`,
  caution: `${CAUTION_YEARS}년 넘게 멈춤`,
};

const STYLES: Record<Exclude<WarningLevel, "none">, string> = {
  danger:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  caution:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
};

export function WarningBadge({ level }: { level: WarningLevel }) {
  if (level === "none") return null;

  return (
    <span
      data-warning={level}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[level]
      )}
    >
      <span aria-hidden>●</span>
      {LABELS[level]}
    </span>
  );
}
