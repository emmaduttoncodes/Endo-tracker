import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import type { Medication } from '../../types';
import { PlusIcon } from '../../components/layout/icons';
import { todayISODate } from '../../utils/dates';

function emptyForm(): Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> {
  return { name: '', dosage: '', frequency: '', startDate: todayISODate(), endDate: '', active: true, notes: '' };
}

export function MedicationsSection() {
  const medications = useLiveQuery(() => db.medications.toArray(), []);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm());

  function startNew() {
    setForm(emptyForm());
    setEditingId('new');
  }

  function startEdit(m: Medication) {
    setForm({
      name: m.name,
      dosage: m.dosage ?? '',
      frequency: m.frequency ?? '',
      startDate: m.startDate ?? '',
      endDate: m.endDate ?? '',
      active: m.active,
      notes: m.notes ?? '',
    });
    setEditingId(m.id ?? 'new');
  }

  async function save() {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    if (typeof editingId === 'number') {
      await db.medications.update(editingId, { ...form, updatedAt: now });
    } else {
      await db.medications.add({ ...form, createdAt: now, updatedAt: now });
    }
    setEditingId(null);
  }

  async function remove(id: number) {
    await db.medications.delete(id);
  }

  const sorted = medications ? [...medications].sort((a, b) => Number(b.active) - Number(a.active)) : [];

  return (
    <div>
      {editingId !== null ? (
        <div className="card">
          <h2>{typeof editingId === 'number' ? 'Edit medication' : 'New medication / treatment'}</h2>
          <div className="field">
            <label>Name</label>
            <input className="input" placeholder="e.g. Norethisterone" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Dosage</label>
              <input className="input" placeholder="e.g. 5mg" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Frequency</label>
              <input className="input" placeholder="e.g. Twice daily" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
            </div>
          </div>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Start date</label>
              <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>End date</label>
              <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Currently taking
            </label>
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
          <PlusIcon className="icon-inline" /> Add medication
        </button>
      )}

      <div className="card">
        {sorted.length === 0 ? (
          <div className="empty-state">No medications logged yet.</div>
        ) : (
          sorted.map((m) => (
            <div className="list-item" key={m.id}>
              <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => startEdit(m)}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.name}
                  {m.active && <span className="badge">Active</span>}
                </div>
                <div className="text-subtle text-sm">
                  {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => m.id && remove(m.id)} aria-label="Delete">
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
