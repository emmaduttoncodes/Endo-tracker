import { useEffect, useRef, useState } from 'react';
import { db } from '../db/db';
import { PAIN_LOCATIONS, type DailyLog, type PainLocation } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { DateNav } from '../components/ui/DateNav';
import { NumberScale } from '../components/ui/NumberScale';
import { ChipGroup } from '../components/ui/ChipGroup';
import { SymptomPicker } from '../components/ui/SymptomPicker';
import { todayISODate } from '../utils/dates';
import { useToast } from '../utils/useToast';

function emptyLog(date: string): DailyLog {
  const now = new Date().toISOString();
  return {
    date,
    overallPainLevel: 0,
    painLocations: [],
    symptoms: {},
    medicationsTaken: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function DailyLogPage() {
  const [date, setDate] = useState(todayISODate());
  const [form, setForm] = useState<DailyLog | null>(null);
  const { message, showToast } = useToast();
  const [medInput, setMedInput] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    setForm(null);
    (async () => {
      const record = await db.dailyLogs.where('date').equals(date).first();
      if (!cancelled) setForm(record ?? emptyLog(date));
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  function update(patch: Partial<DailyLog>) {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const id = await db.dailyLogs.put(next);
        setForm((f) => (f && f.date === next.date ? { ...f, id: f.id ?? (id as number) } : f));
        showToast('Saved');
      }, 500);
      return next;
    });
  }

  if (!form) return null;

  const medications = form.medicationsTaken;

  function addMedication() {
    const val = medInput.trim();
    if (!val) return;
    update({ medicationsTaken: [...medications, val] });
    setMedInput('');
  }

  function removeMedication(idx: number) {
    update({ medicationsTaken: medications.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <PageHeader eyebrow="Daily check-in" title="Today" />
      <DateNav date={date} onChange={setDate} />

      <div className="card">
        <h2>Overall pain</h2>
        <NumberScale value={form.overallPainLevel} onChange={(v) => update({ overallPainLevel: v })} variant="pain" />
      </div>

      <div className="card">
        <h2>Pain locations</h2>
        <ChipGroup
          options={PAIN_LOCATIONS}
          selected={form.painLocations}
          onToggle={(id) =>
            update({
              painLocations: form.painLocations.includes(id as PainLocation)
                ? form.painLocations.filter((l) => l !== id)
                : [...form.painLocations, id as PainLocation],
            })
          }
        />
      </div>

      <div className="card">
        <h2>Symptoms</h2>
        <SymptomPicker symptoms={form.symptoms} onChange={(symptoms) => update({ symptoms })} />
      </div>

      <div className="card">
        <h2>Mood</h2>
        <div className="chip-group">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`chip${form.moodRating === n ? ' selected' : ''}`}
              onClick={() => update({ moodRating: n })}
            >
              {['😞', '🙁', '😐', '🙂', '😀'][n - 1]}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Energy level</h2>
        <NumberScale value={form.energyLevel} onChange={(v) => update({ energyLevel: v })} />
      </div>

      <div className="card">
        <h2>Sleep quality</h2>
        <NumberScale value={form.sleepQuality} onChange={(v) => update({ sleepQuality: v })} />
      </div>

      <div className="card">
        <h2>Medication taken</h2>
        {medications.length > 0 && (
          <div className="chip-group" style={{ marginBottom: 10 }}>
            {medications.map((m, i) => (
              <button key={i} type="button" className="chip selected" onClick={() => removeMedication(i)}>
                {m} ✕
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="e.g. Ibuprofen 400mg"
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addMedication();
              }
            }}
          />
          <button type="button" className="btn" onClick={addMedication}>
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Notes</h2>
        <textarea
          className="input"
          placeholder="Anything else worth noting today..."
          value={form.notes ?? ''}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </div>

      {message && <div className="toast">{message}</div>}
    </>
  );
}
