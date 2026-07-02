import { SYMPTOM_CATALOG, type SeverityLevel, type SymptomCategory } from '../../types';

interface SymptomPickerProps {
  symptoms: Partial<Record<string, SeverityLevel>>;
  onChange: (symptoms: Partial<Record<string, SeverityLevel>>) => void;
}

const CATEGORY_LABELS: Record<SymptomCategory, string> = {
  pain: 'Pain',
  digestive: 'Digestive',
  urinary: 'Urinary',
  'energy-cognitive': 'Energy & cognitive',
  mood: 'Mood',
  other: 'Other',
};

const CATEGORY_ORDER: SymptomCategory[] = ['pain', 'digestive', 'urinary', 'energy-cognitive', 'mood', 'other'];

const severityLabel: Record<SeverityLevel, string> = { 0: '', 1: 'Mild', 2: 'Moderate', 3: 'Severe' };

export function SymptomPicker({ symptoms, onChange }: SymptomPickerProps) {
  function cycle(id: string) {
    const current = symptoms[id] ?? 0;
    const next = ((current + 1) % 4) as SeverityLevel;
    const updated = { ...symptoms };
    if (next === 0) {
      delete updated[id];
    } else {
      updated[id] = next;
    }
    onChange(updated);
  }

  return (
    <div>
      {CATEGORY_ORDER.map((category) => {
        const items = SYMPTOM_CATALOG.filter((s) => s.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category} style={{ marginBottom: 14 }}>
            <div className="field-label">{CATEGORY_LABELS[category]}</div>
            <div className="chip-group">
              {items.map((s) => {
                const severity = symptoms[s.id] ?? 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`chip${severity > 0 ? ` selected severity-${severity}` : ''}`}
                    onClick={() => cycle(s.id)}
                  >
                    {s.label}
                    {severity > 0 ? ` · ${severityLabel[severity]}` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-subtle text-sm">Tap a symptom to cycle through mild → moderate → severe → off.</p>
    </div>
  );
}
