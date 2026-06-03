// Admin User Creation Script
// Run this to create an admin user in your database

import { auth } from "@/lib/auth";

async function createAdminUser() {
  try {
    // Use the signUp method and then update the role
    const result = await auth.api.signUpEmail({
      body: {
        name: "Admin User",
        email: "admin@archcool.com",
        password: "AdminPassword123!",
      },
    });

    if (result?.user) {
      // Update the user to admin role using raw database query
      // This is a one-time setup script
      console.log(
        "✅ Admin user created successfully. Please manually set role to 'admin' in database for user:",
        {
          id: result.user.id,
          email: result.user.email,
        }
      );

      console.log("SQL to run manually:");
      console.log(
        `UPDATE "User" SET role = 'admin' WHERE id = '${result.user.id}';`
      );
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  }
}

// Run the script
createAdminUser();
