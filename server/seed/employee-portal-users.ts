import bcrypt from "bcryptjs";
import { db } from "../db";
import { salesTeamMembers } from "../../shared/schema/employee-portal";
import { users } from "@shared/schema";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Test users to create
const testUsers = [
  {
    username: "admin",
    password: "Admin123!",
    role: "admin",
    fullName: "System Administrator",
    email: "admin@tsgfulfillment.com"
  },
  {
    username: "manager",
    password: "Manager123!",
    role: "manager",
    fullName: "Sales Manager",
    email: "manager@tsgfulfillment.com"
  },
  {
    username: "employee1",
    password: "Employee123!",
    role: "employee",
    fullName: "John Smith",
    email: "john.smith@tsgfulfillment.com"
  },
  {
    username: "employee2",
    password: "Employee123!",
    role: "employee",
    fullName: "Jane Doe",
    email: "jane.doe@tsgfulfillment.com"
  },
  {
    username: "viewer",
    password: "Viewer123!",
    role: "viewer",
    fullName: "Guest Viewer",
    email: "viewer@tsgfulfillment.com"
  }
];

export async function seedEmployeePortalUsers() {
  console.log("🌱 Seeding employee portal users...");

  try {
    for (const userData of testUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          username: userData.username,
          password: hashedPassword,
          role: userData.role,
        })
        .onConflictDoNothing()
        .returning();

      if (user) {
        console.log(`✅ Created user: ${userData.username}`);

        // If user is employee or manager, add to sales team
        if (userData.role === "employee" || userData.role === "manager") {
          await db
            .insert(salesTeamMembers)
            .values({
              userId: user.id,
              fullName: userData.fullName,
              email: userData.email,
              isActive: true,
            })
            .onConflictDoNothing();

          console.log(`✅ Added ${userData.username} to sales team`);
        }
      } else {
        console.log(`⚠️  User ${userData.username} already exists`);
      }
    }

    console.log("\n🎉 Employee portal users seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("=====================================");
    testUsers.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log("-------------------------------------");
    });
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

// Run if called directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  seedEmployeePortalUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}