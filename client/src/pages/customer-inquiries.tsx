import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Eye, 
  MessageSquare, 
  User, 
  Building, 
  Package,
  Filter,
  Search,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Hourglass
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { QuoteRequest } from "@shared/schema";

export default function CustomerInquiries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<QuoteRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: inquiries = [], isLoading, error } = useQuery<QuoteRequest[]>({
    queryKey: ["/api/quote-requests"],
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<QuoteRequest> }) => {
      const res = await apiRequest("PATCH", `/api/quote-requests/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quote-requests"] });
      toast({
        title: "Inquiry updated successfully",
        description: "The inquiry status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update inquiry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort inquiries
  const filteredInquiries = inquiries
    .filter(inquiry => {
      if (filterStatus !== "all" && inquiry.status !== filterStatus) return false;
      if (searchTerm && !inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortBy as keyof QuoteRequest];
      const bValue = b[sortBy as keyof QuoteRequest];
      const modifier = sortOrder === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return (aValue.getTime() - bValue.getTime()) * modifier;
      }
      return 0;
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Hourglass className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const handleStatusUpdate = (inquiry: QuoteRequest, newStatus: string) => {
    updateInquiryMutation.mutate({
      id: inquiry.id,
      data: { status: newStatus }
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load customer inquiries. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Inquiries</h1>
        <p className="text-gray-600">Manage quote requests and customer inquiries from your website</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {inquiries.filter(i => i.status === "pending").length}
                </p>
              </div>
              <Hourglass className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inquiries.filter(i => i.status === "in_progress").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {inquiries.filter(i => i.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="urgency-desc">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Inquiries ({filteredInquiries.length})</CardTitle>
          <CardDescription>
            Review and manage customer quote requests and inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Customer inquiries will appear here when submitted through your website"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.email}
                          </div>
                          {inquiry.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {inquiry.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.company ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            {inquiry.company}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-gray-400" />
                          {inquiry.service || "General Inquiry"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inquiry.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium capitalize text-gray-600">
                          Medium
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(inquiry.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Select
                            value={inquiry.status}
                            onValueChange={(value) => handleStatusUpdate(inquiry, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inquiry Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Complete details for customer inquiry #{selectedInquiry?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Customer Details</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{selectedInquiry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedInquiry.email}</span>
                      </div>
                      {selectedInquiry.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{selectedInquiry.phone}</span>
                        </div>
                      )}
                      {selectedInquiry.company && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{selectedInquiry.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Inquiry Status</h4>
                    <div className="space-y-2">
                      <div>
                        <Label>Current Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedInquiry.status)}
                        </div>
                      </div>
                      <div>
                        <Label>Priority Level</Label>
                        <div className="mt-1 font-medium capitalize text-gray-600">
                          Medium
                        </div>
                      </div>
                      <div>
                        <Label>Submitted</Label>
                        <div className="mt-1 text-sm text-gray-600">
                          {formatDate(selectedInquiry.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="requirements" className="space-y-4">
                <div>
                  <Label>Service Type</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {selectedInquiry.service || "General Inquiry"}
                  </div>
                </div>
                
                <div>
                  <Label>Message/Requirements</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md min-h-[100px] whitespace-pre-wrap">
                    {selectedInquiry.message || "No additional message provided."}
                  </div>
                </div>
                
                {selectedInquiry.budget && (
                  <div>
                    <Label>Budget Range</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      ${selectedInquiry.budget}
                    </div>
                  </div>
                )}
                
                {selectedInquiry.timeline && (
                  <div>
                    <Label>Project Timeline</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      {selectedInquiry.timeline}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div>
                  <Label>Update Status</Label>
                  <Select
                    value={selectedInquiry.status}
                    onValueChange={(value) => handleStatusUpdate(selectedInquiry, value)}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <Button className="w-full" variant="default">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email Response
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Create Quote
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}