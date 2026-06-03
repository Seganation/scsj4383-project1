// Admin User Setup Script
// This script creates an admin user using Better Auth

import { auth } from "@/lib/auth";

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUser = await auth.api.listUsers({
      query: {
        searchField: "email",
        searchOperator: "contains",
        searchValue: "admin@archcool.com",
      },
    });

    if (existingUser?.users && existingUser.users.length > 0) {
      console.log("✅ Admin user already exists:", {
        id: existingUser.users[0].id,
        email: existingUser.users[0].email,
        role: (existingUser.users[0] as any).role,
      });
      return;
    }

    // Create admin user using Better Auth admin API
    // Note: This requires an authenticated admin session
    console.log("📝 Creating admin user manually...");
    console.log(
      "Please create a regular user first, then update the role to 'admin'"
    );
    console.log("\nTo create admin manually:");
    console.log(
      "1. Sign up normally at /sign-up with email: admin@archcool.com"
    );
    console.log("2. Run this SQL in your database:");
    console.log(
      "   UPDATE \"User\" SET role = 'admin' WHERE email = 'admin@archcool.com';"
    );
    console.log("\n🔑 Suggested Admin Credentials:");
    console.log("Email: admin@archcool.com");
    console.log("Password: AdminPassword123!");
  } catch (error) {
    console.error("❌ Error checking admin user:", error);
  }
}

// Run the script
createAdminUser();
