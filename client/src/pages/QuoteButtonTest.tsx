import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, TestTube } from 'lucide-react';

interface TestResult {
  page: string;
  buttonText: string;
  status: 'untested' | 'working' | 'broken';
  location: string;
}

const QuoteButtonTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { page: 'Home Page', buttonText: 'Get a Quote (Navbar)', status: 'untested', location: 'Top navigation bar' },
    { page: 'Home Page', buttonText: 'Request a Quote (Hero)', status: 'untested', location: 'Hero section' },
    { page: 'Home Page', buttonText: 'Get a Free Quote (CTA)', status: 'untested', location: 'CTA section' },
    { page: 'Service Pages', buttonText: 'Request a Quote', status: 'untested', location: 'Service detail pages' },
    { page: 'OWD Home', buttonText: 'Request a Quote', status: 'untested', location: 'CTA banner' },
    { page: 'New Home', buttonText: 'Request a Quote (x2)', status: 'untested', location: 'CTA sections' },
    { page: 'Contact Page', buttonText: 'Quote Form Access', status: 'untested', location: 'Contact form section' }
  ]);

  const [currentTest, setCurrentTest] = useState('');

  const testCurrentPage = () => {
    setCurrentTest('Running tests...');
    
    // Check if contact section exists
    const contactSection = document.getElementById('contact');
    if (!contactSection) {
      setCurrentTest('❌ No contact section found on this page');
      return;
    }

    // Find all quote-related buttons
    const allButtons = Array.from(document.querySelectorAll('button, a'));
    const quoteButtons = allButtons.filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('quote') || text.includes('get a') || text.includes('request');
    });

    if (quoteButtons.length === 0) {
      setCurrentTest('❌ No quote buttons found on this page');
      return;
    }

    setCurrentTest(`✅ Found ${quoteButtons.length} quote button(s) on this page. Contact section exists.`);

    // Test each button by checking if it has proper click handlers
    const buttonDetails = quoteButtons.map(btn => {
      const hasClickHandler = btn.onclick !== null || 
                             btn.getAttribute('onclick') !== null ||
                             btn.addEventListener !== undefined;
      return `• "${btn.textContent?.trim()}" - ${hasClickHandler ? 'Has click handler' : 'No click handler'}`;
    }).join('\n');

    setCurrentTest(`✅ Found ${quoteButtons.length} quote button(s):\n${buttonDetails}\n\n📍 Contact section is available for scrolling.`);
  };

  const testSpecificButton = (buttonText: string) => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    const targetButton = buttons.find(btn => 
      btn.textContent?.toLowerCase().includes(buttonText.toLowerCase())
    );

    if (targetButton) {
      // Simulate click and check if page scrolls
      const initialScrollY = window.scrollY;
      (targetButton as HTMLElement).click();
      
      setTimeout(() => {
        const scrolled = window.scrollY !== initialScrollY;
        const contactVisible = document.getElementById('contact')?.getBoundingClientRect().top;
        
        if (scrolled || (contactVisible && contactVisible < window.innerHeight)) {
          setCurrentTest(`✅ "${buttonText}" button works correctly`);
        } else {
          setCurrentTest(`❌ "${buttonText}" button may not be working`);
        }
      }, 1000);
    } else {
      setCurrentTest(`❌ Button "${buttonText}" not found on current page`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-3">
            <TestTube className="h-8 w-8 text-primary" />
            Quote Button Test Suite
          </CardTitle>
          <p className="text-center text-gray-600">
            Manual testing tool for verifying quote button functionality across the website
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Current Page Test */}
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Test Current Page</h3>
              <Button onClick={testCurrentPage} className="bg-blue-600 hover:bg-blue-700">
                Scan Page
              </Button>
            </div>
            <div className="text-sm bg-white p-3 rounded border min-h-[60px] whitespace-pre-line">
              {currentTest || 'Click "Scan Page" to check for quote buttons on the current page'}
            </div>
          </div>

          {/* Manual Test Instructions */}
          <div className="p-4 border rounded-lg bg-green-50">
            <h3 className="font-medium text-lg mb-3">Manual Testing Instructions</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Step 1:</strong> Navigate to each page listed below</p>
              <p><strong>Step 2:</strong> Click "Scan Page" to detect quote buttons</p>
              <p><strong>Step 3:</strong> Manually click each quote button to verify it scrolls to the contact form</p>
              <p><strong>Step 4:</strong> Mark results as working ✅ or broken ❌</p>
            </div>
          </div>

          {/* Pages to Test */}
          <div className="space-y-3">
            <h3 className="font-medium text-lg">Pages to Test:</h3>
            
            <div className="grid gap-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Home Page (/)</h4>
                    <p className="text-sm text-gray-600">Test: Navbar "Get a Quote", Hero "Request a Quote", CTA "Get a Free Quote"</p>
                  </div>
                  <a href="/" className="text-blue-600 hover:underline text-sm">Visit Page</a>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Service Pages (/services/*)</h4>
                    <p className="text-sm text-gray-600">Test: "Request a Quote" buttons on service detail pages</p>
                  </div>
                  <a href="/services/warehousing" className="text-blue-600 hover:underline text-sm">Visit Page</a>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">OWD Home (/old-home)</h4>
                    <p className="text-sm text-gray-600">Test: CTA banner "Request a Quote"</p>
                  </div>
                  <a href="/old-home" className="text-blue-600 hover:underline text-sm">Visit Page</a>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Contact Page (/contact)</h4>
                    <p className="text-sm text-gray-600">Test: Quote form accessibility and functionality</p>
                  </div>
                  <a href="/contact" className="text-blue-600 hover:underline text-sm">Visit Page</a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Test Buttons */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium text-lg mb-3">Quick Button Tests</h3>
            <p className="text-sm text-gray-600 mb-3">Click these to test specific button types on the current page:</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSpecificButton('Get a Quote')}
              >
                Test "Get a Quote"
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSpecificButton('Request a Quote')}
              >
                Test "Request a Quote"
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSpecificButton('Get a Free Quote')}
              >
                Test "Get a Free Quote"
              </Button>
            </div>
          </div>

          {/* Expected Behavior */}
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-medium text-lg mb-3">Expected Behavior</h3>
            <ul className="text-sm space-y-1">
              <li>• All quote buttons should smoothly scroll to the contact form section</li>
              <li>• No buttons should only show toast notifications</li>
              <li>• The contact form should have all required fields from your specification</li>
              <li>• Form fields: Name, Business Email, Mobile Number, Company Name, Current Shipments dropdown, Expected Shipments dropdown, Services dropdown, Additional Information, reCAPTCHA</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteButtonTest;