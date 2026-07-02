import Dexie, { type EntityTable } from 'dexie';
import type { Appointment, BloodTestResult, CycleDay, DailyLog, Medication } from '../types';

class EndoTrackerDB extends Dexie {
  dailyLogs!: EntityTable<DailyLog, 'id'>;
  cycleDays!: EntityTable<CycleDay, 'id'>;
  bloodTests!: EntityTable<BloodTestResult, 'id'>;
  appointments!: EntityTable<Appointment, 'id'>;
  medications!: EntityTable<Medication, 'id'>;

  constructor() {
    super('endo-tracker');
    this.version(1).stores({
      dailyLogs: '++id, &date',
      cycleDays: '++id, &date',
      bloodTests: '++id, date, testName',
      appointments: '++id, date, type',
      medications: '++id, active',
    });
  }
}

export const db = new EndoTrackerDB();
