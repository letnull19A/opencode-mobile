// Sentry removed — stub so existing imports keep working.
// The user requested complete removal; analytics (PostHog) is still
// controlled via telemetry.ts but no longer triggers Sentry init.

export function initSentry(): void {}
export async function disableSentry(): Promise<void> {}
export function sentryEnabled(): boolean {
  return false
}
export type Breadcrumb = {
  category: string
  message: string
  level?: "debug" | "info" | "warning" | "error"
  data?: Record<string, unknown>
}
export function addBreadcrumb(_crumb: Breadcrumb): void {}
export function captureException(
  _err: unknown,
  _context?: { tags?: Record<string, string>; extra?: Record<string, unknown>; level?: string },
): void {}
export function captureDiagnostic(_report: unknown): void {}
export function applyNoiseGate<T>(event: T): T | null {
  return event
}
export const wrap = <T>(component: T): T => component
export function scrubUrl(url: string): string {
  return url
}
