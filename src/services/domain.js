"use strict";

const DAY_MS = 24 * 60 * 60 * 1000;
const NIGHT_HOUR = 22;

/** ATO Schedule 1 Scale 2 (tax-free threshold claimed). Bands are “weekly x less than”. */
const SCALE2_FY2025_26 = [
  { lessThan: 361, withholdZero: true },
  { lessThan: 500, a: 0.16, b: 57.8462 },
  { lessThan: 625, a: 0.26, b: 107.8462 },
  { lessThan: 721, a: 0.18, b: 57.8462 },
  { lessThan: 865, a: 0.189, b: 64.3365 },
  { lessThan: 1282, a: 0.3227, b: 180.0385 },
  { lessThan: 2596, a: 0.32, b: 176.5769 },
  { lessThan: 3653, a: 0.39, b: 358.3077 },
  { lessThan: Infinity, a: 0.47, b: 650.6154 },
];

const SCALE2_FY2026_27 = [
  { lessThan: 362, withholdZero: true },
  { lessThan: 538, a: 0.15, b: 54.3462 },
  { lessThan: 673, a: 0.25, b: 108.2135 },
  { lessThan: 721, a: 0.17, b: 54.3473 },
  { lessThan: 865, a: 0.179, b: 60.8377 },
  { lessThan: 1282, a: 0.3227, b: 185.1935 },
  { lessThan: 2596, a: 0.32, b: 181.7319 },
  { lessThan: 3653, a: 0.39, b: 363.4627 },
  { lessThan: Infinity, a: 0.47, b: 655.7704 },
];

const FY2026_27_START = new Date(2026, 6, 1);

function toDate(value) {
  if (value instanceof Date) return new Date(value.getTime());
  return new Date(value);
}

function startOfLocalDay(value) {
  const d = toDate(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addLocalDays(value, days) {
  const d = startOfLocalDay(value);
  d.setDate(d.getDate() + days);
  return d;
}

function formatISODate(value) {
  const d = toDate(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function mondayOnOrBefore(value) {
  const d = startOfLocalDay(value);
  const day = d.getDay();
  const delta = day === 0 ? 6 : day - 1;
  return addLocalDays(d, -delta);
}

function defaultAnchorISO(now = new Date()) {
  return formatISODate(mondayOnOrBefore(now));
}

function getFortnightStart(date, anchorISO) {
  const day = startOfLocalDay(date);
  const anchor = startOfLocalDay(parseISODate(anchorISO));
  const diffDays = Math.round((day.getTime() - anchor.getTime()) / DAY_MS);
  const fortnightIndex = Math.floor(diffDays / 14);
  return addLocalDays(anchor, fortnightIndex * 14);
}

function getFortnightRange(date, anchorISO) {
  const start = getFortnightStart(date, anchorISO);
  const end = addLocalDays(start, 13);
  end.setHours(23, 59, 59, 999);
  return { start, end, id: formatISODate(start) };
}

function shiftHours(clockInISO, clockOutISO) {
  if (!clockInISO || !clockOutISO) return 0;
  const ms = new Date(clockOutISO).getTime() - new Date(clockInISO).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return ms / 36e5;
}

function roundHours(hours) {
  return roundHalfUp(hours, 2);
}

function roundHalfUp(value, places = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const factor = 10 ** places;
  const scaled = n * factor;
  const sign = scaled < 0 ? -1 : 1;
  return (sign * Math.round(Math.abs(scaled) + Number.EPSILON * 10)) / factor;
}

function roundMoney(amount) {
  return roundHalfUp(amount, 2);
}

function roundWholeDollars(amount) {
  return Math.max(0, Math.round(roundHalfUp(amount, 2)));
}

function parseRate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const DEFAULT_HEADER_RATE = "34.00";
const DEFAULT_PREVIOUS_HEADER_RATE = "31.18";
const DEFAULT_HEADER_RATE_FROM = "2026-06-29";

function isISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function headerForDate(settings, date) {
  const current = parseRate(settings && settings.headerRate);
  const previous = parseRate(settings && settings.previousHeaderRate);
  const fromISO = String((settings && settings.headerRateFrom) || "").trim();
  if (previous > 0 && isISODate(fromISO) && formatISODate(date) < fromISO) return previous;
  return current;
}

function parsePercent(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseLoading(value, fallbackPercent) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallbackPercent / 100;
  return n > 3 ? n / 100 : n;
}

function hasPayRates(settings) {
  return (
    parseRate(settings && settings.headerRate) > 0 ||
    parseRate(settings && settings.previousHeaderRate) > 0
  );
}

function dayType(value) {
  const day = toDate(value).getDay();
  if (day === 6) return "saturday";
  if (day === 0) return "sunday";
  return "weekday";
}

function isWeekdayNight(value) {
  const date = toDate(value);
  return dayType(date) === "weekday" && date.getHours() >= NIGHT_HOUR;
}

function nextRateBoundary(value) {
  const date = toDate(value);
  const type = dayType(date);
  const boundary = new Date(date.getTime());
  if (type === "saturday" || type === "sunday" || date.getHours() >= NIGHT_HOUR) {
    boundary.setDate(boundary.getDate() + 1);
    boundary.setHours(0, 0, 0, 0);
    return boundary;
  }
  boundary.setHours(NIGHT_HOUR, 0, 0, 0);
  return boundary;
}

function loadingFor(type, weekdayNight, settings) {
  if (type === "holiday") return parseLoading(settings && settings.publicHolidayLoading, 250);
  if (type === "saturday") return parseLoading(settings && settings.saturdayLoading, 125);
  if (type === "sunday") return parseLoading(settings && settings.sundayLoading, 150);
  if (weekdayNight) return parseLoading(settings && settings.nightLoading, 110);
  return 1;
}

function lineAmount(hours, header, loading) {
  if (hours <= 0 || header <= 0) return 0;
  return roundHalfUp(hours * header * loading, 2);
}

function splitShiftSegments(clockInISO, clockOutISO, settings, publicHoliday) {
  const start = new Date(clockInISO);
  const end = new Date(clockOutISO);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    return [];
  }
  const segments = [];
  let cursor = start;
  while (cursor < end) {
    const boundary = nextRateBoundary(cursor);
    const segEnd = boundary < end ? boundary : end;
    const type = publicHoliday ? "holiday" : dayType(cursor);
    const weekdayNight = publicHoliday ? false : isWeekdayNight(cursor);
    const hours = (segEnd.getTime() - cursor.getTime()) / 36e5;
    const loading = loadingFor(type, weekdayNight, settings || {});
    const header = headerForDate(settings, cursor);
    segments.push({
      start: new Date(cursor),
      end: new Date(segEnd),
      hours,
      dayType: type,
      isNight: weekdayNight,
      loading,
      header,
      amount: lineAmount(hours, header, loading),
    });
    cursor = segEnd;
  }
  return segments;
}

function emptyTally() {
  return {
    hours: 0,
    weekdayHours: 0,
    saturdayHours: 0,
    sundayHours: 0,
    holidayHours: 0,
    nightHours: 0,
    segments: [],
  };
}

function addSegmentToTally(tally, segment) {
  tally.hours += segment.hours;
  tally.segments.push(segment);
  if (segment.dayType === "holiday") tally.holidayHours += segment.hours;
  else if (segment.dayType === "saturday") tally.saturdayHours += segment.hours;
  else if (segment.dayType === "sunday") tally.sundayHours += segment.hours;
  else if (segment.isNight) tally.nightHours += segment.hours;
  else tally.weekdayHours += segment.hours;
}

function scale2YearForPayment(paymentDate) {
  const day = startOfLocalDay(paymentDate || new Date());
  return day >= FY2026_27_START ? "2026-27" : "2025-26";
}

function scale2BandsForPayment(paymentDate) {
  return scale2YearForPayment(paymentDate) === "2026-27" ? SCALE2_FY2026_27 : SCALE2_FY2025_26;
}

function weeklyEarningsX(fortnightlyGross) {
  const weekly = Number(fortnightlyGross) / 2;
  if (!Number.isFinite(weekly) || weekly <= 0) return 0.99;
  return Math.floor(weekly) + 0.99;
}

function roundToNearestDollarFiftyUp(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n);
}

function weeklyScale2Withholding(x, bands) {
  for (const band of bands) {
    if (x < band.lessThan) {
      if (band.withholdZero) return 0;
      return band.a * x - band.b;
    }
  }
  return 0;
}

function estimatePayg(gross, paymentDate) {
  const g = Number(gross) || 0;
  if (g <= 0) return 0;
  const x = weeklyEarningsX(g);
  const weeklyY = weeklyScale2Withholding(x, scale2BandsForPayment(paymentDate));
  const weeklyRounded = roundToNearestDollarFiftyUp(weeklyY);
  return weeklyRounded * 2;
}

function parsePaygOverride(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return roundWholeDollars(n);
}

function sumSegmentAmounts(segments) {
  let weekdayAmount = 0;
  let nightAmount = 0;
  let saturdayAmount = 0;
  let sundayAmount = 0;
  let holidayAmount = 0;
  for (const segment of segments || []) {
    if (segment.dayType === "holiday") holidayAmount += segment.amount;
    else if (segment.dayType === "saturday") saturdayAmount += segment.amount;
    else if (segment.dayType === "sunday") sundayAmount += segment.amount;
    else if (segment.isNight) nightAmount += segment.amount;
    else weekdayAmount += segment.amount;
  }
  return {
    weekdayAmount: roundMoney(weekdayAmount),
    nightAmount: roundMoney(nightAmount),
    saturdayAmount: roundMoney(saturdayAmount),
    sundayAmount: roundMoney(sundayAmount),
    holidayAmount: roundMoney(holidayAmount),
  };
}

function finalizePay(tally, settings, paygOverride, paymentDate) {
  const amounts = sumSegmentAmounts(tally && tally.segments);
  const weekdayAmount = amounts.weekdayAmount;
  const nightAmount = amounts.nightAmount;
  const saturdayAmount = amounts.saturdayAmount;
  const sundayAmount = amounts.sundayAmount;
  const holidayAmount = amounts.holidayAmount;
  const gross = roundMoney(weekdayAmount + nightAmount + saturdayAmount + sundayAmount + holidayAmount);
  const superPercent = parsePercent(settings && settings.superPercent) || 12;
  const superAmount = roundMoney(gross * (superPercent / 100));
  const paygScaleYear = scale2YearForPayment(paymentDate);
  const paygEstimated = estimatePayg(gross, paymentDate);
  const override = parsePaygOverride(paygOverride);
  const paygIsOverride = override !== null;
  const payg = paygIsOverride ? override : paygEstimated;
  const net = roundMoney(gross - payg);
  return {
    hours: roundHours(tally.hours),
    weekdayHours: roundHours(tally.weekdayHours),
    saturdayHours: roundHours(tally.saturdayHours),
    sundayHours: roundHours(tally.sundayHours),
    holidayHours: roundHours(tally.holidayHours),
    nightHours: roundHours(tally.nightHours),
    weekdayAmount,
    nightAmount,
    saturdayAmount,
    sundayAmount,
    holidayAmount,
    segments: tally.segments,
    gross,
    payg,
    paygEstimated,
    paygIsOverride,
    paygScaleYear,
    tax: payg,
    superAmount,
    net,
    amount: net,
  };
}

function tallyShifts(shifts, settings) {
  const tally = emptyTally();
  for (const shift of shifts || []) {
    if (!shift.clockIn || !shift.clockOut) continue;
    for (const segment of splitShiftSegments(shift.clockIn, shift.clockOut, settings, shift.publicHoliday)) {
      addSegmentToTally(tally, segment);
    }
  }
  return tally;
}

function calculateShiftPay(clockInISO, clockOutISO, settings, paygOverride, paymentDate, publicHoliday) {
  const tally = emptyTally();
  for (const segment of splitShiftSegments(clockInISO, clockOutISO, settings, publicHoliday)) {
    addSegmentToTally(tally, segment);
  }
  return finalizePay(tally, settings, paygOverride, paymentDate);
}

function calculateShiftsPay(shifts, settings, paygOverride, paymentDate) {
  return finalizePay(tallyShifts(shifts, settings), settings, paygOverride, paymentDate);
}

function completedShifts(shifts) {
  return (shifts || []).filter((shift) => shift.clockIn && shift.clockOut);
}

function hoursForShifts(shifts) {
  return roundHours(
    (shifts || []).reduce((sum, shift) => sum + shiftHours(shift.clockIn, shift.clockOut), 0)
  );
}

function findOpenShift(shifts) {
  return (shifts || []).find((shift) => shift.clockIn && !shift.clockOut) || null;
}

function liveHours(openShift, now = new Date()) {
  if (!openShift || !openShift.clockIn) return 0;
  return shiftHours(openShift.clockIn, now.toISOString());
}

function shiftsInRange(shifts, range) {
  return completedShifts(shifts).filter((shift) => {
    const t = new Date(shift.clockIn);
    return t >= range.start && t <= range.end;
  });
}

function paymentFor(payments, fortnightId) {
  return (payments || []).find((payment) => payment.fortnightId === fortnightId) || null;
}

function buildFortnight(range, shifts, settings, payments, paygOverrides, now = new Date()) {
  const inRange = shiftsInRange(shifts, range);
  const hours = hoursForShifts(inRange);
  const override = paygOverrides ? paygOverrides[range.id] : undefined;
  const payment = paymentFor(payments, range.id);
  const paymentDate = payment && payment.paidAt ? payment.paidAt : now;
  const pay = calculateShiftsPay(inRange, settings, override, paymentDate);
  return {
    id: range.id,
    start: range.start,
    end: range.end,
    shifts: inRange,
    hours,
    pay,
    paid: Boolean(payment),
    paidAt: payment ? payment.paidAt : null,
    paidAmount: payment ? roundMoney(payment.amount) : null,
    displayAmount: payment ? roundMoney(payment.amount) : pay.net,
  };
}

function listFortnights(shifts, settings, payments, now = new Date(), paygOverrides = {}) {
  const anchor = settings.fortnightAnchor;
  const seen = new Map();
  for (const shift of completedShifts(shifts)) {
    const range = getFortnightRange(shift.clockIn, anchor);
    if (!seen.has(range.id)) seen.set(range.id, range);
  }
  const current = getFortnightRange(now, anchor);
  if (!seen.has(current.id)) seen.set(current.id, current);
  return [...seen.values()]
    .sort((a, b) => b.start.getTime() - a.start.getTime())
    .map((range) => buildFortnight(range, shifts, settings, payments, paygOverrides, now));
}

function summarizeIncome(fortnights) {
  let earned = 0;
  let paid = 0;
  let owed = 0;
  for (const fortnight of fortnights || []) {
    earned += fortnight.displayAmount;
    if (fortnight.paid) paid += fortnight.paidAmount;
    else owed += fortnight.pay.net;
  }
  return {
    earned: roundMoney(earned),
    paid: roundMoney(paid),
    owed: roundMoney(owed),
  };
}

function financialYearStart(date) {
  const d = toDate(date);
  const year = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
  return new Date(year, 6, 1);
}

function ytdFromPaid(fortnights, now = new Date()) {
  const start = financialYearStart(now);
  const end = new Date(start.getFullYear() + 1, 6, 1);
  let gross = 0;
  let payg = 0;
  let superAmount = 0;
  let net = 0;
  for (const fortnight of fortnights || []) {
    if (!fortnight.paid || !fortnight.paidAt) continue;
    const paidAt = new Date(fortnight.paidAt);
    if (paidAt < start || paidAt >= end) continue;
    gross += fortnight.pay.gross;
    payg += fortnight.pay.payg;
    superAmount += fortnight.pay.superAmount;
    net += fortnight.paidAmount != null ? fortnight.paidAmount : fortnight.pay.net;
  }
  return {
    start,
    end,
    gross: roundMoney(gross),
    payg: roundMoney(payg),
    superAmount: roundMoney(superAmount),
    net: roundMoney(net),
  };
}

function defaultShiftTimes(shifts, now = new Date()) {
  const done = completedShifts(shifts).sort(
    (a, b) => new Date(b.clockOut).getTime() - new Date(a.clockOut).getTime()
  );
  const last = done[0];
  const date = startOfLocalDay(now);
  const clockIn = new Date(date);
  const clockOut = new Date(date);
  if (!last) {
    clockIn.setHours(9, 0, 0, 0);
    clockOut.setHours(17, 0, 0, 0);
    return { clockIn, clockOut };
  }
  const lastIn = new Date(last.clockIn);
  const lastOut = new Date(last.clockOut);
  clockIn.setHours(lastIn.getHours(), lastIn.getMinutes(), 0, 0);
  clockOut.setHours(lastOut.getHours(), lastOut.getMinutes(), 0, 0);
  if (lastOut.getDate() !== lastIn.getDate() || clockOut <= clockIn) {
    clockOut.setDate(clockOut.getDate() + 1);
  }
  return { clockIn, clockOut };
}

function groupShiftsByDay(shifts) {
  const groups = [];
  const map = new Map();
  const sorted = [...(shifts || [])].sort(
    (a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
  );
  for (const shift of sorted) {
    const key = formatISODate(shift.clockIn);
    if (!map.has(key)) {
      const group = { key, date: startOfLocalDay(shift.clockIn), shifts: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).shifts.push(shift);
  }
  return groups;
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultStore(now = new Date()) {
  return {
    settings: {
      headerRate: DEFAULT_HEADER_RATE,
      headerRateFrom: DEFAULT_HEADER_RATE_FROM,
      previousHeaderRate: DEFAULT_PREVIOUS_HEADER_RATE,
      saturdayLoading: "125",
      sundayLoading: "150",
      publicHolidayLoading: "250",
      nightLoading: "110",
      superPercent: "12",
      currency: "AUD",
      fortnightAnchor: defaultAnchorISO(now),
    },
    shifts: [],
    payments: [],
    paygOverrides: {},
  };
}

module.exports = {
  DEFAULT_HEADER_RATE,
  DEFAULT_HEADER_RATE_FROM,
  DEFAULT_PREVIOUS_HEADER_RATE,
  NIGHT_HOUR,
  SCALE2_FY2025_26,
  SCALE2_FY2026_27,
  addLocalDays,
  buildFortnight,
  calculateShiftPay,
  calculateShiftsPay,
  completedShifts,
  createDefaultStore,
  createId,
  dayType,
  defaultAnchorISO,
  defaultShiftTimes,
  estimatePayg,
  financialYearStart,
  scale2YearForPayment,
  findOpenShift,
  formatISODate,
  getFortnightRange,
  getFortnightStart,
  groupShiftsByDay,
  hasPayRates,
  headerForDate,
  hoursForShifts,
  isWeekdayNight,
  lineAmount,
  listFortnights,
  liveHours,
  loadingFor,
  mondayOnOrBefore,
  nextRateBoundary,
  parseISODate,
  parseLoading,
  parsePaygOverride,
  parsePercent,
  parseRate,
  roundHalfUp,
  roundHours,
  roundMoney,
  roundToNearestDollarFiftyUp,
  shiftHours,
  shiftsInRange,
  splitShiftSegments,
  startOfLocalDay,
  summarizeIncome,
  weeklyEarningsX,
  ytdFromPaid,
};
