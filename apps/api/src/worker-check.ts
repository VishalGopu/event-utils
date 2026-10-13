import assert from "node:assert/strict";
import { loadLocalEnvironment } from "./config.js";
import {
  createQueue,
  ensureFoundationQueue,
  FOUNDATION_QUEUE,
} from "./queue.js";

loadLocalEnvironment();

const boss = createQueue();
let stopped = false;

try {
  await boss.start();
  await ensureFoundationQueue(boss);

  const jobId = await boss.send(
    FOUNDATION_QUEUE,
    { check: true },
    { retryLimit: 1, retryDelay: 0 },
  );
  assert.ok(jobId, "queue did not return a job id");

  const [firstAttempt] = await boss.fetch<{ check: boolean }>(FOUNDATION_QUEUE);
  assert.equal(
    firstAttempt?.id,
    jobId,
    "worker did not claim the enqueued job",
  );
  assert.equal(
    firstAttempt.retryCount,
    0,
    "first claim had an unexpected retry count",
  );
  await boss.fail(FOUNDATION_QUEUE, firstAttempt, {
    message: "intentional compatibility-check failure",
  });

  const [secondAttempt] = await boss.fetch<{ check: boolean }>(
    FOUNDATION_QUEUE,
  );
  assert.equal(
    secondAttempt?.id,
    jobId,
    "failed job was not made available for retry",
  );
  assert.equal(secondAttempt.retryCount, 1, "retry count was not incremented");
  await boss.complete(FOUNDATION_QUEUE, secondAttempt, { checked: true });

  const completed = await boss.getJobById<{ check: boolean }>(
    FOUNDATION_QUEUE,
    jobId,
  );
  assert.equal(completed?.state, "completed", "retried job did not complete");

  await boss.stop({ graceful: true, timeout: 10_000 });
  stopped = true;
  console.log(
    "Queue enqueue, claim, retry, completion, and graceful shutdown passed",
  );
} finally {
  if (!stopped) await boss.stop({ graceful: true, timeout: 10_000 });
}
