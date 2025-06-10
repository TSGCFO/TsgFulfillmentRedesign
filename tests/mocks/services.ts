import { vi } from 'vitest';

// Mock HubSpot API responses
export const mockHubSpotResponses = {
  deals: {
    create: {
      id: 'deal-12345',
      properties: {
        dealname: 'Test Deal',
        amount: 1500,
        dealstage: 'qualifiedtobuy',
        closedate: '2025-02-01'
      }
    },
    get: {
      id: 'deal-12345',
      properties: {
        dealname: 'Test Deal',
        amount: 1500,
        dealstage: 'closedwon',
        closedate: '2025-01-15'
      }
    },
    update: {
      id: 'deal-12345',
      properties: {
        dealname: 'Updated Deal',
        amount: 1800,
        dealstage: 'closedwon'
      }
    }
  },
  contacts: {
    create: {
      id: 'contact-67890',
      properties: {
        firstname: 'John',
        lastname: 'Smith',
        email: 'john.smith@client.com',
        company: 'Client Corp'
      }
    },
    search: {
      total: 1,
      results: [{
        id: 'contact-67890',
        properties: {
          firstname: 'John',
          lastname: 'Smith',
          email: 'john.smith@client.com',
          company: 'Client Corp'
        }
      }]
    }
  }
};

// Mock DocuSign API responses
export const mockDocuSignResponses = {
  envelope: {
    create: {
      envelopeId: 'envelope-abc123',
      status: 'sent',
      uri: '/envelopes/envelope-abc123'
    },
    status: {
      envelopeId: 'envelope-abc123',
      status: 'completed',
      completedDateTime: '2025-01-15T14:30:00Z',
      recipients: {
        signers: [{
          name: 'John Smith',
          email: 'john.smith@client.com',
          status: 'completed',
          signedDateTime: '2025-01-15T14:30:00Z'
        }]
      }
    }
  },
  document: {
    download: {
      // Mock binary data would go here
      data: Buffer.from('Mock PDF content'),
      contentType: 'application/pdf'
    }
  }
};

// Mock storage service
export const createMockStorageService = () => ({
  // User operations
  getUserByUsername: vi.fn().mockImplementation((username: string) => {
    if (username === 'testuser') {
      return Promise.resolve({
        id: 1,
        username: 'testuser',
        password: '$2a$10$hashedpassword',
        email: 'test@example.com',
        role: 'sales_rep'
      });
    }
    return Promise.resolve(null);
  }),

  getUserById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'sales_rep'
      });
    }
    return Promise.resolve(null);
  }),

  // Employee operations
  getEmployeeByUserId: vi.fn().mockImplementation((userId: number) => {
    if (userId === 1) {
      return Promise.resolve({
        id: 1,
        userId: 1,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        department: 'Sales',
        position: 'Sales Representative',
        email: 'john.doe@tsg.com',
        isActive: true,
        permissions: {}
      });
    }
    return Promise.resolve(null);
  }),

  // Quote request operations
  getQuoteRequests: vi.fn().mockImplementation((filters = {}) => {
    const allRequests = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@client.com',
        company: 'Client Corp',
        status: 'new',
        urgency: 'high',
        assignedTo: null
      },
      {
        id: 2,
        name: 'Jane Johnson',
        email: 'jane@test.com',
        company: 'Test Corp',
        status: 'assigned',
        urgency: 'medium',
        assignedTo: 1
      }
    ];

    let filtered = allRequests;

    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(req => req.assignedTo === filters.assignedTo);
    }

    return Promise.resolve(filtered);
  }),

  updateQuoteRequest: vi.fn().mockImplementation((id: number, data: any) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        name: 'John Smith',
        status: data.status || 'new',
        assignedTo: data.assignedTo || null,
        ...data
      });
    }
    return Promise.resolve(null);
  }),

  getQuoteRequestCount: vi.fn().mockResolvedValue(5),

  // Quote operations
  getQuotes: vi.fn().mockImplementation((filters = {}) => {
    const allQuotes = [
      {
        id: 1,
        quoteNumber: 'QUO-2025-001',
        clientName: 'John Smith',
        status: 'draft',
        totalAmount: 1500
      },
      {
        id: 2,
        quoteNumber: 'QUO-2025-002',
        clientName: 'Jane Johnson',
        status: 'sent',
        totalAmount: 1200
      }
    ];

    let filtered = allQuotes;

    if (filters.status) {
      filtered = filtered.filter(quote => quote.status === filters.status);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(quote => true); // Simplified for mock
    }

    return Promise.resolve(filtered);
  }),

  createQuote: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      quoteNumber: data.quoteNumber || 'QUO-2025-001',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  updateQuote: vi.fn().mockImplementation((id: number, data: any) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        quoteNumber: 'QUO-2025-001',
        ...data,
        updatedAt: new Date()
      });
    }
    return Promise.resolve(null);
  }),

  getQuoteById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        quoteNumber: 'QUO-2025-001',
        clientName: 'John Smith',
        status: 'draft',
        totalAmount: 1500
      });
    }
    return Promise.resolve(null);
  }),

  getQuoteCount: vi.fn().mockResolvedValue(12),

  // Contract operations
  getContracts: vi.fn().mockImplementation((filters = {}) => {
    const allContracts = [
      {
        id: 1,
        contractNumber: 'CON-2025-001',
        clientName: 'John Smith',
        status: 'sent',
        contractValue: 1500
      },
      {
        id: 2,
        contractNumber: 'CON-2025-002',
        clientName: 'Jane Johnson',
        status: 'signed',
        contractValue: 1200
      }
    ];

    let filtered = allContracts;

    if (filters.status) {
      filtered = filtered.filter(contract => contract.status === filters.status);
    }

    return Promise.resolve(filtered);
  }),

  createContract: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      contractNumber: data.contractNumber || 'CON-2025-001',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  getContractCount: vi.fn().mockResolvedValue(8),

  // Vendor operations
  getVendors: vi.fn().mockImplementation((activeOnly = true) => {
    const allVendors = [
      {
        id: 1,
        vendorName: 'Test Vendor A',
        vendorCode: 'TVA001',
        isActive: true
      },
      {
        id: 2,
        vendorName: 'Test Vendor B',
        vendorCode: 'TVB002',
        isActive: false
      }
    ];

    if (activeOnly) {
      return Promise.resolve(allVendors.filter(vendor => vendor.isActive));
    }

    return Promise.resolve(allVendors);
  }),

  createVendor: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  // Material operations
  getMaterials: vi.fn().mockResolvedValue([
    {
      id: 1,
      materialName: 'Test Material A',
      materialCode: 'TMA001',
      currentStock: 150,
      reorderLevel: 100
    },
    {
      id: 2,
      materialName: 'Test Material B',
      materialCode: 'TMB002',
      currentStock: 45,
      reorderLevel: 100
    }
  ]),

  createMaterial: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  updateMaterial: vi.fn().mockImplementation((id: number, data: any) => {
    return Promise.resolve({
      id,
      ...data,
      updatedAt: new Date()
    });
  }),

  getLowStockMaterials: vi.fn().mockResolvedValue([
    {
      id: 2,
      materialName: 'Test Material B',
      materialCode: 'TMB002',
      currentStock: 45,
      reorderLevel: 100,
      reorderQuantity: 500
    }
  ]),

  getMaterialCount: vi.fn().mockResolvedValue(3),

  // Purchase order operations
  getPurchaseOrders: vi.fn().mockResolvedValue([
    {
      id: 1,
      poNumber: 'PO-2025-001',
      vendorName: 'Test Vendor A',
      totalAmount: 1000,
      status: 'pending'
    }
  ]),

  createPurchaseOrder: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      poNumber: data.poNumber || 'PO-2025-001',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  updatePurchaseOrder: vi.fn().mockImplementation((id: number, data: any) => {
    return Promise.resolve({
      id,
      ...data,
      updatedAt: new Date()
    });
  }),

  getPurchaseOrderById: vi.fn().mockImplementation((id: number) => {
    if (id === 1) {
      return Promise.resolve({
        id: 1,
        poNumber: 'PO-2025-001',
        vendorId: 1,
        status: 'pending',
        totalAmount: 1000
      });
    }
    return Promise.resolve(null);
  }),

  createPurchaseOrderItem: vi.fn().mockImplementation((data: any) => {
    return Promise.resolve({
      id: 1,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }),

  // Activity operations
  getRecentActivity: vi.fn().mockResolvedValue([
    {
      id: 1,
      description: 'Quote QUO-2025-001 was created',
      timestamp: new Date(),
      type: 'quote_created'
    },
    {
      id: 2,
      description: 'Contract CON-2025-001 was signed',
      timestamp: new Date(),
      type: 'contract_signed'
    }
  ])
});

// Mock HubSpot service
export const createMockHubSpotService = () => ({
  syncQuoteRequestToDeal: vi.fn().mockImplementation(async (quoteRequestId: number) => {
    return Promise.resolve({
      dealId: 'deal-12345',
      contactId: 'contact-67890',
      syncStatus: 'success'
    });
  }),

  syncDealFromHubSpot: vi.fn().mockImplementation(async (dealId: string) => {
    return Promise.resolve({
      localQuoteId: 1,
      syncStatus: 'success'
    });
  }),

  createOrUpdateContact: vi.fn().mockImplementation(async (contactData: any) => {
    return Promise.resolve({
      id: 'contact-67890',
      properties: contactData
    });
  }),

  getDeal: vi.fn().mockImplementation(async (dealId: string) => {
    return Promise.resolve(mockHubSpotResponses.deals.get);
  }),

  updateDeal: vi.fn().mockImplementation(async (dealId: string, properties: any) => {
    return Promise.resolve({
      ...mockHubSpotResponses.deals.update,
      properties: { ...mockHubSpotResponses.deals.update.properties, ...properties }
    });
  }),

  createDeal: vi.fn().mockImplementation(async (dealData: any) => {
    return Promise.resolve({
      ...mockHubSpotResponses.deals.create,
      properties: { ...mockHubSpotResponses.deals.create.properties, ...dealData }
    });
  })
});

// Mock DocuSign service
export const createMockDocuSignService = () => ({
  sendContractForSignature: vi.fn().mockImplementation(async (quoteId: number, templateId: string, signerData: any) => {
    return Promise.resolve({
      contract: {
        id: 1,
        contractNumber: 'CON-2025-001',
        quoteId,
        docusignEnvelopeId: 'envelope-abc123',
        status: 'sent'
      },
      envelopeId: 'envelope-abc123'
    });
  }),

  handleWebhook: vi.fn().mockImplementation(async (envelopeId: string, status: string) => {
    // Simulate webhook processing
    return Promise.resolve();
  }),

  getEnvelopeStatus: vi.fn().mockImplementation(async (envelopeId: string) => {
    return Promise.resolve(mockDocuSignResponses.envelope.status);
  }),

  downloadSignedDocument: vi.fn().mockImplementation(async (envelopeId: string, documentId: string) => {
    return Promise.resolve(mockDocuSignResponses.document.download);
  })
});

// Mock authentication functions
export const createMockAuthService = () => ({
  generateToken: vi.fn().mockReturnValue('mock.jwt.token'),
  
  verifyToken: vi.fn().mockImplementation((req: any, res: any, next: any) => {
    req.user = {
      id: 1,
      username: 'testuser',
      role: 'sales_rep'
    };
    next();
  }),

  requireRole: vi.fn().mockImplementation((roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (req.user && roles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({ message: 'Insufficient permissions' });
      }
    };
  })
});

// Mock email service (if needed)
export const createMockEmailService = () => ({
  sendQuoteEmail: vi.fn().mockResolvedValue({
    messageId: 'email-123',
    status: 'sent'
  }),

  sendContractEmail: vi.fn().mockResolvedValue({
    messageId: 'email-456',
    status: 'sent'
  }),

  sendNotificationEmail: vi.fn().mockResolvedValue({
    messageId: 'email-789',
    status: 'sent'
  })
});

// Helper to setup all service mocks
export const setupServiceMocks = () => {
  const storage = createMockStorageService();
  const hubspot = createMockHubSpotService();
  const docusign = createMockDocuSignService();
  const auth = createMockAuthService();
  const email = createMockEmailService();

  return {
    storage,
    hubspot,
    docusign,
    auth,
    email
  };
};

// Helper to reset all service mocks
export const resetServiceMocks = (services: ReturnType<typeof setupServiceMocks>) => {
  Object.values(services).forEach(service => {
    Object.values(service).forEach(method => {
      if (vi.isMockFunction(method)) {
        method.mockClear();
      }
    });
  });
};