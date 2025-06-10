import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calculator, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

export interface Employee {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  createdAt: string;
  status: string;
}

export function EmployeePortal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  // Mock authentication for demo - in production, implement proper auth
  React.useEffect(() => {
    // This would be replaced with actual authentication
    setCurrentEmployee({
      id: 1,
      email: "demo@tsgfulfillment.com",
      firstName: "Demo",
      lastName: "User",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }, []);

  if (!currentEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Employee Portal Login</CardTitle>
            <CardDescription>Please sign in to access the employee portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Sign In</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentEmployee.firstName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={currentEmployee.role === 'admin' ? 'default' : 'secondary'}>
                {currentEmployee.role}
              </Badge>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Quotes
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Contracts
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Materials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiryManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="quotes">
            <QuoteManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="contracts">
            <ContractManagement employeeId={currentEmployee.id} />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsInventory employeeId={currentEmployee.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function DashboardOverview({ employeeId }: { employeeId: number }) {
  const { data: quoteRequests, isLoading } = useQuery({
    queryKey: ['/api/quote-requests']
  });

  // Mock data for demonstration
  const mockStats = {
    totalInquiries: quoteRequests?.data?.length || 0,
    activeQuotes: 8,
    signedContracts: 12,
    lowStockItems: 3,
    recentActivity: [
      { type: "inquiry", message: "New inquiry from ABC Corp", time: "2 hours ago" },
      { type: "quote", message: "Quote Q-12345 accepted", time: "4 hours ago" },
      { type: "contract", message: "Contract signed for XYZ Ltd", time: "1 day ago" },
      { type: "material", message: "Low stock alert: Bubble wrap", time: "2 days ago" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-blue-600">{mockStats.totalInquiries}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Quotes</p>
                <p className="text-3xl font-bold text-yellow-600">{mockStats.activeQuotes}</p>
              </div>
              <Calculator className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Signed Contracts</p>
                <p className="text-3xl font-bold text-green-600">{mockStats.signedContracts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-red-600">{mockStats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {activity.type === 'inquiry' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'quote' && <Calculator className="h-5 w-5 text-yellow-500" />}
                  {activity.type === 'contract' && <FileText className="h-5 w-5 text-green-500" />}
                  {activity.type === 'material' && <Package className="h-5 w-5 text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Quote Requests */}
      {quoteRequests?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Quote Requests</CardTitle>
            <CardDescription>Latest customer inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quoteRequests.data.slice(0, 5).map((request: QuoteRequest) => (
                <div key={request.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{request.name}</h4>
                      <Badge variant="outline">{request.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {request.company}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {request.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{request.service}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Placeholder components for other tabs
function InquiryManagement({ employeeId }: { employeeId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inquiry Management</CardTitle>
        <CardDescription>Manage customer inquiries and assignments</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Inquiry management interface will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

function QuoteManagement({ employeeId }: { employeeId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quote Management</CardTitle>
        <CardDescription>Create and manage customer quotes</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Quote management interface will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

function ContractManagement({ employeeId }: { employeeId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Management</CardTitle>
        <CardDescription>Manage contracts and DocuSign integration</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Contract management interface will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

function MaterialsInventory({ employeeId }: { employeeId: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Inventory</CardTitle>
        <CardDescription>Track materials, supplies, and vendor management</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Materials inventory interface will be implemented here.</p>
      </CardContent>
    </Card>
  );
}

export default EmployeePortal;