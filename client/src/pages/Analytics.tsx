import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, subDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'wouter';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  Calendar, ChevronDown, ChevronUp, Package, 
  Truck, BarChart2, Settings, Clock, DollarSign,
  TrendingUp, FileText
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogClose 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AnalyticsLayout from '@/components/analytics/Layout';
import Seo from '@/components/SEO/Seo';

// Analytics Dashboard Colors
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
};

// Mock client data
const CLIENTS = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Inc.' },
  { id: 3, name: 'Global Enterprises' },
  { id: 4, name: 'Tech Solutions' },
  { id: 5, name: 'E-commerce Giant' },
];

// Type Definitions
interface AnalyticsSummary {
  shipmentSummary: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  inventorySummary: {
    totalItems: number;
    lowStock: number;
    lowStockPercentage: number;
  };
  orderSummary: {
    total: number;
    processed: number;
    fulfilled: number;
    fulfillmentRate: number;
  };
  performance: {
    shippingAccuracy: number;
    inventoryAccuracy: number;
    onTimeDelivery: number;
    returnRate: number;
    customerSatisfaction: number;
  } | null;
}

interface ShippingPerformance {
  totalShipments: number;
  byCarrier: Record<string, number>;
  byStatus: Record<string, number>;
  deliveryPerformance: {
    averageDeliveryTime: number | null;
    minimumTime: number;
    maximumTime: number;
  };
}

interface InventoryReport {
  totalUniqueItems: number;
  totalQuantity: number;
  inventoryHealth: {
    lowStock: number;
    optimal: number;
    overstock: number;
  };
  byLocation: Record<string, number>;
}

interface DashboardSetting {
  userId: number;
  widgetId: string;
  position: number;
  visible: boolean;
  settings: Record<string, any>;
}

// Dashboard Widget Components
const KpiCard: React.FC<{
  title: string;
  value: number | string;
  changePercent?: number;
  icon: React.ReactNode;
  color?: string;
  isPercentage?: boolean;
  isCurrency?: boolean;
}> = ({ title, value, changePercent, icon, color = COLORS.primary, isPercentage = false, isCurrency = false }) => {
  return (
    <Card className="p-4 shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-1">
            {isCurrency && '$'}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {isPercentage && '%'}
          </p>
          {changePercent !== undefined && (
            <div className={`flex items-center mt-1 text-sm ${changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {changePercent >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{Math.abs(changePercent)}%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

const LineChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKeys: string[];
  colors?: string[];
}> = ({ title, data, dataKeys, colors = [COLORS.primary, COLORS.secondary] }) => {
  return (
    <Card className="p-4 shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Download CSV</DropdownMenuItem>
            <DropdownMenuItem>Edit Widget</DropdownMenuItem>
            <DropdownMenuItem>Remove Widget</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const BarChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKeys: string[];
  colors?: string[];
}> = ({ title, data, dataKeys, colors = [COLORS.primary, COLORS.secondary] }) => {
  return (
    <Card className="p-4 shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Download CSV</DropdownMenuItem>
            <DropdownMenuItem>Edit Widget</DropdownMenuItem>
            <DropdownMenuItem>Remove Widget</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataKeys.map((key, i) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[i % colors.length]} 
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const PieChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
}> = ({ title, data, dataKey, nameKey, colors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.quinary] }) => {
  return (
    <Card className="p-4 shadow-md h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Download CSV</DropdownMenuItem>
            <DropdownMenuItem>Edit Widget</DropdownMenuItem>
            <DropdownMenuItem>Remove Widget</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="h-64 flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              nameKey={nameKey}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Main Dashboard Component
const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState<number | null>(1); // Default to first client
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  
  // Fetch client summary data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/analytics/client-summary', selectedClient],
    enabled: !!selectedClient,
    queryFn: async () => {
      const response = await fetch(`/api/analytics/client-summary/${selectedClient}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client summary');
      }
      return response.json();
    },
    placeholderData: {
      data: {
        shipmentSummary: {
          total: 120,
          completed: 98,
          inProgress: 22,
          completionRate: 81.67
        },
        inventorySummary: {
          totalItems: 8750,
          lowStock: 12,
          lowStockPercentage: 3.2
        },
        orderSummary: {
          total: 425,
          processed: 398,
          fulfilled: 387,
          fulfillmentRate: 91.06
        },
        performance: {
          shippingAccuracy: 99.4,
          inventoryAccuracy: 98.7,
          onTimeDelivery: 97.2,
          returnRate: 2.3,
          customerSatisfaction: 4.8
        }
      }
    }
  });
  
  // Fetch shipping performance data
  const { data: shippingData, isLoading: shippingLoading } = useQuery({
    queryKey: ['/api/analytics/shipping-performance', selectedClient, dateRange],
    enabled: !!selectedClient && !!dateRange[0] && !!dateRange[1],
    queryFn: async () => {
      const startDate = dateRange[0]?.toISOString();
      const endDate = dateRange[1]?.toISOString();
      const response = await fetch(
        `/api/analytics/shipping-performance?clientId=${selectedClient}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch shipping performance');
      }
      return response.json();
    },
    placeholderData: {
      data: {
        totalShipments: 120,
        byCarrier: {
          'FedEx': 45,
          'UPS': 35,
          'USPS': 25,
          'DHL': 15
        },
        byStatus: {
          'processing': 10,
          'shipped': 12,
          'in-transit': 20,
          'delivered': 78
        },
        deliveryPerformance: {
          averageDeliveryTime: 2.7,
          minimumTime: 1,
          maximumTime: 5
        }
      }
    }
  });
  
  // Fetch inventory report data
  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/analytics/inventory-report', selectedClient],
    enabled: !!selectedClient,
    queryFn: async () => {
      const response = await fetch(`/api/analytics/inventory-report?clientId=${selectedClient}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory report');
      }
      return response.json();
    },
    placeholderData: {
      data: {
        totalUniqueItems: 320,
        totalQuantity: 8750,
        inventoryHealth: {
          lowStock: 12,
          optimal: 250,
          overstock: 58
        },
        byLocation: {
          'Warehouse A': 3500,
          'Warehouse B': 2800,
          'Warehouse C': 1450,
          'Warehouse D': 1000
        }
      }
    }
  });
  
  // Transform data for charts
  const orderTrendsData = [
    { date: '2025-01-01', received: 45, processed: 40, fulfilled: 38 },
    { date: '2025-01-02', received: 52, processed: 48, fulfilled: 45 },
    { date: '2025-01-03', received: 49, processed: 46, fulfilled: 44 },
    { date: '2025-01-04', received: 63, processed: 60, fulfilled: 58 },
    { date: '2025-01-05', received: 58, processed: 55, fulfilled: 53 },
    { date: '2025-01-06', received: 48, processed: 45, fulfilled: 44 },
    { date: '2025-01-07', received: 42, processed: 40, fulfilled: 39 },
    { date: '2025-01-08', received: 53, processed: 51, fulfilled: 49 },
    { date: '2025-01-09', received: 59, processed: 56, fulfilled: 54 },
    { date: '2025-01-10', received: 66, processed: 63, fulfilled: 61 },
  ].map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd')
  }));

  const carrierPerformanceData = shippingData?.data?.byCarrier 
    ? Object.entries(shippingData.data.byCarrier).map(([name, value]) => ({ name, value })) 
    : [];
    
  const shipmentStatusData = shippingData?.data?.byStatus 
    ? Object.entries(shippingData.data.byStatus).map(([name, value]) => ({ name, value })) 
    : [];
  
  const inventoryHealthData = inventoryData?.data?.inventoryHealth 
    ? [
        { name: 'Low Stock', value: inventoryData.data.inventoryHealth.lowStock },
        { name: 'Optimal', value: inventoryData.data.inventoryHealth.optimal },
        { name: 'Overstock', value: inventoryData.data.inventoryHealth.overstock }
      ] 
    : [];
  
  const warehouseDistributionData = inventoryData?.data?.byLocation 
    ? Object.entries(inventoryData.data.byLocation).map(([name, value]) => ({ name, value })) 
    : [];
  
  // Performance KPI data
  const kpiData = summaryData?.data?.performance
    ? [
        { name: 'Shipping Accuracy', value: summaryData.data.performance.shippingAccuracy },
        { name: 'Inventory Accuracy', value: summaryData.data.performance.inventoryAccuracy },
        { name: 'On-Time Delivery', value: summaryData.data.performance.onTimeDelivery },
        { name: 'Return Rate', value: summaryData.data.performance.returnRate },
        { name: 'Customer Satisfaction', value: summaryData.data.performance.customerSatisfaction * 20 } // Scale 1-5 to percentage
      ]
    : [];
  
  // Define structured data for analytics page
  const analyticsStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TSG Fulfillment Analytics Dashboard",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web-based",
    "description": "Comprehensive logistics analytics and reporting dashboard for monitoring shipment performance, inventory management, and fulfillment operations.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <AnalyticsLayout title="Analytics Dashboard">
      <Seo
        title="Logistics Analytics Dashboard | TSG Fulfillment"
        description="Comprehensive analytics and reporting platform for monitoring and optimizing your logistics and fulfillment operations with TSG Fulfillment."
        keywords="logistics analytics, fulfillment reporting, shipment tracking, inventory management, supply chain metrics, performance dashboard"
        canonical="https://tsgfulfillment.com/analytics"
        ogType="website" 
        ogUrl="https://tsgfulfillment.com/analytics"
        ogImage="https://tsgfulfillment.com/images/analytics-dashboard.jpg"
        twitterCard="summary_large_image"
        twitterTitle="Logistics Analytics Dashboard | TSG Fulfillment"
        twitterDescription="Monitor and optimize your logistics operations with our comprehensive analytics dashboard."
        structuredData={analyticsStructuredData}
      />
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and reporting for logistics performance with real-time insights across all your fulfillment operations</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Our advanced analytics platform helps you track key metrics, identify trends, and optimize your supply chain operations for maximum efficiency and customer satisfaction. Monitor inventory levels, shipment performance, order processing, and more from a single intuitive dashboard.</p>
          </div>
        </header>
      
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Select value={selectedClient?.toString()} onValueChange={(value) => setSelectedClient(parseInt(value))}>
            <SelectTrigger className="w-full md:w-[240px]">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {CLIENTS.map(client => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <DatePicker
              selectsRange={true}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
              className="p-2 border rounded"
              dateFormat="MMM dd, yyyy"
              customInput={
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange[0] 
                    ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${dateRange[1] ? format(dateRange[1], 'MMM dd, yyyy') : 'Select...'}`
                    : 'Select Date Range'}
                </Button>
              }
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Link href="/analytics/dashboard">
            <Button variant="outline">
              <BarChart2 className="h-4 w-4 mr-2" /> Custom Dashboard
            </Button>
          </Link>
          <Link href="/analytics/comparison">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" /> Performance Comparison
            </Button>
          </Link>
          <Link href="/analytics/reports">
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <FileText className="h-4 w-4 mr-2" /> Generate Report
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 md:w-[500px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Orders"
              value={summaryData?.data?.orderSummary?.total || 0}
              changePercent={8.2}
              icon={<Package size={24} />}
              color={COLORS.primary}
            />
            <KpiCard 
              title="Order Fulfillment Rate"
              value={summaryData?.data?.orderSummary?.fulfillmentRate || 0}
              changePercent={1.5}
              icon={<Package size={24} />}
              color={COLORS.secondary}
              isPercentage
            />
            <KpiCard 
              title="Total Shipments"
              value={summaryData?.data?.shipmentSummary?.total || 0}
              changePercent={5.7}
              icon={<Truck size={24} />}
              color={COLORS.tertiary}
            />
            <KpiCard 
              title="Completion Rate"
              value={summaryData?.data?.shipmentSummary?.completionRate || 0}
              changePercent={-0.8}
              icon={<Truck size={24} />}
              color={COLORS.quaternary}
              isPercentage
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartWidget 
              title="Order Trends" 
              data={orderTrendsData} 
              dataKeys={['received', 'processed', 'fulfilled']}
              colors={[COLORS.primary, COLORS.secondary, COLORS.tertiary]}
            />
            <PieChartWidget 
              title="Inventory Health" 
              data={inventoryHealthData} 
              dataKey="value" 
              nameKey="name"
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartWidget 
              title="Warehouse Distribution" 
              data={warehouseDistributionData} 
              dataKeys={['value']}
            />
            <PieChartWidget 
              title="Carrier Performance" 
              data={carrierPerformanceData} 
              dataKey="value" 
              nameKey="name"
            />
          </div>
        </TabsContent>
        
        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Shipments"
              value={shippingData?.data?.totalShipments || 0}
              icon={<Truck size={24} />}
              color={COLORS.primary}
            />
            <KpiCard 
              title="Average Delivery Time"
              value={`${shippingData?.data?.deliveryPerformance?.averageDeliveryTime || 0} days`}
              icon={<Clock size={24} />}
              color={COLORS.secondary}
            />
            <KpiCard 
              title="Delivered Shipments"
              value={shippingData?.data?.byStatus?.delivered || 0}
              icon={<Package size={24} />}
              color={COLORS.tertiary}
            />
            <KpiCard 
              title="In Progress Shipments"
              value={(shippingData?.data?.totalShipments || 0) - (shippingData?.data?.byStatus?.delivered || 0)}
              icon={<Package size={24} />}
              color={COLORS.quaternary}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartWidget 
              title="Shipment Status Distribution" 
              data={shipmentStatusData} 
              dataKey="value" 
              nameKey="name"
            />
            <PieChartWidget 
              title="Carrier Distribution" 
              data={carrierPerformanceData} 
              dataKey="value" 
              nameKey="name"
            />
          </div>
          
          <Card className="p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Shipments</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ship Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">TRK-{1000 + index}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {['FedEx', 'UPS', 'USPS', 'DHL'][index % 4]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(subDays(new Date(), index + 1), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          index === 0 ? 'bg-blue-100 text-blue-800' : 
                          index === 1 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {index === 0 ? 'Processing' : index === 1 ? 'In Transit' : 'Delivered'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'][index]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard 
              title="Total Products"
              value={inventoryData?.data?.totalUniqueItems || 0}
              icon={<Package size={24} />}
              color={COLORS.primary}
            />
            <KpiCard 
              title="Total Quantity"
              value={inventoryData?.data?.totalQuantity || 0}
              icon={<Package size={24} />}
              color={COLORS.secondary}
            />
            <KpiCard 
              title="Low Stock Items"
              value={inventoryData?.data?.inventoryHealth?.lowStock || 0}
              icon={<Package size={24} />}
              color={COLORS.quaternary}
            />
            <KpiCard 
              title="Overstock Items"
              value={inventoryData?.data?.inventoryHealth?.overstock || 0}
              icon={<Package size={24} />}
              color={COLORS.tertiary}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartWidget 
              title="Inventory Health Distribution" 
              data={inventoryHealthData} 
              dataKey="value" 
              nameKey="name"
            />
            <BarChartWidget 
              title="Warehouse Inventory Distribution" 
              data={warehouseDistributionData} 
              dataKeys={['value']}
            />
          </div>
          
          <Card className="p-4 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Low Stock Alert</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[...Array(5)].map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PRD-{2000 + index}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {['Premium Widget', 'Standard Gadget', 'Deluxe Device', 'Economy Item', 'Ultra Component'][index]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {[3, 5, 2, 4, 1][index]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        10
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse A', 'Warehouse D'][index]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          index === 4 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {index === 4 ? 'Critical' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard 
              title="Shipping Accuracy"
              value={summaryData?.data?.performance?.shippingAccuracy || 0}
              icon={<Truck size={24} />}
              color={COLORS.primary}
              isPercentage
            />
            <KpiCard 
              title="Inventory Accuracy"
              value={summaryData?.data?.performance?.inventoryAccuracy || 0}
              icon={<Package size={24} />}
              color={COLORS.secondary}
              isPercentage
            />
            <KpiCard 
              title="On-Time Delivery"
              value={summaryData?.data?.performance?.onTimeDelivery || 0}
              icon={<Clock size={24} />}
              color={COLORS.tertiary}
              isPercentage
            />
            <KpiCard 
              title="Return Rate"
              value={summaryData?.data?.performance?.returnRate || 0}
              icon={<Package size={24} />}
              color={COLORS.quaternary}
              isPercentage
            />
            <KpiCard 
              title="Customer Satisfaction"
              value={summaryData?.data?.performance?.customerSatisfaction || 0}
              icon={<Package size={24} />}
              color={COLORS.quinary}
            />
            <KpiCard 
              title="Average Order Value"
              value={285.75}
              icon={<DollarSign size={24} />}
              color={COLORS.primary}
              isCurrency
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <BarChartWidget 
              title="KPI Performance"
              data={kpiData}
              dataKeys={['value']}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartWidget 
              title="Delivery Performance Trend" 
              data={[
                { date: 'Week 1', onTime: 96.5, accuracy: 98.2 },
                { date: 'Week 2', onTime: 97.1, accuracy: 98.5 },
                { date: 'Week 3', onTime: 96.8, accuracy: 99.0 },
                { date: 'Week 4', onTime: 97.2, accuracy: 99.4 },
              ]} 
              dataKeys={['onTime', 'accuracy']}
            />
            <LineChartWidget 
              title="Return Rate Trend" 
              data={[
                { date: 'Week 1', rate: 2.8 },
                { date: 'Week 2', rate: 2.5 },
                { date: 'Week 3', rate: 2.4 },
                { date: 'Week 4', rate: 2.3 },
              ]} 
              dataKeys={['rate']}
              colors={[COLORS.quaternary]}
            />
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AnalyticsLayout>
  );
};

export default AnalyticsPage;