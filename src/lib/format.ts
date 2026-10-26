export function formatMoney(
  value: number,
  fractionDigits = 0,
  withSymbol = true,
): string {
  if (!Number.isFinite(value)) return withSymbol ? "¥0" : "0";
  const formatted = new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(value));
  const sign = value < 0 ? "-" : "";
  return `${sign}${withSymbol ? "¥" : ""}${formatted}`;
}

export function formatWan(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "0";
  return `${new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 10000)}万`;
}

export function formatCompactMoney(value: number): string {
  if (Math.abs(value) >= 10000) return formatWan(value);
  return formatMoney(value);
}

export function formatNumber(
  value: number,
  fractionDigits = 0,
): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatMonths(months: number): string {
  const rounded = Math.max(0, Math.round(months));
  if (rounded === 0) return "0个月";
  const years = Math.floor(rounded / 12);
  const rest = rounded % 12;
  if (years === 0) return `${rest}个月`;
  if (rest === 0) return `${years}年`;
  return `${years}年${rest}个月`;
}

export function formatPeriod(period: number): string {
  return `第 ${period} 期`;
}

export function formatPercent(value: number, digits = 2): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedMoney(value: number): string {
  return `${value >= 0 ? "+" : "-"}${formatMoney(Math.abs(value))}`;
}
