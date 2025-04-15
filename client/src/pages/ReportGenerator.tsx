import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Loader2,
  Table,
  BarChart2,
  PieChart,
  Share2
} from 'lucide-react';

import AnalyticsLayout from '@/components/analytics/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  { id: 'inventory', name: 'Inventory Report', description: 'Detailed analysis of current inventory levels, including low stock alerts and stock optimization recommendations.' },
  { id: 'shipment', name: 'Shipment Report', description: 'Comprehensive overview of all shipments, including delivery times, carrier performance, and cost analysis.' },
  { id: 'order', name: 'Order Processing Report', description: 'Insights into order processing efficiency, fulfillment rates, and bottlenecks in the order workflow.' },
  { id: 'performance', name: 'Performance Metrics', description: 'Key performance indicators including shipping accuracy, on-time delivery, and return rates over time.' },
  { id: 'financial', name: 'Financial Analysis', description: 'Cost analysis including shipping costs, storage fees, and overall fulfillment expenses.' },
];

// Report formats
const REPORT_FORMATS = [
  { id: 'pdf', name: 'PDF Document', icon: <FileText className="h-4 w-4" /> },
  { id: 'csv', name: 'CSV Spreadsheet', icon: <Table className="h-4 w-4" /> },
  { id: 'excel', name: 'Excel Spreadsheet', icon: <Table className="h-4 w-4" /> },
  { id: 'charts', name: 'Interactive Charts', icon: <BarChart2 className="h-4 w-4" /> },
];

const ReportGenerator: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<number | null>(1);
  const [selectedReportType, setSelectedReportType] = useState<string>('inventory');
  const [reportFormat, setReportFormat] = useState<string>('pdf');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState({
    includeCharts: true,
    includeTables: true,
    includeRecommendations: true,
    includeExecutiveSummary: true,
    includeRawData: false,
  });

  // Query for report data (mock for now)
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['/api/analytics/report-data', selectedClient, selectedReportType, dateRange],
    enabled: !!selectedClient && !!selectedReportType && !!dateRange[0] && !!dateRange[1],
    queryFn: async () => {
      const startDate = dateRange[0]?.toISOString();
      const endDate = dateRange[1]?.toISOString();
      
      const response = await fetch(
        `/api/analytics/report-data?clientId=${selectedClient}&reportType=${selectedReportType}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      return response.json();
    },
    placeholderData: {
      data: {
        summary: {
          totalItems: 138,
          totalValue: 256780,
          criticalAlerts: 3,
          recommendations: 8
        }
      }
    }
  });

  // Handle report generation
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      // In a real implementation, the report would be downloaded or displayed here
      
      // Mock download dialog trigger
      if (reportFormat === 'pdf' || reportFormat === 'csv' || reportFormat === 'excel') {
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.download = `${selectedReportType}_report_${format(new Date(), 'yyyy-MM-dd')}.${reportFormat}`;
        anchor.click();
      }
    }, 2000);
  };

  const handleOptionChange = (option: keyof typeof selectedOptions) => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  return (
    <AnalyticsLayout title="Report Generator">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Advanced Report Generator</h1>
          <p className="text-gray-600">Create customized reports with detailed analytics and insights</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Report Configuration Panel */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Report Configuration</h2>
              
              <div className="space-y-6">
                {/* Client Selection */}
                <div>
                  <Label htmlFor="client">Client</Label>
                  <Select 
                    value={selectedClient?.toString()} 
                    onValueChange={(value) => setSelectedClient(parseInt(value))}
                  >
                    <SelectTrigger id="client" className="w-full">
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
                
                {/* Report Type */}
                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select 
                    value={selectedReportType} 
                    onValueChange={setSelectedReportType}
                  >
                    <SelectTrigger id="reportType" className="w-full">
                      <SelectValue placeholder="Select Report Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedReportType && (
                    <p className="text-sm text-gray-500 mt-2">
                      {REPORT_TYPES.find(t => t.id === selectedReportType)?.description}
                    </p>
                  )}
                </div>
                
                {/* Date Range */}
                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <div className="flex items-center mt-1">
                    <DatePicker
                      selectsRange={true}
                      startDate={dateRange[0]}
                      endDate={dateRange[1]}
                      onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
                      className="p-2 border rounded w-full"
                      dateFormat="MMM dd, yyyy"
                      customInput={
                        <Button id="dateRange" variant="outline" className="w-full justify-start text-left">
                          <Calendar className="h-4 w-4 mr-2" />
                          {dateRange[0] 
                            ? `${format(dateRange[0], 'MMM dd, yyyy')} - ${dateRange[1] ? format(dateRange[1], 'MMM dd, yyyy') : 'Select...'}`
                            : 'Select Date Range'}
                        </Button>
                      }
                    />
                  </div>
                </div>
                
                {/* Report Format */}
                <div>
                  <Label>Report Format</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-1">
                    {REPORT_FORMATS.map((format) => (
                      <div 
                        key={format.id}
                        className={`
                          p-3 border rounded-lg flex flex-col items-center text-center cursor-pointer transition-colors
                          ${reportFormat === format.id ? 'border-primary bg-primary/5' : 'hover:border-gray-300'}
                        `}
                        onClick={() => setReportFormat(format.id)}
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 ${reportFormat === format.id ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                          {format.icon}
                        </div>
                        <span className="text-sm">{format.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Report Options */}
                <div>
                  <Label>Report Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="includeCharts" 
                        checked={selectedOptions.includeCharts}
                        onCheckedChange={() => handleOptionChange('includeCharts')}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="includeCharts" className="text-sm font-medium">
                          Include Charts & Graphs
                        </Label>
                        <p className="text-xs text-gray-500">
                          Visual representations of the data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="includeTables" 
                        checked={selectedOptions.includeTables}
                        onCheckedChange={() => handleOptionChange('includeTables')}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="includeTables" className="text-sm font-medium">
                          Include Data Tables
                        </Label>
                        <p className="text-xs text-gray-500">
                          Detailed tabular data
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="includeRecommendations" 
                        checked={selectedOptions.includeRecommendations}
                        onCheckedChange={() => handleOptionChange('includeRecommendations')}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="includeRecommendations" className="text-sm font-medium">
                          Include Recommendations
                        </Label>
                        <p className="text-xs text-gray-500">
                          AI-powered insights and action items
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="includeExecutiveSummary" 
                        checked={selectedOptions.includeExecutiveSummary}
                        onCheckedChange={() => handleOptionChange('includeExecutiveSummary')}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="includeExecutiveSummary" className="text-sm font-medium">
                          Include Executive Summary
                        </Label>
                        <p className="text-xs text-gray-500">
                          High-level overview for executives
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="includeRawData" 
                        checked={selectedOptions.includeRawData}
                        onCheckedChange={() => handleOptionChange('includeRawData')}
                      />
                      <div className="grid gap-1.5">
                        <Label htmlFor="includeRawData" className="text-sm font-medium">
                          Include Raw Data
                        </Label>
                        <p className="text-xs text-gray-500">
                          Complete dataset for further analysis
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Generate Button */}
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={handleGenerateReport}
                    disabled={isGenerating || isLoading || !selectedClient || !selectedReportType}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Preview Panel */}
          <div>
            <Card className="p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Report Preview</h2>
              
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : reportData ? (
                <div className="space-y-4 flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-700 mb-2">
                      {REPORT_TYPES.find(t => t.id === selectedReportType)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {selectedClient && CLIENTS.find(c => c.id === selectedClient)?.name}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-xs text-gray-500">Total Items</p>
                        <p className="text-lg font-semibold">{reportData.data.summary.totalItems.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-xs text-gray-500">Total Value</p>
                        <p className="text-lg font-semibold">${reportData.data.summary.totalValue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-xs text-gray-500">Critical Alerts</p>
                        <p className="text-lg font-semibold text-red-600">{reportData.data.summary.criticalAlerts}</p>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm">
                        <p className="text-xs text-gray-500">Recommendations</p>
                        <p className="text-lg font-semibold text-blue-600">{reportData.data.summary.recommendations}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-xs text-gray-500">Report Period</p>
                      <p className="text-sm">
                        {dateRange[0] && format(dateRange[0], 'MMM dd, yyyy')} - {dateRange[1] && format(dateRange[1], 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4">
                    <Button variant="outline" className="w-full justify-between" disabled>
                      <span>Preview Full Report</span>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    Configure your report settings to see a preview
                  </p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Download Options</h3>
                    <p className="text-sm text-gray-500">Available after generation</p>
                  </div>
                  <Download className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Recently Generated Reports */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recently Generated Reports</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Generated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3].map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {['Inventory Status Report', 'Shipping Performance Analysis', 'Order Processing Efficiency'][index]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {['Inventory', 'Shipment', 'Orders'][index]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(subDays(new Date(), index + 1), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {['PDF', 'Excel', 'CSV'][index]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AnalyticsLayout>
  );
};

export default ReportGenerator;