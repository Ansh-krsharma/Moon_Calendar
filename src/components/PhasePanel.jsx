import { motion } from 'framer-motion';
import { CalendarDays, Rotate3D, Sparkles } from 'lucide-react';
import { formatDateLong, MOON_ENGINE_APPROXIMATE, MOON_ENGINE_EPHEMERIS } from '../services/moonService.js';

const kmFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export default function PhasePanel({ selectedDate, moon, moonEngine, onMoonEngineChange, onToday }) {
  const distance = moon.distanceKm ? `${kmFormat.format(moon.distanceKm)} km` : moon.sourceLabel;

  return (
    <motion.div className="phase-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button className="today-button" onClick={onToday} type="button" aria-label="Jump to today's moon phase">
        <CalendarDays size={14} /> Today
      </button>
      <div className="drag-hint"><Rotate3D size={13} /> Drag to rotate - scroll to zoom</div>
      <div className="phase-overlay-card" role="region" aria-labelledby="phase-title" aria-live="polite">
        <div className="phase-card-topline">
          <div className="eyebrow"><Sparkles size={13} /> Live lunar profile</div>
          <div className="engine-toggle" role="group" aria-label="Moon data precision">
            <button
              type="button"
              className={moonEngine === MOON_ENGINE_EPHEMERIS ? 'active' : ''}
              aria-pressed={moonEngine === MOON_ENGINE_EPHEMERIS}
              onClick={() => onMoonEngineChange(MOON_ENGINE_EPHEMERIS)}
            >
              Ephemeris
            </button>
            <button
              type="button"
              className={moonEngine === MOON_ENGINE_APPROXIMATE ? 'active' : ''}
              aria-pressed={moonEngine === MOON_ENGINE_APPROXIMATE}
              onClick={() => onMoonEngineChange(MOON_ENGINE_APPROXIMATE)}
            >
              Approx
            </button>
          </div>
        </div>
        <h1 id="phase-title">{moon.emoji} {moon.name}</h1>
        <p>{formatDateLong(selectedDate)}</p>
        <div className="stat-grid">
          <div><span>Illumination</span><strong>{moon.illuminationPercent}%</strong></div>
          <div><span>Moon Age</span><strong>{moon.age.toFixed(1)} days</strong></div>
          <div><span>Cycle</span><strong>{moon.cyclePercent}%</strong></div>
          <div><span>{moon.distanceKm ? 'Distance' : 'Engine'}</span><strong>{distance}</strong></div>
        </div>
        <div className="illumination-track" aria-label={`Moon illumination ${moon.illuminationPercent}%`}>
          <span style={{ width: `${moon.illuminationPercent}%` }} />
        </div>
      </div>
    </motion.div>
  );
}
