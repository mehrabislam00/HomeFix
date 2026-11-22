/**
 * Contract between the auth forms and your existing auth layer.
 * Pass an `onSubmit` that calls your real API / server action; the forms
 * handle validation, pending state, error display and redirects.
 */
export type AuthResult = { ok: true } | { ok: false; error: string };

export type LoginValues = {
  email: string;
  password: string;
  rememberMe?: boolean;
};
export type RegisterValues = {
  role: "customer" | "technician";
  name: string;
  email: string;
  password: string;
};

export const NOT_CONNECTED: AuthResult = {
  ok: false,
  error: "Authentication isn't connected yet. Provide an onSubmit handler to this form.",
};