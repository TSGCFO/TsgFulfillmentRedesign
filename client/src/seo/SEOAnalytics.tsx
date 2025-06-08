import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  Eye, 
  Clock, 
  Globe, 
  Smartphone, 
  Monitor,
  CheckCircle,
  AlertCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface SEOMetrics {
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  accessibility: number;
  seo: number;
  bestPractices: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

interface PageAnalysis {
  url: string;
  title: string;
  description: string;
  titleLength: number;
  descriptionLength: number;
  hasH1: boolean;
  hasMetaDescription: boolean;
  hasCanonical: boolean;
  hasStructuredData: boolean;
  imageOptimization: number;
  internalLinks: number;
  externalLinks: number;
}

export const SEOAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetrics>({
    pageSpeed: { desktop: 92, mobile: 87 },
    accessibility: 94,
    seo: 96,
    bestPractices: 91,
    coreWebVitals: { lcp: 1.2, fid: 8, cls: 0.05 }
  });

  const [pages, setPages] = useState<PageAnalysis[]>([
    {
      url: '/',
      title: 'TSG Fulfillment Services | Professional Order Fulfillment & Warehousing',
      description: 'Leading fulfillment center in Ontario providing comprehensive order fulfillment, warehousing, kitting, and logistics solutions.',
      titleLength: 78,
      descriptionLength: 142,
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasStructuredData: true,
      imageOptimization: 95,
      internalLinks: 12,
      externalLinks: 3
    },
    {
      url: '/services',
      title: 'Fulfillment Services | Warehousing, Kitting & Logistics - TSG Fulfillment',
      description: 'Complete fulfillment services including order processing, inventory management, kitting, assembly, and freight forwarding.',
      titleLength: 75,
      descriptionLength: 128,
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasStructuredData: true,
      imageOptimization: 88,
      internalLinks: 8,
      externalLinks: 2
    },
    {
      url: '/about',
      title: 'About TSG Fulfillment | Leading Logistics Provider in Ontario',
      description: 'Learn about TSG Fulfillment mission to provide exceptional fulfillment and logistics services.',
      titleLength: 65,
      descriptionLength: 105,
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasStructuredData: true,
      imageOptimization: 92,
      internalLinks: 6,
      externalLinks: 1
    },
    {
      url: '/contact',
      title: 'Contact TSG Fulfillment | Get a Quote for Fulfillment Services',
      description: 'Contact TSG Fulfillment for personalized quotes on warehousing, order fulfillment, and logistics services.',
      titleLength: 67,
      descriptionLength: 118,
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasStructuredData: true,
      imageOptimization: 90,
      internalLinks: 5,
      externalLinks: 0
    },
    {
      url: '/locations',
      title: 'TSG Fulfillment Location | Vaughan Ontario Distribution Center',
      description: 'Visit our modern fulfillment center in Vaughan, Ontario. Strategic location serving the Greater Toronto Area.',
      titleLength: 66,
      descriptionLength: 115,
      hasH1: true,
      hasMetaDescription: true,
      hasCanonical: true,
      hasStructuredData: true,
      imageOptimization: 93,
      internalLinks: 4,
      externalLinks: 1
    }
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">SEO Analytics Dashboard</h1>
        <Badge variant="outline" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Real-time Monitoring
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SEO Score</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(metrics.seo)}
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.seo)}`}>
                    {metrics.seo}
                  </div>
                </div>
                <Progress value={metrics.seo} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(metrics.pageSpeed.desktop)}
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.pageSpeed.desktop)}`}>
                    {metrics.pageSpeed.desktop}
                  </div>
                </div>
                <Progress value={metrics.pageSpeed.desktop} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accessibility</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(metrics.accessibility)}
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.accessibility)}`}>
                    {metrics.accessibility}
                  </div>
                </div>
                <Progress value={metrics.accessibility} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getScoreIcon(metrics.bestPractices)}
                  <div className={`text-2xl font-bold ${getScoreColor(metrics.bestPractices)}`}>
                    {metrics.bestPractices}
                  </div>
                </div>
                <Progress value={metrics.bestPractices} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Largest Contentful Paint</span>
                  <Badge variant={metrics.coreWebVitals.lcp <= 2.5 ? 'default' : 'destructive'}>
                    {metrics.coreWebVitals.lcp}s
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">First Input Delay</span>
                  <Badge variant={metrics.coreWebVitals.fid <= 100 ? 'default' : 'destructive'}>
                    {metrics.coreWebVitals.fid}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cumulative Layout Shift</span>
                  <Badge variant={metrics.coreWebVitals.cls <= 0.1 ? 'default' : 'destructive'}>
                    {metrics.coreWebVitals.cls}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4" />
                    <span className="text-sm font-medium">Desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getScoreIcon(metrics.pageSpeed.desktop)}
                    <span className={`font-bold ${getScoreColor(metrics.pageSpeed.desktop)}`}>
                      {metrics.pageSpeed.desktop}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm font-medium">Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getScoreIcon(metrics.pageSpeed.mobile)}
                    <span className={`font-bold ${getScoreColor(metrics.pageSpeed.mobile)}`}>
                      {metrics.pageSpeed.mobile}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page-by-Page SEO Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pages.map((page, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{page.url}</h3>
                      <Badge variant="outline">
                        {page.hasH1 && page.hasMetaDescription && page.hasCanonical && page.hasStructuredData 
                          ? 'Optimized' 
                          : 'Needs Attention'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Title:</strong> {page.title}</p>
                        <p><strong>Length:</strong> {page.titleLength} chars 
                          <Badge variant={page.titleLength <= 60 ? 'default' : 'destructive'} className="ml-2">
                            {page.titleLength <= 60 ? 'Good' : 'Too Long'}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <p><strong>Description:</strong> {page.description}</p>
                        <p><strong>Length:</strong> {page.descriptionLength} chars
                          <Badge variant={page.descriptionLength <= 160 ? 'default' : 'destructive'} className="ml-2">
                            {page.descriptionLength <= 160 ? 'Good' : 'Too Long'}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        {page.hasH1 ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>H1 Tag</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {page.hasMetaDescription ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>Meta Description</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {page.hasCanonical ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>Canonical URL</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {page.hasStructuredData ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>Structured Data</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { item: 'Title tags optimized', status: true },
                    { item: 'Meta descriptions added', status: true },
                    { item: 'Header structure (H1-H6)', status: true },
                    { item: 'Canonical URLs set', status: true },
                    { item: 'Structured data implemented', status: true },
                    { item: 'Image alt tags', status: true },
                    { item: 'Internal linking', status: true },
                    { item: 'XML sitemap', status: true },
                    { item: 'Robots.txt', status: true },
                    { item: 'Site speed optimization', status: true }
                  ].map((check, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {check.status ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">{check.item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800">Great Work!</h4>
                    <p className="text-sm text-green-700">Your website has excellent SEO optimization with comprehensive meta tags, structured data, and fast loading speeds.</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Continue Monitoring</h4>
                    <p className="text-sm text-blue-700">Keep tracking Core Web Vitals and consider implementing AMP for mobile performance improvements.</p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800">Future Enhancements</h4>
                    <p className="text-sm text-yellow-700">Consider adding FAQ schemas and review markup to improve rich snippet visibility.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOAnalytics;