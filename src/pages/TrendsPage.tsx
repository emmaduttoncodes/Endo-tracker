import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db } from '../db/db';
import { PageHeader } from '../components/layout/PageHeader';
import { SYMPTOM_CATALOG } from '../types';
import { addDaysISO, todayISODate } from '../utils/dates';

type RangeOption = 14 | 30 | 90;

export function TrendsPage() {
  const [range, setRange] = useState<RangeOption>(30);

  const startDate = addDaysISO(todayISODate(), -(range - 1));
  const logs = useLiveQuery(
    () => db.dailyLogs.where('date').between(startDate, todayISODate(), true, true).sortBy('date'),
    [startDate]
  );
  const cycleDays = useLiveQuery(
    () => db.cycleDays.where('date').between(startDate, todayISODate(), true, true).toArray(),
    [startDate]
  );

  const chartData = useMemo(() => {
    if (!logs) return [];
    const periodDates = new Set((cycleDays ?? []).map((c) => c.date));
    return logs.map((log) => ({
      date: log.date,
      label: format(new Date(`${log.date}T00:00:00`), 'MMM d'),
      pain: log.overallPainLevel,
      energy: log.energyLevel ?? null,
      period: periodDates.has(log.date) ? 1 : 0,
    }));
  }, [logs, cycleDays]);

  const symptomFrequency = useMemo(() => {
    if (!logs) return [];
    const counts = new Map<string, number>();
    for (const log of logs) {
      for (const id of Object.keys(log.symptoms ?? {})) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return SYMPTOM_CATALOG.map((s) => ({ label: s.label, count: counts.get(s.id) ?? 0 }))
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [logs]);

  const hasLogs = logs && logs.length > 0;

  return (
    <>
      <PageHeader eyebrow="Insights" title="Trends" />

      <div className="section-nav">
        {([14, 30, 90] as RangeOption[]).map((r) => (
          <button
            key={r}
            type="button"
            className={`section-nav__item${range === r ? ' active' : ''}`}
            onClick={() => setRange(r)}
          >
            Last {r} days
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Pain &amp; energy</h2>
        {!hasLogs ? (
          <div className="empty-state">Log a few days to see your trend here.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} interval="preserveStartEnd" />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-subtle)' }} width={28} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="pain" name="Pain" stroke="#cf5f5f" strokeWidth={2} dot={{ r: 2 }} connectNulls />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#6d5b8f" strokeWidth={2} dot={{ r: 2 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <span className="text-sm text-muted"><span style={{ color: '#cf5f5f' }}>●</span> Pain</span>
          <span className="text-sm text-muted"><span style={{ color: '#6d5b8f' }}>●</span> Energy</span>
        </div>
      </div>

      <div className="card">
        <h2>Period days</h2>
        {!chartData.length ? (
          <div className="empty-state">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" hide />
              <YAxis domain={[0, 1]} hide />
              <Bar dataKey="period" fill="var(--accent)" radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h2>Most frequent symptoms</h2>
        {symptomFrequency.length === 0 ? (
          <div className="empty-state">No symptoms logged in this range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(120, symptomFrequency.length * 34)}>
            <BarChart data={symptomFrequency} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="label" type="category" width={150} tick={{ fontSize: 12, fill: 'var(--text)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
