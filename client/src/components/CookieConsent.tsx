import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if cookie consent already exists
    const hasConsent = localStorage.getItem('cookie-consent');
    
    // If no consent is found, show the banner
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
    
    // Here you would typically initialize your analytics/tracking scripts
    console.log('Cookies accepted, analytics enabled');
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setIsVisible(false);
    
    // Here you would disable any non-essential cookies
    console.log('Cookies declined, analytics disabled');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white text-gray-800 shadow-lg z-50 animate-fadeIn">
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="pr-4 flex-1">
            <h3 className="font-bold text-lg mb-2">We Value Your Privacy</h3>
            <p className="text-sm text-gray-600">
              This website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies as described in our Cookie Policy.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={decline}
              className="text-sm"
            >
              Decline Non-Essential
            </Button>
            <Button 
              onClick={acceptAll}
              className="bg-primary text-white hover:bg-primary/90 text-sm"
            >
              Accept All Cookies
            </Button>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="absolute top-2 right-2 md:static md:ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Close cookie consent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>
            You can change your preferences at any time by visiting our Privacy Settings page. 
            For more details about our cookies, see our <a href="#" className="underline hover:text-primary">Cookie Policy</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;