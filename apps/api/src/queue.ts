import { PgBoss } from "pg-boss";
import { requireDatabaseUrl } from "./config.js";

export const FOUNDATION_QUEUE = "phase0-compatibility";

export function createQueue() {
  const boss = new PgBoss({
    connectionString: requireDatabaseUrl(),
    schema: "pgboss",
  });
  boss.on("error", (error) => console.error("queue error", error));
  return boss;
}

export async function ensureFoundationQueue(boss: PgBoss) {
  await boss.createQueue(FOUNDATION_QUEUE, {
    retryLimit: 1,
    retryDelay: 0,
    deleteAfterSeconds: 60,
  });
}
