import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { Link } from 'wouter';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, FileText, Save, Plus, X, GripHorizontal,
  ExternalLink, Settings, LayoutGrid, Trash2, Edit3,
  BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Activity, Clock, ArrowUpRight, ArrowDownRight,
  Maximize2, Minimize2, Move, Package, DollarSign
} from 'lucide-react';

import { DashboardSetting } from '@/shared/schema'; 
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AnalyticsLayout from '@/components/analytics/Layout';
import Seo from '@/components/SEO/Seo';

// Colors for visualizations
const COLORS = {
  primary: '#0056B3',
  secondary: '#28A745',
  tertiary: '#FFC107',
  quaternary: '#DC3545',
  quinary: '#6C757D',
};

// Widget types
const WIDGET_TYPES = [
  { id: 'kpi', name: 'KPI Card', icon: <Activity size={18} /> },
  { id: 'bar', name: 'Bar Chart', icon: <BarChart2 size={18} /> },
  { id: 'line', name: 'Line Chart', icon: <LineChartIcon size={18} /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartIcon size={18} /> },
];

// KPI types
const KPI_TYPES = [
  { id: 'shipments', name: 'Total Shipments', icon: <Package size={18} />, color: COLORS.primary },
  { id: 'inventory', name: 'Inventory Items', icon: <Package size={18} />, color: COLORS.secondary },
  { id: 'orders', name: 'Orders Processed', icon: <FileText size={18} />, color: COLORS.tertiary },
  { id: 'ontime', name: 'On-Time Delivery', icon: <Clock size={18} />, color: COLORS.quaternary },
  { id: 'revenue', name: 'Total Revenue', icon: <DollarSign size={18} />, color: COLORS.quinary },
];

// Mock Data Generators
const getKpiData = (type: string) => {
  switch (type) {
    case 'shipments':
      return { value: 243, change: 12.5, changeType: 'increase' };
    case 'inventory':
      return { value: 1298, change: 4.2, changeType: 'increase' };
    case 'orders':
      return { value: 508, change: 7.8, changeType: 'increase' };
    case 'ontime':
      return { value: 97.2, change: 1.5, changeType: 'increase', isPercentage: true };
    case 'revenue':
      return { value: 145750, change: 9.7, changeType: 'increase', isCurrency: true };
    default:
      return { value: 0, change: 0, changeType: 'increase' };
  }
};

const getBarChartData = (dataType: string) => {
  if (dataType === 'shipments') {
    return [
      { name: 'Mon', value: 45 },
      { name: 'Tue', value: 52 },
      { name: 'Wed', value: 48 },
      { name: 'Thu', value: 61 },
      { name: 'Fri', value: 55 },
      { name: 'Sat', value: 32 },
      { name: 'Sun', value: 18 },
    ];
  } else if (dataType === 'inventory') {
    return [
      { name: 'Warehouse A', value: 450 },
      { name: 'Warehouse B', value: 320 },
      { name: 'Warehouse C', value: 280 },
      { name: 'Warehouse D', value: 190 },
    ];
  } else if (dataType === 'orders') {
    return [
      { name: 'Standard', value: 320 },
      { name: 'Express', value: 125 },
      { name: 'Priority', value: 75 },
    ];
  }
  
  return [];
};

const getLineChartData = (dataType: string) => {
  if (dataType === 'shipments') {
    return Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), 'MM/dd'),
      value: Math.floor(Math.random() * 30) + 30,
    }));
  } else if (dataType === 'inventory') {
    return Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), 'MM/dd'),
      value: Math.floor(Math.random() * 200) + 1100,
    }));
  } else if (dataType === 'orders') {
    return Array.from({ length: 14 }, (_, i) => ({
      date: format(subDays(new Date(), 13 - i), 'MM/dd'),
      value: Math.floor(Math.random() * 60) + 30,
    }));
  }
  
  return [];
};

const getPieChartData = (dataType: string) => {
  if (dataType === 'shipments') {
    return [
      { name: 'FedEx', value: 45 },
      { name: 'UPS', value: 35 },
      { name: 'USPS', value: 25 },
      { name: 'DHL', value: 15 },
    ];
  } else if (dataType === 'inventory') {
    return [
      { name: 'Optimal', value: 250 },
      { name: 'Low Stock', value: 12 },
      { name: 'Overstock', value: 38 },
    ];
  } else if (dataType === 'orders') {
    return [
      { name: 'Processed', value: 380 },
      { name: 'Pending', value: 45 },
      { name: 'Cancelled', value: 15 },
    ];
  }
  
  return [];
};

// KPI Card Component
const KpiCard: React.FC<{
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  color?: string;
  isPercentage?: boolean;
  isCurrency?: boolean;
  isCompact?: boolean;
  widgetId: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  color = COLORS.primary, 
  isPercentage = false, 
  isCurrency = false,
  isCompact = false,
  widgetId,
  onEdit,
  onRemove
}) => {
  return (
    <Card className={`${isCompact ? 'p-3' : 'p-4'} h-full`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>{title}</h3>
          <p className={`${isCompact ? 'text-xl' : 'text-2xl'} font-bold mt-1`}>
            {isCurrency && '$'}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {isPercentage && '%'}
          </p>
          <div className={`flex items-center mt-1 ${isCompact ? 'text-xs' : 'text-sm'} ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {changeType === 'increase' ? <ArrowUpRight size={isCompact ? 12 : 14} /> : <ArrowDownRight size={isCompact ? 12 : 14} />}
            <span>{change}%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(widgetId)}
          >
            <Edit3 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onRemove(widgetId)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Bar Chart Component
const BarChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKey: string;
  nameKey?: string;
  color?: string;
  widgetId: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ 
  title,
  data,
  dataKey = 'value',
  nameKey = 'name',
  color = COLORS.primary,
  widgetId,
  onEdit,
  onRemove
}) => {
  return (
    <Card className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(widgetId)}
          >
            <Edit3 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onRemove(widgetId)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={nameKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Line Chart Component
const LineChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  widgetId: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ 
  title,
  data,
  dataKey = 'value',
  xAxisKey = 'date',
  color = COLORS.primary,
  widgetId,
  onEdit,
  onRemove
}) => {
  return (
    <Card className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(widgetId)}
          >
            <Edit3 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onRemove(widgetId)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Pie Chart Component
const PieChartWidget: React.FC<{
  title: string;
  data: any[];
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  widgetId: string;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}> = ({ 
  title,
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.quinary],
  widgetId,
  onEdit,
  onRemove
}) => {
  return (
    <Card className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onEdit(widgetId)}
          >
            <Edit3 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => onRemove(widgetId)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      
      <div className="h-60 flex justify-center">
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
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

// Dialog for adding/editing widgets
const WidgetDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (widgetConfig: any) => void;
  initialConfig?: any;
  isEditing?: boolean;
}> = ({ open, onClose, onSave, initialConfig = null, isEditing = false }) => {
  const [widgetType, setWidgetType] = useState(initialConfig?.type || 'kpi');
  const [widgetTitle, setWidgetTitle] = useState(initialConfig?.title || '');
  const [dataType, setDataType] = useState(initialConfig?.dataType || 'shipments');
  const [refresh, setRefresh] = useState(initialConfig?.refresh || 'manual');
  const [size, setSize] = useState(initialConfig?.size || 'medium');
  
  const handleSave = () => {
    onSave({
      id: initialConfig?.id || `widget-${Date.now()}`,
      type: widgetType,
      title: widgetTitle || (
        widgetType === 'kpi' 
          ? KPI_TYPES.find(k => k.id === dataType)?.name 
          : `${dataType.charAt(0).toUpperCase() + dataType.slice(1)} ${WIDGET_TYPES.find(w => w.id === widgetType)?.name}`
      ),
      dataType,
      refresh,
      size,
      position: initialConfig?.position || 0
    });
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Widget' : 'Add New Widget'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="widget-type">Widget Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {WIDGET_TYPES.map(type => (
                <Button
                  key={type.id}
                  type="button"
                  variant={widgetType === type.id ? "default" : "outline"}
                  className="justify-start h-auto py-2"
                  onClick={() => setWidgetType(type.id)}
                >
                  <span className="mr-2">{type.icon}</span>
                  <span className="text-xs">{type.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="widget-title">Widget Title (Optional)</Label>
            <Input
              id="widget-title"
              placeholder="Enter custom title"
              value={widgetTitle}
              onChange={(e) => setWidgetTitle(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave blank to use default title based on data type
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="data-type">Data Type</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="data-type">
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipments">Shipments</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                {widgetType === 'kpi' && (
                  <>
                    <SelectItem value="ontime">On-Time Delivery</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="refresh-rate">Refresh Rate</Label>
              <Select value={refresh} onValueChange={setRefresh}>
                <SelectTrigger id="refresh-rate">
                  <SelectValue placeholder="Select refresh rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="realtime">Real-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="widget-size">Widget Size</Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="widget-size">
                  <SelectValue placeholder="Select widget size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {widgetType !== 'kpi' && (
            <div className="border rounded-md p-3 bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Preview</h4>
              <div className="h-32 w-full bg-white border rounded">
                <ResponsiveContainer width="100%" height="100%">
                  {widgetType === 'bar' ? (
                    <BarChart data={getBarChartData(dataType).slice(0, 3)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill={COLORS.primary} />
                    </BarChart>
                  ) : widgetType === 'line' ? (
                    <LineChart data={getLineChartData(dataType).slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke={COLORS.primary} />
                    </LineChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={getPieChartData(dataType)}
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPieChartData(dataType).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary][index % 4]} />
                        ))}
                      </Pie>
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {isEditing ? 'Update Widget' : 'Add Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Dashboard Component
const CustomDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'columns'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch dashboard settings
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard-settings'],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/dashboard-settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard settings');
      }
      return response.json();
    }
  });
  
  // Save dashboard settings
  const saveMutation = useMutation({
    mutationFn: async (settings: any) => {
      const response = await fetch('/api/analytics/dashboard-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save dashboard settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard-settings'] });
    },
  });
  
  // Load widgets from dashboard data
  useEffect(() => {
    if (dashboardData?.data?.widgets) {
      setWidgets(dashboardData.data.widgets);
    } else if (!isLoading && !dashboardData?.data?.widgets) {
      // Set default widgets if none exist
      setWidgets([
        {
          id: 'widget-1',
          type: 'kpi',
          title: 'Total Shipments',
          dataType: 'shipments',
          refresh: 'daily',
          size: 'medium',
          position: 0
        },
        {
          id: 'widget-2',
          type: 'kpi',
          title: 'Inventory Items',
          dataType: 'inventory',
          refresh: 'daily',
          size: 'medium',
          position: 1
        },
        {
          id: 'widget-3',
          type: 'bar',
          title: 'Shipments by Day',
          dataType: 'shipments',
          refresh: 'daily',
          size: 'medium',
          position: 2
        },
        {
          id: 'widget-4',
          type: 'line',
          title: 'Orders Trend',
          dataType: 'orders',
          refresh: 'daily',
          size: 'large',
          position: 3
        }
      ]);
    }
  }, [dashboardData, isLoading]);
  
  // Add new widget
  const handleAddWidget = (widgetConfig: any) => {
    const updatedWidgets = [...widgets, widgetConfig];
    setWidgets(updatedWidgets);
    saveMutation.mutate({ widgets: updatedWidgets });
  };
  
  // Update existing widget
  const handleUpdateWidget = (widgetConfig: any) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === widgetConfig.id ? widgetConfig : widget
    );
    setWidgets(updatedWidgets);
    saveMutation.mutate({ widgets: updatedWidgets });
  };
  
  // Remove widget
  const handleRemoveWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
    setWidgets(updatedWidgets);
    saveMutation.mutate({ widgets: updatedWidgets });
  };
  
  // Edit widget
  const handleEditWidget = (widgetId: string) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setEditingWidget(widget);
      setDialogOpen(true);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/dashboard-settings'] });
    
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Widget size to grid span mapping
  const getWidgetSize = (size: string) => {
    if (dashboardLayout === 'grid') {
      switch (size) {
        case 'small': return 'col-span-1';
        case 'large': return 'col-span-3';
        case 'medium':
        default: return 'col-span-2';
      }
    } else {
      switch (size) {
        case 'small': return 'col-span-1';
        case 'large': return 'row-span-2';
        case 'medium':
        default: return '';
      }
    }
  };
  
  // Render Widget
  const renderWidget = (widget: any) => {
    const kpiData = getKpiData(widget.dataType);
    
    switch (widget.type) {
      case 'kpi':
        return (
          <KpiCard
            title={widget.title}
            value={kpiData.value}
            change={kpiData.change}
            changeType={kpiData.changeType}
            isPercentage={kpiData.isPercentage}
            isCurrency={kpiData.isCurrency}
            color={KPI_TYPES.find(k => k.id === widget.dataType)?.color}
            widgetId={widget.id}
            onEdit={handleEditWidget}
            onRemove={handleRemoveWidget}
            isCompact={widget.size === 'small'}
          />
        );
      
      case 'bar':
        return (
          <BarChartWidget
            title={widget.title}
            data={getBarChartData(widget.dataType)}
            dataKey="value"
            widgetId={widget.id}
            onEdit={handleEditWidget}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'line':
        return (
          <LineChartWidget
            title={widget.title}
            data={getLineChartData(widget.dataType)}
            dataKey="value"
            widgetId={widget.id}
            onEdit={handleEditWidget}
            onRemove={handleRemoveWidget}
          />
        );
      
      case 'pie':
        return (
          <PieChartWidget
            title={widget.title}
            data={getPieChartData(widget.dataType)}
            dataKey="value"
            widgetId={widget.id}
            onEdit={handleEditWidget}
            onRemove={handleRemoveWidget}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <AnalyticsLayout title="Custom Dashboard">
      <div className="p-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Custom Dashboard</h1>
              <p className="text-gray-600">Create and customize your own analytics dashboard</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Back to Analytics
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg 
                      className="mr-2 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M3 21v-5h5" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Layout
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setDashboardLayout('grid')}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Grid Layout
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDashboardLayout('columns')}>
                    <GripHorizontal className="mr-2 h-4 w-4" />
                    Column Layout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => { setEditingWidget(null); setDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </div>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : widgets.length === 0 ? (
          <Card className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">No Widgets Added Yet</h3>
            <p className="text-gray-600 mb-4">Start building your custom dashboard by adding widgets</p>
            <Button onClick={() => { setEditingWidget(null); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Widget
            </Button>
          </Card>
        ) : (
          <div className={
            dashboardLayout === 'grid'
              ? "grid grid-cols-4 gap-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }>
            {widgets
              .sort((a, b) => a.position - b.position)
              .map(widget => (
                <div 
                  key={widget.id} 
                  className={`${getWidgetSize(widget.size)}`}
                >
                  {renderWidget(widget)}
                </div>
              ))
            }
          </div>
        )}
      </div>
      
      <WidgetDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingWidget(null); }}
        onSave={editingWidget ? handleUpdateWidget : handleAddWidget}
        initialConfig={editingWidget}
        isEditing={!!editingWidget}
      />
    </AnalyticsLayout>
  );
};

export default CustomDashboard;