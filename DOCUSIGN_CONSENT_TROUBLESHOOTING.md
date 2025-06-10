# DocuSign Consent URL Troubleshooting Guide

## Issue: Consent URL Not Working

The DocuSign authentication is working correctly, but the consent URL is failing due to redirect URI mismatch.

## Root Cause Analysis

DocuSign OAuth requires the redirect URI in the consent URL to exactly match what's configured in your DocuSign application settings. Currently we're getting a consent_required error, which means:

1. ✅ JWT authentication is working
2. ✅ Private key is valid
3. ✅ Integration Key is correct
4. ❌ Redirect URI mismatch preventing consent flow

## Solution Options

### Option 1: Update DocuSign App Configuration (Recommended)

1. Log into DocuSign Developer Console: https://developers.docusign.com/
2. Navigate to your application settings
3. Go to Authentication → Redirect URIs
4. Add these redirect URIs:
   - `https://www.tsgfulfillment.com/employee`
   - `https://www.tsgfulfillment.com/auth/docusign/callback`
   - `http://localhost:5000/auth/docusign/callback` (for development)

### Option 2: Try Alternative Consent URLs

Based on your current configuration, try these consent URLs:

**Primary Production URL:**
```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=dea51199-a1e0-4948-afca-c39274320387&redirect_uri=https://www.tsgfulfillment.com/employee&state=docusign_consent
```

**Auth Callback URL:**
```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=dea51199-a1e0-4948-afca-c39274320387&redirect_uri=https://www.tsgfulfillment.com/auth/docusign/callback&state=docusign_consent
```

**Local Development URL:**
```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=dea51199-a1e0-4948-afca-c39274320387&redirect_uri=http://localhost:5000/auth/docusign/callback&state=docusign_consent
```

### Option 3: Check Current Redirect URI Configuration

To find out what redirect URIs are currently configured in your DocuSign app:

1. Log into DocuSign Developer Console
2. Go to your app → Authentication tab
3. Check the "Redirect URIs" section
4. Use the exact URI from that list in the consent URL

## Testing the Solution

Once you've updated the redirect URIs or found the correct one:

1. Visit the working consent URL
2. Authenticate with DocuSign
3. Grant the requested permissions
4. You'll be redirected to the configured URI
5. Test the connection: `GET /api/test/docusign` should return `"status": "connected"`

## Next Steps After Consent

Once consent is granted, the DocuSign integration will be fully functional for:

- Sending contracts for electronic signature
- Tracking signature status
- Downloading completed documents
- Storing contracts automatically

## Technical Details

- **Integration Key**: dea51199-a1e0-4948-afca-c39274320387
- **Account ID**: b3517833-f642-4e3f-93d7-143e5ee7fb13
- **Callback Handler**: Available at `/auth/docusign/callback`
- **JWT Authentication**: ✅ Working
- **Required Scopes**: signature, impersonation

The authentication infrastructure is complete and ready - only the redirect URI configuration needs to be aligned between the consent URL and DocuSign app settings.