#!/usr/bin/env node

/**
 * Comprehensive Integration Testing Script
 * Tests real functionality of DocuSign and HubSpot integrations
 */

const fs = require('fs');

async function testHubSpotIntegration() {
  console.log('\n=== TESTING HUBSPOT INTEGRATION ===');
  
  const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
  
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.log('❌ HUBSPOT_ACCESS_TOKEN not found in environment');
    return false;
  }
  
  console.log('✅ HubSpot access token found');
  
  try {
    // Test 1: Get account info
    console.log('\nTest 1: Fetching account information...');
    const accountResponse = await fetch('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.log(`❌ Account info failed: ${accountResponse.status} - ${errorText}`);
      return false;
    }
    
    const accountData = await accountResponse.json();
    console.log(`✅ Account info retrieved: ${accountData.user || 'Unknown user'}`);
    
    // Test 2: Get contacts (real API call)
    console.log('\nTest 2: Fetching contacts...');
    const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!contactsResponse.ok) {
      const errorText = await contactsResponse.text();
      console.log(`❌ Contacts fetch failed: ${contactsResponse.status} - ${errorText}`);
      
      if (contactsResponse.status === 403) {
        console.log('⚠️  This indicates missing scopes. Required scopes:');
        console.log('   - crm.objects.contacts.read');
        console.log('   - crm.schemas.contacts.read');
        console.log('   - crm.objects.contacts.sensitive.read.v2');
      }
      return false;
    }
    
    const contactsData = await contactsResponse.json();
    console.log(`✅ Contacts retrieved: ${contactsData.results?.length || 0} contacts found`);
    
    // Test 3: Try to create a test contact
    console.log('\nTest 3: Creating test contact...');
    const testContact = {
      properties: {
        email: `test-${Date.now()}@example.com`,
        firstname: 'Integration',
        lastname: 'Test',
        company: 'TSG Fulfillment Test',
        phone: '+1-555-TEST-123',
        lifecyclestage: 'lead'
      }
    };
    
    const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContact)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Contact creation failed: ${createResponse.status} - ${errorText}`);
      return false;
    }
    
    const createdContact = await createResponse.json();
    console.log(`✅ Test contact created with ID: ${createdContact.id}`);
    
    // Clean up test contact
    console.log('\nCleaning up test contact...');
    const deleteResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${createdContact.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      }
    });
    
    if (deleteResponse.ok) {
      console.log('✅ Test contact deleted successfully');
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ HubSpot integration error: ${error.message}`);
    return false;
  }
}

async function testDocuSignIntegration() {
  console.log('\n=== TESTING DOCUSIGN INTEGRATION ===');
  
  const DOCUSIGN_INTEGRATION_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
  const DOCUSIGN_USER_ID = process.env.DOCUSIGN_USER_ID;
  const DOCUSIGN_ACCOUNT_ID = process.env.DOCUSIGN_ACCOUNT_ID;
  const DOCUSIGN_PRIVATE_KEY = process.env.DOCUSIGN_PRIVATE_KEY;
  
  const requiredVars = {
    DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_USER_ID,
    DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_PRIVATE_KEY
  };
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.log(`❌ ${key} not found in environment`);
      return false;
    }
    console.log(`✅ ${key} found`);
  }
  
  try {
    // Test private key format
    console.log('\nTest 1: Validating private key format...');
    const { createPrivateKey } = require('crypto');
    
    let privateKey = DOCUSIGN_PRIVATE_KEY;
    if (!privateKey.includes('-----BEGIN')) {
      privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`;
    }
    
    try {
      createPrivateKey(privateKey);
      console.log('✅ Private key format is valid');
    } catch (keyError) {
      console.log(`❌ Invalid private key format: ${keyError.message}`);
      return false;
    }
    
    // Test JWT creation
    console.log('\nTest 2: Creating JWT token...');
    const jwt = require('jsonwebtoken');
    
    const payload = {
      iss: DOCUSIGN_INTEGRATION_KEY,
      sub: DOCUSIGN_USER_ID,
      aud: 'account-d.docusign.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      scope: 'signature impersonation'
    };
    
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    console.log('✅ JWT token created successfully');
    
    // Test DocuSign authentication
    console.log('\nTest 3: Testing DocuSign authentication...');
    const authResponse = await fetch('https://account-d.docusign.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
      })
    });
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.log(`❌ DocuSign authentication failed: ${authResponse.status} - ${errorText}`);
      
      if (errorText.includes('consent_required')) {
        console.log('⚠️  User consent required. Visit the consent URL:');
        console.log(`   https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=${DOCUSIGN_INTEGRATION_KEY}&redirect_uri=https://www.tsgfulfillment.com/employee`);
      }
      return false;
    }
    
    const authData = await authResponse.json();
    console.log('✅ DocuSign authentication successful');
    
    // Test API call
    console.log('\nTest 4: Testing DocuSign API access...');
    const apiResponse = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${DOCUSIGN_ACCOUNT_ID}`, {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`
      }
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.log(`❌ DocuSign API call failed: ${apiResponse.status} - ${errorText}`);
      return false;
    }
    
    const apiData = await apiResponse.json();
    console.log(`✅ DocuSign API access successful: Account ${apiData.accountName || 'Unknown'}`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ DocuSign integration error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 COMPREHENSIVE INTEGRATION TESTING');
  console.log('=====================================');
  
  const hubspotWorking = await testHubSpotIntegration();
  const docusignWorking = await testDocuSignIntegration();
  
  console.log('\n📊 INTEGRATION TEST RESULTS');
  console.log('============================');
  console.log(`HubSpot Integration: ${hubspotWorking ? '✅ FULLY FUNCTIONAL' : '❌ REQUIRES ATTENTION'}`);
  console.log(`DocuSign Integration: ${docusignWorking ? '✅ FULLY FUNCTIONAL' : '❌ REQUIRES ATTENTION'}`);
  
  if (hubspotWorking && docusignWorking) {
    console.log('\n🎉 ALL INTEGRATIONS ARE FULLY OPERATIONAL');
    console.log('Employee Portal is ready for production use with full third-party integration capabilities.');
  } else {
    console.log('\n⚠️  INTEGRATION ISSUES DETECTED');
    if (!hubspotWorking) {
      console.log('HubSpot: Check access token and required scopes in developer portal');
    }
    if (!docusignWorking) {
      console.log('DocuSign: Verify credentials and grant user consent if required');
    }
  }
  
  process.exit(hubspotWorking && docusignWorking ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}