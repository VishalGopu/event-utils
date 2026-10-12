-- CreateTable
CREATE TABLE "foundation_probe" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foundation_probe_pkey" PRIMARY KEY ("id")
);
