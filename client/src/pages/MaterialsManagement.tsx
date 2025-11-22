import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Bell,
  ArrowUp,
  ArrowDown,
  Truck,
  FileText,
  Users,
  DollarSign,
  Calendar,
  CheckCircle
} from "lucide-react";
import type { Material, Vendor, MaterialOrder } from "@shared/schema";

export default function MaterialsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [usageForm, setUsageForm] = useState({
    materialId: 0,
    quantityUsed: 0,
    purpose: "",
    clientReference: "",
    notes: ""
  });

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials"],
  });

  // Fetch vendors
  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors"],
  });

  // Fetch material orders
  const { data: orders = [] } = useQuery<MaterialOrder[]>({
    queryKey: ["/api/material-orders"],
  });

  // Update material mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Material> }) => {
      const res = await apiRequest("PATCH", `/api/materials/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      toast({
        title: "Material updated successfully",
        description: "The material information has been updated.",
      });
    },
  });

  // Record material usage mutation
  const recordUsageMutation = useMutation({
    mutationFn: async (data: typeof usageForm) => {
      const res = await apiRequest("POST", `/api/materials/usage`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/materials"] });
      setShowUsageDialog(false);
      setUsageForm({
        materialId: 0,
        quantityUsed: 0,
        purpose: "",
        clientReference: "",
        notes: ""
      });
      toast({
        title: "Usage recorded successfully",
        description: "Material usage has been recorded and stock updated.",
      });
    },
  });

  // Send stock alerts mutation
  const sendStockAlertsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/materials/check-stock-alerts`);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Stock alerts sent",
        description: `Alerts sent for ${data.alertsSent} low stock items.`,
      });
    },
  });

  // Get stock status badge
  const getStockBadge = (material: Material) => {
    const percentage = (material.currentStock / material.minimumStock) * 100;
    
    if (material.currentStock === 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          OUT OF STOCK
        </Badge>
      );
    } else if (percentage <= 100) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 bg-orange-100 text-orange-800">
          <TrendingDown className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    } else if (percentage <= 150) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          Adequate
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          Good Stock
        </Badge>
      );
    }
  };

  // Calculate low stock items (ensure materials is an array)
  const lowStockItems = (materials || []).filter(m => m.currentStock <= m.minimumStock);
  const outOfStockItems = (materials || []).filter(m => m.currentStock === 0);

  const handleRecordUsage = () => {
    if (!usageForm.materialId || !usageForm.quantityUsed) {
      toast({
        title: "Missing information",
        description: "Please select a material and enter quantity used.",
        variant: "destructive",
      });
      return;
    }
    recordUsageMutation.mutate({
      ...usageForm,
      employeeId: user?.id || 0
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Materials & Inventory Management</h1>
        <p className="text-gray-600 mt-2">
          Manage materials, track inventory levels, and monitor stock alerts
        </p>
      </div>

      {/* Stock Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Materials</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-gray-500">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-600">Low Stock Items</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-gray-500">Need reordering</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-600">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-gray-500">Critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-600">Pending Orders</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'pending' || o.status === 'ordered').length}
            </div>
            <p className="text-xs text-gray-500">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => sendStockAlertsMutation.mutate()}
              disabled={sendStockAlertsMutation.isPending}
              variant="destructive"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Stock Alerts
            </Button>
            <Button 
              onClick={() => setShowUsageDialog(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Record Usage
            </Button>
            <Button 
              onClick={() => setShowOrderDialog(true)}
              variant="outline"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Materials Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Material Inventory</CardTitle>
              <CardDescription>
                Current stock levels and material information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Min. Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(materials || []).map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{material.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {material.currentStock}
                            <span className="text-gray-500">/{material.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>{material.minimumStock}</TableCell>
                        <TableCell>{getStockBadge(material)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setUsageForm({
                                  materialId: material.id,
                                  quantityUsed: 0,
                                  purpose: "",
                                  clientReference: "",
                                  notes: ""
                                });
                                setShowUsageDialog(true);
                              }}
                            >
                              Record Usage
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedMaterial(material)}
                            >
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track material orders and deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        {vendors.find(v => v.id === order.vendorId)?.name || "Unknown"}
                      </TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'received' ? 'default' :
                          order.status === 'cancelled' ? 'destructive' :
                          'secondary'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.expectedDelivery 
                          ? new Date(order.expectedDelivery).toLocaleDateString() 
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Usage Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Material Usage</DialogTitle>
            <DialogDescription>
              Record material consumption for tracking and stock updates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Select
                value={usageForm.materialId.toString()}
                onValueChange={(value) => setUsageForm({...usageForm, materialId: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {(materials || []).map((material) => (
                    <SelectItem key={material.id} value={material.id.toString()}>
                      {material.name} (Stock: {material.currentStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity Used</Label>
              <Input
                id="quantity"
                type="number"
                value={usageForm.quantityUsed}
                onChange={(e) => setUsageForm({...usageForm, quantityUsed: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select
                value={usageForm.purpose}
                onValueChange={(value) => setUsageForm({...usageForm, purpose: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulfillment">Fulfillment</SelectItem>
                  <SelectItem value="kitting">Kitting</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client Reference (Optional)</Label>
              <Input
                id="client"
                value={usageForm.clientReference}
                onChange={(e) => setUsageForm({...usageForm, clientReference: e.target.value})}
                placeholder="e.g., Order #12345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={usageForm.notes}
                onChange={(e) => setUsageForm({...usageForm, notes: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordUsage} disabled={recordUsageMutation.isPending}>
              Record Usage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}