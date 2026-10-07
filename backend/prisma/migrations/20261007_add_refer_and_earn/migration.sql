-- AlterTable yogis_points_config
ALTER TABLE "yogis_points_config" ADD COLUMN IF NOT EXISTS "referral_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "yogis_points_config" ADD COLUMN IF NOT EXISTS "referrer_reward_points" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "yogis_points_config" ADD COLUMN IF NOT EXISTS "referred_reward_points" INTEGER NOT NULL DEFAULT 50;

-- AlterTable users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_key" ON "users"("referral_code");

-- AlterTable yogis_points_transactions type column length
ALTER TABLE "yogis_points_transactions" ALTER COLUMN "type" TYPE VARCHAR(50);

-- CreateTable referrals
CREATE TABLE IF NOT EXISTS "referrals" (
    "id" SERIAL NOT NULL,
    "referrer_user_id" INTEGER NOT NULL,
    "referred_user_id" INTEGER NOT NULL,
    "referral_code" VARCHAR(50) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'REWARDED',
    "referrer_reward_points" INTEGER NOT NULL DEFAULT 0,
    "referred_reward_points" INTEGER NOT NULL DEFAULT 0,
    "invited_at" TIMESTAMP(3),
    "signed_up_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "rewarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referred_user_id_key" ON "referrals"("referred_user_id");
CREATE INDEX IF NOT EXISTS "referrals_referrer_user_id_idx" ON "referrals"("referrer_user_id");
CREATE INDEX IF NOT EXISTS "referrals_referral_code_idx" ON "referrals"("referral_code");

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
