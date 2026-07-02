import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { APPOINTMENT_TYPES, type Appointment, type AppointmentType } from '../../types';
import { PlusIcon } from '../../components/layout/icons';
import { todayISODate } from '../../utils/dates';

function emptyForm(): Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> {
  return { date: todayISODate(), type: 'gynaecologist', providerName: '', location: '', reasonNotes: '', outcomeNotes: '', followUpDate: '' };
}

export function AppointmentsSection() {
  const appointments = useLiveQuery(() => db.appointments.orderBy('date').reverse().toArray(), []);
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm());

  function startNew() {
    setForm(emptyForm());
    setEditingId('new');
  }

  function startEdit(a: Appointment) {
    setForm({
      date: a.date,
      time: a.time ?? '',
      type: a.type,
      providerName: a.providerName ?? '',
      location: a.location ?? '',
      reasonNotes: a.reasonNotes ?? '',
      outcomeNotes: a.outcomeNotes ?? '',
      followUpDate: a.followUpDate ?? '',
    });
    setEditingId(a.id ?? 'new');
  }

  async function save() {
    const now = new Date().toISOString();
    if (typeof editingId === 'number') {
      await db.appointments.update(editingId, { ...form, updatedAt: now });
    } else {
      await db.appointments.add({ ...form, createdAt: now, updatedAt: now });
    }
    setEditingId(null);
  }

  async function remove(id: number) {
    await db.appointments.delete(id);
  }

  const today = todayISODate();

  return (
    <div>
      {editingId !== null ? (
        <div className="card">
          <h2>{typeof editingId === 'number' ? 'Edit appointment' : 'New appointment'}</h2>
          <div className="field" style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Time</label>
              <input className="input" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AppointmentType })}>
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Provider / clinic</label>
            <input className="input" value={form.providerName} onChange={(e) => setForm({ ...form, providerName: e.target.value })} />
          </div>
          <div className="field">
            <label>Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="field">
            <label>Reason / what to discuss</label>
            <textarea className="input" value={form.reasonNotes} onChange={(e) => setForm({ ...form, reasonNotes: e.target.value })} />
          </div>
          <div className="field">
            <label>Outcome / notes from appointment</label>
            <textarea className="input" value={form.outcomeNotes} onChange={(e) => setForm({ ...form, outcomeNotes: e.target.value })} />
          </div>
          <div className="field">
            <label>Follow-up date</label>
            <input className="input" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
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
          <PlusIcon className="icon-inline" /> Add appointment
        </button>
      )}

      <div className="card">
        {!appointments || appointments.length === 0 ? (
          <div className="empty-state">No appointments logged yet.</div>
        ) : (
          appointments.map((a) => (
            <div className="list-item" key={a.id}>
              <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => startEdit(a)}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {APPOINTMENT_TYPES.find((t) => t.id === a.type)?.label ?? a.type}
                  {a.date >= today && <span className="badge">Upcoming</span>}
                </div>
                <div className="text-subtle text-sm">
                  {a.date}
                  {a.time ? ` · ${a.time}` : ''}
                  {a.providerName ? ` · ${a.providerName}` : ''}
                </div>
              </div>
              <button type="button" className="icon-btn" onClick={() => a.id && remove(a.id)} aria-label="Delete">
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
