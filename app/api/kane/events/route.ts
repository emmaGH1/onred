import { getEvents, getJob, getReport } from "@/lib/events";

export async function GET() {
  return Response.json({
    ok: true,
    job: getJob(),
    events: getEvents(),
    report: getReport(),
  });
}

export const runtime = "nodejs";
