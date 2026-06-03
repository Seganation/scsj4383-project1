#!/usr/bin/env tsx

// Test script for the first email template (otpSignIn)
import { emailService } from "../src/app/lib/email";

async function testFirstEmailTemplate() {
  console.log("🧪 Testing first email template (OTP Sign-In)...");

  const testEmail = "test-b7p2ymmcz@srv1.mail-tester.com";
  const testOTP = "123456";

  try {
    // Test email connection first
    console.log("📡 Testing email connection...");
    const isConnected = await emailService.testConnection();

    if (!isConnected) {
      console.error("❌ Email connection failed. Check your credentials.");
      process.exit(1);
    }

    console.log("✅ Email connection successful");
    console.log(`📧 Sending OTP Sign-In email to: ${testEmail}`);
    console.log(`🔐 Using test OTP: ${testOTP}`);

    // Send the first email template (otpSignIn)
    const result = await emailService.sendOTP(testEmail, testOTP, "sign-in");

    console.log("✅ Email sent successfully!");
    console.log("📊 Email details:", {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      envelope: result.envelope,
    });

    console.log("\n🎯 Next steps:");
    console.log("1. Check the mail-tester inbox");
    console.log("2. Review the email score and formatting");
    console.log("3. Note any issues or improvements needed");
  } catch (error) {
    console.error(
      "❌ Failed to send email:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && "code" in error) {
      console.error("Error code:", (error as any).code);
    }
    process.exit(1);
  }
}

// Run the test
testFirstEmailTemplate();
