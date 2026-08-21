import { readFile } from "node:fs/promises";
import { SPEC_PATH } from "@/lib/kane";
import Dashboard from "./dashboard";

export default async function Page() {
  const spec = await readFile(SPEC_PATH, "utf8");
  return <Dashboard initialSpec={spec} />;
}
