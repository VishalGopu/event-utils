import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.js";
import { loadLocalEnvironment } from "./config.js";

loadLocalEnvironment();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 4000), "0.0.0.0");
}

void bootstrap();
