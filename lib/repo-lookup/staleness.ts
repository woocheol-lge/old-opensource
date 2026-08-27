/** 경고 등급. 마지막 업데이트로부터 경과한 기간으로 정해진다. */
export type WarningLevel = "none" | "caution" | "danger";

/** 노란 경고가 시작되는 경과 연수. */
export const CAUTION_YEARS = 3;

/** 빨간 경고가 시작되는 경과 연수. */
export const DANGER_YEARS = 5;

const DAYS_PER_YEAR = 365.25;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 두 시점 사이의 경과 연수. 미래 날짜는 0으로 본다. */
export function yearsBetween(from: Date, to: Date): number {
  const days = (to.getTime() - from.getTime()) / MS_PER_DAY;
  return Math.max(0, days / DAYS_PER_YEAR);
}

/**
 * 마지막 업데이트 시점으로 경고 등급을 정한다.
 * 날짜를 확인하지 못한 경우에는 등급을 매기지 않는다.
 */
export function warningLevelFor(
  lastUpdate: Date | null,
  now: Date
): WarningLevel {
  if (!lastUpdate) return "none";

  const years = yearsBetween(lastUpdate, now);
  if (years >= DANGER_YEARS) return "danger";
  if (years >= CAUTION_YEARS) return "caution";
  return "none";
}
