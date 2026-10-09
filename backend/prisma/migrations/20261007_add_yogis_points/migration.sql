-- AlterTable orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_type" VARCHAR(30);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "yogis_points_used" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "yogis_points_discount" DECIMAL(18,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "points_awarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable yogis_points_config
CREATE TABLE IF NOT EXISTS "yogis_points_config" (
    "id" SERIAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "points_per_order" INTEGER NOT NULL DEFAULT 10,
    "conversion_points" INTEGER NOT NULL DEFAULT 100,
    "conversion_rupees" DECIMAL(18,2) NOT NULL DEFAULT 100.00,
    "minimum_redeemable_points" INTEGER NOT NULL DEFAULT 100,
    "minimum_cart_value" DECIMAL(18,2) NOT NULL DEFAULT 500.00,
    "expiry_enabled" BOOLEAN NOT NULL DEFAULT true,
    "expiry_value" INTEGER NOT NULL DEFAULT 1,
    "expiry_unit" VARCHAR(20) NOT NULL DEFAULT 'years',
    "welcome_bonus_enabled" BOOLEAN NOT NULL DEFAULT false,
    "welcome_bonus_points" INTEGER NOT NULL DEFAULT 100,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yogis_points_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable yogis_points_accounts
CREATE TABLE IF NOT EXISTS "yogis_points_accounts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yogis_points_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "yogis_points_accounts_user_id_key" UNIQUE ("user_id"),
    CONSTRAINT "yogis_points_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable yogis_points_transactions
CREATE TABLE IF NOT EXISTS "yogis_points_transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "points" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "order_id" INTEGER,
    "description" TEXT,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yogis_points_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "yogis_points_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "yogis_points_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable yogis_points_lots
CREATE TABLE IF NOT EXISTS "yogis_points_lots" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_id" INTEGER NOT NULL,
    "original_points" INTEGER NOT NULL,
    "remaining_points" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yogis_points_lots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "yogis_points_lots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "yogis_points_lots_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "yogis_points_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS "yogis_points_transactions_user_id_created_at_idx" ON "yogis_points_transactions"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "yogis_points_lots_user_id_expires_at_idx" ON "yogis_points_lots"("user_id", "expires_at");
