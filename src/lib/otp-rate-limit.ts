/**
 * Basic in-memory brute-force protection for OTP verification.
 *
 * Tracks failed attempts per key (the user id) inside a sliding window and
 * locks further attempts for a cool-down once the threshold is reached.
 *
 * Scope/limits: this is intentionally lightweight. State lives in the process
 * memory of a single instance and resets on restart, so it is a best-effort
 * speed bump rather than a distributed limiter. Supabase additionally enforces
 * OTP expiry and single-use semantics server-side, so even without this the
 * codes cannot be replayed; this guard exists to blunt rapid guessing.
 * For multi-instance deployments, back this with Redis or a DB table.
 */

const MAX_ATTEMPTS = 5; // failures allowed within the window before lock-out
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOCK_MS = 15 * 60 * 1000; // lock duration once threshold hit

type AttemptRecord = {
  count: number;
  windowStart: number;
  lockedUntil: number;
};

const attempts = new Map<string, AttemptRecord>();

function now() {
  return Date.now();
}

/**
 * Call before attempting verification. When locked, returns the remaining
 * cool-down so the caller can surface a Retry-After style message.
 */
export function checkOtpRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const record = attempts.get(key);
  if (!record) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const current = now();

  if (record.lockedUntil > current) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - current) / 1000) };
  }

  // Window expired -> forget old failures.
  if (current - record.windowStart > WINDOW_MS) {
    attempts.delete(key);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Record a failed verification. Returns the (possibly new) lock state. */
export function recordOtpFailure(key: string): { locked: boolean; retryAfterSeconds: number } {
  const current = now();
  const record = attempts.get(key);

  if (!record || current - record.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: current, lockedUntil: 0 });
    return { locked: false, retryAfterSeconds: 0 };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = current + LOCK_MS;
    return { locked: true, retryAfterSeconds: Math.ceil(LOCK_MS / 1000) };
  }

  return { locked: false, retryAfterSeconds: 0 };
}

/** Clear all recorded attempts for a key after a successful verification. */
export function resetOtpAttempts(key: string): void {
  attempts.delete(key);
}
