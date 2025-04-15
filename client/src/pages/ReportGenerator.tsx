import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'wouter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';
import {
  Calendar, ChevronDown, ChevronUp, FileText, 
  DownloadCloud, ShieldCheck, AlertTriangle, TrendingUp,
  ArrowRight, Truck, Package, Settings, Clipboard, Filter
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import AnalyticsLayout from '@/components/analytics/Layout';

// Analytics colors
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

// Report types
const REPORT_TYPES = [
  { id: 'inventory', name: 'Inventory Status', icon: <Package size={18} /> },
  { id: 'shipment', name: 'Shipment Performance', icon: <Truck size={18} /> },
  { id: 'order', name: 'Order Processing', icon: <Clipboard size={18} /> },
  { id: 'performance', name: 'KPI Performance', icon: <TrendingUp size={18} /> }
];

// Summary Card Component
const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}> = ({ title, value, icon, color, description }) => {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="rounded-full p-2" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </Card>
  );
};

// Alert Card Component
const AlertCard: React.FC<{
  title: string;
  alerts: number;
  severity: 'critical' | 'warning' | 'info';
  items: string[];
}> = ({ title, alerts, severity, items }) => {
  const colors = {
    critical: { bg: 'bg-red-50', text: 'text-red-800', icon: COLORS.quaternary },
    warning: { bg: 'bg-yellow-50', text: 'text-yellow-800', icon: COLORS.tertiary },
    info: { bg: 'bg-blue-50', text: 'text-blue-800', icon: COLORS.primary },
  };
  
  return (
    <Card className={`p-4 shadow-sm ${colors[severity].bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`text-sm font-medium ${colors[severity].text}`}>{title}</p>
          <p className="text-2xl font-bold mt-1">{alerts}</p>
        </div>
        <div className="rounded-full p-2 bg-white/50">
          <AlertTriangle size={20} style={{ color: colors[severity].icon }} />
        </div>
      </div>
      <div className="space-y-1 mt-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center text-sm">
            <div className="w-1 h-1 rounded-full mr-2" style={{ backgroundColor: colors[severity].icon }}></div>
            <p className={`${colors[severity].text} text-xs`}>{item}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className={`${colors[severity].text} text-xs`}>No alerts at this time</p>
        )}
      </div>
    </Card>
  );
};

// Recommendation Card Component
const RecommendationCard: React.FC<{
  title: string;
  recommendations: number;
  items: string[];
}> = ({ title, recommendations, items }) => {
  return (
    <Card className="p-4 shadow-sm bg-green-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-green-800">{title}</p>
          <p className="text-2xl font-bold mt-1">{recommendations}</p>
        </div>
        <div className="rounded-full p-2 bg-white/50">
          <ShieldCheck size={20} style={{ color: COLORS.secondary }} />
        </div>
      </div>
      <div className="space-y-1 mt-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center text-sm">
            <div className="w-1 h-1 rounded-full bg-green-600 mr-2"></div>
            <p className="text-green-800 text-xs">{item}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-green-800 text-xs">No recommendations at this time</p>
        )}
      </div>
    </Card>
  );
};

// Chart Component
const ReportChart: React.FC<{
  type: string;
  data: any[];
  title: string;
}> = ({ type, data, title }) => {
  const renderChart = () => {
    switch (type) {
      case 'inventory':
        return (
          <PieChart width={500} height={300}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={[COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary][index % 4]} 
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      
      case 'shipment':
        return (
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="delivered" stroke={COLORS.secondary} />
            <Line type="monotone" dataKey="shipped" stroke={COLORS.primary} />
            <Line type="monotone" dataKey="processing" stroke={COLORS.tertiary} />
          </LineChart>
        );
      
      case 'order':
        return (
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="received" fill={COLORS.primary} />
            <Bar dataKey="processed" fill={COLORS.secondary} />
            <Bar dataKey="fulfilled" fill={COLORS.tertiary} />
          </BarChart>
        );
      
      case 'performance':
        return (
          <ComposedChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS.primary} />
            <Line type="monotone" dataKey="target" stroke={COLORS.quaternary} />
            <Area type="monotone" dataKey="average" fill={COLORS.quinary + "40"} stroke={COLORS.quinary} />
          </ComposedChart>
        );
      
      default:
        return (
          <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={COLORS.primary} />
          </BarChart>
        );
    }
  };
  
  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="h-80 flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Report Configuration Panel
const ReportConfig: React.FC<{
  reportType: string;
  setReportType: (type: string) => void;
  includeSections: string[];
  setIncludeSections: (sections: string[]) => void;
}> = ({ reportType, setReportType, includeSections, setIncludeSections }) => {
  const toggleSection = (section: string) => {
    if (includeSections.includes(section)) {
      setIncludeSections(includeSections.filter(s => s !== section));
    } else {
      setIncludeSections([...includeSections, section]);
    }
  };
  
  return (
    <Card className="p-6 shadow-md">
      <h3 className="text-xl font-semibold mb-4">Report Configuration</h3>
      
      <div className="mb-6">
        <Label className="mb-2 block">Report Type</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {REPORT_TYPES.map(type => (
            <Button
              key={type.id}
              variant={reportType === type.id ? "default" : "outline"}
              className="justify-start"
              onClick={() => setReportType(type.id)}
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <Label className="mb-2 block">Include Sections</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="summary" 
              checked={includeSections.includes('summary')}
              onCheckedChange={() => toggleSection('summary')}
            />
            <label htmlFor="summary" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Summary Statistics
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="alerts" 
              checked={includeSections.includes('alerts')}
              onCheckedChange={() => toggleSection('alerts')}
            />
            <label htmlFor="alerts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Critical Alerts
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recommendations" 
              checked={includeSections.includes('recommendations')}
              onCheckedChange={() => toggleSection('recommendations')}
            />
            <label htmlFor="recommendations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Recommendations
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="charts" 
              checked={includeSections.includes('charts')}
              onCheckedChange={() => toggleSection('charts')}
            />
            <label htmlFor="charts" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Visual Charts
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="details" 
              checked={includeSections.includes('details')}
              onCheckedChange={() => toggleSection('details')}
            />
            <label htmlFor="details" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Detailed Data Tables
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="trends" 
              checked={includeSections.includes('trends')}
              onCheckedChange={() => toggleSection('trends')}
            />
            <label htmlFor="trends" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Trend Analysis
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <Label className="mb-2 block">Format Options</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-schedule" className="flex-1">Auto Schedule Report</Label>
            <Switch id="auto-schedule" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="export-pdf" className="flex-1">Export as PDF</Label>
            <Switch id="export-pdf" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="include-logo" className="flex-1">Include Company Logo</Label>
            <Switch id="include-logo" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-trends" className="flex-1">Include YoY Comparison</Label>
            <Switch id="show-trends" />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Report Preview Component
const ReportPreview: React.FC<{
  reportType: string;
  reportData: any;
  includeSections: string[];
}> = ({ reportType, reportData, includeSections }) => {
  // Generate mock chart data based on report type
  const getChartData = () => {
    switch (reportType) {
      case 'inventory':
        return [
          { name: 'Optimal Stock', value: 250 },
          { name: 'Low Stock', value: 12 },
          { name: 'Overstock', value: 38 },
        ];
      case 'shipment':
        return [
          { date: '01/15', delivered: 12, shipped: 15, processing: 5 },
          { date: '01/16', delivered: 15, shipped: 22, processing: 8 },
          { date: '01/17', delivered: 18, shipped: 19, processing: 6 },
          { date: '01/18', delivered: 21, shipped: 23, processing: 7 },
          { date: '01/19', delivered: 25, shipped: 25, processing: 4 },
          { date: '01/20', delivered: 28, shipped: 30, processing: 5 },
        ];
      case 'order':
        return [
          { date: '01/15', received: 35, processed: 30, fulfilled: 28 },
          { date: '01/16', received: 42, processed: 38, fulfilled: 35 },
          { date: '01/17', received: 38, processed: 36, fulfilled: 33 },
          { date: '01/18', received: 45, processed: 40, fulfilled: 38 },
          { date: '01/19', received: 48, processed: 42, fulfilled: 40 },
          { date: '01/20', received: 52, processed: 46, fulfilled: 43 },
        ];
      case 'performance':
        return [
          { name: 'Shipping Accuracy', value: 99.4, target: 98, average: 97 },
          { name: 'Inventory Accuracy', value: 98.7, target: 95, average: 94 },
          { name: 'On-Time Delivery', value: 97.2, target: 95, average: 92 },
          { name: 'Customer Satisfaction', value: 96, target: 90, average: 88 },
        ];
      default:
        return [];
    }
  };
  
  // Mock critical alerts
  const getCriticalAlerts = () => {
    switch (reportType) {
      case 'inventory':
        return [
          'Premium Widgets (SKU-1234) inventory below minimum threshold',
          'Warehouse B at 92% capacity',
          'Seasonal items require reordering within 5 days',
        ];
      case 'shipment':
        return [
          '3 delayed shipments to West Coast region',
          'Carrier performance declining for Express service',
          'Delivery times increasing in Northeast region',
        ];
      case 'order':
        return [
          'Order processing backlog increased by 15%',
          'Returns from Customer X above threshold',
          'High-value orders pending verification',
        ];
      case 'performance':
        return [
          'On-time delivery below target in Region C',
          'Inventory discrepancies detected at Warehouse A',
        ];
      default:
        return [];
    }
  };
  
  // Mock recommendations
  const getRecommendations = () => {
    switch (reportType) {
      case 'inventory':
        return [
          'Reorder Premium Widgets inventory within 48 hours',
          'Redistribute inventory from Warehouse C to Warehouse A',
          'Increase safety stock levels for seasonal products',
          'Review slow-moving SKUs for potential clearance',
          'Implement cycle counting for Warehouse B',
        ];
      case 'shipment':
        return [
          'Evaluate alternative carriers for West Coast deliveries',
          'Update SLAs with current carriers',
          'Consider regional fulfillment strategy for Northeast',
          'Implement advanced package tracking system',
        ];
      case 'order':
        return [
          'Add temporary staff to process backlog orders',
          'Review return policy for Customer X',
          'Implement automated approval for orders under $500',
          'Evaluate order processing bottlenecks',
        ];
      case 'performance':
        return [
          'Schedule carrier performance review meeting',
          'Implement inventory reconciliation at Warehouse A',
          'Develop action plan for Region C delivery improvement',
          'Review SLA commitments with top 3 clients',
          'Consider performance-based incentives for warehouse staff',
        ];
      default:
        return [];
    }
  };
  
  const chartData = getChartData();
  const criticalAlerts = getCriticalAlerts();
  const recommendations = getRecommendations();
  
  // Get report title based on type
  const getReportTitle = () => {
    const type = REPORT_TYPES.find(t => t.id === reportType);
    return type ? type.name : 'Custom Report';
  };
  
  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{getReportTitle()} Report</h2>
          <div className="text-sm text-gray-500">
            {format(new Date(), 'MMMM d, yyyy')}
          </div>
        </div>
        <div className="border-b pb-2 mb-4">
          <p className="text-gray-600">
            Client: {CLIENTS[0].name} • Generated by: Admin User • Period: Last 30 days
          </p>
        </div>
        
        {includeSections.includes('summary') && reportData?.data?.summary && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                title="Total Items"
                value={reportData.data.summary.totalItems}
                icon={<Package size={20} />}
                color={COLORS.primary}
              />
              <SummaryCard
                title="Total Value"
                value={reportData.data.summary.totalValue}
                icon={<FileText size={20} />}
                color={COLORS.secondary}
                description="USD"
              />
              <SummaryCard
                title="Critical Alerts"
                value={reportData.data.summary.criticalAlerts}
                icon={<AlertTriangle size={20} />}
                color={COLORS.quaternary}
              />
              <SummaryCard
                title="Recommendations"
                value={reportData.data.summary.recommendations}
                icon={<ShieldCheck size={20} />}
                color={COLORS.tertiary}
              />
            </div>
          </div>
        )}
        
        {includeSections.includes('alerts') && criticalAlerts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Critical Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AlertCard
                title="Critical Issues"
                alerts={criticalAlerts.length}
                severity="critical"
                items={criticalAlerts}
              />
              <AlertCard
                title="Warnings"
                alerts={Math.max(0, Math.floor(criticalAlerts.length * 1.5))}
                severity="warning"
                items={criticalAlerts.map(a => a.replace('Critical', 'Potential')).slice(0, 2)}
              />
            </div>
          </div>
        )}
        
        {includeSections.includes('recommendations') && recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RecommendationCard
                title="Actionable Recommendations"
                recommendations={recommendations.length}
                items={recommendations}
              />
              <RecommendationCard
                title="Optimization Opportunities"
                recommendations={Math.max(0, Math.floor(recommendations.length * 0.6))}
                items={recommendations.map(r => r.replace('Implement', 'Consider').replace('Review', 'Analyze')).slice(0, 3)}
              />
            </div>
          </div>
        )}
      </Card>
      
      {includeSections.includes('charts') && chartData.length > 0 && (
        <ReportChart 
          type={reportType}
          data={chartData}
          title={`${getReportTitle()} Visualization`}
        />
      )}
      
      {includeSections.includes('details') && (
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Detailed Data</h3>
          <div className="relative overflow-x-auto border rounded">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  {reportType === 'inventory' && (
                    <>
                      <th className="px-6 py-3">SKU</th>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Quantity</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3">Location</th>
                    </>
                  )}
                  {reportType === 'shipment' && (
                    <>
                      <th className="px-6 py-3">Tracking #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Carrier</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Destination</th>
                      <th className="px-6 py-3">Transit Time</th>
                    </>
                  )}
                  {reportType === 'order' && (
                    <>
                      <th className="px-6 py-3">Order #</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Processing Time</th>
                    </>
                  )}
                  {reportType === 'performance' && (
                    <>
                      <th className="px-6 py-3">Metric</th>
                      <th className="px-6 py-3">Current</th>
                      <th className="px-6 py-3">Target</th>
                      <th className="px-6 py-3">Previous</th>
                      <th className="px-6 py-3">Change</th>
                      <th className="px-6 py-3">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="bg-white border-b hover:bg-gray-50">
                    {reportType === 'inventory' && (
                      <>
                        <td className="px-6 py-4 font-medium">SKU-{1000 + i}</td>
                        <td className="px-6 py-4">
                          {['Premium Widget', 'Standard Component', 'Deluxe Assembly', 'Basic Part', 'Custom Item'][i]}
                        </td>
                        <td className="px-6 py-4">{[325, 180, 42, 560, 73][i]}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            i === 2 ? 'bg-red-100 text-red-800' : 
                            i === 4 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {i === 2 ? 'Low Stock' : i === 4 ? 'Reorder Soon' : 'Optimal'}
                          </span>
                        </td>
                        <td className="px-6 py-4">${[16250, 5400, 4200, 8400, 3650][i]}</td>
                        <td className="px-6 py-4">
                          {['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse A', 'Warehouse D'][i]}
                        </td>
                      </>
                    )}
                    {reportType === 'shipment' && (
                      <>
                        <td className="px-6 py-4 font-medium">TRK-{1000 + i}</td>
                        <td className="px-6 py-4">
                          {format(subDays(new Date(), i + 1), 'MM/dd/yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          {['FedEx', 'UPS', 'USPS', 'DHL', 'OnTrac'][i]}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            i === 0 ? 'bg-blue-100 text-blue-800' : 
                            i === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {i === 0 ? 'Processing' : i === 1 ? 'In Transit' : 'Delivered'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL'][i]}
                        </td>
                        <td className="px-6 py-4">
                          {['-', '2 days', '3 days', '2 days', '4 days'][i]}
                        </td>
                      </>
                    )}
                    {reportType === 'order' && (
                      <>
                        <td className="px-6 py-4 font-medium">ORD-{10000 + i}</td>
                        <td className="px-6 py-4">
                          {format(subDays(new Date(), i + 1), 'MM/dd/yyyy')}
                        </td>
                        <td className="px-6 py-4">{[5, 2, 8, 1, 3][i]}</td>
                        <td className="px-6 py-4">${[1250, 480, 2150, 390, 875][i]}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            i === 0 ? 'bg-blue-100 text-blue-800' : 
                            i === 1 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {i === 0 ? 'Processing' : i === 1 ? 'Packing' : 'Fulfilled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {['-', '4 hours', '1.5 days', '6 hours', '1 day'][i]}
                        </td>
                      </>
                    )}
                    {reportType === 'performance' && (
                      <>
                        <td className="px-6 py-4 font-medium">
                          {['Shipping Accuracy', 'Inventory Accuracy', 'On-Time Delivery', 'Return Rate', 'Customer Satisfaction'][i]}
                        </td>
                        <td className="px-6 py-4">
                          {[99.4, 98.7, 97.2, 2.3, 4.8][i]}{i === 4 ? '' : '%'}
                        </td>
                        <td className="px-6 py-4">
                          {[98, 95, 95, 3, 4.5][i]}{i === 4 ? '' : '%'}
                        </td>
                        <td className="px-6 py-4">
                          {[98.9, 97.5, 96.8, 2.5, 4.7][i]}{i === 4 ? '' : '%'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center ${
                            (i === 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] < [98.9, 97.5, 96.8, 2.5, 4.7][i]) || 
                            (i !== 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] > [98.9, 97.5, 96.8, 2.5, 4.7][i]) 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {(i === 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] < [98.9, 97.5, 96.8, 2.5, 4.7][i]) || 
                             (i !== 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] > [98.9, 97.5, 96.8, 2.5, 4.7][i]) 
                              ? <ChevronUp size={14} className="mr-1" /> 
                              : <ChevronDown size={14} className="mr-1" />
                            }
                            {Math.abs([99.4, 98.7, 97.2, 2.3, 4.8][i] - [98.9, 97.5, 96.8, 2.5, 4.7][i]).toFixed(1)}{i === 4 ? '' : '%'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            (i === 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] < [98.9, 97.5, 96.8, 2.5, 4.7][i]) || 
                            (i !== 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] > [98.9, 97.5, 96.8, 2.5, 4.7][i])
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(i === 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] < [98.9, 97.5, 96.8, 2.5, 4.7][i]) || 
                             (i !== 3 && [99.4, 98.7, 97.2, 2.3, 4.8][i] > [98.9, 97.5, 96.8, 2.5, 4.7][i])
                              ? 'Improved' 
                              : 'Declined'
                            }
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm">
              <DownloadCloud className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </div>
        </Card>
      )}
      
      {includeSections.includes('trends') && (
        <Card className="p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4">Trend Analysis</h3>
          <div className="space-y-4">
            <p className="text-gray-700">
              <strong>Positive Trends:</strong> Performance has improved across key metrics compared to the previous period. Notably, {reportType === 'inventory' ? 'inventory turnover and stock accuracy' : reportType === 'shipment' ? 'delivery times and shipping accuracy' : reportType === 'order' ? 'order processing speed and fulfillment rate' : 'operational KPIs'} show significant improvement.
            </p>
            <p className="text-gray-700">
              <strong>Areas to Monitor:</strong> While most metrics are trending positively, there are some areas requiring attention. {reportType === 'inventory' ? 'Low stock occurrences have increased slightly' : reportType === 'shipment' ? 'West Coast shipping delays are becoming more frequent' : reportType === 'order' ? 'Order backlog grew by 15% in the last week' : 'Customer satisfaction in Region B requires improvement'}.
            </p>
            <p className="text-gray-700">
              <strong>Year-over-Year Comparison:</strong> Compared to the same period last year, overall performance is up by 12.5%. This indicates sustained improvement in operational efficiency and service quality.
            </p>
            
            <div className="mt-6 flex space-x-2">
              <Button variant="outline" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Historical Data
              </Button>
              <Button variant="outline" size="sm">
                <ArrowRight className="mr-2 h-4 w-4" />
                Forecast Next Quarter
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Export Dialog Component
const ExportDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [includeHeaderFooter, setIncludeHeaderFooter] = useState(true);
  const [includeBranding, setIncludeBranding] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [fileFormat, setFileFormat] = useState('pdf');
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-format">File Format</Label>
            <Select value={fileFormat} onValueChange={setFileFormat}>
              <SelectTrigger id="file-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document (.pdf)</SelectItem>
                <SelectItem value="excel">Excel Spreadsheet (.xlsx)</SelectItem>
                <SelectItem value="csv">CSV File (.csv)</SelectItem>
                <SelectItem value="image">Image (.png)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="header-footer" 
                  checked={includeHeaderFooter}
                  onCheckedChange={(checked) => setIncludeHeaderFooter(!!checked)}
                />
                <label htmlFor="header-footer" className="text-sm">
                  Include header and footer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="branding" 
                  checked={includeBranding}
                  onCheckedChange={(checked) => setIncludeBranding(!!checked)}
                />
                <label htmlFor="branding" className="text-sm">
                  Include company branding
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="timestamp" 
                  checked={includeTimestamp}
                  onCheckedChange={(checked) => setIncludeTimestamp(!!checked)}
                />
                <label htmlFor="timestamp" className="text-sm">
                  Include generation timestamp
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main ReportGenerator Component
const ReportGenerator: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  const [reportType, setReportType] = useState<string>('inventory');
  const [includeSections, setIncludeSections] = useState<string[]>([
    'summary', 'alerts', 'recommendations', 'charts', 'details'
  ]);
  const [activeTab, setActiveTab] = useState('preview');
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/analytics/report-data', selectedClient, reportType, dateRange],
    enabled: !!selectedClient && !!dateRange[0] && !!dateRange[1],
    queryFn: async () => {
      const startDate = dateRange[0]?.toISOString();
      const endDate = dateRange[1]?.toISOString();
      
      const response = await fetch(
        `/api/analytics/report-data?clientId=${selectedClient}&reportType=${reportType}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      return response.json();
    }
  });
  
  return (
    <AnalyticsLayout title="Report Generator">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Report Generator</h1>
              <p className="text-gray-600">Create customized reports with exactly the data you need</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Back to Analytics
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setExportDialogOpen(true)}>
                <DownloadCloud className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <Select value={selectedClient.toString()} onValueChange={(value) => setSelectedClient(parseInt(value))}>
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
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <DatePicker
              selectsRange={true}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
              className="p-2 border rounded w-full"
              customInput={
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {dateRange[0] 
                    ? `${format(dateRange[0], 'MMM d, yyyy')} - ${dateRange[1] ? format(dateRange[1], 'MMM d, yyyy') : 'Present'}`
                    : 'Select date range'}
                </Button>
              }
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Actions</label>
            <div className="flex space-x-2">
              <Button className="flex-1" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button className="flex-1" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="preview">Report Preview</TabsTrigger>
            <TabsTrigger value="config">Report Configuration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ReportPreview 
                reportType={reportType}
                reportData={reportData}
                includeSections={includeSections}
              />
            )}
          </TabsContent>
          
          <TabsContent value="config" className="mt-6">
            <ReportConfig
              reportType={reportType}
              setReportType={setReportType}
              includeSections={includeSections}
              setIncludeSections={setIncludeSections}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <ExportDialog 
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </AnalyticsLayout>
  );
};

export default ReportGenerator;