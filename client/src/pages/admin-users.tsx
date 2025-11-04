import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";

type UserWithoutPassword = Omit<User, "password">;

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery<UserWithoutPassword[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "inspector":
        return "default";
      case "farmer":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">User Management</h1>
        <p className="text-muted-foreground">View and manage all user accounts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users?.length || 0} total users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-username">Username</TableHead>
                    <TableHead data-testid="header-full-name">Full Name</TableHead>
                    <TableHead data-testid="header-email">Email</TableHead>
                    <TableHead data-testid="header-role">Role</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                      <TableCell className="font-medium" data-testid={`text-username-${u.id}`}>{u.username}</TableCell>
                      <TableCell data-testid={`text-fullname-${u.id}`}>{u.fullName}</TableCell>
                      <TableCell data-testid={`text-email-${u.id}`}>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(u.role)} data-testid={`badge-role-${u.id}`}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(newRole) => {
                            if (u.id === user?.id && newRole !== "admin") {
                              toast({
                                title: "Warning",
                                description: "You cannot remove your own admin role",
                                variant: "destructive",
                              });
                              return;
                            }
                            updateRoleMutation.mutate({ userId: u.id, role: newRole });
                          }}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[130px]" data-testid={`select-role-${u.id}`}>
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="farmer">Farmer</SelectItem>
                            <SelectItem value="inspector">Inspector</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-users">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
