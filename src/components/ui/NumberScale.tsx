interface NumberScaleProps {
  value: number | undefined;
  onChange: (value: number) => void;
  max?: number;
  variant?: 'pain' | 'neutral';
}

const painColors = ['#8fb99b', '#a3bd81', '#c4c072', '#e0c168', '#e8ac61', '#e8a061', '#e2925f', '#dd7f63', '#d76f63', '#d16060', '#cf5f5f'];

export function NumberScale({ value, onChange, max = 10, variant = 'neutral' }: NumberScaleProps) {
  const items = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="pain-scale">
      {items.map((n) => {
        const selected = value === n;
        const color = variant === 'pain' ? painColors[Math.min(n, painColors.length - 1)] : 'var(--primary)';
        return (
          <button
            key={n}
            type="button"
            className={`pain-scale__btn${selected ? ' selected' : ''}`}
            style={selected ? { background: color } : undefined}
            onClick={() => onChange(n)}
            aria-pressed={selected}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
