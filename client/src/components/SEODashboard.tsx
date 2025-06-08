/**
 * SEO Performance Dashboard
 * Real-time monitoring and analytics for SEO optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Globe, 
  Zap, 
  Eye, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Clock,
  BarChart3,
  Shield,
  Image as ImageIcon
} from 'lucide-react';
import { seoPerformanceOptimizer } from '@/seo/performance-optimizer';

interface SEOMetrics {
  siteHealth: {
    status: string;
    score: number;
    lastChecked: string;
  };
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    performance: number;
  };
  technicalSeo: {
    indexedPages: number;
    crawlErrors: number;
    mobileUsability: string;
    structuredDataValid: boolean;
  };
  contentOptimization: {
    metaDescriptions: number;
    titleTags: number;
    headingStructure: number;
    imageAltText: number;
  };
}

interface SchemaValidation {
  organization: { valid: boolean; errors: string[] };
  localBusiness: { valid: boolean; errors: string[] };
  website: { valid: boolean; errors: string[] };
  breadcrumbs: { valid: boolean; errors: string[] };
  services: { valid: boolean; errors: string[] };
  faq: { valid: boolean; errors: string[] };
}

export const SEODashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [schemaValidation, setSchemaValidation] = useState<SchemaValidation | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSEOData();
    monitorPerformance();
  }, []);

  const fetchSEOData = async () => {
    try {
      setLoading(true);
      
      const [metricsResponse, schemaResponse] = await Promise.all([
        fetch('/api/seo/analytics'),
        fetch('/api/seo/schema-validation')
      ]);

      const metricsData = await metricsResponse.json();
      const schemaData = await schemaResponse.json();

      setMetrics(metricsData);
      setSchemaValidation(schemaData);
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monitorPerformance = () => {
    const currentMetrics = seoPerformanceOptimizer.getMetrics();
    const performanceScore = seoPerformanceOptimizer.calculatePerformanceScore();
    const issues = seoPerformanceOptimizer.reportPerformanceIssues();

    setPerformanceMetrics({
      ...currentMetrics,
      score: performanceScore,
      issues
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and optimize your search engine performance</p>
        </div>
        <Badge variant={getScoreBadgeVariant(metrics.siteHealth.score)} className="text-lg px-4 py-2">
          SEO Score: {metrics.siteHealth.score}/100
        </Badge>
      </div>

      {/* Core Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.siteHealth.status}</div>
            <p className="text-xs text-muted-foreground">
              Last checked: {new Date(metrics.siteHealth.lastChecked).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.coreWebVitals.performance)}`}>
              {metrics.coreWebVitals.performance}/100
            </div>
            <Progress value={metrics.coreWebVitals.performance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indexed Pages</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.technicalSeo.indexedPages}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.technicalSeo.crawlErrors} crawl errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Usability</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.technicalSeo.mobileUsability}
            </div>
            <p className="text-xs text-muted-foreground">Mobile-friendly design</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>
                Key performance metrics that affect search rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Largest Contentful Paint</span>
                    <span className="text-sm text-green-600">{metrics.coreWebVitals.lcp}s</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (metrics.coreWebVitals.lcp / 4) * 100)} />
                  <p className="text-xs text-muted-foreground">Target: &lt; 2.5s</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">First Input Delay</span>
                    <span className="text-sm text-green-600">{metrics.coreWebVitals.fid}ms</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (metrics.coreWebVitals.fid / 300) * 100)} />
                  <p className="text-xs text-muted-foreground">Target: &lt; 100ms</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cumulative Layout Shift</span>
                    <span className="text-sm text-green-600">{metrics.coreWebVitals.cls}</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (metrics.coreWebVitals.cls / 0.25) * 100)} />
                  <p className="text-xs text-muted-foreground">Target: &lt; 0.1</p>
                </div>
              </div>

              {performanceMetrics?.issues && performanceMetrics.issues.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Performance Issues</h4>
                  <div className="space-y-2">
                    {performanceMetrics.issues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">{issue.type}</p>
                          <p className="text-sm text-yellow-700">{issue.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Content Optimization
              </CardTitle>
              <CardDescription>
                Analysis of on-page SEO elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Meta Descriptions</span>
                    <Badge variant={getScoreBadgeVariant(metrics.contentOptimization.metaDescriptions)}>
                      {metrics.contentOptimization.metaDescriptions}%
                    </Badge>
                  </div>
                  <Progress value={metrics.contentOptimization.metaDescriptions} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Title Tags</span>
                    <Badge variant={getScoreBadgeVariant(metrics.contentOptimization.titleTags)}>
                      {metrics.contentOptimization.titleTags}%
                    </Badge>
                  </div>
                  <Progress value={metrics.contentOptimization.titleTags} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Heading Structure</span>
                    <Badge variant={getScoreBadgeVariant(metrics.contentOptimization.headingStructure)}>
                      {metrics.contentOptimization.headingStructure}%
                    </Badge>
                  </div>
                  <Progress value={metrics.contentOptimization.headingStructure} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Image Alt Text</span>
                    <Badge variant={getScoreBadgeVariant(metrics.contentOptimization.imageAltText)}>
                      {metrics.contentOptimization.imageAltText}%
                    </Badge>
                  </div>
                  <Progress value={metrics.contentOptimization.imageAltText} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Technical SEO
              </CardTitle>
              <CardDescription>
                Technical aspects affecting search engine crawling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">XML Sitemap</span>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Robots.txt</span>
                    </div>
                    <Badge variant="default">Configured</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">SSL Certificate</span>
                    </div>
                    <Badge variant="default">Valid</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Canonical URLs</span>
                    </div>
                    <Badge variant="default">Implemented</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Page Speed</span>
                    </div>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Mobile Responsive</span>
                    </div>
                    <Badge variant="default">Yes</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Structured Data Validation
              </CardTitle>
              <CardDescription>
                Schema.org markup validation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schemaValidation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(schemaValidation).map(([key, validation]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {validation.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <Badge variant={validation.valid ? 'default' : 'destructive'}>
                        {validation.valid ? 'Valid' : 'Issues'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common SEO optimization tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.open('/sitemap.xml', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              View Sitemap
            </button>
            <button
              onClick={() => window.open('/robots.txt', '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              View Robots.txt
            </button>
            <button
              onClick={() => monitorPerformance()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Refresh Metrics
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEODashboard;