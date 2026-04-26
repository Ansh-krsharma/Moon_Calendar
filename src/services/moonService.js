import { Body, Illumination, Libration, MoonPhase } from 'astronomy-engine';

export const LUNAR_MONTH = 29.530588853;
export const NEW_MOON_REFERENCE = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
export const MOON_ENGINE_EPHEMERIS = 'ephemeris';
export const MOON_ENGINE_APPROXIMATE = 'approximate';
export const DEFAULT_MOON_ENGINE = MOON_ENGINE_EPHEMERIS;

const MS_PER_DAY = 864e5;
const UNIX_EPOCH_JULIAN_DATE = 2440587.5;
const J2000_JULIAN_DATE = 2451545.0;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeDegrees(degrees) {
  return ((degrees % 360) + 360) % 360;
}

function normalizeEngine(engine) {
  return engine === MOON_ENGINE_APPROXIMATE ? MOON_ENGINE_APPROXIMATE : MOON_ENGINE_EPHEMERIS;
}

function toLocalNoon(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function toJulianDate(date) {
  return date.getTime() / MS_PER_DAY + UNIX_EPOCH_JULIAN_DATE;
}

function getSunLongitude(daysSinceJ2000) {
  const meanLongitude = normalizeDegrees(280.46646 + 0.98564736 * daysSinceJ2000);
  const meanAnomaly = normalizeDegrees(357.52911 + 0.98560028 * daysSinceJ2000);
  const equationOfCenter =
    1.914602 * Math.sin(degToRad(meanAnomaly)) +
    0.019993 * Math.sin(degToRad(2 * meanAnomaly)) +
    0.000289 * Math.sin(degToRad(3 * meanAnomaly));

  return normalizeDegrees(meanLongitude + equationOfCenter);
}

function getMoonLongitude(daysSinceJ2000) {
  const meanLongitude = normalizeDegrees(218.3164477 + 13.17639648 * daysSinceJ2000);
  const meanElongation = normalizeDegrees(297.8501921 + 12.19074912 * daysSinceJ2000);
  const sunMeanAnomaly = normalizeDegrees(357.5291092 + 0.98560028 * daysSinceJ2000);
  const moonMeanAnomaly = normalizeDegrees(134.9633964 + 13.06499295 * daysSinceJ2000);
  const moonLatitudeArgument = normalizeDegrees(93.2720950 + 13.22935024 * daysSinceJ2000);

  return normalizeDegrees(
    meanLongitude +
    6.288774 * Math.sin(degToRad(moonMeanAnomaly)) +
    1.274027 * Math.sin(degToRad(2 * meanElongation - moonMeanAnomaly)) +
    0.658314 * Math.sin(degToRad(2 * meanElongation)) +
    0.213618 * Math.sin(degToRad(2 * moonMeanAnomaly)) -
    0.185116 * Math.sin(degToRad(sunMeanAnomaly)) -
    0.114332 * Math.sin(degToRad(2 * moonLatitudeArgument))
  );
}

function getPhaseName(phase) {
  if (phase < 0.03 || phase >= 0.97) return 'New Moon';
  if (phase < 0.22) return 'Waxing Crescent';
  if (phase < 0.28) return 'First Quarter';
  if (phase < 0.47) return 'Waxing Gibbous';
  if (phase < 0.53) return 'Full Moon';
  if (phase < 0.72) return 'Waning Gibbous';
  if (phase < 0.78) return 'Last Quarter';
  return 'Waning Crescent';
}

function getPhaseEmoji(name) {
  return {
    'New Moon': '\u{1F311}',
    'Waxing Crescent': '\u{1F312}',
    'First Quarter': '\u{1F313}',
    'Waxing Gibbous': '\u{1F314}',
    'Full Moon': '\u{1F315}',
    'Waning Gibbous': '\u{1F316}',
    'Last Quarter': '\u{1F317}',
    'Waning Crescent': '\u{1F318}',
  }[name];
}

function finalizeMoonData(data) {
  const name = getPhaseName(data.phase);
  const illumination = clamp01(data.illumination);

  return {
    phase: data.phase,
    illumination,
    age: data.phase * LUNAR_MONTH,
    name,
    emoji: getPhaseEmoji(name),
    phaseAngle: data.phaseAngle,
    waxing: data.phase < 0.5,
    engine: data.engine,
    sourceLabel: data.sourceLabel,
    distanceKm: data.distanceKm ?? null,
    angularDiameterDeg: data.angularDiameterDeg ?? null,
    librationLatitude: data.librationLatitude ?? null,
    librationLongitude: data.librationLongitude ?? null,
    eclipticLatitude: data.eclipticLatitude ?? null,
    eclipticLongitude: data.eclipticLongitude ?? null,
    cyclePercent: Math.round(data.phase * 100),
    illuminationPercent: Math.round(illumination * 100),
  };
}

function getApproximateMoonData(date) {
  const safeDate = toLocalNoon(date);
  const daysSinceJ2000 = toJulianDate(safeDate) - J2000_JULIAN_DATE;
  const sunLongitude = getSunLongitude(daysSinceJ2000);
  const moonLongitude = getMoonLongitude(daysSinceJ2000);
  const phaseAngle = normalizeDegrees(moonLongitude - sunLongitude);
  const phase = phaseAngle / 360;

  return finalizeMoonData({
    phase,
    phaseAngle,
    illumination: 0.5 * (1 - Math.cos(degToRad(phaseAngle))),
    engine: MOON_ENGINE_APPROXIMATE,
    sourceLabel: 'Approx',
  });
}

function getEphemerisMoonData(date) {
  const safeDate = toLocalNoon(date);
  const phaseAngle = normalizeDegrees(MoonPhase(safeDate));
  const phase = phaseAngle / 360;
  const illumination = Illumination(Body.Moon, safeDate);
  const libration = Libration(safeDate);

  return finalizeMoonData({
    phase,
    phaseAngle,
    illumination: illumination.phase_fraction,
    engine: MOON_ENGINE_EPHEMERIS,
    sourceLabel: 'Ephemeris',
    distanceKm: Math.round(libration.dist_km),
    angularDiameterDeg: libration.diam_deg,
    librationLatitude: libration.elat,
    librationLongitude: libration.elon,
    eclipticLatitude: libration.mlat,
    eclipticLongitude: libration.mlon,
  });
}

export function getMoonData(date, options = {}) {
  const engine = normalizeEngine(options.engine ?? DEFAULT_MOON_ENGINE);
  if (engine === MOON_ENGINE_APPROXIMATE) return getApproximateMoonData(date);

  try {
    return getEphemerisMoonData(date);
  } catch {
    return {
      ...getApproximateMoonData(date),
      sourceLabel: 'Approx fallback',
    };
  }
}

export function getCalendarDays(year, month, options = {}) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    let date;
    let isCurrentMonth = true;

    if (index < firstDay) {
      date = new Date(year, month - 1, daysInPreviousMonth - firstDay + index + 1);
      isCurrentMonth = false;
    } else if (index < firstDay + daysInMonth) {
      date = new Date(year, month, index - firstDay + 1);
    } else {
      date = new Date(year, month + 1, index - firstDay - daysInMonth + 1);
      isCurrentMonth = false;
    }

    return {
      id: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth,
      moon: getMoonData(date, options),
    };
  });
}

export function getMonthIllumination(year, month, options = {}) {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const moon = getMoonData(date, options);
    return {
      day: index + 1,
      illumination: moon.illuminationPercent,
      phase: moon.name,
    };
  });
}

export function formatDateLong(date) {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}
