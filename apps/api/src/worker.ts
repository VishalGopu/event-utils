import { loadLocalEnvironment } from "./config.js";
import {
  createQueue,
  ensureFoundationQueue,
  FOUNDATION_QUEUE,
} from "./queue.js";

loadLocalEnvironment();

const boss = createQueue();
let stopping = false;

async function stop(signal: string) {
  if (stopping) return;
  stopping = true;
  console.log(`worker received ${signal}; finishing active work`);
  await boss.stop({ graceful: true, timeout: 10_000 });
  console.log("worker stopped");
}

process.once("SIGINT", () => void stop("SIGINT"));
process.once("SIGTERM", () => void stop("SIGTERM"));

await boss.start();
await ensureFoundationQueue(boss);
await boss.work<{ message?: string }>(
  FOUNDATION_QUEUE,
  { pollingIntervalSeconds: 1 },
  async ([job]) => {
    console.log("processed foundation job", {
      id: job.id,
      message: job.data.message,
      retryCount: job.retryCount,
    });
  },
);
console.log(`worker listening on ${FOUNDATION_QUEUE}`);
