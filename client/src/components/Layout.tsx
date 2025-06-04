import React from 'react';
import { Link } from 'wouter';
import { Phone, Mail, MapPin, ArrowRight, Menu, X, ChevronDown } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import logoOnTransparent from '@assets/Original on Transparent.png';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="bg-[#0056B3] text-white text-sm py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <a href="tel:+18005551234" className="flex items-center hover:text-blue-200 transition-colors">
              <Phone size={14} className="mr-2" />
              <span>(800) 555-1234</span>
            </a>
            <a href="mailto:info@tsgfulfillment.com" className="flex items-center hover:text-blue-200 transition-colors">
              <Mail size={14} className="mr-2" />
              <span>info@tsgfulfillment.com</span>
            </a>
            <div className="flex items-center">
              <MapPin size={14} className="mr-2" />
              <span>123 Logistics Way, Warehouse District, CA 90210</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/login" className="hover:text-blue-200 transition-colors">Client Login</a>
            <a href="/contact" className="hover:text-blue-200 transition-colors">Contact Us</a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/">
              <a className="flex items-center">
                <img src={logoOnTransparent} alt="TSG Fulfillment" className="h-12" />
              </a>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 focus:outline-none"
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="relative group">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center text-gray-700 hover:text-[#0056B3] px-2 py-1 font-medium focus:outline-none">
                    <span>Services</span>
                    <ChevronDown size={16} className="ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white rounded-md shadow-lg p-2">
                    <DropdownMenuItem asChild>
                      <Link href="/services/warehousing">
                        <a className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-[#0056B3] rounded-md">
                          Warehousing
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/services/fulfillment">
                        <a className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-[#0056B3] rounded-md">
                          Order Fulfillment
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/services/kitting">
                        <a className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-[#0056B3] rounded-md">
                          Kitting & Assembly
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/services/reverse-logistics">
                        <a className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-[#0056B3] rounded-md">
                          Reverse Logistics
                        </a>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Link href="/industries">
                <a className="text-gray-700 hover:text-[#0056B3] px-2 py-1 font-medium">Industries</a>
              </Link>
              
              <Link href="/technology">
                <a className="text-gray-700 hover:text-[#0056B3] px-2 py-1 font-medium">Technology</a>
              </Link>
              
              <Link href="/why-us">
                <a className="text-gray-700 hover:text-[#0056B3] px-2 py-1 font-medium">Why TSG</a>
              </Link>
              
              <Link href="/blog">
                <a className="text-gray-700 hover:text-[#0056B3] px-2 py-1 font-medium">Resources</a>
              </Link>
              
              <Button className="bg-[#0056B3] hover:bg-[#004494] text-white px-6">
                Get a Quote
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden ${menuOpen ? 'block' : 'hidden'} bg-white border-t`}>
          <div className="px-4 py-2">
            <div className="py-2 border-b">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium">Services</span>
                <ChevronDown size={16} />
              </div>
              <div className="pl-4 py-1">
                <Link href="/services/warehousing">
                  <a className="block py-2 text-gray-700">Warehousing</a>
                </Link>
                <Link href="/services/fulfillment">
                  <a className="block py-2 text-gray-700">Order Fulfillment</a>
                </Link>
                <Link href="/services/kitting">
                  <a className="block py-2 text-gray-700">Kitting & Assembly</a>
                </Link>
                <Link href="/services/reverse-logistics">
                  <a className="block py-2 text-gray-700">Reverse Logistics</a>
                </Link>
              </div>
            </div>
            
            <Link href="/industries">
              <a className="block py-3 border-b text-gray-700">Industries</a>
            </Link>
            
            <Link href="/technology">
              <a className="block py-3 border-b text-gray-700">Technology</a>
            </Link>
            
            <Link href="/why-us">
              <a className="block py-3 border-b text-gray-700">Why TSG</a>
            </Link>
            
            <Link href="/blog">
              <a className="block py-3 border-b text-gray-700">Resources</a>
            </Link>
            
            <div className="py-4">
              <Button className="w-full bg-[#0056B3] hover:bg-[#004494]">
                <span className="text-white">Get a Quote</span>
              </Button>
            </div>
            
            <div className="pt-2 pb-4 space-y-2 text-sm">
              <a href="tel:+18005551234" className="flex items-center text-gray-600">
                <Phone size={14} className="mr-2" />
                <span>(800) 555-1234</span>
              </a>
              <a href="mailto:info@tsgfulfillment.com" className="flex items-center text-gray-600">
                <Mail size={14} className="mr-2" />
                <span>info@tsgfulfillment.com</span>
              </a>
              <div className="flex items-center text-gray-600">
                <MapPin size={14} className="mr-2 flex-shrink-0" />
                <span>123 Logistics Way, Warehouse District, CA 90210</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img src={logoOnTransparent} alt="TSG Fulfillment" className="h-12 mb-4 brightness-0 invert" />
              <p className="mb-4 text-gray-400">
                TSG Fulfillment is your trusted partner for warehousing and fulfillment services. 
                We help businesses of all sizes streamline their logistics operations.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Our Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/services/warehousing">
                    <a className="text-gray-400 hover:text-white transition-colors">Warehousing</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services/fulfillment">
                    <a className="text-gray-400 hover:text-white transition-colors">Order Fulfillment</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services/kitting">
                    <a className="text-gray-400 hover:text-white transition-colors">Kitting & Assembly</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services/reverse-logistics">
                    <a className="text-gray-400 hover:text-white transition-colors">Reverse Logistics</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services/inventory-management">
                    <a className="text-gray-400 hover:text-white transition-colors">Inventory Management</a>
                  </Link>
                </li>
                <li>
                  <Link href="/services/shipping">
                    <a className="text-gray-400 hover:text-white transition-colors">Shipping & Distribution</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">
                    <a className="text-gray-400 hover:text-white transition-colors">About Us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/why-us">
                    <a className="text-gray-400 hover:text-white transition-colors">Why Choose TSG</a>
                  </Link>
                </li>
                <li>
                  <Link href="/industries">
                    <a className="text-gray-400 hover:text-white transition-colors">Industries We Serve</a>
                  </Link>
                </li>
                <li>
                  <Link href="/technology">
                    <a className="text-gray-400 hover:text-white transition-colors">Technology</a>
                  </Link>
                </li>
                <li>
                  <Link href="/locations">
                    <a className="text-gray-400 hover:text-white transition-colors">Locations</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={18} className="mr-2 mt-1 flex-shrink-0 text-[#0056B3]" />
                  <span className="text-gray-400">
                    123 Logistics Way<br />
                    Warehouse District, CA 90210
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone size={18} className="mr-2 flex-shrink-0 text-[#0056B3]" />
                  <span className="text-gray-400">(800) 555-1234</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="mr-2 flex-shrink-0 text-[#0056B3]" />
                  <span className="text-gray-400">info@tsgfulfillment.com</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/quote">
                  <Button className="bg-[#0056B3] hover:bg-[#004494] text-white px-6">
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-6 text-gray-500 text-sm">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p>&copy; {new Date().getFullYear()} TSG Fulfillment. All rights reserved.</p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link href="/privacy">
                  <a className="hover:text-white transition-colors">Privacy Policy</a>
                </Link>
                <Link href="/terms">
                  <a className="hover:text-white transition-colors">Terms of Service</a>
                </Link>
                <Link href="/sitemap">
                  <a className="hover:text-white transition-colors">Sitemap</a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;