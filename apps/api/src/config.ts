import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function loadLocalEnvironment() {
  const localEnv = fileURLToPath(new URL("../.env", import.meta.url));
  if (existsSync(localEnv)) process.loadEnvFile(localEnv);
}

export function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required; copy apps/api/.env.example to apps/api/.env",
    );
  }
  return databaseUrl;
}
