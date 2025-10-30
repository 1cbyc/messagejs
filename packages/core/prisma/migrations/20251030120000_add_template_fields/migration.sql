-- AlterTable
ALTER TABLE "Template" ADD COLUMN "connectorType" "ServiceType" NOT NULL DEFAULT 'WHATSAPP';
ALTER TABLE "Template" ADD COLUMN "variables" TEXT;

