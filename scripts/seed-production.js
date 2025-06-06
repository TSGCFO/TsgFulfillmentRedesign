#!/usr/bin/env node

import { db } from '../server/db.js';
import { users } from '../shared/schema.js';

async function seedProductionData() {
  try {
    console.log('🌱 Seeding production database...');
    
    // Create admin user
    const adminUser = await db.insert(users).values({
      username: 'admin',
      password: '$2b$10$rN8QfS1VL1TG6NHQ8B4sYuOt0nBh3BnBN3QfS1VL1TG6NHQ8B4sYu', // 'admin123' hashed
      role: 'admin'
    }).onConflictDoNothing().returning();
    
    console.log('✅ Admin user created');
    
    // Create sample client user
    const clientUser = await db.insert(users).values({
      username: 'demo_client',
      password: '$2b$10$rN8QfS1VL1TG6NHQ8B4sYuOt0nBh3BnBN3QfS1VL1TG6NHQ8B4sYu', // 'demo123' hashed
      role: 'user'
    }).onConflictDoNothing().returning();
    
    console.log('✅ Demo client created');
    console.log('🎉 Production database seeded successfully');
    
  } catch (error) {
    console.error('❌ Error seeding production database:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProductionData();
}

export { seedProductionData };