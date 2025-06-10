import React from 'react';
import { Link, useLocation } from 'wouter';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { employee, logout } = useEmployeeAuth();
  const [location] = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/employee',
      icon: LayoutDashboard,
      active: location === '/employee'
    },
    {
      name: 'Quote Requests',
      href: '/employee/quote-requests',
      icon: FileText,
      active: location.startsWith('/employee/quote-requests')
    },
    {
      name: 'Quotes & Contracts',
      href: '/employee/quotes',
      icon: Users,
      active: location.startsWith('/employee/quotes')
    },
    {
      name: 'Materials',
      href: '/employee/materials',
      icon: Package,
      active: location.startsWith('/employee/materials')
    },
    {
      name: 'Purchase Orders',
      href: '/employee/purchase-orders',
      icon: ShoppingCart,
      active: location.startsWith('/employee/purchase-orders')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/assets/tsg-logo.png" 
              alt="TSG Fulfillment" 
              className="h-8"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              Employee Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                {employee?.firstName} {employee?.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {employee?.position}
              </span>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>
                    <a className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}