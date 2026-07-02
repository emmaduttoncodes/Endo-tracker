import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { PageHeader } from '../components/layout/PageHeader';
import { DateNav } from '../components/ui/DateNav';
import { computeCycleStats } from '../utils/cycle';
import { formatFriendlyDate, todayISODate } from '../utils/dates';
import type { FlowIntensity } from '../types';
import { useToast } from '../utils/useToast';

const FLOW_OPTIONS: { id: FlowIntensity; label: string }[] = [
  { id: 'spotting', label: 'Spotting' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'heavy', label: 'Heavy' },
];

export function CyclePage() {
  const [date, setDate] = useState(todayISODate());
  const { message, showToast } = useToast();

  const cycleDays = useLiveQuery(() => db.cycleDays.toArray(), []);
  const stats = cycleDays ? computeCycleStats(cycleDays) : null;
  const todayEntry = cycleDays?.find((d) => d.date === date);

  async function setFlow(flow: FlowIntensity | null) {
    if (flow === null) {
      if (todayEntry?.id) {
        await db.cycleDays.delete(todayEntry.id);
        showToast('Removed');
      }
      return;
    }
    const now = new Date().toISOString();
    await db.cycleDays.put({
      id: todayEntry?.id,
      date,
      flow,
      createdAt: todayEntry?.createdAt ?? now,
      updatedAt: now,
    });
    showToast('Saved');
  }

  return (
    <>
      <PageHeader eyebrow="Cycle" title="Cycle tracking" />

      {stats && (
        <div className="card">
          <div className="stat-row">
            <div className="stat">
              <div className="stat__value">{stats.currentCycleDay ?? '—'}</div>
              <div className="stat__label">Cycle day</div>
            </div>
            <div className="stat">
              <div className="stat__value">{stats.averageCycleLength ?? '—'}</div>
              <div className="stat__label">Avg cycle (days)</div>
            </div>
            <div className="stat">
              <div className="stat__value">{stats.averagePeriodLength ?? '—'}</div>
              <div className="stat__label">Avg period (days)</div>
            </div>
          </div>
          {stats.predictedNextPeriod && (
            <p className="text-muted text-sm" style={{ marginTop: 12 }}>
              Predicted next period: <strong>{formatFriendlyDate(stats.predictedNextPeriod)}</strong>
            </p>
          )}
        </div>
      )}

      <DateNav date={date} onChange={setDate} />

      <div className="card">
        <h2>Flow</h2>
        <div className="flow-scale">
          {FLOW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`flow-scale__btn${todayEntry?.flow === opt.id ? ' selected' : ''}`}
              onClick={() => setFlow(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {todayEntry && (
          <button type="button" className="btn btn-sm" style={{ marginTop: 12 }} onClick={() => setFlow(null)}>
            Clear entry for this day
          </button>
        )}
      </div>

      <div className="card">
        <h2>Period history</h2>
        {!stats || stats.periods.length === 0 ? (
          <div className="empty-state">No periods logged yet.</div>
        ) : (
          <div>
            {[...stats.periods]
              .reverse()
              .map((p) => (
                <div className="list-item" key={p.startDate}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{formatFriendlyDate(p.startDate)}</div>
                    <div className="text-subtle text-sm">
                      {p.days.length} day{p.days.length === 1 ? '' : 's'}
                      {p.startDate !== p.endDate ? ` · through ${formatFriendlyDate(p.endDate)}` : ''}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {message && <div className="toast">{message}</div>}
    </>
  );
}
