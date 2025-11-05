import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@database/supabase-client";

interface DashboardStats {
  totalAnimals: number;
  activeTreatments: number;
  complianceRate: number;
  pendingReports: number;
  violationCount: number;
  warningCount: number;
}

interface TreatmentTrend {
  month: string;
  treatments: number;
}

interface ComplianceData {
  name: string;
  value: number;
  color: string;
}

// Fetch dashboard stats from Supabase
async function fetchDashboardStats(): Promise<DashboardStats> {
  // Get total animals count
  const { count: totalAnimals } = await supabase
    .from('animals')
    .select('*', { count: 'exact', head: true });

  // Get active treatments (withdrawal period not ended)
  const today = new Date().toISOString().split('T')[0];
  const { count: activeTreatments } = await supabase
    .from('treatment_records')
    .select('*', { count: 'exact', head: true })
    .gt('withdrawal_end_date', today);

  // Get compliance data
  const { data: treatments } = await supabase
    .from('treatment_records')
    .select('compliance_status');

  const compliant = treatments?.filter(t => t.compliance_status === 'compliant').length || 0;
  const total = treatments?.length || 0;
  const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

  // Get violations and warnings
  const violationCount = treatments?.filter(t => t.compliance_status === 'violation').length || 0;
  const warningCount = treatments?.filter(t => t.compliance_status === 'warning').length || 0;

  // Get pending reports (assuming reports without description are pending)
  const { count: pendingReports } = await supabase
    .from('farm_reports')
    .select('*', { count: 'exact', head: true })
    .is('description', null);

  return {
    totalAnimals: totalAnimals || 0,
    activeTreatments: activeTreatments || 0,
    complianceRate,
    pendingReports: pendingReports || 0,
    violationCount,
    warningCount,
  };
}

// Fetch treatment trends from Supabase
async function fetchTreatmentTrends(): Promise<TreatmentTrend[]> {
  const { data: treatments } = await supabase
    .from('treatment_records')
    .select('administered_date')
    .order('administered_date', { ascending: true });

  // Group by month
  const monthlyData: Record<string, number> = {};
  treatments?.forEach(treatment => {
    const month = treatment.administered_date.substring(0, 7); // YYYY-MM format
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });

  // Convert to array format for chart
  return Object.entries(monthlyData).map(([month, treatments]) => ({
    month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    treatments,
  }));
}

// Fetch compliance data from Supabase
async function fetchComplianceData(): Promise<ComplianceData[]> {
  const { data: treatments } = await supabase
    .from('treatment_records')
    .select('compliance_status');

  const statusCounts: Record<string, number> = {
    compliant: 0,
    warning: 0,
    violation: 0,
    pending: 0,
  };

  treatments?.forEach(treatment => {
    statusCounts[treatment.compliance_status] = (statusCounts[treatment.compliance_status] || 0) + 1;
  });

  return [
    { name: 'Compliant', value: statusCounts.compliant, color: 'hsl(var(--chart-1))' },
    { name: 'Warning', value: statusCounts.warning, color: 'hsl(var(--chart-4))' },
    { name: 'Violation', value: statusCounts.violation, color: 'hsl(var(--chart-2))' },
    { name: 'Pending', value: statusCounts.pending, color: 'hsl(var(--chart-3))' },
  ];
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery<TreatmentTrend[]>({
    queryKey: ['treatment-trends'],
    queryFn: fetchTreatmentTrends,
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery<ComplianceData[]>({
    queryKey: ['compliance-data'],
    queryFn: fetchComplianceData,
  });

  const CHART_COLORS = {
    primary: "hsl(var(--chart-1))",
    secondary: "hsl(var(--chart-2))",
    accent: "hsl(var(--chart-3))",
    warning: "hsl(var(--chart-4))",
    success: "hsl(var(--chart-1))",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your farm's antimicrobial management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-animals">
                  {stats?.totalAnimals || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all registered farms
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-active-treatments">
                  {stats?.activeTreatments || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently in withdrawal period
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary" data-testid="text-compliance-rate">
                  {stats?.complianceRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  MRL compliance this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive" data-testid="text-violations">
                  {(stats?.violationCount || 0) + (stats?.warningCount || 0)}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="destructive" className="text-xs">
                    {stats?.violationCount || 0} violations
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.warningCount || 0} warnings
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Antimicrobial Usage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="treatments"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Compliance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complianceLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={compliance || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(compliance || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}