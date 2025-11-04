import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Activity, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";

interface SystemStats {
  totalUsers: number;
  totalFarms: number;
  totalAnimals: number;
  totalTreatments: number;
  activeViolations: number;
  activeWarnings: number;
  usersByRole: {
    farmers: number;
    inspectors: number;
    admins: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ["/api/admin/system-stats"],
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide overview and management</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">System-wide overview and management</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="card-stat-users">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.usersByRole.farmers || 0} farmers, {stats?.usersByRole.inspectors || 0} inspectors, {stats?.usersByRole.admins || 0} admins
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-farms">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-farms">{stats?.totalFarms || 0}</div>
            <p className="text-xs text-muted-foreground">Registered farms</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-animals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-animals">{stats?.totalAnimals || 0}</div>
            <p className="text-xs text-muted-foreground">Livestock being tracked</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-treatments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-treatments">{stats?.totalTreatments || 0}</div>
            <p className="text-xs text-muted-foreground">Treatment records</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-stat-violations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-violations">{stats?.activeViolations || 0}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-warnings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500" data-testid="text-warnings">{stats?.activeWarnings || 0}</div>
            <p className="text-xs text-muted-foreground">Need monitoring</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-compliant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant Treatments</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500" data-testid="text-compliant">
              {stats ? stats.totalTreatments - stats.activeViolations - stats.activeWarnings : 0}
            </div>
            <p className="text-xs text-muted-foreground">Within acceptable limits</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="/admin/users"
              className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              data-testid="link-manage-users"
            >
              <Users className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage user accounts and roles</p>
            </a>
            <a
              href="/admin/compliance"
              className="flex flex-col p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              data-testid="link-compliance-monitoring"
            >
              <AlertTriangle className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-semibold">Compliance Monitoring</h3>
              <p className="text-sm text-muted-foreground">Review violations and warnings across all farms</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
