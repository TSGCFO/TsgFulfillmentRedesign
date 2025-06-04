import React, { ReactNode } from 'react';
import { Link } from 'wouter';
import { 
  BarChart3 as BarChart2, 
  Package, 
  Truck, 
  Clock, 
  Settings, 
  Home,
  HelpCircle,
  Bell,
  User,
  Search
} from '@/lib/icons';
import Logo from '../Logo';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface AnalyticsLayoutProps {
  children: ReactNode;
  title?: string;
}

// Sidebar navigation items
const sidebarItems = [
  { 
    icon: <BarChart2 className="h-5 w-5" />, 
    label: 'Dashboard', 
    href: '/analytics' 
  },
  { 
    icon: <Package className="h-5 w-5" />, 
    label: 'Inventory', 
    href: '/analytics/inventory' 
  },
  { 
    icon: <Truck className="h-5 w-5" />, 
    label: 'Shipments', 
    href: '/analytics/shipments' 
  },
  { 
    icon: <Clock className="h-5 w-5" />, 
    label: 'Performance', 
    href: '/analytics/performance' 
  },
  { 
    icon: <Settings className="h-5 w-5" />, 
    label: 'Settings', 
    href: '/analytics/settings' 
  }
];

const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({ children, title = 'Analytics Dashboard' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-10">
              <Logo />
            </Link>
            <span className="text-lg font-semibold text-gray-700 hidden md:inline-block">
              {title}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative w-full max-w-md hidden md:block">
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-gray-50"
              />
              <Search className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-5 w-5" /> 
                  <span className="hidden md:inline-block">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/">
                    Return to Website
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-white w-20 md:w-64 shadow-sm hidden md:flex flex-col">
          <nav className="mt-6 flex-1">
            <ul className="space-y-2 px-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg group transition-colors">
                    <div className="text-gray-500 group-hover:text-primary">{item.icon}</div>
                    <span className="ml-3 hidden md:inline-block">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="p-4 mb-4">
            <Link href="/">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Home className="h-5 w-5" />
                <span className="hidden md:inline-block">Back to Website</span>
              </Button>
            </Link>
          </div>
        </aside>
        
        {/* Mobile sidebar button */}
        <div className="md:hidden fixed bottom-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg h-14 w-14">
                <BarChart2 className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sidebarItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href} className="flex items-center">
                    <div className="mr-2">{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  <span>Back to Website</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsLayout;