import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Logo from './Logo';

const analyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu, Phone, Mail, MapPin, ChevronDown, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { toast } = useToast();
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const handleGetQuote = () => {
    setLocation('/quote');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  const topbarLinks = [
    { icon: <Phone className="h-4 w-4 mr-2" />, label: '(289) 815-5869', href: 'tel:2898155869' },
    { icon: <Mail className="h-4 w-4 mr-2" />, label: 'info@tsgfulfillment.com', href: 'mailto:info@tsgfulfillment.com' },
    { icon: <MapPin className="h-4 w-4 mr-2" />, label: 'Locations', href: '/locations', isRoute: true },
  ];

  const serviceItems = [
    { label: 'Warehousing', id: 'warehousing', isLink: true },
    { label: 'Fulfillment', id: 'fulfillment', isLink: true },
    { label: 'Transportation', id: 'transportation', isLink: true },
    { label: 'Value Added Services', id: 'value-added-services', isLink: true },
  ];

  const navItems = [
    { 
      label: 'Services', 
      id: 'services',
      hasDropdown: true,
      dropdownItems: serviceItems
    },
    { label: 'Industries', id: 'industries' },
    { label: 'About Us', id: 'about' },
    { label: 'Locations', id: 'locations', isLink: true },
    { label: 'Contact Us', id: 'quote', isLink: true }
  ];
  
  const pageLinks = analyticsEnabled
    ? [{ label: 'Analytics', href: '/analytics' }]
    : [];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2 text-sm hidden md:block">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {topbarLinks.map((item, index) => (
              item.isRoute ? (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center hover:text-gray-200 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <a 
                  key={index} 
                  href={item.href} 
                  className="flex items-center hover:text-gray-200 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              )
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-gray-200 transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    
      {/* Main Navigation */}
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-white'}`}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
          
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative group">
                {item.hasDropdown ? (
                  <div className="flex items-center cursor-pointer px-4 py-2 text-gray-700 hover:text-primary group transition-colors duration-300 font-medium">
                    <span>{item.label}</span>
                    <ChevronDown className="h-4 w-4 ml-1 transition-transform group-hover:rotate-180" />
                    
                    {/* Dropdown menu */}
                    <div className="absolute left-0 top-full transform origin-top-left transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible bg-white shadow-lg rounded-b-md min-w-[200px] z-10">
                      {item.dropdownItems?.map((dropdownItem) => (
                        dropdownItem.isLink ? (
                          <Link
                            key={dropdownItem.id}
                            href={`/services/${dropdownItem.id}`}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
                          >
                            {dropdownItem.label}
                          </Link>
                        ) : (
                          <button
                            key={dropdownItem.id}
                            onClick={() => scrollTo(dropdownItem.id)}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors duration-200"
                          >
                            {dropdownItem.label}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                ) : item.isLink ? (
                  <Link
                    href={`/${item.id}`}
                    className="px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => scrollTo(item.id)}
                    className="px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
            
            {pageLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
              >
                {link.label}
              </Link>
            ))}
            
            <Button 
              onClick={handleGetQuote} 
              className="ml-2 bg-primary text-white hover:bg-primary/90 px-6 flex items-center"
            >
              Get a Quote
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Navigate to different sections of our website</SheetDescription>
              <div className="flex flex-col space-y-1 mt-4">
                {navItems.map((item) => (
                  <div key={item.id} className="border-b border-gray-100">
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => setMobileSubmenuOpen(mobileSubmenuOpen === item.id ? null : item.id)}
                          className="flex items-center justify-between w-full text-left py-3 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
                        >
                          <span>{item.label}</span>
                          <ChevronDown className={`h-4 w-4 transition-transform ${mobileSubmenuOpen === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {mobileSubmenuOpen === item.id && (
                          <div className="pl-4 py-2 bg-gray-50">
                            {item.dropdownItems?.map((dropdownItem) => (
                              dropdownItem.isLink ? (
                                <Link
                                  key={dropdownItem.id}
                                  href={`/services/${dropdownItem.id}`}
                                  className="block w-full text-left py-3 text-gray-600 hover:text-primary transition-colors duration-200"
                                >
                                  {dropdownItem.label}
                                </Link>
                              ) : (
                                <button
                                  key={dropdownItem.id}
                                  onClick={() => scrollTo(dropdownItem.id)}
                                  className="block w-full text-left py-3 text-gray-600 hover:text-primary transition-colors duration-200"
                                >
                                  {dropdownItem.label}
                                </button>
                              )
                            ))}
                          </div>
                        )}
                      </>
                    ) : item.isLink ? (
                      <Link
                        href={`/${item.id}`}
                        className="block w-full text-left py-3 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollTo(item.id)}
                        className="block w-full text-left py-3 text-gray-700 hover:text-primary transition-colors duration-300 font-medium"
                      >
                        {item.label}
                      </button>
                    )}
                  </div>
                ))}
                
                {pageLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-gray-700 hover:text-primary transition-colors duration-300 font-medium text-left border-b border-gray-100"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="pt-4">
                  <Button 
                    onClick={handleGetQuote} 
                    className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
                  >
                    Get a Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                {/* Mobile contact info */}
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-700 mb-4">Contact Us</h3>
                  <div className="flex flex-col space-y-3">
                    {topbarLinks.map((item, index) => (
                      <a 
                        key={index} 
                        href={item.href} 
                        className="flex items-center text-gray-600 hover:text-primary transition-colors"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
