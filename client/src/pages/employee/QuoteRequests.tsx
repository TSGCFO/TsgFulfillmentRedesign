import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEmployeeAuth } from '@/hooks/use-employee-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, UserPlus } from 'lucide-react';

export default function QuoteRequests() {
  const { token, employee } = useEmployeeAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch quote requests
  const { data: quoteRequestsData, isLoading } = useQuery({
    queryKey: ['quote-requests', statusFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/employee/quote-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch quote requests');
      return response.json();
    }
  });

  // Fetch employees for assignment
  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await fetch('/api/employee/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch employees');
      return response.json();
    }
  });

  // Assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ quoteRequestId, assignedTo }: { quoteRequestId: number; assignedTo: number }) => {
      const response = await fetch(`/api/employee/quote-requests/${quoteRequestId}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assignedTo })
      });

      if (!response.ok) throw new Error('Failed to assign quote request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      setAssignDialogOpen(false);
      toast({
        title: "Success",
        description: "Quote request assigned successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAssign = (assignedTo: number) => {
    if (selectedRequest) {
      assignMutation.mutate({
        quoteRequestId: selectedRequest.id,
        assignedTo
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-orange-100 text-orange-800';
      case 'quoted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = quoteRequestsData?.data?.filter((request: any) =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Quote Requests</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="quoted">Quoted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRequests.map((request: any) => (
          <Card key={request.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-lg">{request.name}</h3>
                    <Badge className={getStatusBadgeColor(request.status)}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Company:</span> {request.company}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {request.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {request.phone}
                    </div>
                    <div>
                      <span className="font-medium">Service:</span> {request.service}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Current Shipments:</span> {request.currentShipments}
                    </div>
                    <div>
                      <span className="font-medium">Expected Shipments:</span> {request.expectedShipments}
                    </div>
                  </div>

                  {request.message && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Message:</span>
                      <p className="text-gray-600 mt-1">{request.message}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Received: {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {request.status === 'new' && (
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setAssignDialogOpen(true);
                      }}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No quote requests found</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Quote Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Request Details</Label>
                <p className="text-sm text-gray-600">
                  {selectedRequest.name} - {selectedRequest.company}
                </p>
              </div>

              <div>
                <Label htmlFor="assignee">Assign to Employee</Label>
                <Select onValueChange={(value) => handleAssign(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesData?.data?.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.firstName} {emp.lastName} - {emp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setAssignDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}