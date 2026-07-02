interface ChipOption {
  id: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (id: string) => void;
}

export function ChipGroup({ options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="chip-group">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`chip${selected.includes(opt.id) ? ' selected' : ''}`}
          onClick={() => onToggle(opt.id)}
          aria-pressed={selected.includes(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
