import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StarsBackground from './components/StarsBackground.jsx';
import PhasePanel from './components/PhasePanel.jsx';
import MonthNavigator from './components/MonthNavigator.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import { DEFAULT_MOON_ENGINE, getMoonData } from './services/moonService.js';

const MoonScene = lazy(() => import('./components/MoonScene.jsx'));
const IlluminationChart = lazy(() => import('./components/IlluminationChart.jsx'));

export default function App() {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [moonEngine, setMoonEngine] = useState(DEFAULT_MOON_ENGINE);

  const moon = useMemo(() => getMoonData(selectedDate, { engine: moonEngine }), [selectedDate, moonEngine]);

  const goToday = () => {
    const now = new Date();
    setSelectedDate(now);
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
  };

  const changeMonth = (step) => {
    const next = new Date(viewYear, viewMonth + step, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const changeCalendarView = (month, year) => {
    const next = new Date(year, month, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const selectDate = (date) => {
    setSelectedDate(new Date(date));
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented) return;
      if (event.target.closest?.('input, select, textarea')) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + (event.key === 'ArrowRight' ? 1 : -1));
        selectDate(next);
      }
      if (event.key.toLowerCase() === 't') goToday();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedDate]);

  return (
    <main className="app-shell">
      <StarsBackground />
      <motion.section className="moon-column" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Suspense fallback={<div className="moon-scene moon-scene-fallback" aria-hidden="true" />}>
          <MoonScene phase={moon.phase} label={`${moon.name}, ${moon.illuminationPercent}% illuminated`} />
        </Suspense>
        <PhasePanel selectedDate={selectedDate} moon={moon} moonEngine={moonEngine} onMoonEngineChange={setMoonEngine} onToday={goToday} />
      </motion.section>
      <section className="calendar-column">
        <MonthNavigator
          viewYear={viewYear}
          viewMonth={viewMonth}
          onPrevious={() => changeMonth(-1)}
          onNext={() => changeMonth(1)}
          onChangeView={changeCalendarView}
        />
        <CalendarGrid viewYear={viewYear} viewMonth={viewMonth} today={today} selectedDate={selectedDate} moonEngine={moonEngine} onSelectDate={selectDate} />
        <Suspense fallback={<section className="chart-card chart-loading" aria-hidden="true"><div className="chart-wrap" /></section>}>
          <IlluminationChart viewYear={viewYear} viewMonth={viewMonth} moonEngine={moonEngine} />
        </Suspense>
      </section>
    </main>
  );
}
