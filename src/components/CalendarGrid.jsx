import { motion } from 'framer-motion';
import MiniMoon from './MiniMoon.jsx';
import { formatDateLong, getCalendarDays, isSameDay, MONTHS, SHORT_WEEKDAYS } from '../services/moonService.js';

export default function CalendarGrid({ viewYear, viewMonth, today, selectedDate, moonEngine, onSelectDate }) {
  const days = getCalendarDays(viewYear, viewMonth, { engine: moonEngine });

  return (
    <div className="calendar-body">
      <div className="day-names" aria-hidden="true">
        {SHORT_WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <motion.div
        className="calendar-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={`${viewYear}-${viewMonth}`}
        aria-label={`${MONTHS[viewMonth]} ${viewYear} moon phase calendar`}
      >
        {days.map(({ id, date, isCurrentMonth, moon }, index) => {
          const selected = isSameDay(date, selectedDate);
          const current = isSameDay(date, today);
          const special = moon.name === 'Full Moon' || moon.name === 'New Moon';
          const dateLabel = `${formatDateLong(date)}: ${moon.name}, ${moon.illuminationPercent}% illuminated`;

          return (
            <motion.button
              type="button"
              key={id}
              className={`day-card ${!isCurrentMonth ? 'muted' : ''} ${selected ? 'selected' : ''} ${current ? 'today' : ''} ${special ? 'special' : ''}`}
              onClick={() => isCurrentMonth && onSelectDate(date)}
              disabled={!isCurrentMonth}
              title={`${moon.name} - ${moon.illuminationPercent}% illuminated`}
              aria-label={`${dateLabel}${selected ? ', selected' : ''}${current ? ', today' : ''}`}
              aria-pressed={selected}
              aria-current={current ? 'date' : undefined}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.008 }}
            >
              <span className={`phase-dot ${moon.name === 'Full Moon' ? 'full' : moon.name === 'New Moon' ? 'new' : ''}`} />
              <MiniMoon phase={moon.phase} />
              <strong>{date.getDate()}</strong>
              <small>{moon.illuminationPercent}%</small>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
