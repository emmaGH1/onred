// In-memory event log for the repair loop. No persistence on purpose —
// the demo runs one loop at a time in a single server process.

export type EventPhase =
  | "verifying"
  | "fail_detected"
  | "diagnosing"
  | "patch_applied"
  | "re_verifying"
  | "green"
  | "red"
  | "info"
  | "error";

export interface LogEvent {
  id: number;
  phase: EventPhase;
  message: string;
  ts: number; // epoch ms
  diff?: string;
  detail?: string;
}

const events: LogEvent[] = [];
let nextId = 1;
let job: "idle" | "running" = "idle";
// Most recent verify report, refreshed by the repair loop so the dashboard
// can repaint the requirement pills without a second slow verify call.
let report: unknown = null;

export function addEvent(
  phase: EventPhase,
  message: string,
  extra?: { diff?: string; detail?: string }
): void {
  events.push({ id: nextId++, phase, message, ts: Date.now(), ...extra });
  if (events.length > 400) events.splice(0, events.length - 400);
}

export function getEvents(): LogEvent[] {
  return [...events];
}

export function clearEvents(): void {
  events.length = 0;
  nextId = 1;
}

export function setJob(state: "idle" | "running"): void {
  job = state;
}

export function getJob(): "idle" | "running" {
  return job;
}

export function setReport(r: unknown): void {
  report = r;
}

export function getReport(): unknown {
  return report;
}
