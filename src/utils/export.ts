import { db } from '../db/db';
import type { Appointment, BloodTestResult, CycleDay, DailyLog, Medication } from '../types';

export interface DataBundle {
  exportedAt: string;
  schemaVersion: 1;
  source: 'endo-tracker';
  dailyLogs: DailyLog[];
  cycleDays: CycleDay[];
  bloodTests: BloodTestResult[];
  appointments: Appointment[];
  medications: Medication[];
}

/**
 * Produces a single structured JSON bundle of all locally-stored health data.
 * Intended as the foundation for future AI-assisted pattern analysis: every
 * record type is exported in full, with consistent field names, so it can be
 * handed to an LLM as context without additional transformation.
 */
export async function exportAllData(): Promise<DataBundle> {
  const [dailyLogs, cycleDays, bloodTests, appointments, medications] = await Promise.all([
    db.dailyLogs.orderBy('date').toArray(),
    db.cycleDays.orderBy('date').toArray(),
    db.bloodTests.orderBy('date').toArray(),
    db.appointments.orderBy('date').toArray(),
    db.medications.toArray(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    source: 'endo-tracker',
    dailyLogs,
    cycleDays,
    bloodTests,
    appointments,
    medications,
  };
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isDataBundle(value: unknown): value is DataBundle {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.source === 'endo-tracker' &&
    Array.isArray(v.dailyLogs) &&
    Array.isArray(v.cycleDays) &&
    Array.isArray(v.bloodTests) &&
    Array.isArray(v.appointments) &&
    Array.isArray(v.medications)
  );
}

/** Replaces all local data with the contents of a previously exported bundle. */
export async function importDataBundle(raw: unknown): Promise<void> {
  if (!isDataBundle(raw)) {
    throw new Error('This file does not look like an Endo Tracker export.');
  }
  await db.transaction('rw', db.dailyLogs, db.cycleDays, db.bloodTests, db.appointments, db.medications, async () => {
    await Promise.all([
      db.dailyLogs.clear(),
      db.cycleDays.clear(),
      db.bloodTests.clear(),
      db.appointments.clear(),
      db.medications.clear(),
    ]);
    await Promise.all([
      db.dailyLogs.bulkAdd(raw.dailyLogs.map(({ id: _id, ...rest }) => rest)),
      db.cycleDays.bulkAdd(raw.cycleDays.map(({ id: _id, ...rest }) => rest)),
      db.bloodTests.bulkAdd(raw.bloodTests.map(({ id: _id, ...rest }) => rest)),
      db.appointments.bulkAdd(raw.appointments.map(({ id: _id, ...rest }) => rest)),
      db.medications.bulkAdd(raw.medications.map(({ id: _id, ...rest }) => rest)),
    ]);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.dailyLogs, db.cycleDays, db.bloodTests, db.appointments, db.medications, async () => {
    await Promise.all([
      db.dailyLogs.clear(),
      db.cycleDays.clear(),
      db.bloodTests.clear(),
      db.appointments.clear(),
      db.medications.clear(),
    ]);
  });
}
