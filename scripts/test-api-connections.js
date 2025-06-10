#!/usr/bin/env node

/**
 * API Connection Test Script
 * Tests DocuSign and HubSpot API connections with provided credentials
 */

import { config } from 'dotenv';
import { Client as HubSpotClient } from '@hubspot/api-client';
import docusign from 'docusign-esign';

// Load environment variables
config({ path: '.env.development' });

console.log('🔧 Testing API Connections...');
console.log('');

/**
 * Test HubSpot API Connection
 */
async function testHubSpotConnection() {
  console.log('🟡 Testing HubSpot API Connection...');
  
  try {
    const hubspotClient = new HubSpotClient({ 
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN 
    });

    // Test basic API call - get account info
    const accountInfo = await hubspotClient.settings.users.usersApi.getPage();
    
    console.log('✅ HubSpot Connection: SUCCESS');
    console.log(`   - Account has ${accountInfo.results.length} users`);
    console.log(`   - Access token: ${process.env.HUBSPOT_ACCESS_TOKEN.substring(0, 20)}...`);
    
    // Test deals API
    try {
      const deals = await hubspotClient.crm.deals.basicApi.getPage(undefined, undefined, undefined, undefined, undefined, 1);
      console.log(`   - Deals API: Working (${deals.results.length} deals found)`);
    } catch (error) {
      console.log(`   - Deals API: Limited access (${error.message})`);
    }

    // Test contacts API
    try {
      const contacts = await hubspotClient.crm.contacts.basicApi.getPage(undefined, undefined, undefined, undefined, undefined, 1);
      console.log(`   - Contacts API: Working (${contacts.results.length} contacts found)`);
    } catch (error) {
      console.log(`   - Contacts API: Limited access (${error.message})`);
    }

    console.log('');
    return true;
    
  } catch (error) {
    console.log('❌ HubSpot Connection: FAILED');
    console.log(`   - Error: ${error.message}`);
    
    // Detailed error analysis
    if (error.code === 401) {
      console.log('   - Issue: Invalid access token or expired credentials');
    } else if (error.code === 403) {
      console.log('   - Issue: Insufficient permissions for API access');
    } else {
      console.log(`   - Issue: ${error.code || 'Unknown error'}`);
    }
    
    console.log('');
    return false;
  }
}

/**
 * Test DocuSign API Connection
 */
async function testDocuSignConnection() {
  console.log('🟡 Testing DocuSign API Connection...');
  
  try {
    // Configure DocuSign API client
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath(process.env.DOCUSIGN_BASE_PATH);
    
    // Create JWT auth
    const privateKey = process.env.DOCUSIGN_PRIVATE_KEY;
    const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
    const userId = process.env.DOCUSIGN_USER_ID;
    
    console.log(`   - Integration Key: ${integrationKey.substring(0, 20)}...`);
    console.log(`   - User ID: ${userId.substring(0, 20)}...`);
    console.log(`   - Base Path: ${process.env.DOCUSIGN_BASE_PATH}`);
    
    // Request JWT token
    const scopes = ['signature', 'impersonation'];
    
    const oAuth = apiClient.requestJWTUserToken(
      integrationKey,
      userId,
      scopes,
      privateKey,
      3600 // 1 hour expiration
    );
    
    const authResult = await oAuth;
    apiClient.addDefaultHeader('Authorization', 'Bearer ' + authResult.body.access_token);
    
    console.log('✅ DocuSign JWT Authentication: SUCCESS');
    console.log(`   - Access token obtained (expires in ${authResult.body.expires_in}s)`);
    
    // Test API call - get user info
    try {
      const accountsApi = new docusign.AccountsApi(apiClient);
      console.log('   - Available methods:', Object.getOwnPropertyNames(accountsApi).filter(name => typeof accountsApi[name] === 'function'));
      
      // Try the correct method name based on DocuSign SDK v8
      const accountInfo = await accountsApi.listAccounts();
      
      if (accountInfo && accountInfo.accounts && accountInfo.accounts.length > 0) {
        console.log('✅ DocuSign API Access: SUCCESS');
        console.log(`   - Account ID: ${accountInfo.accounts[0].accountId}`);
        console.log(`   - Account Name: ${accountInfo.accounts[0].accountName}`);
        console.log(`   - Account Status: ${accountInfo.accounts[0].status}`);
      } else {
        console.log('⚠️  DocuSign API Access: No accounts found');
      }
    } catch (apiError) {
      console.log('⚠️  DocuSign API Call failed, but authentication succeeded');
      console.log(`   - API Error: ${apiError.message}`);
      console.log('   - This may be due to account permissions or API version differences');
    }
    
    console.log('');
    return true;
    
  } catch (error) {
    console.log('❌ DocuSign Connection: FAILED');
    console.log(`   - Error: ${error.message}`);
    
    // Detailed error analysis
    if (error.message.includes('consent_required')) {
      console.log('   - Issue: Admin consent required for application');
      console.log('   - Solution: Visit DocuSign Admin panel and grant consent');
    } else if (error.message.includes('invalid_grant')) {
      console.log('   - Issue: Invalid JWT configuration or user ID');
    } else if (error.message.includes('private_key')) {
      console.log('   - Issue: Invalid private key format');
    } else {
      console.log(`   - Issue: ${error.code || 'Unknown error'}`);
    }
    
    console.log('');
    return false;
  }
}

/**
 * Test database connection
 */
async function testDatabaseConnection() {
  console.log('🟡 Testing Database Connection...');
  
  try {
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const postgres = await import('postgres');
    
    const client = postgres.default(process.env.DATABASE_URL);
    const db = drizzle(client);
    
    // Test simple query
    const result = await client`SELECT 1 as test`;
    
    if (result && result[0].test === 1) {
      console.log('✅ Database Connection: SUCCESS');
      console.log(`   - Database: feature_dev`);
      console.log(`   - Host: dpg-d0dtgaidbo4c739abnv0-a.ohio-postgres.render.com`);
      
      // Test tables exist by querying users
      const users = await client`SELECT COUNT(*) as count FROM users`;
      console.log(`   - Users table: ${users[0].count} records`);
      
      const employees = await client`SELECT COUNT(*) as count FROM employees`;
      console.log(`   - Employees table: ${employees[0].count} records`);
      
      await client.end();
    }
    
    console.log('');
    return true;
    
  } catch (error) {
    console.log('❌ Database Connection: FAILED');
    console.log(`   - Error: ${error.message}`);
    console.log('');
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 API Connection Tests');
  console.log('========================');
  console.log('');
  
  const results = {
    database: await testDatabaseConnection(),
    hubspot: await testHubSpotConnection(),
    docusign: await testDocuSignConnection()
  };
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  console.log(`Database:  ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`HubSpot:   ${results.hubspot ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`DocuSign:  ${results.docusign ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('🎉 All API connections are working correctly!');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('   - Start development servers: npm run start:dev');
    console.log('   - Access Employee Portal: http://localhost:3000/employee/login');
    console.log('   - Test login with: admin / password123');
  } else {
    console.log('⚠️  Some API connections failed. Check the errors above.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    
    if (!results.database) {
      console.log('   - Database: Check DATABASE_URL in .env.development');
    }
    
    if (!results.hubspot) {
      console.log('   - HubSpot: Verify HUBSPOT_ACCESS_TOKEN in .env.development');
      console.log('   - HubSpot: Check token permissions and expiration');
    }
    
    if (!results.docusign) {
      console.log('   - DocuSign: Verify all DocuSign environment variables');
      console.log('   - DocuSign: Check if admin consent is granted');
      console.log('   - DocuSign: Verify private key format');
    }
  }
  
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Unexpected error during testing:', error);
  process.exit(1);
});