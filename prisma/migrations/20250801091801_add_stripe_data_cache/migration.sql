-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeDataCache" JSONB;
ALTER TABLE "User" ADD COLUMN     "lastStripeSync" TIMESTAMP(3);
