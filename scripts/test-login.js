import { createAuthClient } from "better-auth/react"

async function testLogin() {
  try {
    const authClient = createAuthClient()

    const { data, error } = await authClient.signIn.email({
      email: "admin@archcool.com",
      password: process.env.ADMIN_PASSWORD || "admin123", // Use env variable
    });

    if (error) {
      console.error("Login failed:", error);
      return;
    }

    if (data) {
      console.log("Login successful:", data);
      console.log("User:", data.user);
      console.log("Session:", data.session);
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testLogin();
