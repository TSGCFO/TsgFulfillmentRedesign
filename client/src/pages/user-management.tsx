import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Edit, Trash2, User, Shield, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Employee, InsertEmployee } from "@shared/schema";

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Employee | null>(null);
  const [newUser, setNewUser] = useState<InsertEmployee>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "User"
  });

  // Check if current user has permission to manage users
  const canManageUsers = user?.role === "SuperAdmin" || user?.role === "Admin";

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    enabled: canManageUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertEmployee) => {
      const res = await apiRequest("POST", "/api/employees", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setIsCreateDialogOpen(false);
      setNewUser({ fullName: "", username: "", email: "", password: "", role: "User" });
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: Partial<Employee> }) => {
      const res = await apiRequest("PATCH", `/api/employees/${id}`, userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setEditingUser(null);
      toast({
        title: "User updated successfully",
        description: "The user information has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return <Crown className="h-4 w-4" />;
      case "Admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return "destructive";
      case "Admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const canEditUser = (targetUser: Employee) => {
    if (user?.role === "SuperAdmin") return true; // SuperAdmin has unlimited access
    if (user?.role === "Admin") {
      // Admin can edit Users and other Admins, but not SuperAdmins
      return targetUser.role !== "SuperAdmin";
    }
    return false;
  };

  const canDeleteUser = (targetUser: Employee) => {
    if (user?.role === "SuperAdmin") return true; // SuperAdmin can delete anyone
    if (user?.role === "Admin") {
      // Admin can only delete Users, not other Admins or SuperAdmins
      return targetUser.role === "User";
    }
    return false;
  };

  const canCreateRole = (role: string) => {
    if (user?.role === "SuperAdmin") return true; // SuperAdmin can create any role
    if (user?.role === "Admin") {
      // Admin can only create Users, not other Admins or SuperAdmins
      return role === "User";
    }
    return false;
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        userData: {
          fullName: editingUser.fullName,
          email: editingUser.email,
          role: editingUser.role,
          isActive: editingUser.isActive,
        },
      });
    }
  };

  const [userToDelete, setUserToDelete] = useState<Employee | null>(null);

  const handleDeleteUser = (user: Employee) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
      setUserToDelete(null);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access user management. This feature requires Admin or SuperAdmin access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with the appropriate role and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label>Role</Label>
                <RadioGroup
                  value={newUser.role}
                  onValueChange={(value: "SuperAdmin" | "Admin" | "User") => setNewUser({ ...newUser, role: value })}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="User" id="role-user" />
                    <Label htmlFor="role-user" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </Label>
                  </div>
                  {user?.role === "SuperAdmin" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Admin" id="role-admin" />
                        <Label htmlFor="role-admin" className="flex items-center space-x-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SuperAdmin" id="role-superadmin" />
                        <Label htmlFor="role-superadmin" className="flex items-center space-x-2 cursor-pointer">
                          <Crown className="h-4 w-4" />
                          <span>SuperAdmin</span>
                        </Label>
                      </div>
                    </>
                  )}
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            View and manage all users in the system. Your permissions are based on your role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.fullName}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                        <div className="text-xs text-muted-foreground">@{employee.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(employee.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(employee.role)}
                        {employee.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {employee.lastLogin
                        ? new Date(employee.lastLogin).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {canEditUser(employee) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteUser(employee) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(employee)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <RadioGroup
                  value={editingUser.role}
                  onValueChange={(value: "SuperAdmin" | "Admin" | "User") => 
                    setEditingUser({ ...editingUser, role: value })
                  }
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="User" id="edit-role-user" />
                    <Label htmlFor="edit-role-user" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>User</span>
                    </Label>
                  </div>
                  {(user?.role === "SuperAdmin" || (user?.role === "Admin" && editingUser.role !== "SuperAdmin")) && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Admin" id="edit-role-admin" />
                      <Label htmlFor="edit-role-admin" className="flex items-center space-x-2 cursor-pointer">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Label>
                    </div>
                  )}
                  {user?.role === "SuperAdmin" && (
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SuperAdmin" id="edit-role-superadmin" />
                      <Label htmlFor="edit-role-superadmin" className="flex items-center space-x-2 cursor-pointer">
                        <Crown className="h-4 w-4" />
                        <span>SuperAdmin</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}