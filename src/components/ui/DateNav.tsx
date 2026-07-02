import { ChevronLeftIcon, ChevronRightIcon } from '../layout/icons';
import { addDaysISO, formatFriendlyDate, isToday, todayISODate } from '../../utils/dates';

interface DateNavProps {
  date: string;
  onChange: (date: string) => void;
}

export function DateNav({ date, onChange }: DateNavProps) {
  return (
    <div className="date-nav">
      <button type="button" className="icon-btn" onClick={() => onChange(addDaysISO(date, -1))} aria-label="Previous day">
        <ChevronLeftIcon />
      </button>
      <div className="date-nav__label">
        <div className="date-nav__day">{formatFriendlyDate(date)}</div>
        {!isToday(date) && (
          <button
            type="button"
            className="date-nav__sub"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            onClick={() => onChange(todayISODate())}
          >
            Jump to today
          </button>
        )}
        {isToday(date) && <div className="date-nav__sub">Today</div>}
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(addDaysISO(date, 1))}
        aria-label="Next day"
        disabled={date >= todayISODate()}
        style={date >= todayISODate() ? { opacity: 0.35 } : undefined}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
