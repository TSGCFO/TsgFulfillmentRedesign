// Mock API response data for testing

export const mockApiResponses = {
  // Authentication responses
  auth: {
    login: {
      success: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'sales_rep'
        },
        employee: {
          id: 1,
          userId: 1,
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          department: 'Sales',
          position: 'Sales Representative',
          email: 'john.doe@tsg.com',
          permissions: {}
        }
      },
      invalidCredentials: {
        message: 'Invalid credentials'
      },
      inactiveEmployee: {
        message: 'Access denied'
      }
    },
    profile: {
      success: {
        data: {
          id: 1,
          userId: 1,
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          department: 'Sales',
          position: 'Sales Representative',
          email: 'john.doe@tsg.com',
          phone: '555-0123',
          isActive: true,
          permissions: {}
        }
      },
      notFound: {
        message: 'Employee profile not found'
      }
    }
  },

  // Quote request responses
  quoteRequests: {
    list: {
      success: {
        data: [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@client.com',
            company: 'Client Corp A',
            phone: '555-0456',
            message: 'Need fulfillment services for our e-commerce business',
            servicesRequested: { fulfillment: true, warehousing: false, customPackaging: true },
            urgency: 'high',
            status: 'new',
            assignedTo: null,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-01T10:00:00Z'
          },
          {
            id: 2,
            name: 'Jane Johnson',
            email: 'jane@testcompany.com',
            company: 'Test Company B',
            phone: '555-0789',
            message: 'Looking for warehousing solutions',
            servicesRequested: { fulfillment: false, warehousing: true, customPackaging: false },
            urgency: 'medium',
            status: 'assigned',
            assignedTo: 1,
            createdAt: '2025-01-02T09:00:00Z',
            updatedAt: '2025-01-02T14:30:00Z'
          },
          {
            id: 3,
            name: 'Bob Wilson',
            email: 'bob@example.com',
            company: 'Example LLC',
            phone: '555-0321',
            message: 'Complete fulfillment package needed',
            servicesRequested: { fulfillment: true, warehousing: true, customPackaging: true },
            urgency: 'low',
            status: 'quoted',
            assignedTo: 1,
            createdAt: '2025-01-03T08:00:00Z',
            updatedAt: '2025-01-03T16:45:00Z'
          }
        ]
      },
      filtered: {
        data: [
          {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@client.com',
            company: 'Client Corp A',
            status: 'new',
            urgency: 'high',
            assignedTo: null,
            createdAt: '2025-01-01T10:00:00Z'
          }
        ]
      },
      empty: {
        data: []
      }
    },
    assign: {
      success: {
        message: 'Quote request assigned successfully',
        data: {
          id: 1,
          assignedTo: 2,
          status: 'assigned',
          updatedAt: '2025-01-01T15:30:00Z'
        }
      },
      notFound: {
        message: 'Quote request not found'
      }
    }
  },

  // Quote responses
  quotes: {
    list: {
      success: {
        data: [
          {
            id: 1,
            quoteRequestId: 1,
            quoteNumber: 'QUO-2025-001',
            clientName: 'John Smith',
            clientEmail: 'john.smith@client.com',
            clientCompany: 'Client Corp A',
            servicesQuoted: { fulfillment: true, warehousing: false, customPackaging: true },
            pricingData: {
              basePrice: 1000,
              fulfillmentFee: 500,
              customPackaging: 300,
              total: 1800
            },
            totalAmount: 1800,
            createdBy: 1,
            assignedTo: 1,
            status: 'draft',
            validUntil: '2025-02-01T00:00:00Z',
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-01T10:00:00Z'
          },
          {
            id: 2,
            quoteRequestId: 2,
            quoteNumber: 'QUO-2025-002',
            clientName: 'Jane Johnson',
            clientEmail: 'jane@testcompany.com',
            clientCompany: 'Test Company B',
            servicesQuoted: { fulfillment: false, warehousing: true, customPackaging: false },
            pricingData: {
              basePrice: 800,
              warehousingFee: 400,
              total: 1200
            },
            totalAmount: 1200,
            createdBy: 1,
            assignedTo: 1,
            status: 'sent',
            validUntil: '2025-02-02T00:00:00Z',
            createdAt: '2025-01-02T09:00:00Z',
            updatedAt: '2025-01-02T14:30:00Z'
          }
        ]
      }
    },
    create: {
      success: {
        message: 'Quote created successfully',
        data: {
          id: 1,
          quoteRequestId: 1,
          quoteNumber: 'QUO-2025-001',
          clientName: 'John Smith',
          clientEmail: 'john.smith@client.com',
          clientCompany: 'Client Corp A',
          servicesQuoted: { fulfillment: true, warehousing: false },
          pricingData: { basePrice: 1000, total: 1000 },
          totalAmount: 1000,
          status: 'draft'
        }
      },
      error: {
        message: 'Error creating quote'
      }
    },
    update: {
      success: {
        message: 'Quote updated successfully',
        data: {
          id: 1,
          status: 'sent',
          totalAmount: 1500,
          updatedAt: '2025-01-01T16:00:00Z'
        }
      },
      notFound: {
        message: 'Quote not found'
      }
    }
  },

  // Contract responses
  contracts: {
    list: {
      success: {
        data: [
          {
            id: 1,
            quoteId: 1,
            contractNumber: 'CON-2025-001',
            clientName: 'John Smith',
            clientEmail: 'john.smith@client.com',
            clientCompany: 'Client Corp A',
            docusignEnvelopeId: 'envelope-12345',
            contractValue: 1800,
            status: 'sent',
            signedAt: null,
            createdAt: '2025-01-01T10:00:00Z',
            updatedAt: '2025-01-01T10:00:00Z'
          },
          {
            id: 2,
            quoteId: 2,
            contractNumber: 'CON-2025-002',
            clientName: 'Jane Johnson',
            clientEmail: 'jane@testcompany.com',
            clientCompany: 'Test Company B',
            docusignEnvelopeId: 'envelope-67890',
            contractValue: 1200,
            status: 'signed',
            signedAt: '2025-01-02T15:30:00Z',
            createdAt: '2025-01-02T09:00:00Z',
            updatedAt: '2025-01-02T15:30:00Z'
          }
        ]
      }
    },
    send: {
      success: {
        message: 'Contract sent successfully',
        data: {
          contract: {
            id: 1,
            contractNumber: 'CON-2025-001',
            status: 'sent'
          },
          envelopeId: 'envelope-12345'
        }
      },
      error: {
        message: 'Error sending contract'
      }
    }
  },

  // Vendor responses
  vendors: {
    list: {
      success: {
        data: [
          {
            id: 1,
            vendorName: 'Packaging Solutions Inc',
            vendorCode: 'PSI001',
            contactPerson: 'Sarah Johnson',
            email: 'sarah@packagingsolutions.com',
            phone: '555-PACK',
            address: '123 Package St, Box City, BC 12345',
            isActive: true,
            createdAt: '2025-01-01T00:00:00Z'
          },
          {
            id: 2,
            vendorName: 'Material Suppliers LLC',
            vendorCode: 'MSL002',
            contactPerson: 'Mike Wilson',
            email: 'mike@materialsuppliers.com',
            phone: '555-MTRL',
            address: '456 Supply Ave, Material Town, MT 67890',
            isActive: true,
            createdAt: '2025-01-02T00:00:00Z'
          }
        ]
      }
    },
    create: {
      success: {
        message: 'Vendor created successfully',
        data: {
          id: 1,
          vendorName: 'New Vendor Corp',
          vendorCode: 'NVC001',
          contactPerson: 'John Vendor',
          email: 'john@newvendor.com',
          isActive: true
        }
      }
    }
  },

  // Material responses
  materials: {
    list: {
      success: {
        data: [
          {
            id: 1,
            materialName: 'Bubble Wrap',
            materialCode: 'BW001',
            description: 'Protective bubble wrap for packaging',
            vendorId: 1,
            unitPrice: 12.50,
            unitOfMeasure: 'rolls',
            reorderLevel: 50,
            reorderQuantity: 200,
            currentStock: 75,
            createdAt: '2025-01-01T00:00:00Z'
          },
          {
            id: 2,
            materialName: 'Cardboard Boxes',
            materialCode: 'CB002',
            description: 'Medium-sized cardboard shipping boxes',
            vendorId: 1,
            unitPrice: 2.25,
            unitOfMeasure: 'pieces',
            reorderLevel: 100,
            reorderQuantity: 500,
            currentStock: 45, // Below reorder level
            createdAt: '2025-01-01T00:00:00Z'
          },
          {
            id: 3,
            materialName: 'Packing Tape',
            materialCode: 'PT003',
            description: 'Heavy-duty packing tape',
            vendorId: 2,
            unitPrice: 8.75,
            unitOfMeasure: 'rolls',
            reorderLevel: 25,
            reorderQuantity: 100,
            currentStock: 15, // Below reorder level
            createdAt: '2025-01-01T00:00:00Z'
          }
        ]
      }
    },
    lowStock: {
      success: {
        data: [
          {
            id: 2,
            materialName: 'Cardboard Boxes',
            materialCode: 'CB002',
            currentStock: 45,
            reorderLevel: 100,
            reorderQuantity: 500,
            unitPrice: 2.25,
            vendorId: 1
          },
          {
            id: 3,
            materialName: 'Packing Tape',
            materialCode: 'PT003',
            currentStock: 15,
            reorderLevel: 25,
            reorderQuantity: 100,
            unitPrice: 8.75,
            vendorId: 2
          }
        ]
      }
    },
    create: {
      success: {
        message: 'Material created successfully',
        data: {
          id: 1,
          materialName: 'New Material',
          materialCode: 'NM001',
          description: 'A new test material',
          vendorId: 1,
          unitPrice: 15.00,
          currentStock: 100
        }
      }
    }
  },

  // Purchase order responses
  purchaseOrders: {
    list: {
      success: {
        data: [
          {
            id: 1,
            poNumber: 'PO-2025-001',
            vendorId: 1,
            vendorName: 'Packaging Solutions Inc',
            requestedBy: 1,
            totalAmount: 1125.00,
            status: 'pending',
            orderDate: '2025-01-01T00:00:00Z',
            expectedDelivery: '2025-01-08T00:00:00Z',
            notes: 'Reorder for low stock items',
            createdAt: '2025-01-01T10:00:00Z'
          },
          {
            id: 2,
            poNumber: 'PO-2025-002',
            vendorId: 2,
            vendorName: 'Material Suppliers LLC',
            requestedBy: 1,
            totalAmount: 875.00,
            status: 'approved',
            orderDate: '2025-01-02T00:00:00Z',
            expectedDelivery: '2025-01-09T00:00:00Z',
            notes: 'Regular monthly order',
            createdAt: '2025-01-02T09:00:00Z'
          }
        ]
      }
    },
    create: {
      success: {
        message: 'Purchase order created successfully',
        data: {
          id: 1,
          poNumber: 'PO-2025-001',
          vendorId: 1,
          totalAmount: 1125.00,
          status: 'pending'
        }
      }
    }
  },

  // Dashboard responses
  dashboard: {
    success: {
      data: {
        employee: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          department: 'Sales',
          position: 'Sales Representative'
        },
        metrics: {
          assignedQuotes: 12,
          activeContracts: 8,
          pendingQuoteRequests: 5,
          lowStockItems: 3
        },
        recentActivity: [
          {
            id: 1,
            description: 'Quote QUO-2025-001 was created',
            timestamp: '2025-01-01T10:00:00Z',
            type: 'quote_created'
          },
          {
            id: 2,
            description: 'Contract CON-2025-001 was signed',
            timestamp: '2025-01-01T09:30:00Z',
            type: 'contract_signed'
          },
          {
            id: 3,
            description: 'Purchase order PO-2025-001 was approved',
            timestamp: '2025-01-01T09:00:00Z',
            type: 'po_approved'
          }
        ]
      }
    },
    employeeNotFound: {
      message: 'Employee not found'
    }
  },

  // Webhook responses
  webhooks: {
    hubspot: {
      success: {
        message: 'Webhook processed successfully'
      },
      error: {
        error: 'Webhook processing failed'
      }
    },
    docusign: {
      success: {
        message: 'Webhook processed successfully'
      },
      error: {
        error: 'Webhook processing failed'
      }
    }
  },

  // Error responses
  errors: {
    unauthorized: {
      message: 'Access token required'
    },
    forbidden: {
      message: 'Insufficient permissions'
    },
    notFound: {
      message: 'Resource not found'
    },
    validationError: {
      message: 'Validation failed',
      errors: [
        { field: 'email', message: 'Valid email is required' },
        { field: 'name', message: 'Name is required' }
      ]
    },
    serverError: {
      message: 'Internal server error'
    },
    networkError: {
      message: 'Network connection failed'
    }
  }
};

// Helper functions to get specific responses
export const getAuthResponse = (type: 'success' | 'invalidCredentials' | 'inactiveEmployee') => 
  mockApiResponses.auth.login[type];

export const getQuoteRequestsResponse = (type: 'success' | 'filtered' | 'empty') => 
  mockApiResponses.quoteRequests.list[type];

export const getQuotesResponse = () => 
  mockApiResponses.quotes.list.success;

export const getContractsResponse = () => 
  mockApiResponses.contracts.list.success;

export const getVendorsResponse = () => 
  mockApiResponses.vendors.list.success;

export const getMaterialsResponse = () => 
  mockApiResponses.materials.list.success;

export const getLowStockMaterialsResponse = () => 
  mockApiResponses.materials.lowStock.success;

export const getPurchaseOrdersResponse = () => 
  mockApiResponses.purchaseOrders.list.success;

export const getDashboardResponse = () => 
  mockApiResponses.dashboard.success;

export const getErrorResponse = (type: keyof typeof mockApiResponses.errors) => 
  mockApiResponses.errors[type];