# DocuSign Integration Setup Guide

## Prerequisites

- DocuSign Developer Account (free for development)
- DocuSign production account for live deployment
- SSL certificate for webhook endpoints
- Access to TSG Fulfillment environment variables

## Step-by-Step Setup

### Step 1: Create DocuSign Developer Account (10 minutes)

1. **Sign up for Developer Account**
   - Navigate to https://developers.docusign.com
   - Click "Get Started" or "Create Account"
   - Fill in registration details
   - Verify email address

2. **Access Developer Dashboard**
   - Log into https://admindemo.docusign.com
   - This is your sandbox environment

### Step 2: Create Integration Key (20 minutes)

1. **Navigate to Integrations**
   - In the Admin dashboard, go to "Integrations" > "Apps and Keys"
   - Click "Add App and Integration Key"

2. **Configure App Settings**
   - **App Name**: TSG Employee Portal
   - **Description**: Integration for automatic contract storage
   - Click "Create App"

3. **Note Integration Key**
   - Copy the Integration Key (Client ID)
   - This will be your `DOCUSIGN_INTEGRATION_KEY`

4. **Configure Authentication**
   - Select "Authorization Code Grant" flow
   - Add Redirect URIs:
     ```
     https://www.tsgfulfillment.com/api/employee/docusign/callback
     http://localhost:5000/api/employee/docusign/callback (for development)
     ```

5. **Generate RSA Keypair**
   - Click "Generate RSA Keypair"
   - Copy the private key immediately
   - Store it securely as `DOCUSIGN_RSA_PRIVATE_KEY`

### Step 3: Configure Service Integration (15 minutes)

1. **Get User ID**
   - Go to "Users" in the admin panel
   - Click on your user
   - Copy the API Username (User ID)
   - This is your `DOCUSIGN_USER_ID`

2. **Get Account ID**
   - In the top right, click your profile
   - Select "Account Info"
   - Copy the Account ID
   - This is your `DOCUSIGN_ACCOUNT_ID`

3. **Grant Consent**
   Build consent URL:
   ```
   https://account-d.docusign.com/oauth/auth?
   response_type=code&
   scope=signature%20impersonation&
   client_id=YOUR_INTEGRATION_KEY&
   redirect_uri=https://www.tsgfulfillment.com/api/employee/docusign/callback
   ```
   - Visit this URL in your browser
   - Log in and grant consent
   - You'll be redirected to your callback URL

### Step 4: Configure Webhooks (25 minutes)

1. **Create Connect Configuration**
   - Go to "Integrations" > "Connect"
   - Click "Add Configuration"

2. **Configure Webhook Settings**
   - **Name**: TSG Employee Portal Webhook
   - **URL to Publish**: `https://www.tsgfulfillment.com/api/employee/docusign/webhook`
   - **Event Triggers**:
     - ✓ Envelope Sent
     - ✓ Envelope Delivered
     - ✓ Envelope Signed/Completed
     - ✓ Envelope Declined
     - ✓ Envelope Voided

3. **Configure Security**
   - Enable "Require Acknowledgement"
   - Enable "Sign Message with X509 Certificate"
   - Enable "Include Certificate of Completion"
   - Enable "Include Time Zone Information"
   - Enable "Include Documents"

4. **Set Envelope Events**
   - Include Document Fields: Yes
   - Include Certificate of Completion: Yes
   - Include Documents: Yes
   - Include Envelope Void Reason: Yes

5. **Save Configuration**
   - Review all settings
   - Click "Save"
   - Note the Connect ID

### Step 5: Environment Configuration (10 minutes)

1. **Create .env variables**
   ```bash
   # DocuSign Configuration
   DOCUSIGN_INTEGRATION_KEY=your-integration-key
   DOCUSIGN_USER_ID=your-user-id
   DOCUSIGN_ACCOUNT_ID=your-account-id
   DOCUSIGN_RSA_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
   YOUR_PRIVATE_KEY_HERE
   -----END RSA PRIVATE KEY-----"
   
   # Environment URLs
   DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi  # Sandbox
   # DOCUSIGN_BASE_URL=https://www.docusign.net/restapi  # Production
   
   # OAuth URLs
   DOCUSIGN_OAUTH_BASE_URL=https://account-d.docusign.com  # Sandbox
   # DOCUSIGN_OAUTH_BASE_URL=https://account.docusign.com  # Production
   ```

2. **Store RSA Key Properly**
   - For multiline private key, ensure proper formatting
   - Alternative: Store in file and reference path
   ```bash
   DOCUSIGN_RSA_PRIVATE_KEY_PATH=/secure/path/docusign_private.key
   ```

### Step 6: Test Integration (20 minutes)

1. **Test Authentication**
   Create test script `test-docusign.js`:
   ```javascript
   const docusign = require('docusign-esign');
   
   const apiClient = new docusign.ApiClient();
   apiClient.setBasePath(process.env.DOCUSIGN_BASE_URL);
   
   async function testAuth() {
     try {
       const results = await apiClient.requestJWTUserToken(
         process.env.DOCUSIGN_INTEGRATION_KEY,
         process.env.DOCUSIGN_USER_ID,
         ['signature', 'impersonation'],
         process.env.DOCUSIGN_RSA_PRIVATE_KEY,
         3600
       );
       console.log('Authentication successful!');
       console.log('Access token:', results.body.access_token.substring(0, 20) + '...');
     } catch (error) {
       console.error('Authentication failed:', error);
     }
   }
   
   testAuth();
   ```

2. **Test Envelope Creation**
   ```javascript
   async function testEnvelope() {
     // Authenticate first
     const token = await getAccessToken();
     apiClient.addDefaultHeader('Authorization', `Bearer ${token}`);
     
     const envelopesApi = new docusign.EnvelopesApi(apiClient);
     
     const envelope = {
       emailSubject: 'Test Contract from Employee Portal',
       documents: [{
         documentBase64: 'BASE64_ENCODED_PDF',
         name: 'Test Contract',
         fileExtension: 'pdf',
         documentId: '1'
       }],
       recipients: {
         signers: [{
           email: 'test@example.com',
           name: 'Test Signer',
           recipientId: '1',
           routingOrder: '1'
         }]
       },
       status: 'sent'
     };
     
     const results = await envelopesApi.createEnvelope(
       process.env.DOCUSIGN_ACCOUNT_ID,
       { envelopeDefinition: envelope }
     );
     
     console.log('Envelope created:', results.envelopeId);
   }
   ```

3. **Test Webhook Reception**
   - Send a test envelope
   - Monitor your webhook endpoint logs
   - Verify payload structure

### Step 7: Production Setup (30 minutes)

1. **Go-Live Process**
   - Complete 20+ API calls in sandbox
   - Pass Go-Live requirements
   - Request production access

2. **Create Production Integration**
   - Log into production admin (admin.docusign.com)
   - Repeat Steps 2-4 for production
   - Use production URLs

3. **Update Environment Variables**
   ```bash
   # Production URLs
   DOCUSIGN_BASE_URL=https://www.docusign.net/restapi
   DOCUSIGN_OAUTH_BASE_URL=https://account.docusign.com
   DOCUSIGN_ENVIRONMENT=production
   ```

## Webhook Security

### Validate Webhook Signatures

```javascript
function validateWebhookSignature(request) {
  const signature = request.headers['x-docusign-signature-1'];
  const certificateChain = request.headers['x-docusign-certificate'];
  
  // Implement HMAC validation
  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(request.rawBody)
    .digest('base64');
    
  return signature === computedSignature;
}
```

### Webhook Payload Structure

```json
{
  "event": "envelope-completed",
  "apiVersion": "v2.1",
  "uri": "/envelopes/xxx-xxx-xxx",
  "envelopeId": "xxx-xxx-xxx",
  "envelopeSummary": {
    "status": "completed",
    "emailSubject": "Contract for ABC Company",
    "completedDateTime": "2024-01-01T10:00:00.000Z",
    "signers": [{
      "email": "john@abc.com",
      "name": "John Doe",
      "status": "completed",
      "signedDateTime": "2024-01-01T10:00:00.000Z"
    }]
  }
}
```

## Troubleshooting

### Common Issues

1. **JWT Token Error**
   - Verify RSA key format
   - Check user has granted consent
   - Ensure correct user ID

2. **Webhook Not Received**
   - Verify SSL certificate
   - Check firewall rules
   - Test with webhook.site first
   - Ensure Connect is enabled

3. **401 Unauthorized**
   - Token may be expired (1 hour limit)
   - Check base URL matches environment
   - Verify integration key is correct

4. **Missing Envelopes**
   - Check correct account ID
   - Verify user permissions
   - Ensure envelope status filter

### Debug Tips

1. **Enable Logging**
   ```javascript
   if (process.env.DOCUSIGN_DEBUG === 'true') {
     apiClient.setDebugging(true);
   }
   ```

2. **Test Webhook Locally**
   Use ngrok for local testing:
   ```bash
   ngrok http 5000
   ```
   Update webhook URL to ngrok URL

3. **Monitor API Usage**
   - Check API request logs in DocuSign
   - Monitor rate limits (1000/hour)
   - Review error logs

## Best Practices

1. **Security**
   - Store keys in secure vault
   - Rotate integration keys annually
   - Use webhook signature validation
   - Implement retry logic

2. **Performance**
   - Cache access tokens (1 hour)
   - Batch envelope operations
   - Use async processing for webhooks
   - Implement proper error handling

3. **Storage**
   - Download documents immediately
   - Store in Supabase with encryption
   - Keep audit trail of all operations
   - Implement retention policies

## Maintenance

### Regular Tasks

**Weekly**
- Monitor webhook failures
- Check API usage statistics
- Review error logs

**Monthly**
- Test disaster recovery
- Verify all integrations working
- Update documentation

**Annually**
- Rotate RSA keypairs
- Review security settings
- Update integration scopes
- Renew certificates

## Support Resources

- [DocuSign Developer Center](https://developers.docusign.com/)
- [API Documentation](https://developers.docusign.com/docs/esign-rest-api/)
- [JWT Authentication Guide](https://developers.docusign.com/platform/auth/jwt/)
- [Webhook Guide](https://developers.docusign.com/platform/webhooks/)
- [Support Portal](https://support.docusign.com/)