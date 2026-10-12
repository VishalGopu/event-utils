import {
  Controller,
  Get,
  Module,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";

@Controller()
class HealthController {
  @Get("health")
  health() {
    return { status: "ok" };
  }
}

@Controller()
class ReadinessController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("ready")
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: "ok" };
    } catch {
      throw new ServiceUnavailableException("Database unavailable");
    }
  }
}

@Module({
  controllers: [HealthController, ReadinessController],
  providers: [PrismaService],
})
export class AppModule {}
