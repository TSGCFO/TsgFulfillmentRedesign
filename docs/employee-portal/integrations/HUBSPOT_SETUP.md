# HubSpot Integration Setup Guide

## Prerequisites

- HubSpot account with Sales Hub (Starter or higher)
- Admin access to HubSpot portal
- Access to TSG Fulfillment environment variables

## Step-by-Step Setup

### Step 1: Create Private App in HubSpot (30 minutes)

1. **Log into HubSpot**
   - Navigate to https://app.hubspot.com
   - Use admin credentials

2. **Navigate to Private Apps**
   - Click on the settings gear icon in the top navigation
   - In the left sidebar, navigate to: Integrations > Private Apps
   - Click "Create a private app" button

3. **Configure Basic Information**
   - **Name**: TSG Employee Portal Integration
   - **Description**: Integration for employee portal to sync quote inquiries and deals
   - **Logo**: Upload TSG logo (optional)

4. **Set Required Scopes**
   Click on the "Scopes" tab and enable the following:
   
   **CRM Scopes:**
   - `crm.objects.contacts.read` - Read contact information
   - `crm.objects.contacts.write` - Create and update contacts
   - `crm.objects.deals.read` - Read deal information
   - `crm.objects.deals.write` - Create and update deals
   - `crm.objects.companies.read` - Read company information
   - `crm.objects.companies.write` - Create and update companies
   - `crm.objects.owners.read` - Read sales team information
   
   **Additional Scopes:**
   - `crm.schemas.deals.read` - Read deal properties
   - `crm.objects.custom.read` - Read custom objects (if applicable)
   - `crm.objects.custom.write` - Write custom objects (if applicable)

5. **Create the App**
   - Review all settings
   - Click "Create app" button
   - Review and accept the terms
   - Click "Continue creating"

6. **Copy Access Token**
   - After creation, you'll see the access token
   - Click "Show token"
   - Copy the entire token
   - **IMPORTANT**: Store this securely - you won't be able to see it again

### Step 2: Configure Deal Pipeline (20 minutes)

1. **Navigate to Deal Settings**
   - In HubSpot, go to Settings > Objects > Deals
   - Click on "Pipelines" tab

2. **Create or Modify Pipeline**
   - Create a new pipeline called "TSG Quote Inquiries" or use existing
   - Configure stages:
     - **New** (0% probability)
     - **Contacted** (20% probability)
     - **Quoted** (40% probability)
     - **Negotiating** (60% probability)
     - **Won** (100% probability) - Closed Won
     - **Lost** (0% probability) - Closed Lost

3. **Note Pipeline ID**
   - Click on the pipeline name
   - Note the pipeline ID from the URL or settings
   - You'll need this for configuration

### Step 3: Configure Custom Properties (15 minutes)

1. **Navigate to Properties**
   - Settings > Properties
   - Select "Deal properties"

2. **Create Custom Properties**
   Create the following custom properties:

   **TSG Quote Request ID**
   - Field type: Single-line text
   - Internal name: `tsg_quote_request_id`
   - Description: Original quote request ID from TSG website
   
   **TSG Services Requested**
   - Field type: Multiple checkboxes
   - Internal name: `tsg_services_requested`
   - Options:
     - Warehousing
     - Order Fulfillment
     - Freight Forwarding
     - Returns Processing
     - Value-Added Services
   
   **TSG Priority Level**
   - Field type: Dropdown select
   - Internal name: `tsg_priority_level`
   - Options: Low, Medium, High
   
   **TSG Sync Status**
   - Field type: Single-line text
   - Internal name: `tsg_sync_status`
   - Description: Sync status with employee portal

### Step 4: Configure Webhooks (Optional - 20 minutes)

For real-time updates from HubSpot to your portal:

1. **Navigate to Workflows**
   - Automation > Workflows
   - Create new workflow

2. **Create Deal Update Workflow**
   - Trigger: Deal property updated
   - Properties to watch:
     - Deal stage
     - Amount
     - Close date
   - Action: Send webhook
   - URL: `https://www.tsgfulfillment.com/api/employee/hubspot/webhook`
   - Method: POST
   - Authentication: Add secret key

### Step 5: Environment Configuration (10 minutes)

1. **Update .env file**
   Add the following variables:
   ```
   HUBSPOT_ACCESS_TOKEN=your-private-app-token-here
   HUBSPOT_PIPELINE_ID=your-pipeline-id
   HUBSPOT_PORTAL_ID=your-portal-id
   ```

2. **Optional Configuration**
   ```
   HUBSPOT_WEBHOOK_SECRET=your-webhook-secret
   HUBSPOT_API_LIMIT=100
   HUBSPOT_SYNC_INTERVAL=300000
   ```

### Step 6: Test the Integration (15 minutes)

1. **Test Authentication**
   ```bash
   curl https://api.hubapi.com/crm/v3/objects/contacts \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

2. **Test Deal Creation**
   ```bash
   curl -X POST https://api.hubapi.com/crm/v3/objects/deals \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "properties": {
         "dealname": "Test Deal from Employee Portal",
         "pipeline": "YOUR_PIPELINE_ID",
         "dealstage": "appointmentscheduled",
         "amount": "1000"
       }
     }'
   ```

3. **Verify in Portal**
   - Create a test quote inquiry in employee portal
   - Check HubSpot to verify deal creation
   - Update deal in HubSpot
   - Verify update appears in employee portal

## API Rate Limits

HubSpot enforces the following rate limits:
- **Daily limit**: 250,000 requests
- **10-second limit**: 100 requests
- **Concurrent limit**: 10 requests

The integration is designed to respect these limits automatically.

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error**
   - Verify access token is correct
   - Check token hasn't expired
   - Ensure required scopes are enabled

2. **Deal Not Syncing**
   - Check pipeline ID is correct
   - Verify deal stage mappings
   - Check sync logs in employee portal

3. **Missing Properties**
   - Ensure custom properties are created
   - Check property internal names match code
   - Verify property permissions

4. **Rate Limit Errors**
   - Implement exponential backoff
   - Check daily usage in HubSpot
   - Consider batch operations

### Debug Mode

Enable debug logging:
```javascript
// In hubspot.service.ts
const DEBUG = process.env.HUBSPOT_DEBUG === 'true';

if (DEBUG) {
  console.log('HubSpot Request:', requestData);
  console.log('HubSpot Response:', response);
}
```

## Security Best Practices

1. **Token Storage**
   - Never commit tokens to version control
   - Use environment variables
   - Rotate tokens periodically

2. **Webhook Security**
   - Validate webhook signatures
   - Use HTTPS only
   - Implement request validation

3. **Data Privacy**
   - Only sync necessary data
   - Implement data retention policies
   - Follow GDPR/privacy regulations

## Maintenance

### Monthly Tasks
- Review sync logs for errors
- Check API usage statistics
- Verify all deals syncing correctly
- Update field mappings if needed

### Quarterly Tasks
- Rotate access tokens
- Review and update scopes
- Audit custom properties
- Update documentation

## Support Resources

- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [Private Apps Guide](https://developers.hubspot.com/docs/api/private-apps)
- [CRM API Reference](https://developers.hubspot.com/docs/api/crm/deals)
- [Rate Limits Documentation](https://developers.hubspot.com/docs/api/rate-limits)