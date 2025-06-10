# Employee Portal API Documentation

## Base URL
```
https://www.tsgfulfillment.com/api/employee
```

## Authentication
All endpoints require authentication via session cookies. Users must be logged in and have appropriate role permissions.

## API Endpoints

### Quote Inquiries

#### GET /quote-inquiries
Retrieve all quote inquiries with optional filters.

**Query Parameters:**
- `status` (string, optional): Filter by status (new, contacted, quoted, negotiating, won, lost)
- `assignedTo` (number, optional): Filter by assigned sales team member ID
- `priority` (string, optional): Filter by priority (low, medium, high)

**Response:**
```json
[
  {
    "inquiry": {
      "id": 1,
      "quoteRequestId": 123,
      "assignedTo": 2,
      "hubspotDealId": "12345",
      "hubspotContactId": "67890",
      "status": "new",
      "priority": "medium",
      "lastSyncedAt": "2024-01-01T12:00:00Z",
      "syncStatus": "synced",
      "notes": "Initial contact made",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    },
    "quoteRequest": {
      "companyName": "ABC Company",
      "contactName": "John Doe",
      "email": "john@abc.com",
      "phone": "555-0123",
      "services": ["warehousing", "fulfillment"]
    },
    "assignedMember": {
      "fullName": "Jane Smith",
      "email": "jane.smith@tsgfulfillment.com"
    }
  }
]
```

#### POST /quote-inquiries
Create a new quote inquiry from a quote request.

**Request Body:**
```json
{
  "quoteRequestId": 123,
  "assignedTo": 2,
  "priority": "high",
  "notes": "Urgent customer requirement"
}
```

**Response:**
```json
{
  "id": 1,
  "quoteRequestId": 123,
  "assignedTo": 2,
  "status": "new",
  "priority": "high",
  "notes": "Urgent customer requirement",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### PUT /quote-inquiries/:id
Update an existing quote inquiry.

**URL Parameters:**
- `id` (number): Quote inquiry ID

**Request Body:**
```json
{
  "status": "contacted",
  "priority": "medium",
  "notes": "Spoke with customer, preparing quote"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "contacted",
  "priority": "medium",
  "notes": "Spoke with customer, preparing quote",
  "updatedAt": "2024-01-01T14:00:00Z"
}
```

#### POST /quote-inquiries/:id/assign
Assign a quote inquiry to a sales team member.

**URL Parameters:**
- `id` (number): Quote inquiry ID

**Request Body:**
```json
{
  "salesTeamMemberId": 3
}
```

**Response:**
```json
{
  "id": 1,
  "assignedTo": 3,
  "status": "contacted",
  "updatedAt": "2024-01-01T14:00:00Z"
}
```

### Contracts

#### GET /contracts
Retrieve all contracts with optional filters.

**Query Parameters:**
- `status` (string, optional): Filter by status (pending, completed, declined, voided)
- `clientEmail` (string, optional): Filter by client email

**Response:**
```json
[
  {
    "id": 1,
    "quoteInquiryId": 1,
    "docusignEnvelopeId": "abc123",
    "supabaseFilePath": "contracts/abc123_1234567890.pdf",
    "supabaseFileUrl": "https://supabase.url/contracts/abc123.pdf",
    "clientName": "ABC Company",
    "clientEmail": "john@abc.com",
    "contractType": "standard",
    "status": "completed",
    "signedAt": "2024-01-02T10:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z"
  }
]
```

#### POST /docusign/webhook
DocuSign webhook endpoint for envelope events.

**Headers:**
- `X-DocuSign-Signature-1`: DocuSign signature for verification

**Request Body:**
DocuSign envelope event data

**Response:**
```
200 OK
```

### Quote Versions

#### POST /quote-versions
Create a new version of a quote.

**Request Body:**
```json
{
  "quoteInquiryId": 1,
  "pricingData": {
    "subtotal": 1000.00,
    "tax": 80.00,
    "total": 1080.00,
    "lineItems": [
      {
        "description": "Warehousing - 1000 sq ft",
        "quantity": 1,
        "unitPrice": 500.00,
        "total": 500.00
      }
    ]
  },
  "services": ["warehousing", "fulfillment"],
  "terms": "Net 30",
  "validUntil": "2024-02-01"
}
```

**Response:**
```json
{
  "id": 1,
  "quoteInquiryId": 1,
  "versionNumber": 1,
  "pricingData": {...},
  "services": ["warehousing", "fulfillment"],
  "createdBy": 2,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### GET /quote-inquiries/:id/versions
Get all versions of a quote for a specific inquiry.

**URL Parameters:**
- `id` (number): Quote inquiry ID

**Response:**
```json
[
  {
    "version": {
      "id": 1,
      "versionNumber": 1,
      "pricingData": {...},
      "validUntil": "2024-02-01",
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    "createdBy": {
      "fullName": "Jane Smith",
      "email": "jane.smith@tsgfulfillment.com"
    }
  }
]
```

### Materials

#### GET /materials
Retrieve all materials with inventory levels.

**Query Parameters:**
- `category` (string, optional): Filter by category
- `search` (string, optional): Search by name or SKU

**Response:**
```json
[
  {
    "material": {
      "id": 1,
      "sku": "PKG-TAPE-001",
      "name": "Packaging Tape - Clear",
      "description": "Heavy duty clear packaging tape",
      "category": "Packaging Supplies",
      "unitOfMeasure": "Roll",
      "reorderPoint": 50,
      "reorderQuantity": 200,
      "isActive": true
    },
    "inventory": {
      "currentQuantity": 75,
      "reservedQuantity": 10,
      "location": "Warehouse A - Section 3",
      "lastCountedAt": "2024-01-01T08:00:00Z"
    }
  }
]
```

#### POST /materials
Create a new material.

**Request Body:**
```json
{
  "sku": "BOX-XL-001",
  "name": "Extra Large Box",
  "description": "30x24x24 inch box",
  "category": "Boxes",
  "unitOfMeasure": "Each",
  "reorderPoint": 25,
  "reorderQuantity": 100
}
```

**Response:**
```json
{
  "id": 11,
  "sku": "BOX-XL-001",
  "name": "Extra Large Box",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

#### POST /materials/:id/usage
Record material usage.

**URL Parameters:**
- `id` (number): Material ID

**Request Body:**
```json
{
  "quantityUsed": 10,
  "usedFor": "Order #12345",
  "usageDate": "2024-01-01",
  "notes": "Used for large shipment"
}
```

**Response:**
```json
{
  "success": true
}
```

#### GET /materials/reorder-needed
Get materials that need reordering.

**Response:**
```json
[
  {
    "id": 1,
    "sku": "PKG-TAPE-001",
    "name": "Packaging Tape - Clear",
    "currentQuantity": 45,
    "reorderPoint": 50,
    "reorderQuantity": 200
  }
]
```

### Vendors

#### GET /vendors
Retrieve all active vendors.

**Response:**
```json
[
  {
    "id": 1,
    "name": "ABC Packaging Supplies",
    "contactName": "Sarah Thompson",
    "email": "sarah@abcpackaging.com",
    "phone": "555-0101",
    "address": "123 Industrial Way, Houston, TX",
    "paymentTerms": "Net 30",
    "isActive": true
  }
]
```

#### POST /vendors
Create a new vendor.

**Request Body:**
```json
{
  "name": "New Supplier Inc",
  "contactName": "Bob Johnson",
  "email": "bob@newsupplier.com",
  "phone": "555-0105",
  "address": "999 Supply St, Houston, TX",
  "paymentTerms": "Net 45"
}
```

**Response:**
```json
{
  "id": 5,
  "name": "New Supplier Inc",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### Purchase Orders

#### GET /purchase-orders
Retrieve purchase orders with filters.

**Query Parameters:**
- `status` (string, optional): Filter by status
- `vendorId` (number, optional): Filter by vendor

**Response:**
```json
[
  {
    "order": {
      "id": 1,
      "poNumber": "PO-1704110400000",
      "status": "submitted",
      "orderDate": "2024-01-01",
      "expectedDeliveryDate": "2024-01-15",
      "totalAmount": "500.00",
      "notes": "Urgent order"
    },
    "vendor": {
      "name": "ABC Packaging Supplies",
      "email": "sarah@abcpackaging.com"
    },
    "items": [
      {
        "materialId": 1,
        "quantity": 100,
        "unitPrice": "5.00",
        "totalPrice": "500.00"
      }
    ]
  }
]
```

#### POST /purchase-orders
Create a new purchase order.

**Request Body:**
```json
{
  "vendorId": 1,
  "orderDate": "2024-01-01",
  "expectedDeliveryDate": "2024-01-15",
  "notes": "Monthly restock",
  "items": [
    {
      "materialId": 1,
      "quantity": 100,
      "unitPrice": "5.00",
      "totalPrice": "500.00"
    },
    {
      "materialId": 3,
      "quantity": 50,
      "unitPrice": "10.00",
      "totalPrice": "500.00"
    }
  ]
}
```

**Response:**
```json
{
  "id": 2,
  "poNumber": "PO-1704110500000",
  "status": "draft",
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### Synchronization

#### POST /sync/hubspot
Manually trigger HubSpot synchronization.

**Response:**
```json
{
  "success": true,
  "message": "HubSpot sync completed"
}
```

### Sales Team

#### GET /sales-team
Retrieve all active sales team members.

**Response:**
```json
[
  {
    "id": 1,
    "fullName": "John Smith",
    "email": "john.smith@tsgfulfillment.com",
    "hubspotOwnerId": "12345",
    "isActive": true
  }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details"
}
```

## Rate Limiting

API endpoints are rate limited to:
- 100 requests per minute for authenticated users
- 1000 requests per hour per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp