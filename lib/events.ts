// Event log for the repair loop. Backed by a JSON file in the temp dir so it
// survives a Turbopack module re-instantiation mid-loop (the repair agent edits
// source files, which can rebuild the route handler and wipe in-memory state).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

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

const STATE_FILE = path.join(os.tmpdir(), "onred-repair-state.json");

interface State {
  events: LogEvent[];
  nextId: number;
  job: "idle" | "running";
  report: unknown;
}

function readState(): State {
  try {
    if (existsSync(STATE_FILE)) {
      const raw = JSON.parse(readFileSync(STATE_FILE, "utf8"));
      return {
        events: Array.isArray(raw.events) ? raw.events : [],
        nextId: typeof raw.nextId === "number" ? raw.nextId : 1,
        job: raw.job === "running" ? "running" : "idle",
        report: raw.report ?? null,
      };
    }
  } catch {
    // corrupt or unreadable — start fresh
  }
  return { events: [], nextId: 1, job: "idle", report: null };
}

function writeState(state: State): void {
  try {
    writeFileSync(STATE_FILE, JSON.stringify(state), "utf8");
  } catch {
    // best-effort: the log is cosmetic to the loop, never a hard failure
  }
}

export function addEvent(
  phase: EventPhase,
  message: string,
  extra?: { diff?: string; detail?: string }
): void {
  const state = readState();
  state.events.push({ id: state.nextId++, phase, message, ts: Date.now(), ...extra });
  if (state.events.length > 400) state.events.splice(0, state.events.length - 400);
  writeState(state);
}

export function getEvents(): LogEvent[] {
  return readState().events;
}

export function clearEvents(): void {
  const state = readState();
  state.events = [];
  state.nextId = 1;
  writeState(state);
}

export function setJob(job: "idle" | "running"): void {
  const state = readState();
  state.job = job;
  writeState(state);
}

export function getJob(): "idle" | "running" {
  return readState().job;
}

export function setReport(report: unknown): void {
  const state = readState();
  state.report = report;
  writeState(state);
}

export function getReport(): unknown {
  return readState().report;
}
