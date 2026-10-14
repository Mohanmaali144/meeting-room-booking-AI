export function getDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

export function getDayStart(date: Date) {
  return new Date(getDay(date) + "T00:00:00Z");
}

export function getNextDayStart(date: Date) {
  const dayStart = getDayStart(date);
  return new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
}
