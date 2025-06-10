import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calculator, 
  Package, 
  TrendingUp,
  Settings,
  LogOut,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { Link } from 'wouter';

export default function EmployeePortal() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please log in to access the employee portal.</p>
          <Button asChild>
            <Link href="/auth">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return <Crown className="h-4 w-4" />;
      case "Admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return "destructive";
      case "Admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const canManageUsers = user.role === "SuperAdmin" || user.role === "Admin";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">TSG Fulfillment Employee Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(user.role)}
                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <CardTitle>Dashboard Overview</CardTitle>
              </div>
              <CardDescription>View your dashboard and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Access comprehensive analytics and performance metrics.</p>
              <Button className="w-full">
                View Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Inquiries Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <CardTitle>Customer Inquiries</CardTitle>
              </div>
              <CardDescription>Manage customer inquiries and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Handle incoming customer inquiries and follow-ups.</p>
              <Button className="w-full">
                View Inquiries
              </Button>
            </CardContent>
          </Card>

          {/* Customer Inquiries Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle>Customer Inquiries</CardTitle>
              </div>
              <CardDescription>Review and manage customer quote requests</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">View and respond to customer inquiries submitted through the website.</p>
              <Button asChild className="w-full">
                <Link href="/employee/inquiries">
                  View Inquiries
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quotes Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                <CardTitle>Quote Management</CardTitle>
              </div>
              <CardDescription>Create and manage customer quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Generate quotes and track their status.</p>
              <Button className="w-full">
                Manage Quotes
              </Button>
            </CardContent>
          </Card>

          {/* Contracts Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <CardTitle>Contract Management</CardTitle>
              </div>
              <CardDescription>Handle DocuSign contracts and agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Manage contracts through DocuSign integration.</p>
              <Button className="w-full">
                View Contracts
              </Button>
            </CardContent>
          </Card>

          {/* Materials Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-red-600" />
                <CardTitle>Materials & Inventory</CardTitle>
              </div>
              <CardDescription>Track materials and inventory levels</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Monitor inventory and material management.</p>
              <Button className="w-full">
                View Inventory
              </Button>
            </CardContent>
          </Card>

          {/* User Management Card - Only for Admins and SuperAdmins */}
          {canManageUsers && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <CardTitle>User Management</CardTitle>
                </div>
                <CardDescription>Manage employee accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Create and manage employee accounts with role-based permissions.</p>
                <Button asChild className="w-full">
                  <Link href="/employee/users">
                    Manage Users
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Welcome Message */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to TSG Fulfillment Employee Portal</CardTitle>
              <CardDescription>Your centralized hub for business operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Quick Access</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View and respond to customer inquiries</li>
                    <li>• Generate and manage quotes</li>
                    <li>• Handle contract workflows with DocuSign</li>
                    <li>• Monitor inventory and materials</li>
                    {canManageUsers && <li>• Manage user accounts and permissions</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Your Role: {user.role}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {user.role === "SuperAdmin" && (
                      <div>
                        <p>• Full system access and administration</p>
                        <p>• Complete user management capabilities</p>
                        <p>• Access to all portal features</p>
                      </div>
                    )}
                    {user.role === "Admin" && (
                      <div>
                        <p>• User account management (Users only)</p>
                        <p>• Read/Update access for Admin accounts</p>
                        <p>• Access to most portal features</p>
                      </div>
                    )}
                    {user.role === "User" && (
                      <div>
                        <p>• Basic portal access</p>
                        <p>• View and manage assigned tasks</p>
                        <p>• Access to standard features</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}