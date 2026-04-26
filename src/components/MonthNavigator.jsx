import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { MONTHS } from '../services/moonService.js';

const MIN_YEAR = 1600;
const MAX_YEAR = 2600;

function clampYear(year) {
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
}

export default function MonthNavigator({ viewYear, viewMonth, onPrevious, onNext, onChangeView }) {
  const [draftYear, setDraftYear] = useState(String(viewYear));

  useEffect(() => {
    setDraftYear(String(viewYear));
  }, [viewYear]);

  const changeMonth = (event) => {
    onChangeView(Number(event.target.value), viewYear);
  };

  const changeYear = (year) => {
    onChangeView(viewMonth, clampYear(year));
  };

  const commitYear = (value = draftYear) => {
    const year = Number(value);
    if (Number.isFinite(year)) {
      changeYear(year);
    } else {
      setDraftYear(String(viewYear));
    }
  };

  const onYearInput = (event) => {
    const { value } = event.target;
    setDraftYear(value);

    const year = Number(value);
    if (value.length >= 4 && Number.isFinite(year) && year >= MIN_YEAR && year <= MAX_YEAR) {
      onChangeView(viewMonth, year);
    }
  };

  const onYearKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
      commitYear(event.currentTarget.value);
    }
  };

  return (
    <header className="calendar-header">
      <div className="app-title">Selenarium Advanced</div>
      <nav className="month-nav" aria-label="Calendar month navigation">
        <button type="button" onClick={onPrevious} aria-label="Previous month"><ChevronLeft size={18} /></button>
        <div className="date-picker" aria-label="Choose calendar month and year">
          <label className="picker-field">
            <span>Month</span>
            <select value={viewMonth} onChange={changeMonth} aria-label="Month">
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </label>
          <div className="year-field">
            <button type="button" onClick={() => changeYear(viewYear - 1)} aria-label="Previous year"><Minus size={14} /></button>
            <label className="picker-field year-input-field">
              <span>Year</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={draftYear}
                onChange={onYearInput}
                onBlur={() => commitYear()}
                onKeyDown={onYearKeyDown}
                aria-label="Year"
              />
            </label>
            <button type="button" onClick={() => changeYear(viewYear + 1)} aria-label="Next year"><Plus size={14} /></button>
          </div>
        </div>
        <button type="button" onClick={onNext} aria-label="Next month"><ChevronRight size={18} /></button>
      </nav>
      <div className="legend" aria-label="Calendar legend">
        <span><i className="legend-full" />Full Moon</span>
        <span><i className="legend-new" />New Moon</span>
        <span><i className="legend-today" />Today</span>
      </div>
    </header>
  );
}
