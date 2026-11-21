/** Tiny client-side validators shared by the auth forms. Each returns an error message or "". */
export const required = (label: string) => (v: string) => (v.trim() ? "" : `${label} is required.`);

export const email = (v: string) => {
  if (!v.trim()) return "Email is required.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address.";
};

export const password = (v: string) => {
  if (!v) return "Password is required.";
  return v.length >= 8 ? "" : "Use at least 8 characters.";
};

export type FieldErrors<T extends string> = Partial<Record<T, string>>;