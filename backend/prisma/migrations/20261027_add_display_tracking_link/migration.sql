-- AlterTable orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "display_tracking_link" VARCHAR(500);
