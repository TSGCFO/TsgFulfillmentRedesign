import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, subMonths } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  ArrowRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart2,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  Package,
  Truck,
  DollarSign
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import AnalyticsLayout from '@/components/analytics/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Define colors
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
  periodA: '#0056B3',
  periodB: '#DC3545',
};

// Mock client data
const CLIENTS = [
  { id: 1, name: 'ABC Corporation' },
  { id: 2, name: 'XYZ Inc.' },
  { id: 3, name: 'Global Enterprises' },
  { id: 4, name: 'Tech Solutions' },
  { id: 5, name: 'E-commerce Giant' },
];

// Predefined date ranges
const PERIOD_PRESETS = [
  { id: 'last7days', name: 'Last 7 Days', days: 7 },
  { id: 'last30days', name: 'Last 30 Days', days: 30 },
  { id: 'last90days', name: 'Last 90 Days', days: 90 },
  { id: 'lastMonth', name: 'Last Month', months: 1 },
  { id: 'last3months', name: 'Last 3 Months', months: 3 },
  { id: 'last6months', name: 'Last 6 Months', months: 6 },
  { id: 'ytd', name: 'Year to Date', ytd: true },
  { id: 'custom', name: 'Custom Range', custom: true },
];

interface ComparisonMetric {
  key: string;
  name: string;
  periodA: number;
  periodB: number;
  change: number;
  changePercentage: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface ComparisonSummary {
  title: string;
  metrics: ComparisonMetric[];
}

const PerformanceComparison: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<string>('shipments');
  
  // Period A (earlier period)
  const [periodAPreset, setPeriodAPreset] = useState<string>('last30days');
  const [periodARange, setPeriodARange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 60),
    subDays(new Date(), 31)
  ]);
  
  // Period B (later period)
  const [periodBPreset, setPeriodBPreset] = useState<string>('last7days');
  const [periodBRange, setPeriodBRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  
  const [isCustomA, setIsCustomA] = useState<boolean>(false);
  const [isCustomB, setIsCustomB] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle period preset change
  const handlePeriodPresetChange = (preset: string, isPeriodA: boolean) => {
    const currentDate = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    const presetObj = PERIOD_PRESETS.find(p => p.id === preset);
    if (!presetObj) return;
    
    if (presetObj.custom) {
      if (isPeriodA) {
        setIsCustomA(true);
      } else {
        setIsCustomB(true);
      }
      return;
    }
    
    if (isPeriodA) {
      setIsCustomA(false);
    } else {
      setIsCustomB(false);
    }
    
    if (presetObj.days) {
      if (isPeriodA) {
        // For period A, set to the period before period B
        const periodBStart = periodBRange[0] || currentDate;
        endDate = subDays(periodBStart, 1);
        startDate = subDays(endDate, presetObj.days - 1);
      } else {
        endDate = currentDate;
        startDate = subDays(currentDate, presetObj.days - 1);
      }
    } else if (presetObj.months) {
      if (isPeriodA) {
        const periodBStart = periodBRange[0] || currentDate;
        endDate = subDays(periodBStart, 1);
        startDate = subMonths(endDate, presetObj.months);
      } else {
        endDate = currentDate;
        startDate = subMonths(currentDate, presetObj.months);
      }
    } else if (presetObj.ytd) {
      endDate = currentDate;
      startDate = new Date(currentDate.getFullYear(), 0, 1); // January 1st of current year
    }
    
    if (isPeriodA) {
      setPeriodAPreset(preset);
      setPeriodARange([startDate, endDate]);
    } else {
      setPeriodBPreset(preset);
      setPeriodBRange([startDate, endDate]);
    }
  };

  // Fetch comparison data
  const { data: comparisonData, isLoading: dataLoading } = useQuery({
    queryKey: ['/api/analytics/comparison', selectedClient, periodARange, periodBRange, activeTab],
    enabled: !!selectedClient && !!periodARange[0] && !!periodARange[1] && !!periodBRange[0] && !!periodBRange[1],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const periodAStart = periodARange[0]?.toISOString();
        const periodAEnd = periodARange[1]?.toISOString();
        const periodBStart = periodBRange[0]?.toISOString();
        const periodBEnd = periodBRange[1]?.toISOString();
        
        const response = await fetch(
          `/api/analytics/comparison?clientId=${selectedClient}&periodAStart=${periodAStart}&periodAEnd=${periodAEnd}&periodBStart=${periodBStart}&periodBEnd=${periodBEnd}&metric=${activeTab}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch comparison data');
        }
        
        return response.json();
      } finally {
        setIsLoading(false);
      }
    },
    placeholderData: {
      data: {
        summaries: [
          {
            title: 'Shipment Performance',
            metrics: [
              {
                key: 'totalShipments',
                name: 'Total Shipments',
                periodA: 245,
                periodB: 312,
                change: 67,
                changePercentage: 27.35,
                trend: 'up'
              },
              {
                key: 'averageDeliveryTime',
                name: 'Avg. Delivery Time',
                periodA: 3.8,
                periodB: 2.9,
                change: -0.9,
                changePercentage: -23.68,
                unit: 'days',
                trend: 'down'
              },
              {
                key: 'onTimeDelivery',
                name: 'On-Time Delivery',
                periodA: 92.1,
                periodB: 95.7,
                change: 3.6,
                changePercentage: 3.91,
                unit: '%',
                trend: 'up'
              },
              {
                key: 'shippingAccuracy',
                name: 'Shipping Accuracy',
                periodA: 98.2,
                periodB: 99.1,
                change: 0.9,
                changePercentage: 0.92,
                unit: '%',
                trend: 'up'
              },
              {
                key: 'averageShippingCost',
                name: 'Avg. Shipping Cost',
                periodA: 24.75,
                periodB: 22.18,
                change: -2.57,
                changePercentage: -10.38,
                unit: '$',
                trend: 'down'
              }
            ]
          },
          {
            title: 'Inventory Management',
            metrics: [
              {
                key: 'stockLevels',
                name: 'Avg. Stock Levels',
                periodA: 5280,
                periodB: 6120,
                change: 840,
                changePercentage: 15.91,
                trend: 'up'
              },
              {
                key: 'stockTurnover',
                name: 'Stock Turnover Rate',
                periodA: 4.2,
                periodB: 4.8,
                change: 0.6,
                changePercentage: 14.29,
                trend: 'up'
              },
              {
                key: 'lowStockOccurrences',
                name: 'Low Stock Occurrences',
                periodA: 18,
                periodB: 12,
                change: -6,
                changePercentage: -33.33,
                trend: 'down'
              },
              {
                key: 'inventoryAccuracy',
                name: 'Inventory Accuracy',
                periodA: 96.8,
                periodB: 98.2,
                change: 1.4,
                changePercentage: 1.45,
                unit: '%',
                trend: 'up'
              }
            ]
          },
          {
            title: 'Order Processing',
            metrics: [
              {
                key: 'totalOrders',
                name: 'Total Orders',
                periodA: 318,
                periodB: 402,
                change: 84,
                changePercentage: 26.42,
                trend: 'up'
              },
              {
                key: 'processingTime',
                name: 'Avg. Processing Time',
                periodA: 1.6,
                periodB: 1.2,
                change: -0.4,
                changePercentage: -25.0,
                unit: 'days',
                trend: 'down'
              },
              {
                key: 'fulfillmentRate',
                name: 'Fulfillment Rate',
                periodA: 94.3,
                periodB: 96.8,
                change: 2.5,
                changePercentage: 2.65,
                unit: '%',
                trend: 'up'
              },
              {
                key: 'returnRate',
                name: 'Return Rate',
                periodA: 4.8,
                periodB: 3.2,
                change: -1.6,
                changePercentage: -33.33,
                unit: '%',
                trend: 'down'
              },
              {
                key: 'averageOrderValue',
                name: 'Avg. Order Value',
                periodA: 287.35,
                periodB: 312.48,
                change: 25.13,
                changePercentage: 8.75,
                unit: '$',
                trend: 'up'
              }
            ]
          }
        ],
        charts: {
          dailyMetrics: [
            { date: '2025-03-15', periodA: 12, periodB: 18 },
            { date: '2025-03-16', periodA: 15, periodB: 20 },
            { date: '2025-03-17', periodA: 13, periodB: 22 },
            { date: '2025-03-18', periodA: 17, periodB: 19 },
            { date: '2025-03-19', periodA: 14, periodB: 23 },
            { date: '2025-03-20', periodA: 16, periodB: 25 },
            { date: '2025-03-21', periodA: 19, periodB: 21 }
          ]
        }
      }
    }
  });

  // Render trend icon based on trend direction
  const renderTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format numeric values with units
  const formatValue = (value: number, unit?: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === '$') {
      return `$${value.toFixed(2)}`;
    } else if (unit === 'days') {
      return `${value.toFixed(1)} days`;
    }
    return value.toLocaleString();
  };

  return (
    <AnalyticsLayout title="Performance Comparison">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Performance Comparison</h1>
          <p className="text-gray-600">Compare key metrics across different time periods to identify trends and improvements</p>
        </header>

        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Client Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Client</h3>
              <Select 
                value={selectedClient?.toString()} 
                onValueChange={(value) => setSelectedClient(parseInt(value))}
              >
                <SelectTrigger className="w-full">
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
            
            {/* Period A Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Period A (Earlier)</h3>
              <div className="space-y-2">
                <Select 
                  value={periodAPreset} 
                  onValueChange={(value) => handlePeriodPresetChange(value, true)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_PRESETS.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isCustomA && (
                  <div className="pt-2">
                    <DatePicker
                      selectsRange={true}
                      startDate={periodARange[0]}
                      endDate={periodARange[1]}
                      onChange={(update: [Date | null, Date | null]) => setPeriodARange(update)}
                      dateFormat="MMM dd, yyyy"
                      customInput={
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          {periodARange[0] 
                            ? `${format(periodARange[0], 'MMM dd, yyyy')} - ${periodARange[1] ? format(periodARange[1], 'MMM dd, yyyy') : 'Select...'}`
                            : 'Select Custom Range'}
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Period B Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Period B (Later)</h3>
              <div className="space-y-2">
                <Select 
                  value={periodBPreset} 
                  onValueChange={(value) => handlePeriodPresetChange(value, false)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_PRESETS.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isCustomB && (
                  <div className="pt-2">
                    <DatePicker
                      selectsRange={true}
                      startDate={periodBRange[0]}
                      endDate={periodBRange[1]}
                      onChange={(update: [Date | null, Date | null]) => setPeriodBRange(update)}
                      dateFormat="MMM dd, yyyy"
                      customInput={
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          {periodBRange[0] 
                            ? `${format(periodBRange[0], 'MMM dd, yyyy')} - ${periodBRange[1] ? format(periodBRange[1], 'MMM dd, yyyy') : 'Select...'}`
                            : 'Select Custom Range'}
                        </Button>
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs for different metric categories */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 max-w-md">
                <TabsTrigger value="shipments">
                  <Truck className="h-4 w-4 mr-2" />
                  Shipments
                </TabsTrigger>
                <TabsTrigger value="inventory">
                  <Package className="h-4 w-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <Clock className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>
        
        {/* Comparison Results */}
        {dataLoading || isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Comparison summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData?.data?.summaries
                .find(summary => 
                  (activeTab === 'shipments' && summary.title === 'Shipment Performance') ||
                  (activeTab === 'inventory' && summary.title === 'Inventory Management') ||
                  (activeTab === 'orders' && summary.title === 'Order Processing')
                )
                ?.metrics.slice(0, 6).map((metric) => (
                <Card key={metric.key} className="p-4">
                  <div className="flex justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
                    {renderTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Period A</p>
                      <p className="text-lg font-bold">{formatValue(metric.periodA, metric.unit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Period B</p>
                      <p className="text-lg font-bold">{formatValue(metric.periodB, metric.unit)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${metric.trend === 'up' ? 'bg-green-500' : metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'}`}
                        style={{ width: `${Math.min(Math.abs(metric.changePercentage) * 2, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 
                      'text-gray-500'
                    }`}>
                      {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Detailed comparison charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Daily Comparison</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={comparisonData?.data?.charts.dailyMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                        formatter={(value, name) => [value, name === 'periodA' ? 'Period A' : 'Period B']}
                      />
                      <Legend formatter={(value) => value === 'periodA' ? 'Period A' : 'Period B'} />
                      <Line 
                        type="monotone" 
                        dataKey="periodA" 
                        stroke={COLORS.periodA} 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="periodB" 
                        stroke={COLORS.periodB} 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Percentage Change by Metric</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={comparisonData?.data?.summaries
                        .find(summary => 
                          (activeTab === 'shipments' && summary.title === 'Shipment Performance') ||
                          (activeTab === 'inventory' && summary.title === 'Inventory Management') ||
                          (activeTab === 'orders' && summary.title === 'Order Processing')
                        )
                        ?.metrics.map(metric => ({
                          name: metric.name,
                          change: metric.changePercentage
                        }))
                      }
                      layout="vertical"
                      margin={{ left: 120 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[-40, 40]} />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Bar 
                        dataKey="change" 
                        fill={(entry: any) => entry.change >= 0 ? COLORS.secondary : COLORS.quaternary}
                        radius={[4, 4, 4, 4]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            
            {/* Detailed metrics table */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Detailed Metrics Comparison</h2>
              
              <Accordion type="single" collapsible defaultValue="item-0">
                {comparisonData?.data?.summaries.map((summary, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-base font-medium">
                      {summary.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metric
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period A
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                % Change
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trend
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {summary.metrics.map((metric) => (
                              <tr key={metric.key}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {metric.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatValue(metric.periodA, metric.unit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatValue(metric.periodB, metric.unit)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {metric.change >= 0 ? '+' : ''}{formatValue(metric.change, metric.unit)}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                  metric.trend === 'up' ? 'text-green-500' : 
                                  metric.trend === 'down' ? 'text-red-500' : 
                                  'text-gray-500'
                                }`}>
                                  {metric.changePercentage >= 0 ? '+' : ''}{metric.changePercentage.toFixed(1)}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    {renderTrendIcon(metric.trend)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
            
            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Share Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </AnalyticsLayout>
  );
};

export default PerformanceComparison;