export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addMonthsClamped(base: Date, months: number): Date {
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(base.getDate(), lastDay));
  return target;
}

export function getDefaultNextPaymentDate(): string {
  return toDateInputValue(addMonthsClamped(new Date(), 1));
}

export function getPaymentDate(
  nextPaymentDate: string,
  period: number,
): Date | null {
  const base = parseDateInput(nextPaymentDate);
  if (!base) return null;
  return addMonthsClamped(base, Math.max(1, period) - 1);
}

export function formatChineseDate(
  date: Date | null,
  fallback = "—",
): string {
  if (!date) return fallback;
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export function formatShortDate(date: Date | null, fallback = "—"): string {
  if (!date) return fallback;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}.${String(date.getDate()).padStart(2, "0")}`;
}

export function formatYearMonth(date: Date | null, fallback = "—"): string {
  if (!date) return fallback;
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

export function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const today = new Date();
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

export function todayLabel(): string {
  return formatChineseDate(new Date());
}
