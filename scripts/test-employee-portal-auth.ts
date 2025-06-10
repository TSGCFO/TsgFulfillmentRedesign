#!/usr/bin/env node
import fetch from "node-fetch";

const API_URL = process.env.API_URL || "http://localhost:5000";

async function testAuth() {
  console.log("🧪 Testing Employee Portal Authentication...\n");

  try {
    // Test 1: Login
    console.log("1️⃣ Testing login...");
    const loginResponse = await fetch(`${API_URL}/api/employee-portal/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "admin",
        password: "Admin123!"
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(`Login failed: ${JSON.stringify(error)}`);
    }

    const loginData = await loginResponse.json();
    console.log("✅ Login successful!");
    console.log(`   Token: ${loginData.data.token.substring(0, 20)}...`);
    console.log(`   User: ${loginData.data.user.username} (${loginData.data.user.role})\n`);

    const token = loginData.data.token;

    // Test 2: Access protected endpoint
    console.log("2️⃣ Testing protected endpoint access...");
    const meResponse = await fetch(`${API_URL}/api/employee-portal/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`
      }
    });

    if (!meResponse.ok) {
      const error = await meResponse.json();
      throw new Error(`Protected endpoint failed: ${JSON.stringify(error)}`);
    }

    const meData = await meResponse.json();
    console.log("✅ Protected endpoint accessed successfully!");
    console.log(`   User data: ${JSON.stringify(meData.data, null, 2)}\n`);

    // Test 3: Access without token
    console.log("3️⃣ Testing access without token...");
    const unauthorizedResponse = await fetch(`${API_URL}/api/employee-portal/quote-inquiries`);
    
    if (unauthorizedResponse.status !== 401) {
      throw new Error(`Expected 401, got ${unauthorizedResponse.status}`);
    }

    console.log("✅ Correctly rejected unauthorized access\n");

    // Test 4: Invalid token
    console.log("4️⃣ Testing invalid token...");
    const invalidTokenResponse = await fetch(`${API_URL}/api/employee-portal/quote-inquiries`, {
      headers: { 
        "Authorization": `Bearer invalid-token-123`
      }
    });
    
    if (invalidTokenResponse.status !== 401) {
      throw new Error(`Expected 401, got ${invalidTokenResponse.status}`);
    }

    console.log("✅ Correctly rejected invalid token\n");

    // Test 5: Test different user roles
    console.log("5️⃣ Testing different user roles...");
    const roles = ["manager", "employee1", "viewer"];
    
    for (const username of roles) {
      const roleLoginResponse = await fetch(`${API_URL}/api/employee-portal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password: username === "manager" ? "Manager123!" : username === "viewer" ? "Viewer123!" : "Employee123!"
        })
      });

      if (roleLoginResponse.ok) {
        const roleData = await roleLoginResponse.json();
        console.log(`   ✅ ${username}: ${roleData.data.user.role}`);
      }
    }

    console.log("\n🎉 All authentication tests passed!");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testAuth();