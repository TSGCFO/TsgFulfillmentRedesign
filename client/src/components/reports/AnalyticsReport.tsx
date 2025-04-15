import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Calendar, Download, Printer, Share2, 
  Mail, Plus, Save, ArrowDown
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogClose, DialogFooter, DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';

// Analytics Dashboard Colors
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
  background: '#F8F9FA',
  text: '#212529',
};

// Report types and interfaces
export enum ReportType {
  INVENTORY = 'inventory',
  SHIPMENT = 'shipment',
  PERFORMANCE = 'performance',
  FINANCIAL = 'financial',
  CUSTOM = 'custom'
}

export interface ReportConfig {
  type: ReportType;
  title: string;
  description?: string;
  dateRange: [Date, Date];
  clientId?: number;
  metrics: string[];
  compareWithPrevious?: boolean;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'pdf' | 'excel' | 'csv';
  charts: {
    type: 'line' | 'bar' | 'pie' | 'area';
    metric: string;
    title: string;
  }[];
  tables: {
    title: string;
    columns: string[];
  }[];
}

interface AnalyticsReportProps {
  initialConfig?: Partial<ReportConfig>;
  onGenerate?: (config: ReportConfig) => void;
  onSave?: (config: ReportConfig) => void;
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  onShare?: (email: string) => void;
  data?: any;
  loading?: boolean;
}

export const AnalyticsReport: React.FC<AnalyticsReportProps> = ({
  initialConfig,
  onGenerate,
  onSave,
  onExport,
  onShare,
  data,
  loading = false
}) => {
  // Default configuration
  const defaultConfig: ReportConfig = {
    type: ReportType.INVENTORY,
    title: 'Inventory Status Report',
    description: 'Overview of current inventory levels and status',
    dateRange: [subDays(new Date(), 30), new Date()],
    metrics: ['total_items', 'low_stock', 'out_of_stock'],
    compareWithPrevious: true,
    groupBy: 'day',
    charts: [
      { type: 'line', metric: 'inventory_level', title: 'Inventory Level Trend' },
      { type: 'pie', metric: 'inventory_status', title: 'Inventory Status Distribution' }
    ],
    tables: [
      { title: 'Low Stock Items', columns: ['item_id', 'name', 'current_level', 'minimum_level', 'warehouse'] }
    ]
  };
  
  // State
  const [config, setConfig] = useState<ReportConfig>({...defaultConfig, ...initialConfig});
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState(config.title);
  
  // Mock data for demonstration
  const mockTimeSeriesData = [
    { date: '2025-03-01', value: 1200, previous: 1100 },
    { date: '2025-03-02', value: 1250, previous: 1150 },
    { date: '2025-03-03', value: 1180, previous: 1130 },
    { date: '2025-03-04', value: 1300, previous: 1200 },
    { date: '2025-03-05', value: 1350, previous: 1250 },
    { date: '2025-03-06', value: 1400, previous: 1300 },
    { date: '2025-03-07', value: 1380, previous: 1320 },
    { date: '2025-03-08', value: 1420, previous: 1350 },
    { date: '2025-03-09', value: 1450, previous: 1370 },
    { date: '2025-03-10', value: 1500, previous: 1400 },
  ].map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
  }));
  
  const mockPieData = [
    { name: 'In Stock', value: 65 },
    { name: 'Low Stock', value: 20 },
    { name: 'Out of Stock', value: 15 },
  ];
  
  const mockTableData = [
    { id: 1, product_id: 'P-1001', name: 'Premium Widget', current_stock: 5, min_level: 10, warehouse: 'Warehouse A', status: 'Low Stock' },
    { id: 2, product_id: 'P-1002', name: 'Deluxe Gadget', current_stock: 3, min_level: 10, warehouse: 'Warehouse B', status: 'Low Stock' },
    { id: 3, product_id: 'P-1003', name: 'Standard Device', current_stock: 2, min_level: 10, warehouse: 'Warehouse A', status: 'Low Stock' },
    { id: 4, product_id: 'P-1004', name: 'Budget Widget', current_stock: 0, min_level: 5, warehouse: 'Warehouse C', status: 'Out of Stock' },
    { id: 5, product_id: 'P-1005', name: 'Economy Item', current_stock: 1, min_level: 8, warehouse: 'Warehouse B', status: 'Low Stock' },
  ];
  
  // Event handlers
  const handleGenerateReport = () => {
    if (onGenerate) {
      onGenerate(config);
    }
  };
  
  const handleSaveReport = () => {
    setConfig(prev => ({ ...prev, title: reportName }));
    if (onSave) {
      onSave({ ...config, title: reportName });
    }
    setIsSaveDialogOpen(false);
  };
  
  const handleShareReport = () => {
    if (onShare) {
      onShare(shareEmail);
    }
    setIsShareDialogOpen(false);
  };
  
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (onExport) {
      onExport(format);
    }
  };
  
  const updateConfig = (updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };
  
  // Render charts based on configuration
  const renderChart = (chartConfig: ReportConfig['charts'][0], index: number) => {
    switch (chartConfig.type) {
      case 'line':
        return (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{chartConfig.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTimeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Current Period"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    {config.compareWithPrevious && (
                      <Line
                        type="monotone"
                        dataKey="previous"
                        name="Previous Period"
                        stroke={COLORS.quinary}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'bar':
        return (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{chartConfig.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockTimeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Current Period"
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                    {config.compareWithPrevious && (
                      <Bar
                        dataKey="previous"
                        name="Previous Period"
                        fill={COLORS.quinary}
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'area':
        return (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{chartConfig.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTimeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Current Period"
                      stroke={COLORS.primary}
                      fill={`${COLORS.primary}40`}
                    />
                    {config.compareWithPrevious && (
                      <Area
                        type="monotone"
                        dataKey="previous"
                        name="Previous Period"
                        stroke={COLORS.quinary}
                        fill={`${COLORS.quinary}40`}
                        strokeDasharray="5 5"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
        
      case 'pie':
        return (
          <Card key={index} className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{chartConfig.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockPieData.map((entry, i) => (
                        <Cell 
                          key={`cell-${i}`} 
                          fill={[COLORS.primary, COLORS.tertiary, COLORS.quaternary][i % 3]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div>
      {/* Report Header */}
      <Card className="mb-6 shadow-md bg-white">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
              {config.description && (
                <CardDescription className="mt-1">{config.description}</CardDescription>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsConfigOpen(true)}>
                Customize Report
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsSaveDialogOpen(true)}>
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row mt-4 gap-4 items-start sm:items-center text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {format(config.dateRange[0], 'MMM dd, yyyy')} - {format(config.dateRange[1], 'MMM dd, yyyy')}
              </span>
            </div>
            <div>
              Generated on {format(new Date(), 'MMM dd, yyyy, h:mm a')}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4 bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold">8,750</p>
                </div>
                <ArrowDown className={`h-5 w-5 text-red-500`} />
              </div>
              <p className="text-xs mt-2 text-gray-500">
                <span className="text-red-500 font-medium">-2.4%</span> from previous period
              </p>
            </Card>
            <Card className="p-4 bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                  <p className="text-2xl font-bold">32</p>
                </div>
                <ArrowDown className={`h-5 w-5 text-green-500`} />
              </div>
              <p className="text-xs mt-2 text-gray-500">
                <span className="text-green-500 font-medium">-15.8%</span> from previous period
              </p>
            </Card>
            <Card className="p-4 bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Out of Stock Items</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
                <ArrowDown className={`h-5 w-5 text-green-500`} />
              </div>
              <p className="text-xs mt-2 text-gray-500">
                <span className="text-green-500 font-medium">-22.2%</span> from previous period
              </p>
            </Card>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleGenerateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Refresh Report'}
            </Button>
          </div>
        </CardContent>
        
        <Separator />
        
        <CardContent className="pt-6">
          <Tabs defaultValue="charts">
            <TabsList className="mb-4">
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {config.charts.map(renderChart)}
              </div>
            </TabsContent>
            
            <TabsContent value="tables">
              <div className="space-y-6">
                {config.tables.map((table, index) => (
                  <div key={index}>
                    <DataTable 
                      title={table.title}
                      data={mockTableData}
                      columns={[
                        { header: 'Product ID', accessor: 'product_id', sortable: true },
                        { header: 'Product Name', accessor: 'name', sortable: true },
                        { 
                          header: 'Current Stock', 
                          accessor: 'current_stock', 
                          sortable: true,
                          cell: (row) => <span className={row.current_stock === 0 ? 'text-red-500 font-medium' : row.current_stock < 5 ? 'text-yellow-500 font-medium' : ''}>{row.current_stock}</span>
                        },
                        { header: 'Min Level', accessor: 'min_level', sortable: true },
                        { header: 'Warehouse', accessor: 'warehouse', sortable: true },
                        { 
                          header: 'Status', 
                          accessor: 'status',
                          cell: (row) => (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              row.status === 'Out of Stock' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </span>
                          )
                        },
                      ]}
                      pagination
                      downloadable
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="summary">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
                <p className="mb-4">This report provides an analysis of inventory levels across all warehouses for the period {format(config.dateRange[0], 'MMMM d, yyyy')} to {format(config.dateRange[1], 'MMMM d, yyyy')}.</p>
                
                <h4 className="text-lg font-semibold mt-6 mb-2">Key Findings</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Total inventory has <span className="text-red-500 font-medium">decreased by 2.4%</span> compared to the previous period.</li>
                  <li>The number of low stock items has <span className="text-green-500 font-medium">decreased by 15.8%</span>, indicating improved inventory management.</li>
                  <li>Out of stock items have <span className="text-green-500 font-medium">decreased by 22.2%</span> from 9 to 7 items.</li>
                  <li>Warehouse A continues to hold the largest portion of inventory at 40.0% of total stock.</li>
                </ul>
                
                <h4 className="text-lg font-semibold mt-6 mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Restock the 7 out of stock items immediately to avoid lost sales.</li>
                  <li>Review minimum stock levels for Premium Widgets and Economy Items which consistently run low.</li>
                  <li>Consider redistributing some stock from Warehouse A to Warehouse C to balance inventory.</li>
                </ul>
                
                <h4 className="text-lg font-semibold mt-6 mb-2">Next Steps</h4>
                <p>Schedule inventory review with Warehouse Managers by April 22, 2025 to address identified issues.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Configuration Dialog */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Configuration</DialogTitle>
            <DialogDescription>
              Customize your report settings and parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={config.type}
                  onValueChange={(value) => updateConfig({ type: value as ReportType })}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReportType.INVENTORY}>Inventory Report</SelectItem>
                    <SelectItem value={ReportType.SHIPMENT}>Shipment Report</SelectItem>
                    <SelectItem value={ReportType.PERFORMANCE}>Performance Report</SelectItem>
                    <SelectItem value={ReportType.FINANCIAL}>Financial Report</SelectItem>
                    <SelectItem value={ReportType.CUSTOM}>Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="report-title">Report Title</Label>
                <Input
                  id="report-title"
                  value={config.title}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="report-description">Description</Label>
                <Input
                  id="report-description"
                  value={config.description || ''}
                  onChange={(e) => updateConfig({ description: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Date Range</Label>
                <div className="flex space-x-2">
                  <DatePicker
                    selected={config.dateRange[0]}
                    onChange={(date) => {
                      if (date) {
                        updateConfig({ dateRange: [date, config.dateRange[1]] });
                      }
                    }}
                    className="flex-1 p-2 border rounded"
                    dateFormat="MMM dd, yyyy"
                  />
                  <span className="flex items-center">to</span>
                  <DatePicker
                    selected={config.dateRange[1]}
                    onChange={(date) => {
                      if (date) {
                        updateConfig({ dateRange: [config.dateRange[0], date] });
                      }
                    }}
                    className="flex-1 p-2 border rounded"
                    dateFormat="MMM dd, yyyy"
                    minDate={config.dateRange[0]}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compare-previous"
                  checked={config.compareWithPrevious}
                  onCheckedChange={(checked) => updateConfig({ compareWithPrevious: checked as boolean })}
                />
                <Label htmlFor="compare-previous">Compare with previous period</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-by">Group By</Label>
                <Select
                  value={config.groupBy || 'day'}
                  onValueChange={(value) => updateConfig({ groupBy: value as 'day' | 'week' | 'month' })}
                >
                  <SelectTrigger id="group-by">
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Charts to Include</Label>
                <div className="space-y-2 mt-2">
                  {config.charts.map((chart, i) => (
                    <div key={i} className="flex items-center justify-between border p-2 rounded">
                      <span>{chart.title} ({chart.type})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newCharts = [...config.charts];
                          newCharts.splice(i, 1);
                          updateConfig({ charts: newCharts });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateConfig({ 
                        charts: [
                          ...config.charts, 
                          { type: 'line', metric: 'new_metric', title: `Chart ${config.charts.length + 1}` }
                        ] 
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Chart
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Tables to Include</Label>
                <div className="space-y-2 mt-2">
                  {config.tables.map((table, i) => (
                    <div key={i} className="flex items-center justify-between border p-2 rounded">
                      <span>{table.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTables = [...config.tables];
                          newTables.splice(i, 1);
                          updateConfig({ tables: newTables });
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateConfig({ 
                        tables: [
                          ...config.tables, 
                          { title: `Table ${config.tables.length + 1}`, columns: ['column1', 'column2'] }
                        ] 
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Table
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConfigOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Report Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report</DialogTitle>
            <DialogDescription>
              Save this report for future reference
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="report-name">Report Name</Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="save-as-template" />
              <Label htmlFor="save-as-template">Save as template for future reports</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReport}>
              Save Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Report Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Share this report with others via email
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="share-email">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="recipient@example.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="share-message">Message (Optional)</Label>
              <Input
                id="share-message"
                placeholder="Here's the report you requested..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="include-pdf" />
              <Label htmlFor="include-pdf">Include PDF attachment</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareReport}>
              <Mail className="h-4 w-4 mr-1" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};