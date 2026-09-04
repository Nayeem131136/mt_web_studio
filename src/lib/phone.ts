/**
 * Normalizes a Bangladeshi phone/WhatsApp number to international format.
 * Accepts input like "01740527078", "1740527078", "+8801740527078", "880 1740-527078"
 * and always returns "+8801740527078" (or null if it doesn't look like a valid BD mobile number).
 */
export function normalizeBDPhone(input: string): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, "");

  let national: string;
  if (digits.startsWith("880")) {
    national = digits.slice(3);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  // BD mobile numbers: 10 digits after the leading 0 (e.g. 1740527078)
  if (national.length !== 10 || !national.startsWith("1")) {
    return null;
  }

  return `+880${national}`;
}

/** Formats a normalized +880 number for display, e.g. "+880 1740-527078" */
export function displayBDPhone(input: string): string {
  const normalized = normalizeBDPhone(input) || input;
  const match = normalized.match(/^\+880(\d{4})(\d{6})$/);
  if (!match) return normalized;
  return `+880 ${match[1]}-${match[2]}`;
}

/** Returns the digits-only international format wa.me expects, e.g. "8801740527078" */
export function toWaMeNumber(input: string): string | null {
  const normalized = normalizeBDPhone(input);
  return normalized ? normalized.replace("+", "") : null;
}

/** Builds a safe wa.me chat link, or null if the number is invalid */
export function buildWaMeLink(input: string, message?: string): string | null {
  const number = toWaMeNumber(input);
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
