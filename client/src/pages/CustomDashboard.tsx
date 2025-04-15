import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import {
  Package,
  Truck,
  Clock,
  Settings,
  Plus,
  X,
  Move,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Table,
  Layout,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

import AnalyticsLayout from '@/components/analytics/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

// Colors
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
};

// Available chart and widget types
const WIDGET_TYPES = [
  { id: 'line-chart', name: 'Line Chart', icon: <LineChartIcon className="h-5 w-5" /> },
  { id: 'bar-chart', name: 'Bar Chart', icon: <BarChart2 className="h-5 w-5" /> },
  { id: 'pie-chart', name: 'Pie Chart', icon: <PieChartIcon className="h-5 w-5" /> },
  { id: 'stat-card', name: 'Stat Card', icon: <Layout className="h-5 w-5" /> },
  { id: 'data-table', name: 'Data Table', icon: <Table className="h-5 w-5" /> },
];

// Available data sources
const DATA_SOURCES = [
  { id: 'shipment-overview', name: 'Shipment Overview', category: 'shipments' },
  { id: 'delivery-times', name: 'Delivery Times', category: 'shipments' },
  { id: 'carrier-distribution', name: 'Carrier Distribution', category: 'shipments' },
  { id: 'shipping-costs', name: 'Shipping Costs', category: 'shipments' },
  { id: 'inventory-levels', name: 'Inventory Levels', category: 'inventory' },
  { id: 'stock-turnover', name: 'Stock Turnover', category: 'inventory' },
  { id: 'low-stock-items', name: 'Low Stock Items', category: 'inventory' },
  { id: 'order-volume', name: 'Order Volume', category: 'orders' },
  { id: 'processing-times', name: 'Processing Times', category: 'orders' },
  { id: 'order-fulfillment', name: 'Order Fulfillment', category: 'orders' },
  { id: 'return-rate', name: 'Return Rate', category: 'orders' },
  { id: 'performance-kpis', name: 'Performance KPIs', category: 'performance' },
];

// Time period options
const TIME_PERIODS = [
  { id: 'today', name: 'Today' },
  { id: 'yesterday', name: 'Yesterday' },
  { id: 'last7days', name: 'Last 7 Days' },
  { id: 'last30days', name: 'Last 30 Days' },
  { id: 'thisMonth', name: 'This Month' },
  { id: 'lastMonth', name: 'Last Month' },
  { id: 'thisYear', name: 'This Year' },
];

// Dashboard layout presets
const DASHBOARD_PRESETS = [
  { id: 'shipments', name: 'Shipments Dashboard' },
  { id: 'inventory', name: 'Inventory Dashboard' },
  { id: 'orders', name: 'Orders Dashboard' },
  { id: 'performance', name: 'Performance Dashboard' },
  { id: 'executive', name: 'Executive Overview' },
];

// Mock data for chart widgets
const MOCK_DATA = {
  'shipment-overview': [
    { date: '2025-03-15', shipments: 28, delivered: 24 },
    { date: '2025-03-16', shipments: 32, delivered: 29 },
    { date: '2025-03-17', shipments: 36, delivered: 30 },
    { date: '2025-03-18', shipments: 30, delivered: 25 },
    { date: '2025-03-19', shipments: 42, delivered: 38 },
    { date: '2025-03-20', shipments: 38, delivered: 34 },
    { date: '2025-03-21', shipments: 45, delivered: 40 },
  ],
  'delivery-times': [
    { carrier: 'FedEx', time: 2.4 },
    { carrier: 'UPS', time: 2.1 },
    { carrier: 'USPS', time: 3.2 },
    { carrier: 'DHL', time: 2.7 },
  ],
  'carrier-distribution': [
    { name: 'FedEx', value: 35 },
    { name: 'UPS', value: 30 },
    { name: 'USPS', value: 20 },
    { name: 'DHL', value: 15 },
  ],
  'inventory-levels': [
    { date: '2025-03-15', quantity: 5280 },
    { date: '2025-03-16', quantity: 5350 },
    { date: '2025-03-17', quantity: 5420 },
    { date: '2025-03-18', quantity: 5380 },
    { date: '2025-03-19', quantity: 5510 },
    { date: '2025-03-20', quantity: 5650 },
    { date: '2025-03-21', quantity: 5720 },
  ],
  'order-volume': [
    { date: '2025-03-15', orders: 48 },
    { date: '2025-03-16', orders: 52 },
    { date: '2025-03-17', orders: 58 },
    { date: '2025-03-18', orders: 51 },
    { date: '2025-03-19', orders: 63 },
    { date: '2025-03-20', orders: 59 },
    { date: '2025-03-21', orders: 67 },
  ],
};

// Widget interface
interface DashboardWidget {
  id: string;
  type: string;
  dataSource: string;
  title: string;
  timePeriod: string;
  settings: {
    height: number;
    showLegend: boolean;
    chartColors: string[];
    dataKeys: string[];
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  visible: boolean;
}

const CustomDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'widget-1',
      type: 'line-chart',
      dataSource: 'shipment-overview',
      title: 'Shipment Volume',
      timePeriod: 'last7days',
      settings: {
        height: 300,
        showLegend: true,
        chartColors: [COLORS.primary, COLORS.secondary],
        dataKeys: ['shipments', 'delivered'],
      },
      position: { x: 0, y: 0, w: 6, h: 2 },
      visible: true,
    },
    {
      id: 'widget-2',
      type: 'pie-chart',
      dataSource: 'carrier-distribution',
      title: 'Carrier Distribution',
      timePeriod: 'last30days',
      settings: {
        height: 300,
        showLegend: true,
        chartColors: [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary],
        dataKeys: ['value'],
      },
      position: { x: 6, y: 0, w: 6, h: 2 },
      visible: true,
    },
    {
      id: 'widget-3',
      type: 'bar-chart',
      dataSource: 'delivery-times',
      title: 'Average Delivery Times by Carrier',
      timePeriod: 'last30days',
      settings: {
        height: 300,
        showLegend: false,
        chartColors: [COLORS.tertiary],
        dataKeys: ['time'],
      },
      position: { x: 0, y: 2, w: 6, h: 2 },
      visible: true,
    },
    {
      id: 'widget-4',
      type: 'line-chart',
      dataSource: 'inventory-levels',
      title: 'Inventory Levels',
      timePeriod: 'last7days',
      settings: {
        height: 300,
        showLegend: true,
        chartColors: [COLORS.primary],
        dataKeys: ['quantity'],
      },
      position: { x: 6, y: 2, w: 6, h: 2 },
      visible: true,
    },
  ]);
  
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isAddingWidget, setIsAddingWidget] = useState<boolean>(false);
  const [newWidget, setNewWidget] = useState<Partial<DashboardWidget>>({
    type: 'line-chart',
    dataSource: 'shipment-overview',
    title: '',
    timePeriod: 'last7days',
    settings: {
      height: 300,
      showLegend: true,
      chartColors: [COLORS.primary, COLORS.secondary],
      dataKeys: ['shipments', 'delivered'],
    },
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch saved dashboard settings
  const { data: dashboardSettings, refetch } = useQuery({
    queryKey: ['/api/analytics/dashboard-settings'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics/dashboard-settings');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard settings');
        }
        return response.json();
      } finally {
        setIsLoading(false);
      }
    },
    // For demo purposes, we'll just use our initial state
    enabled: false
  });

  // Get selected widget
  const selectedWidget = widgets.find(widget => widget.id === selectedWidgetId);

  // Handle widget selection
  const handleSelectWidget = (widgetId: string) => {
    if (isEditMode) {
      setSelectedWidgetId(widgetId);
    }
  };

  // Handle widget position change
  const handleWidgetPositionChange = (widgetId: string, position: { x: number, y: number, w: number, h: number }) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, position } 
          : widget
      )
    );
  };

  // Handle widget visibility toggle
  const handleToggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible } 
          : widget
      )
    );
  };

  // Handle widget removal
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== widgetId));
    if (selectedWidgetId === widgetId) {
      setSelectedWidgetId(null);
    }
  };

  // Handle widget settings update
  const handleUpdateWidgetSettings = (widgetId: string, updatedSettings: Partial<DashboardWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...updatedSettings } 
          : widget
      )
    );
  };

  // Handle adding a new widget
  const handleAddWidget = () => {
    if (!newWidget.title) return;
    
    const widget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: newWidget.type || 'line-chart',
      dataSource: newWidget.dataSource || 'shipment-overview',
      title: newWidget.title || 'New Widget',
      timePeriod: newWidget.timePeriod || 'last7days',
      settings: newWidget.settings || {
        height: 300,
        showLegend: true,
        chartColors: [COLORS.primary, COLORS.secondary],
        dataKeys: ['shipments', 'delivered'],
      },
      position: { x: 0, y: 4, w: 6, h: 2 }, // Default position at bottom
      visible: true,
    };
    
    setWidgets(prev => [...prev, widget]);
    setIsAddingWidget(false);
    setNewWidget({
      type: 'line-chart',
      dataSource: 'shipment-overview',
      title: '',
      timePeriod: 'last7days',
      settings: {
        height: 300,
        showLegend: true,
        chartColors: [COLORS.primary, COLORS.secondary],
        dataKeys: ['shipments', 'delivered'],
      },
    });
  };

  // Handle saving dashboard
  const handleSaveDashboard = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Dashboard saved:', widgets);
      setIsEditMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading a preset dashboard
  const handleLoadPreset = (presetId: string) => {
    // In a real implementation, this would fetch a preset from the server
    console.log('Loading preset:', presetId);
    // For now we'll just keep our existing widgets
  };

  // Handle dashboard refresh
  const handleRefreshDashboard = async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real implementation, this would refresh all widget data
    } finally {
      setRefreshing(false);
    }
  };

  // Render widget content based on type and data source
  const renderWidgetContent = (widget: DashboardWidget) => {
    const data = MOCK_DATA[widget.dataSource as keyof typeof MOCK_DATA] || [];
    
    switch (widget.type) {
      case 'line-chart':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => date && typeof date === 'string' ? format(new Date(date), 'MMM d') : ''}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => date && typeof date === 'string' ? format(new Date(date), 'MMMM d, yyyy') : ''}
                />
                {widget.settings.showLegend && <Legend />}
                {widget.settings.dataKeys.map((key, i) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={widget.settings.chartColors[i % widget.settings.chartColors.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'bar-chart':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={widget.dataSource === 'delivery-times' ? 'carrier' : 'date'} />
                <YAxis />
                <Tooltip />
                {widget.settings.showLegend && <Legend />}
                {widget.settings.dataKeys.map((key, i) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={widget.settings.chartColors[i % widget.settings.chartColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'pie-chart':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={widget.settings.dataKeys[0]}
                  nameKey={widget.dataSource === 'carrier-distribution' ? 'name' : undefined}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={widget.settings.chartColors[index % widget.settings.chartColors.length]} 
                    />
                  ))}
                </Pie>
                {widget.settings.showLegend && <Legend />}
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'stat-card':
        // A simpler card for displaying a single statistic
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Shipments</h3>
            <p className="text-4xl font-bold">458</p>
            <p className="text-sm text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.3% vs previous period
            </p>
          </div>
        );
        
      case 'data-table':
        // A simple data table
        return (
          <div className="overflow-x-auto h-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipments</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {MOCK_DATA['shipment-overview'].map((entry, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{entry.shipments}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{entry.delivered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return <div className="p-4 text-center text-gray-500">Invalid widget type</div>;
    }
  };

  // Get data sources for the selected widget type
  const getDataSourcesForWidgetType = (widgetType: string) => {
    return DATA_SOURCES;
  };

  return (
    <AnalyticsLayout title="Custom Dashboard">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Custom Dashboard</h1>
            <p className="text-gray-600">Create and customize your own analytics dashboard</p>
          </div>
          
          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveDashboard}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Dashboard
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={handleRefreshDashboard}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Layout className="mr-2 h-4 w-4" />
                      Load Preset
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Dashboard Presets</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {DASHBOARD_PRESETS.map(preset => (
                      <DropdownMenuItem 
                        key={preset.id}
                        onClick={() => handleLoadPreset(preset.id)}
                      >
                        {preset.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={() => setIsEditMode(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Dashboard
                </Button>
              </>
            )}
          </div>
        </header>
        
        {/* Add Widget Dialog */}
        <Dialog open={isAddingWidget} onOpenChange={setIsAddingWidget}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Widget</DialogTitle>
              <DialogDescription>
                Configure a new widget to add to your dashboard.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Widget Title</Label>
                <Input
                  id="title"
                  value={newWidget.title || ''}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter widget title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Widget Type</Label>
                <Select
                  value={newWidget.type}
                  onValueChange={(value) => setNewWidget(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Select
                  value={newWidget.dataSource}
                  onValueChange={(value) => setNewWidget(prev => ({ ...prev, dataSource: value }))}
                >
                  <SelectTrigger id="dataSource">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDataSourcesForWidgetType(newWidget.type || '').map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timePeriod">Time Period</Label>
                <Select
                  value={newWidget.timePeriod}
                  onValueChange={(value) => setNewWidget(prev => ({ ...prev, timePeriod: value }))}
                >
                  <SelectTrigger id="timePeriod">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIODS.map(period => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddingWidget(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddWidget}
                disabled={!newWidget.title}
              >
                Add Widget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Widget Settings Sidebar */}
        {isEditMode && selectedWidget && (
          <div className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto z-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Widget Settings</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedWidgetId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="widget-title">Title</Label>
                <Input
                  id="widget-title"
                  value={selectedWidget.title}
                  onChange={(e) => handleUpdateWidgetSettings(selectedWidget.id, { title: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="widget-type">Widget Type</Label>
                <Select
                  value={selectedWidget.type}
                  onValueChange={(value) => handleUpdateWidgetSettings(selectedWidget.id, { type: value })}
                >
                  <SelectTrigger id="widget-type" className="mt-1">
                    <SelectValue placeholder="Select widget type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDGET_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{type.icon}</span>
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="widget-data-source">Data Source</Label>
                <Select
                  value={selectedWidget.dataSource}
                  onValueChange={(value) => handleUpdateWidgetSettings(selectedWidget.id, { dataSource: value })}
                >
                  <SelectTrigger id="widget-data-source" className="mt-1">
                    <SelectValue placeholder="Select data source" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDataSourcesForWidgetType(selectedWidget.type).map(source => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="widget-time-period">Time Period</Label>
                <Select
                  value={selectedWidget.timePeriod}
                  onValueChange={(value) => handleUpdateWidgetSettings(selectedWidget.id, { timePeriod: value })}
                >
                  <SelectTrigger id="widget-time-period" className="mt-1">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_PERIODS.map(period => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedWidget.settings.showLegend}
                    onChange={(e) => handleUpdateWidgetSettings(
                      selectedWidget.id, 
                      { 
                        settings: { 
                          ...selectedWidget.settings, 
                          showLegend: e.target.checked 
                        } 
                      }
                    )}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Show Legend</span>
                </label>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full mb-2 justify-between"
                  onClick={() => handleToggleWidgetVisibility(selectedWidget.id)}
                >
                  <span>{selectedWidget.visible ? 'Hide Widget' : 'Show Widget'}</span>
                  {selectedWidget.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="destructive"
                  className="w-full justify-between"
                  onClick={() => handleRemoveWidget(selectedWidget.id)}
                >
                  <span>Remove Widget</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-4">
          {widgets.filter(widget => widget.visible || isEditMode).map((widget) => (
            <div 
              key={widget.id}
              className={`col-span-${widget.position.w} md:col-span-${widget.position.w}`}
              style={{ 
                order: widget.position.y * 12 + widget.position.x,
                opacity: widget.visible ? 1 : 0.5
              }}
            >
              <Card 
                className={`overflow-hidden transition-shadow ${
                  isEditMode && selectedWidgetId === widget.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : isEditMode 
                    ? 'cursor-pointer hover:shadow-md' 
                    : ''
                }`}
                onClick={isEditMode ? () => handleSelectWidget(widget.id) : undefined}
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-medium">{widget.title}</h3>
                  
                  {isEditMode && (
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWidgetVisibility(widget.id);
                        }}
                      >
                        {widget.visible 
                          ? <EyeOff className="h-4 w-4 text-gray-500" /> 
                          : <Eye className="h-4 w-4 text-gray-500" />
                        }
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWidget(widget.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="cursor-move"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Move className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className={`p-4 ${!widget.visible && 'opacity-50'}`}>
                  {renderWidgetContent(widget)}
                </div>
              </Card>
            </div>
          ))}
          
          {/* Add Widget Button */}
          {isEditMode && (
            <div className="col-span-12 md:col-span-6">
              <Button
                variant="outline"
                className="h-full w-full border-dashed flex flex-col items-center justify-center py-8"
                onClick={() => setIsAddingWidget(true)}
              >
                <Plus className="h-8 w-8 mb-2 text-gray-400" />
                <span>Add Widget</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </AnalyticsLayout>
  );
};

export default CustomDashboard;