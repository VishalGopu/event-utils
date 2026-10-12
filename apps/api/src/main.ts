import "reflect-metadata";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.js";

const localEnv = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(localEnv)) process.loadEnvFile(localEnv);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0");
}

void bootstrap();
