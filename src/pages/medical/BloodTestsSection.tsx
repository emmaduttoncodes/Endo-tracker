import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { BloodTestResult } from '../../types';
import { PlusIcon } from '../../components/layout/icons';
import { todayISODate } from '../../utils/dates';

function emptyForm(): Omit<BloodTestResult, 'id' | 'createdAt' | 'updatedAt'> {
  return { date: todayISODate(), testName: '', value: '', unit: '', notes: '' };
}

export function BloodTestsSection() {
  const tests = useLiveQuery(() => db.bloodTests.orderBy('date').reverse().toArray(), []);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm());

  function startNew() {
    setForm(emptyForm());
    setEditingId('new');
  }

  function startEdit(test: BloodTestResult) {
    setForm({
      date: test.date,
      testName: test.testName,
      value: test.value,
      unit: test.unit ?? '',
      referenceRangeLow: test.referenceRangeLow,
      referenceRangeHigh: test.referenceRangeHigh,
      orderedBy: test.orderedBy,
      notes: test.notes ?? '',
    });
    setEditingId(test.id ?? 'new');
  }

  async function save() {
    if (!form.testName.trim()) return;
    const now = new Date().toISOString();
    if (typeof editingId === 'number') {
      await db.bloodTests.update(editingId, { ...form, updatedAt: now });
    } else {
      await db.bloodTests.add({ ...form, createdAt: now, updatedAt: now });
    }
    setEditingId(null);
  }

  async function remove(id: number) {
    await db.bloodTests.delete(id);
  }

  function isOutOfRange(test: BloodTestResult): boolean {
    if (typeof test.value !== 'number') return false;
    if (test.referenceRangeLow != null && test.value < test.referenceRangeLow) return true;
    if (test.referenceRangeHigh != null && test.value > test.referenceRangeHigh) return true;
    return false;
  }

  return (
    <div>
      {editingId !== null ? (
        <div className="card">
          <h2>{typeof editingId === 'number' ? 'Edit result' : 'New blood test result'}</h2>
          <div className="field">
            <label>Date</label>
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Test name</label>
            <input
              className="input"
              placeholder="e.g. CA-125, Iron, Vitamin D"
              value={form.testName}
              onChange={(e) => setForm({ ...form, testName: e.target.value })}
            />
          </div>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Value</label>
              <input
                className="input"
                inputMode="decimal"
                value={form.value}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = Number(raw);
                  setForm({ ...form, value: raw !== '' && !Number.isNaN(num) ? num : raw });
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Unit</label>
              <input className="input" placeholder="e.g. ng/mL" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
          </div>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Reference range low</label>
              <input
                className="input"
                inputMode="decimal"
                value={form.referenceRangeLow ?? ''}
                onChange={(e) => setForm({ ...form, referenceRangeLow: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Reference range high</label>
              <input
                className="input"
                inputMode="decimal"
                value={form.referenceRangeHigh ?? ''}
                onChange={(e) => setForm({ ...form, referenceRangeHigh: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="field">
            <label>Ordered by</label>
            <input className="input" value={form.orderedBy ?? ''} onChange={(e) => setForm({ ...form, orderedBy: e.target.value })} />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary btn-block" onClick={save}>
              Save
            </button>
            <button type="button" className="btn" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-block" onClick={startNew} style={{ marginBottom: 14 }}>
          <PlusIcon className="icon-inline" /> Add blood test result
        </button>
      )}

      <div className="card">
        {!tests || tests.length === 0 ? (
          <div className="empty-state">No blood test results yet.</div>
        ) : (
          tests.map((t) => (
            <div className="list-item" key={t.id}>
              <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => startEdit(t)}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.testName}
                  {isOutOfRange(t) && <span className="badge" style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>Out of range</span>}
                </div>
                <div className="text-subtle text-sm">
                  {t.date} · {t.value}
                  {t.unit ? ` ${t.unit}` : ''}
                  {t.referenceRangeLow != null || t.referenceRangeHigh != null
                    ? ` (ref ${t.referenceRangeLow ?? '?'}–${t.referenceRangeHigh ?? '?'})`
                    : ''}
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => t.id && remove(t.id)} aria-label="Delete">
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
