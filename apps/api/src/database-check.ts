import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
try {
  const record = await prisma.foundationProbe.create({ data: {} });
  try {
    const found = await prisma.foundationProbe.findUnique({
      where: { id: record.id },
    });
    if (!found) throw new Error("Prisma could not read its inserted probe");
    console.log("Prisma migration and create/read/delete check passed");
  } finally {
    await prisma.foundationProbe.delete({ where: { id: record.id } });
  }
} finally {
  await prisma.$disconnect();
}
