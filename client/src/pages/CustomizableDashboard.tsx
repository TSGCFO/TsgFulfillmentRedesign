import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, 
  Package, 
  MessageSquare, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  Activity,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  PlusCircle,
  GripVertical,
  Eye,
  EyeOff
} from "lucide-react";

// Widget types and their configurations
const WIDGET_TYPES = {
  stockAlerts: {
    id: 'stockAlerts',
    title: 'Stock Alerts',
    icon: Package,
    color: 'text-orange-600',
    defaultSize: 'small',
    category: 'inventory'
  },
  pendingInquiries: {
    id: 'pendingInquiries', 
    title: 'Pending Inquiries',
    icon: MessageSquare,
    color: 'text-blue-600',
    defaultSize: 'medium',
    category: 'customer'
  },
  upcomingDeadlines: {
    id: 'upcomingDeadlines',
    title: 'Upcoming Deadlines',
    icon: Calendar,
    color: 'text-purple-600',
    defaultSize: 'medium',
    category: 'contracts'
  },
  performanceMetrics: {
    id: 'performanceMetrics',
    title: 'Performance Metrics',
    icon: TrendingUp,
    color: 'text-green-600',
    defaultSize: 'large',
    category: 'analytics'
  },
  recentActivity: {
    id: 'recentActivity',
    title: 'Recent Activity',
    icon: Activity,
    color: 'text-gray-600',
    defaultSize: 'medium',
    category: 'activity'
  },
  teamMembers: {
    id: 'teamMembers',
    title: 'Team Overview',
    icon: Users,
    color: 'text-indigo-600',
    defaultSize: 'small',
    category: 'team'
  },
  contractStatus: {
    id: 'contractStatus',
    title: 'Contract Status',
    icon: FileText,
    color: 'text-pink-600',
    defaultSize: 'medium',
    category: 'contracts'
  },
  revenue: {
    id: 'revenue',
    title: 'Revenue Summary',
    icon: DollarSign,
    color: 'text-green-700',
    defaultSize: 'medium',
    category: 'analytics'
  }
};

// Widget component
function DashboardWidget({ widget, data }: { widget: any; data: any }) {
  const Icon = WIDGET_TYPES[widget.type].icon;
  const config = WIDGET_TYPES[widget.type];
  
  // Determine grid span based on size
  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small':
        return 'col-span-1';
      case 'large':
        return 'col-span-2 row-span-2';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  const renderContent = () => {
    switch (widget.type) {
      case 'stockAlerts':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{data?.lowStock || 0}</span>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600">Items below minimum stock</p>
            {data?.criticalItems && data.criticalItems.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-red-600 mb-1">Critical:</p>
                {data.criticalItems.slice(0, 3).map((item: any, idx: number) => (
                  <p key={idx} className="text-xs text-gray-600">• {item.name}</p>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'pendingInquiries':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xl font-bold">{data?.new || 0}</span>
                <p className="text-xs text-gray-600">New</p>
              </div>
              <div>
                <span className="text-xl font-bold">{data?.inProgress || 0}</span>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
            {data?.urgent > 0 && (
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-sm text-red-600 font-medium">
                  {data.urgent} urgent inquiries need attention
                </p>
              </div>
            )}
          </div>
        );
      
      case 'upcomingDeadlines':
        return (
          <div className="space-y-2">
            {data?.deadlines && data.deadlines.length > 0 ? (
              data.deadlines.slice(0, 4).map((deadline: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b last:border-0">
                  <span className="text-sm">{deadline.title}</span>
                  <Badge variant={deadline.daysLeft <= 3 ? "destructive" : "secondary"}>
                    {deadline.daysLeft}d
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            )}
          </div>
        );

      case 'performanceMetrics':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Response Time</p>
              <p className="text-lg font-semibold">{data?.avgResponseTime || '24h'}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">12% faster</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Completion Rate</p>
              <p className="text-lg font-semibold">{data?.completionRate || '94%'}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+5%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Customer Satisfaction</p>
              <p className="text-lg font-semibold">{data?.satisfaction || '4.8/5'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Tasks Completed</p>
              <p className="text-lg font-semibold">{data?.tasksCompleted || '127'}</p>
            </div>
          </div>
        );

      case 'recentActivity':
        return (
          <div className="space-y-2">
            {data?.activities && data.activities.length > 0 ? (
              data.activities.slice(0, 5).map((activity: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Clock className="h-3 w-3 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        );

      case 'teamMembers':
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">{data?.online || 0} online</span>
              <span className="text-sm text-gray-500">of {data?.total || 0}</span>
            </div>
            <div className="flex -space-x-2">
              {data?.members && data.members.slice(0, 5).map((member: any, idx: number) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center"
                  title={member.name}
                >
                  <span className="text-xs font-medium">{member.initials}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contractStatus':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-semibold text-green-600">{data?.signed || 0}</p>
                <p className="text-xs text-gray-500">Signed</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-yellow-600">{data?.pending || 0}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-600">{data?.expired || 0}</p>
                <p className="text-xs text-gray-500">Expired</p>
              </div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-2xl font-bold">${data?.currentMonth || '0'}</p>
              <div className="flex items-center gap-1">
                {data?.monthGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">+{data.monthGrowth}%</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                    <span className="text-xs text-red-600">{data?.monthGrowth || 0}%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Widget content</p>;
    }
  };

  return (
    <Card className={`${getSizeClasses()} hover:shadow-lg transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.color}`} />
            <CardTitle className="text-base">{config.title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

export default function CustomizableDashboard() {
  const { user } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardLayout, setDashboardLayout] = useState<any[]>([]);
  
  // Load user's saved dashboard preferences
  useEffect(() => {
    const savedLayout = localStorage.getItem(`dashboard_${user?.id}`);
    if (savedLayout) {
      setDashboardLayout(JSON.parse(savedLayout));
    } else {
      // Default layout
      setDashboardLayout([
        { type: 'pendingInquiries', size: 'medium', visible: true },
        { type: 'stockAlerts', size: 'small', visible: true },
        { type: 'upcomingDeadlines', size: 'medium', visible: true },
        { type: 'performanceMetrics', size: 'large', visible: true },
        { type: 'recentActivity', size: 'medium', visible: true },
        { type: 'teamMembers', size: 'small', visible: true },
      ]);
    }
  }, [user]);

  // Save dashboard preferences
  const saveDashboardLayout = () => {
    localStorage.setItem(`dashboard_${user?.id}`, JSON.stringify(dashboardLayout));
    setShowSettings(false);
  };

  // Toggle widget visibility
  const toggleWidget = (widgetType: string) => {
    setDashboardLayout(prev => 
      prev.map(widget => 
        widget.type === widgetType 
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    );
  };

  // Change widget size
  const changeWidgetSize = (widgetType: string, size: string) => {
    setDashboardLayout(prev =>
      prev.map(widget =>
        widget.type === widgetType
          ? { ...widget, size }
          : widget
      )
    );
  };

  // Add widget to dashboard
  const addWidget = (widgetType: string) => {
    if (!dashboardLayout.find(w => w.type === widgetType)) {
      setDashboardLayout(prev => [
        ...prev,
        {
          type: widgetType,
          size: WIDGET_TYPES[widgetType as keyof typeof WIDGET_TYPES].defaultSize,
          visible: true
        }
      ]);
    }
  };

  // Mock data for widgets (in production, these would be API calls)
  const widgetData = {
    stockAlerts: {
      lowStock: 8,
      criticalItems: [
        { name: 'Packaging Tape', stock: 2 },
        { name: 'Bubble Wrap', stock: 0 },
        { name: 'Shipping Labels', stock: 5 }
      ]
    },
    pendingInquiries: {
      new: 12,
      inProgress: 5,
      urgent: 2
    },
    upcomingDeadlines: {
      deadlines: [
        { title: 'Contract #2024-001', daysLeft: 2 },
        { title: 'Quote Response ABC Corp', daysLeft: 3 },
        { title: 'Inventory Report', daysLeft: 7 },
        { title: 'Client Review Meeting', daysLeft: 10 }
      ]
    },
    performanceMetrics: {
      avgResponseTime: '18h',
      completionRate: '94%',
      satisfaction: '4.8/5',
      tasksCompleted: 127
    },
    recentActivity: {
      activities: [
        { description: 'New inquiry from ABC Corp', time: '5 minutes ago' },
        { description: 'Contract signed by XYZ Ltd', time: '1 hour ago' },
        { description: 'Stock alert for Bubble Wrap', time: '2 hours ago' },
        { description: 'Quote approved for Client #123', time: '3 hours ago' },
        { description: 'Material order received', time: '5 hours ago' }
      ]
    },
    teamMembers: {
      online: 5,
      total: 8,
      members: [
        { name: 'John Doe', initials: 'JD' },
        { name: 'Jane Smith', initials: 'JS' },
        { name: 'Mike Wilson', initials: 'MW' },
        { name: 'Sarah Johnson', initials: 'SJ' },
        { name: 'Tom Brown', initials: 'TB' }
      ]
    },
    contractStatus: {
      signed: 24,
      pending: 8,
      expired: 2
    },
    revenue: {
      currentMonth: '125,430',
      monthGrowth: 12
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.fullName}! Here's your personalized overview.
          </p>
        </div>
        <Button onClick={() => setShowSettings(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
        {dashboardLayout
          .filter(widget => widget.visible)
          .map((widget, index) => (
            <DashboardWidget
              key={`${widget.type}-${index}`}
              widget={widget}
              data={widgetData[widget.type as keyof typeof widgetData]}
            />
          ))}
      </div>

      {/* Customize Dashboard Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customize Dashboard</DialogTitle>
            <DialogDescription>
              Choose which widgets to display and their sizes on your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              {Object.entries(WIDGET_TYPES).map(([key, config]) => {
                const widget = dashboardLayout.find(w => w.type === key);
                const Icon = config.icon;
                
                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <div>
                        <p className="font-medium">{config.title}</p>
                        <p className="text-sm text-gray-500">Category: {config.category}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {widget && (
                        <Select
                          value={widget.size}
                          onValueChange={(value) => changeWidgetSize(key, value)}
                          disabled={!widget.visible}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`widget-${key}`} className="sr-only">
                          Toggle {config.title}
                        </Label>
                        <Switch
                          id={`widget-${key}`}
                          checked={widget?.visible ?? false}
                          onCheckedChange={() => 
                            widget ? toggleWidget(key) : addWidget(key)
                          }
                        />
                        {widget?.visible ? (
                          <Eye className="h-4 w-4 text-gray-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={saveDashboardLayout}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}