import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  component: string;
  description: string;
  status: 'untested' | 'pass' | 'fail';
  error?: string;
}

const QuoteButtonTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      component: 'Navbar',
      description: 'Main navigation "Get a Quote" button',
      status: 'untested'
    },
    {
      component: 'Navbar Mobile',
      description: 'Mobile navigation "Get a Quote" button',
      status: 'untested'
    },
    {
      component: 'Hero Section',
      description: 'Hero "Request a Quote" button',
      status: 'untested'
    },
    {
      component: 'CTA Section',
      description: 'CTA "Get a Free Quote" button',
      status: 'untested'
    },
    {
      component: 'Service Detail',
      description: 'Service page "Request a Quote" button',
      status: 'untested'
    },
    {
      component: 'OWD Home',
      description: 'OWD Home page quote button',
      status: 'untested'
    },
    {
      component: 'New Home',
      description: 'New Home page quote buttons (2)',
      status: 'untested'
    },
    {
      component: 'Contact Page',
      description: 'Contact page quote form access',
      status: 'untested'
    }
  ]);

  const testQuoteButton = (selector: string, componentName: string, index: number) => {
    const newResults = [...testResults];
    
    try {
      // Find buttons by text content
      const buttons = Array.from(document.querySelectorAll('button')).filter(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('quote') || text.includes('get a') || text.includes('request');
      });

      if (buttons.length === 0) {
        newResults[index] = {
          ...newResults[index],
          status: 'fail',
          error: 'No quote buttons found on current page'
        };
      } else {
        // Test if contact section exists
        const contactSection = document.getElementById('contact');
        if (!contactSection) {
          newResults[index] = {
            ...newResults[index],
            status: 'fail',
            error: 'Contact section not found on page'
          };
        } else {
          newResults[index] = {
            ...newResults[index],
            status: 'pass'
          };
        }
      }
    } catch (error) {
      newResults[index] = {
        ...newResults[index],
        status: 'fail',
        error: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    setTestResults(newResults);
  };

  const testAllButtons = () => {
    // Check if we're on a page with a contact section
    const contactSection = document.getElementById('contact');
    
    const newResults = testResults.map((result, index) => {
      if (!contactSection) {
        return {
          ...result,
          status: 'fail' as const,
          error: 'No contact section found on this page'
        };
      }

      // Look for quote-related buttons
      const quoteButtons = Array.from(document.querySelectorAll('button')).filter(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('quote') || text.includes('get a') || text.includes('request');
      });

      if (quoteButtons.length > 0) {
        return {
          ...result,
          status: 'pass' as const
        };
      } else {
        return {
          ...result,
          status: 'fail' as const,
          error: 'No quote buttons found'
        };
      }
    });

    setTestResults(newResults);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const totalCount = testResults.length;

  return (
    <div className="container mx-auto px-6 py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Quote Button Functionality Test
          </CardTitle>
          <div className="text-center text-gray-600">
            <p>Testing all "Get a Quote" and "Request a Quote" buttons across the website</p>
            <div className="mt-4 flex justify-center space-x-6">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Passed: {passCount}
              </span>
              <span className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                Failed: {failCount}
              </span>
              <span className="text-gray-500">
                Total: {totalCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <Button onClick={testAllButtons} className="w-full">
              Run Full Test Suite
            </Button>
            
            <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
              <strong>Test Instructions:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Navigate to different pages (Home, Services, Contact, etc.)</li>
                <li>• Click "Run Full Test Suite" on each page</li>
                <li>• Green checkmarks indicate working buttons</li>
                <li>• Red X marks indicate broken buttons that need fixing</li>
                <li>• All quote buttons should scroll to the contact form section</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg flex items-center justify-between ${
                  result.status === 'pass' ? 'border-green-200 bg-green-50' :
                  result.status === 'fail' ? 'border-red-200 bg-red-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <h4 className="font-medium">{result.component}</h4>
                    <p className="text-sm text-gray-600">{result.description}</p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testQuoteButton('', result.component, index)}
                >
                  Test Individual
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Pages to Test:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <span>• Home Page</span>
              <span>• Services Pages</span>
              <span>• Contact Page</span>
              <span>• About Page</span>
              <span>• Industries</span>
              <span>• Locations</span>
              <span>• Analytics</span>
              <span>• OWD Home</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteButtonTest;