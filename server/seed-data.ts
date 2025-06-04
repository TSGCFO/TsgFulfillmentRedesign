import { storage } from './storage';

// Seed data for analytics dashboard demonstration
export async function seedAnalyticsData() {
  console.log('Seeding analytics data...');
  
  // Create sample clients (using user IDs as client IDs for simplicity)
  const admin = await storage.getUserByUsername('admin');
  if (!admin) {
    console.log('Creating admin user for sample data...');
    await storage.createUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
  }
  
  // Check if we already have inventory data to avoid duplicates
  const existingInventory = await storage.getInventoryLevels();
  if (existingInventory.length > 0) {
    console.log('Analytics data already exists, skipping seed');
    return;
  }
  
  // Seed inventory levels
  const clientId = 1; // Using admin user ID as client ID
  
  // Create inventory items
  const inventoryItems = [
    { clientId, productId: 1001, quantity: 150, warehouseLocation: 'Warehouse A', minimumLevel: 20, maximumLevel: 200 },
    { clientId, productId: 1002, quantity: 75, warehouseLocation: 'Warehouse B', minimumLevel: 15, maximumLevel: 100 },
    { clientId, productId: 1003, quantity: 5, warehouseLocation: 'Warehouse A', minimumLevel: 10, maximumLevel: 50 },
    { clientId, productId: 1004, quantity: 0, warehouseLocation: 'Warehouse C', minimumLevel: 5, maximumLevel: 30 },
    { clientId, productId: 1005, quantity: 35, warehouseLocation: 'Warehouse B', minimumLevel: 10, maximumLevel: 40 },
    { clientId, productId: 1006, quantity: 120, warehouseLocation: 'Warehouse A', minimumLevel: 20, maximumLevel: 150 },
    { clientId, productId: 1007, quantity: 8, warehouseLocation: 'Warehouse C', minimumLevel: 12, maximumLevel: 60 },
    { clientId, productId: 1008, quantity: 200, warehouseLocation: 'Warehouse A', minimumLevel: 50, maximumLevel: 250 },
    { clientId, productId: 1009, quantity: 45, warehouseLocation: 'Warehouse B', minimumLevel: 20, maximumLevel: 80 },
    { clientId, productId: 1010, quantity: 60, warehouseLocation: 'Warehouse C', minimumLevel: 15, maximumLevel: 100 },
  ];
  
  console.log('Seeding inventory data...');
  for (const item of inventoryItems) {
    await storage.createInventoryLevel(item);
  }
  
  // Seed shipment data
  const shipments = [
    { 
      clientId, 
      trackingNumber: 'TRK-1001', 
      carrier: 'FedEx', 
      destination: 'New York, NY',
      status: 'delivered',
      deliveryDate: new Date('2025-04-10'),
      weight: 5.2,
      cost: 25.99,
      serviceLevel: 'Priority'
    },
    { 
      clientId, 
      trackingNumber: 'TRK-1002', 
      carrier: 'UPS', 
      destination: 'Los Angeles, CA',
      status: 'delivered',
      deliveryDate: new Date('2025-04-09'),
      weight: 3.7,
      cost: 18.50,
      serviceLevel: 'Ground'
    },
    { 
      clientId, 
      trackingNumber: 'TRK-1003', 
      carrier: 'USPS', 
      destination: 'Chicago, IL',
      status: 'delivered',
      deliveryDate: new Date('2025-04-08'),
      weight: 2.1,
      cost: 12.75,
      serviceLevel: 'First Class'
    },
    { 
      clientId, 
      trackingNumber: 'TRK-1004', 
      carrier: 'DHL', 
      destination: 'Houston, TX',
      status: 'in-transit',
      weight: 6.8,
      cost: 32.25,
      serviceLevel: 'Express'
    },
    { 
      clientId, 
      trackingNumber: 'TRK-1005', 
      carrier: 'FedEx', 
      destination: 'Miami, FL',
      status: 'processing',
      weight: 4.3,
      cost: 22.99,
      serviceLevel: 'Standard'
    },
  ];
  
  console.log('Seeding shipment data...');
  for (const shipment of shipments) {
    await storage.createShipment(shipment);
  }
  
  // Seed order statistics
  const orderStats = [
    { 
      clientId, 
      date: '2025-04-01', 
      ordersReceived: 45, 
      ordersProcessed: 42, 
      ordersFulfilled: 40, 
      averageProcessingTime: 1.2, 
      totalValue: 3250.75 
    },
    { 
      clientId, 
      date: '2025-04-02', 
      ordersReceived: 52, 
      ordersProcessed: 50, 
      ordersFulfilled: 48, 
      averageProcessingTime: 1.3, 
      totalValue: 3845.25 
    },
    { 
      clientId, 
      date: '2025-04-03', 
      ordersReceived: 48, 
      ordersProcessed: 46, 
      ordersFulfilled: 45, 
      averageProcessingTime: 1.1, 
      totalValue: 3562.50 
    },
    { 
      clientId, 
      date: '2025-04-04', 
      ordersReceived: 55, 
      ordersProcessed: 53, 
      ordersFulfilled: 51, 
      averageProcessingTime: 1.2, 
      totalValue: 4125.99 
    },
    { 
      clientId, 
      date: '2025-04-05', 
      ordersReceived: 42, 
      ordersProcessed: 40, 
      ordersFulfilled: 38, 
      averageProcessingTime: 1.4, 
      totalValue: 3050.25 
    },
    { 
      clientId, 
      date: '2025-04-06', 
      ordersReceived: 38, 
      ordersProcessed: 36, 
      ordersFulfilled: 35, 
      averageProcessingTime: 1.2, 
      totalValue: 2850.75 
    },
    { 
      clientId, 
      date: '2025-04-07', 
      ordersReceived: 44, 
      ordersProcessed: 42, 
      ordersFulfilled: 41, 
      averageProcessingTime: 1.3, 
      totalValue: 3325.50 
    },
    { 
      clientId, 
      date: '2025-04-08', 
      ordersReceived: 49, 
      ordersProcessed: 47, 
      ordersFulfilled: 46, 
      averageProcessingTime: 1.2, 
      totalValue: 3725.25 
    },
    { 
      clientId, 
      date: '2025-04-09', 
      ordersReceived: 53, 
      ordersProcessed: 51, 
      ordersFulfilled: 49, 
      averageProcessingTime: 1.3, 
      totalValue: 3950.99 
    },
    { 
      clientId, 
      date: '2025-04-10', 
      ordersReceived: 47, 
      ordersProcessed: 45, 
      ordersFulfilled: 43, 
      averageProcessingTime: 1.1, 
      totalValue: 3500.25 
    },
  ];
  
  console.log('Seeding order statistics...');
  for (const stat of orderStats) {
    await storage.createOrderStatistic(stat);
  }
  
  // Seed KPI data
  const kpiData = [
    { 
      clientId, 
      month: '2025-01-01', 
      shippingAccuracy: 98.5, 
      inventoryAccuracy: 97.2, 
      onTimeDelivery: 95.8, 
      returnRate: 3.2, 
      averageOrderValue: 75.25, 
      totalOrders: 1450, 
      customerSatisfaction: 4.6 
    },
    { 
      clientId, 
      month: '2025-02-01', 
      shippingAccuracy: 98.7, 
      inventoryAccuracy: 97.5, 
      onTimeDelivery: 96.2, 
      returnRate: 2.9, 
      averageOrderValue: 76.50, 
      totalOrders: 1525, 
      customerSatisfaction: 4.7 
    },
    { 
      clientId, 
      month: '2025-03-01', 
      shippingAccuracy: 99.1, 
      inventoryAccuracy: 98.0, 
      onTimeDelivery: 96.8, 
      returnRate: 2.5, 
      averageOrderValue: 78.75, 
      totalOrders: 1600, 
      customerSatisfaction: 4.7 
    },
    { 
      clientId, 
      month: '2025-04-01', 
      shippingAccuracy: 99.4, 
      inventoryAccuracy: 98.7, 
      onTimeDelivery: 97.2, 
      returnRate: 2.3, 
      averageOrderValue: 80.25, 
      totalOrders: 1675, 
      customerSatisfaction: 4.8 
    },
  ];
  
  console.log('Seeding KPI data...');
  for (const kpi of kpiData) {
    await storage.createClientKpi(kpi);
  }
  
  // Seed dashboard settings
  const dashboardSettings = [
    { 
      userId: 1, 
      widgetId: 'inventory-summary', 
      position: 1, 
      visible: true, 
      settings: { showChart: true, chartType: 'pie' } 
    },
    { 
      userId: 1, 
      widgetId: 'shipment-status', 
      position: 2, 
      visible: true, 
      settings: { showChart: true, chartType: 'bar' } 
    },
    { 
      userId: 1, 
      widgetId: 'order-trends', 
      position: 3, 
      visible: true, 
      settings: { showChart: true, chartType: 'line', timeRange: '7d' } 
    },
    { 
      userId: 1, 
      widgetId: 'performance-kpis', 
      position: 4, 
      visible: true, 
      settings: { metrics: ['shipping_accuracy', 'on_time_delivery', 'return_rate'] } 
    },
  ];
  
  console.log('Seeding dashboard settings...');
  for (const setting of dashboardSettings) {
    await storage.saveDashboardSetting(setting);
  }
  
  console.log('Analytics data seeding complete!');
}
