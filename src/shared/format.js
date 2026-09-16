export function formatMoney(amount, currency = "AUD") {
  const value = Number(amount) || 0;
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatHours(hours) {
  const totalMinutes = Math.round((Number(hours) || 0) * 60);
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m}m`;
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}

export function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(value, options = {}) {
  return new Date(value).toLocaleDateString("en-AU", {
    weekday: options.weekday || "short",
    day: "numeric",
    month: "short",
    ...(options.year ? { year: "numeric" } : {}),
  });
}

export function formatRange(start, end) {
  const startText = new Date(start).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
  const endText = new Date(end).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startText} to ${endText}`;
}

export function formatDurationMs(ms) {
  const totalSeconds = Math.max(0, Math.floor((Number(ms) || 0) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatClockRange(clockIn, clockOut) {
  const start = formatTime(clockIn);
  if (!clockOut) return `${start} to now`;
  return `${start} to ${formatTime(clockOut)}`;
}
