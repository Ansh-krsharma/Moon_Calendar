import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MOON_ENGINE_APPROXIMATE,
  MOON_ENGINE_EPHEMERIS,
  getCalendarDays,
  getMonthIllumination,
  getMoonData,
  isSameDay,
} from './moonService.js';

test('getMoonData identifies known 2024 lunations using ephemeris mode', () => {
  assert.equal(getMoonData(new Date(2024, 3, 8)).name, 'New Moon');
  assert.equal(getMoonData(new Date(2024, 3, 23)).name, 'Full Moon');
});

test('getMoonData can use the approximate fallback engine', () => {
  const moon = getMoonData(new Date(2024, 3, 23), { engine: MOON_ENGINE_APPROXIMATE });

  assert.equal(moon.engine, MOON_ENGINE_APPROXIMATE);
  assert.equal(moon.name, 'Full Moon');
  assert.equal(moon.distanceKm, null);
});

test('ephemeris mode exposes lunar distance metadata', () => {
  const moon = getMoonData(new Date(2024, 3, 23), { engine: MOON_ENGINE_EPHEMERIS });

  assert.equal(moon.engine, MOON_ENGINE_EPHEMERIS);
  assert.equal(typeof moon.distanceKm, 'number');
  assert.ok(moon.distanceKm > 350000 && moon.distanceKm < 410000);
  assert.ok(moon.angularDiameterDeg > 0.45 && moon.angularDiameterDeg < 0.6);
});

test('getCalendarDays includes only the right current-month count', () => {
  const february2024 = getCalendarDays(2024, 1);
  const currentMonthDays = february2024.filter((day) => day.isCurrentMonth);

  assert.equal(currentMonthDays.length, 29);
  assert.equal(currentMonthDays[0].date.getDate(), 1);
  assert.equal(currentMonthDays.at(-1).date.getDate(), 29);
});

test('getMonthIllumination returns bounded daily percentages', () => {
  const data = getMonthIllumination(2024, 3, { engine: MOON_ENGINE_EPHEMERIS });

  assert.equal(data.length, 30);
  assert.ok(data.every((day) => day.illumination >= 0 && day.illumination <= 100));
});

test('isSameDay ignores time of day', () => {
  assert.equal(isSameDay(new Date(2024, 3, 8, 1), new Date(2024, 3, 8, 23)), true);
  assert.equal(isSameDay(new Date(2024, 3, 8), new Date(2024, 3, 9)), false);
});
