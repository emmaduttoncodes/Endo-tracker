import type { CycleDay } from '../types';
import { toISODate } from './dates';

export { toISODate, todayISODate } from './dates';

export interface PeriodGroup {
  startDate: string;
  endDate: string;
  days: CycleDay[];
}

/** Groups cycle days into periods by finding runs of consecutive dates. */
export function groupIntoPeriods(cycleDays: CycleDay[]): PeriodGroup[] {
  const sorted = [...cycleDays].sort((a, b) => a.date.localeCompare(b.date));
  const groups: PeriodGroup[] = [];
  let current: CycleDay[] = [];

  for (const day of sorted) {
    if (current.length === 0) {
      current.push(day);
      continue;
    }
    const prevDate = new Date(current[current.length - 1].date);
    const thisDate = new Date(day.date);
    const diffDays = Math.round((thisDate.getTime() - prevDate.getTime()) / 86400000);
    if (diffDays <= 1) {
      current.push(day);
    } else {
      groups.push({ startDate: current[0].date, endDate: current[current.length - 1].date, days: current });
      current = [day];
    }
  }
  if (current.length > 0) {
    groups.push({ startDate: current[0].date, endDate: current[current.length - 1].date, days: current });
  }
  return groups;
}

export interface CycleStats {
  periods: PeriodGroup[];
  averageCycleLength: number | null;
  averagePeriodLength: number | null;
  lastPeriodStart: string | null;
  currentCycleDay: number | null;
  predictedNextPeriod: string | null;
}

export function computeCycleStats(cycleDays: CycleDay[], today = new Date()): CycleStats {
  const periods = groupIntoPeriods(cycleDays);

  if (periods.length === 0) {
    return {
      periods,
      averageCycleLength: null,
      averagePeriodLength: null,
      lastPeriodStart: null,
      currentCycleDay: null,
      predictedNextPeriod: null,
    };
  }

  const cycleLengths: number[] = [];
  for (let i = 1; i < periods.length; i++) {
    const prevStart = new Date(periods[i - 1].startDate);
    const thisStart = new Date(periods[i].startDate);
    cycleLengths.push(Math.round((thisStart.getTime() - prevStart.getTime()) / 86400000));
  }
  const averageCycleLength = cycleLengths.length
    ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
    : null;

  const periodLengths = periods.map((p) => p.days.length);
  const averagePeriodLength = Math.round(
    periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
  );

  const lastPeriod = periods[periods.length - 1];
  const lastPeriodStart = lastPeriod.startDate;

  const startDate = new Date(lastPeriodStart);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const currentCycleDay = Math.round((todayMidnight.getTime() - startDate.getTime()) / 86400000) + 1;

  let predictedNextPeriod: string | null = null;
  if (averageCycleLength) {
    const predicted = new Date(startDate);
    predicted.setDate(predicted.getDate() + averageCycleLength);
    predictedNextPeriod = toISODate(predicted);
  }

  return {
    periods,
    averageCycleLength,
    averagePeriodLength,
    lastPeriodStart,
    currentCycleDay: currentCycleDay > 0 ? currentCycleDay : null,
    predictedNextPeriod,
  };
}
