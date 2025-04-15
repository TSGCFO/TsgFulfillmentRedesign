import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, subMonths } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'wouter';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
  ChevronDown, ChevronUp, Calendar, 
  TrendingUp, FileText, Share2
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import AnalyticsLayout from '@/components/analytics/Layout';

// Analytics colors
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
  periodA: '#0056B3',
  periodB: '#28A745',
};

// Mock client data
const CLIENTS = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Inc.' },
  { id: 3, name: 'Global Enterprises' },
  { id: 4, name: 'Tech Solutions' },
  { id: 5, name: 'E-commerce Giant' },
];

const METRICS = [
  { key: 'totalShipments', name: 'Total Shipments', category: 'shipment' },
  { key: 'onTimeDelivery', name: 'On-Time Delivery', category: 'shipment' },
  { key: 'shippingAccuracy', name: 'Shipping Accuracy', category: 'shipment' },
  { key: 'stockTurnover', name: 'Stock Turnover Rate', category: 'inventory' },
  { key: 'inventoryAccuracy', name: 'Inventory Accuracy', category: 'inventory' },
  { key: 'lowStockOccurrences', name: 'Low Stock Occurrences', category: 'inventory' },
  { key: 'totalOrders', name: 'Total Orders', category: 'order' },
  { key: 'fulfillmentRate', name: 'Fulfillment Rate', category: 'order' },
  { key: 'processingTime', name: 'Processing Time', category: 'order' },
  { key: 'returnRate', name: 'Return Rate', category: 'order' },
];

const MetricSummary: React.FC<{ 
  title: string;
  metrics: any[];
  category: string;
}> = ({ title, metrics, category }) => {
  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {metrics.filter(metric => metric.key === category || !category).map((metric) => (
          <div key={metric.key} className="grid grid-cols-3 md:grid-cols-6 gap-2 items-center border-b pb-3">
            <div className="col-span-3 md:col-span-2 font-medium">{metric.name}</div>
            <div className="text-gray-700 text-center">{metric.periodA.toLocaleString()}{metric.unit ? metric.unit : ''}</div>
            <div className="text-gray-700 text-center">{metric.periodB.toLocaleString()}{metric.unit ? metric.unit : ''}</div>
            <div className={`text-center font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change > 0 ? '+' : ''}{metric.change.toLocaleString()}{metric.unit ? metric.unit : ''}
            </div>
            <div className="flex items-center justify-center">
              <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center ${
                metric.trend === 'up' 
                  ? metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                  : metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                {metric.trend === 'up' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const ComparisonChart: React.FC<{
  data: any[];
  dataKey: string;
  title: string;
}> = ({ data, dataKey, title }) => {
  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(entry) => entry}
            />
            <YAxis />
            <Tooltip formatter={(value) => [value.toFixed(1), dataKey]} />
            <Legend />
            <Bar 
              name="Period A" 
              dataKey="periodA" 
              fill={COLORS.periodA}
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Period B" 
              dataKey="periodB" 
              fill={COLORS.periodB}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

const MetricOverviewCard: React.FC<{
  summary: any;
  index: number;
}> = ({ summary, index }) => {
  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-2">{summary.title}</h3>
      <div className="space-y-3">
        {summary.metrics.map((metric) => (
          <div key={metric.key} className="grid grid-cols-12 items-center">
            <div className="col-span-4 text-sm font-medium">{metric.name}</div>
            <div className="col-span-8">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                </span>
                <span className={`text-xs ${
                  metric.trend === 'up' 
                    ? metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                      ? 'text-red-600'
                      : 'text-green-600'
                    : metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                      ? 'text-green-600'
                      : 'text-red-600'
                }`}>
                  {metric.periodA} → {metric.periodB}{metric.unit || ''}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${Math.min(Math.abs(metric.changePercentage) * 2, 100)}%`,
                    backgroundColor: metric.trend === 'up' 
                      ? metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                        ? COLORS.quaternary
                        : COLORS.secondary
                      : metric.key === 'lowStockOccurrences' || metric.key === 'returnRate' || metric.key === 'processingTime'
                        ? COLORS.secondary
                        : COLORS.quaternary
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const PerformanceComparison: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<number>(1);
  const [selectedMetric, setSelectedMetric] = useState<string>('totalShipments');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Date periods for comparison
  const [periodA, setPeriodA] = useState<[Date | null, Date | null]>([
    subMonths(new Date(), 2),
    subMonths(new Date(), 1)
  ]);
  
  const [periodB, setPeriodB] = useState<[Date | null, Date | null]>([
    subMonths(new Date(), 1),
    new Date()
  ]);

  // Fetch comparison data
  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['/api/analytics/comparison', selectedClient, periodA, periodB, selectedMetric],
    enabled: !!selectedClient && !!periodA[0] && !!periodA[1] && !!periodB[0] && !!periodB[1],
    queryFn: async () => {
      const periodAStart = periodA[0]?.toISOString();
      const periodAEnd = periodA[1]?.toISOString(); 
      const periodBStart = periodB[0]?.toISOString();
      const periodBEnd = periodB[1]?.toISOString();
      
      const response = await fetch(
        `/api/analytics/comparison?clientId=${selectedClient}&periodAStart=${periodAStart}&periodAEnd=${periodAEnd}&periodBStart=${periodBStart}&periodBEnd=${periodBEnd}&metric=${selectedMetric}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      return response.json();
    }
  });

  // Format period labels
  const formatPeriodLabel = (start: Date | null, end: Date | null) => {
    if (!start || !end) return 'Select dates';
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <AnalyticsLayout title="Performance Comparison">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Performance Comparison</h1>
              <p className="text-gray-600">Compare key metrics between different time periods</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Back to Analytics
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <Select value={selectedClient.toString()} onValueChange={(value) => setSelectedClient(parseInt(value))}>
              <SelectTrigger>
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue placeholder="Select Metric" />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period A</label>
            <DatePicker
              selectsRange={true}
              startDate={periodA[0]}
              endDate={periodA[1]}
              onChange={(update: [Date | null, Date | null]) => setPeriodA(update)}
              className="p-2 border rounded w-full"
              customInput={
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatPeriodLabel(periodA[0], periodA[1])}
                </Button>
              }
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period B</label>
            <DatePicker
              selectsRange={true}
              startDate={periodB[0]}
              endDate={periodB[1]}
              onChange={(update: [Date | null, Date | null]) => setPeriodB(update)}
              className="p-2 border rounded w-full"
              customInput={
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatPeriodLabel(periodB[0], periodB[1])}
                </Button>
              }
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="shipment">Shipment</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {comparisonData?.data?.summaries.map((summary: any, index: number) => (
                    <MetricOverviewCard key={index} summary={summary} index={index} />
                  ))}
                </div>
                
                <ComparisonChart 
                  data={comparisonData?.data?.charts?.dailyMetrics || []} 
                  dataKey={selectedMetric}
                  title={`Daily ${METRICS.find(m => m.key === selectedMetric)?.name || 'Metric'} Comparison`}
                />
              </TabsContent>

              <TabsContent value="shipment" className="space-y-6">
                {comparisonData?.data?.summaries.filter((summary: any) => 
                  summary.title === 'Shipment Performance'
                ).map((summary: any) => (
                  <MetricSummary 
                    key={summary.title} 
                    title={summary.title} 
                    metrics={summary.metrics} 
                    category="shipment"
                  />
                ))}
                
                <ComparisonChart 
                  data={comparisonData?.data?.charts?.dailyMetrics || []} 
                  dataKey={selectedMetric}
                  title="Shipment Performance Comparison"
                />
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                {comparisonData?.data?.summaries.filter((summary: any) => 
                  summary.title === 'Inventory Management'
                ).map((summary: any) => (
                  <MetricSummary 
                    key={summary.title} 
                    title={summary.title} 
                    metrics={summary.metrics} 
                    category="inventory"
                  />
                ))}
                
                <ComparisonChart 
                  data={comparisonData?.data?.charts?.dailyMetrics || []} 
                  dataKey={selectedMetric}
                  title="Inventory Management Comparison"
                />
              </TabsContent>

              <TabsContent value="orders" className="space-y-6">
                {comparisonData?.data?.summaries.filter((summary: any) => 
                  summary.title === 'Order Processing'
                ).map((summary: any) => (
                  <MetricSummary 
                    key={summary.title} 
                    title={summary.title} 
                    metrics={summary.metrics} 
                    category="order"
                  />
                ))}
                
                <ComparisonChart 
                  data={comparisonData?.data?.charts?.dailyMetrics || []} 
                  dataKey={selectedMetric}
                  title="Order Processing Comparison"
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AnalyticsLayout>
  );
};

export default PerformanceComparison;