const test = require("node:test");
const assert = require("node:assert/strict");
const domain = require("../src/services/domain");

const SETTINGS = {
  headerRate: "34.00",
  saturdayLoading: "125",
  sundayLoading: "150",
  nightLoading: "110",
  superPercent: "12",
};

test("line amount is round(hours × header × loading, 2), not a rounded displayed rate", () => {
  const header = 31.18;
  const hours = 1.6;
  const loading = 1.25;
  assert.equal(domain.lineAmount(hours, header, loading), 62.36);
  const displayedRate = domain.roundHalfUp(header * loading, 2);
  assert.equal(displayedRate, 38.98);
  assert.notEqual(domain.roundHalfUp(hours * displayedRate, 2), 62.36);
});

test("Sat 8pm–11pm stays Saturday 125% with no night split", () => {
  const start = new Date(2026, 8, 12, 20, 0, 0);
  const end = new Date(2026, 8, 12, 23, 0, 0);
  const pay = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS);
  assert.equal(pay.hours, 3);
  assert.equal(pay.saturdayHours, 3);
  assert.equal(pay.nightHours, 0);
  assert.equal(pay.gross, 127.5);
  assert.equal(pay.superAmount, 15.3);
  assert.equal(pay.net, pay.gross - pay.payg);
  assert.equal(pay.segments.length, 1);
  assert.equal(pay.segments[0].dayType, "saturday");
  assert.equal(pay.segments[0].isNight, false);
});

test("weekday 8pm–11pm splits 100% then 110% after 10pm", () => {
  const start = new Date(2026, 8, 14, 20, 0, 0);
  const end = new Date(2026, 8, 14, 23, 0, 0);
  const pay = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS);
  assert.equal(pay.weekdayHours, 2);
  assert.equal(pay.nightHours, 1);
  assert.equal(pay.saturdayHours, 0);
  assert.equal(pay.gross, 105.4);
});

test("overnight Sat 10pm–Sun 2am uses 125% then 150%, never weekday night", () => {
  const start = new Date(2026, 8, 12, 22, 0, 0);
  const end = new Date(2026, 8, 13, 2, 0, 0);
  const pay = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS);
  assert.equal(pay.saturdayHours, 2);
  assert.equal(pay.sundayHours, 2);
  assert.equal(pay.nightHours, 0);
  assert.equal(pay.gross, 187);
});

test("super is 12% of gross and is not taken from net", () => {
  const start = new Date(2026, 8, 14, 9, 0, 0);
  const end = new Date(2026, 8, 14, 17, 0, 0);
  const pay = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS);
  assert.equal(pay.gross, 272);
  assert.equal(pay.superAmount, 32.64);
  assert.equal(pay.net, pay.gross - pay.payg);
  assert.notEqual(pay.net, pay.gross - pay.payg - pay.superAmount);
});

test("PAYG uses ATO Scale 2 and matches all 7 slip fixtures", () => {
  const fy25 = new Date(2026, 5, 20);
  const fy26 = new Date(2026, 6, 5);
  assert.equal(domain.scale2YearForPayment(fy25), "2025-26");
  assert.equal(domain.scale2YearForPayment(fy26), "2026-27");
  assert.equal(domain.estimatePayg(1146.18, fy25), 82);
  assert.equal(domain.estimatePayg(1635.17, fy25), 180);
  assert.equal(domain.estimatePayg(1313.78, fy26), 112);
  assert.equal(domain.estimatePayg(1858.71, fy26), 230);
  assert.equal(domain.estimatePayg(1984.29, fy26), 270);
  assert.equal(domain.estimatePayg(2100.11, fy26), 308);
  assert.equal(domain.estimatePayg(2193.1, fy26), 338);
  assert.equal(domain.estimatePayg(0, fy26), 0);
});

test("PAYG fortnightly method: ignore weekly cents, add 0.99, round 50c up, then × 2", () => {
  assert.equal(domain.weeklyEarningsX(1146.18), 573.99);
  const fy25 = new Date(2026, 5, 20);
  const y = 0.26 * 573.99 - 107.8462;
  assert.equal(domain.roundToNearestDollarFiftyUp(y), 41);
  assert.equal(domain.estimatePayg(1146.18, fy25), 82);
});

test("PAYG override replaces the estimate; super still ignored for net", () => {
  const start = new Date(2026, 8, 14, 9, 0, 0);
  const end = new Date(2026, 8, 14, 17, 0, 0);
  const pay = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS, 80);
  assert.equal(pay.paygIsOverride, true);
  assert.equal(pay.payg, 80);
  assert.equal(pay.net, 192);
  assert.equal(pay.superAmount, 32.64);
});

test("listFortnights nets Gross − PAYG and paid vs owed is a payment mark", () => {
  const settings = { ...SETTINGS, fortnightAnchor: "2026-09-07" };
  const mondayIn = new Date(2026, 8, 14, 9, 0, 0);
  const mondayOut = new Date(2026, 8, 14, 17, 0, 0);
  const shifts = [{ id: "a", clockIn: mondayIn.toISOString(), clockOut: mondayOut.toISOString() }];
  const unpaid = domain.listFortnights(shifts, settings, [], new Date(2026, 8, 14));
  const current = unpaid.find((row) => row.id === "2026-09-07");
  assert.equal(current.paid, false);
  assert.equal(current.pay.gross, 272);
  assert.equal(current.pay.net, 272 - current.pay.payg);
  const paid = domain.listFortnights(
    shifts,
    settings,
    [{ fortnightId: "2026-09-07", amount: current.pay.net, paidAt: "2026-11-20T00:00:00.000Z" }],
    new Date(2026, 8, 14)
  );
  assert.equal(paid.find((row) => row.id === "2026-09-07").paid, true);
});

  test("YTD follows payment date around 1 July, not the work period", () => {
  const fortnights = [
    {
      paid: true,
      paidAt: "2026-07-05T00:00:00.000Z",
      paidAmount: 1000,
      pay: { gross: 1146.18, payg: 82, superAmount: 137.54, net: 1064.18 },
    },
    {
      paid: true,
      paidAt: "2026-06-20T00:00:00.000Z",
      paidAmount: 900,
      pay: { gross: 1000, payg: 70, superAmount: 120, net: 930 },
    },
  ];
  const ytd = domain.ytdFromPaid(fortnights, new Date(2026, 8, 14));
  assert.equal(ytd.gross, 1146.18);
  assert.equal(ytd.net, 1000);
});

const RATE_HISTORY = {
  ...SETTINGS,
  headerRate: "34.00",
  headerRateFrom: "2026-06-29",
  previousHeaderRate: "31.18",
};

test("shifts before the raise use $31.18 and later shifts use $34.00", () => {
  const juneIn = new Date(2026, 5, 20, 9, 0, 0);
  const juneOut = new Date(2026, 5, 20, 17, 0, 0);
  const junePay = domain.calculateShiftPay(juneIn.toISOString(), juneOut.toISOString(), RATE_HISTORY);
  assert.equal(domain.headerForDate(RATE_HISTORY, juneIn), 31.18);
  assert.equal(junePay.saturdayHours, 8);
  assert.equal(junePay.saturdayAmount, domain.lineAmount(8, 31.18, 1.25));
  assert.equal(junePay.gross, domain.lineAmount(8, 31.18, 1.25));

  const julyIn = new Date(2026, 6, 5, 9, 0, 0);
  const julyOut = new Date(2026, 6, 5, 17, 0, 0);
  const julyPay = domain.calculateShiftPay(julyIn.toISOString(), julyOut.toISOString(), RATE_HISTORY);
  assert.equal(domain.headerForDate(RATE_HISTORY, julyIn), 34);
  assert.equal(julyPay.sundayHours, 8);
  assert.equal(julyPay.sundayAmount, domain.lineAmount(8, 34, 1.5));
  assert.equal(julyPay.gross, domain.lineAmount(8, 34, 1.5));
});

test("Saturday amount uses whichever hourly pay applied that day × 1.25", () => {
  const oldSatIn = new Date(2026, 5, 20, 18, 0, 0);
  const oldSatOut = new Date(2026, 5, 20, 19, 0, 0);
  const oldSat = domain.calculateShiftPay(oldSatIn.toISOString(), oldSatOut.toISOString(), RATE_HISTORY);
  assert.equal(oldSat.saturdayAmount, domain.lineAmount(1, 31.18, 1.25));

  const newSatIn = new Date(2026, 6, 4, 18, 0, 0);
  const newSatOut = new Date(2026, 6, 4, 19, 0, 0);
  const newSat = domain.calculateShiftPay(newSatIn.toISOString(), newSatOut.toISOString(), RATE_HISTORY);
  assert.equal(newSat.saturdayAmount, domain.lineAmount(1, 34, 1.25));
  assert.equal(newSat.saturdayAmount, 42.5);
});

test("the raise applies from 29 June 2026, including the whole new fortnight", () => {
  assert.equal(domain.headerForDate(RATE_HISTORY, new Date(2026, 5, 28, 22, 0, 0)), 31.18);
  assert.equal(domain.headerForDate(RATE_HISTORY, new Date(2026, 5, 29, 0, 0, 0)), 34);
  const firstNewDay = domain.calculateShiftPay(
    new Date(2026, 5, 29, 9, 0, 0).toISOString(),
    new Date(2026, 5, 29, 17, 0, 0).toISOString(),
    RATE_HISTORY
  );
  assert.equal(firstNewDay.weekdayAmount, 272);
});

test("a public holiday uses 250% for the whole shift instead of the usual day rate", () => {
  const start = new Date(2026, 8, 14, 9, 0, 0);
  const end = new Date(2026, 8, 14, 17, 0, 0);
  const usual = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS);
  const holiday = domain.calculateShiftPay(start.toISOString(), end.toISOString(), SETTINGS, null, null, true);
  assert.equal(usual.gross, 272);
  assert.equal(usual.holidayHours, 0);
  assert.equal(holiday.holidayHours, 8);
  assert.equal(holiday.weekdayHours, 0);
  assert.equal(holiday.nightHours, 0);
  assert.equal(holiday.gross, 680);
  assert.equal(holiday.superAmount, 81.6);
  const fromShift = domain.calculateShiftsPay(
    [{ clockIn: start.toISOString(), clockOut: end.toISOString(), publicHoliday: true }],
    SETTINGS
  );
  assert.equal(fromShift.gross, 680);
});

test("defaultShiftTimes copies the last completed shift onto today", () => {
  const now = new Date(2026, 8, 14, 12, 0, 0);
  const lastIn = new Date(2026, 8, 10, 8, 30, 0);
  const lastOut = new Date(2026, 8, 10, 16, 45, 0);
  const times = domain.defaultShiftTimes(
    [{ clockIn: lastIn.toISOString(), clockOut: lastOut.toISOString() }],
    now
  );
  assert.equal(times.clockIn.getHours(), 8);
  assert.equal(domain.formatISODate(times.clockIn), "2026-09-14");
});
