/**
 * Formatting helpers. Data stores numbers and ISO dates; the edge formats them.
 */

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string, locale = 'en-IN'): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  let formatter = FORMATTERS.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    FORMATTERS.set(key, formatter);
  }
  return formatter;
}

/** Minor units (paise / cents) → display string, e.g. 450000 → "₹4,500". */
export function formatCurrency(amountMinor: number, currency: string): string {
  return currencyFormatter(currency).format(Math.round(amountMinor / 100));
}

/** ISO date → "March 2025". */
export function formatMonthYear(iso: string, locale = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** 4.8571 → "4.86"; whole numbers keep one decimal, matching rating displays. */
export function formatRating(value: number): string {
  return value.toFixed(2).replace(/\.?0+$/, '') || '0';
}
