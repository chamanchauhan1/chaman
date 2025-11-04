import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { Redirect } from "wouter";
import { TreatmentRecord, Farm, Animal } from "@shared/schema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminCompliance() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: treatments, isLoading: loadingTreatments } = useQuery<TreatmentRecord[]>({
    queryKey: ["/api/treatments"],
    enabled: user?.role === "admin",
  });

  const { data: farms } = useQuery<Farm[]>({
    queryKey: ["/api/farms"],
    enabled: user?.role === "admin",
  });

  const { data: animals } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const getFarmName = (farmId: string) => {
    return farms?.find((f) => f.id === farmId)?.name || "Unknown Farm";
  };

  const getAnimalName = (animalId: string) => {
    return animals?.find((a) => a.id === animalId)?.name || "Unknown Animal";
  };

  const getComplianceBadgeVariant = (status: string) => {
    switch (status) {
      case "compliant":
        return "default";
      case "warning":
        return "secondary";
      case "violation":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const criticalTreatments = treatments?.filter(
    (t) => t.complianceStatus === "violation" || t.complianceStatus === "warning"
  ) || [];

  const filteredTreatments = criticalTreatments.filter((t) => {
    const farmName = getFarmName(t.farmId).toLowerCase();
    const animalName = getAnimalName(t.animalId).toLowerCase();
    const medicine = t.medicineName.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return farmName.includes(search) || animalName.includes(search) || medicine.includes(search);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Compliance Monitoring</h1>
        <p className="text-muted-foreground">Review violations and warnings across all farms</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-treatments">{treatments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All treatment records</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-violations">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-violations">
              {treatments?.filter((t) => t.complianceStatus === "violation").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-warnings">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500" data-testid="text-warnings">
              {treatments?.filter((t) => t.complianceStatus === "warning").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need monitoring</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Critical Treatments</CardTitle>
          <CardDescription>
            Violations and warnings that need attention ({filteredTreatments.length} shown)
          </CardDescription>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by farm, animal, or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="input-search"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loadingTreatments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredTreatments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-farm">Farm</TableHead>
                    <TableHead data-testid="header-animal">Animal</TableHead>
                    <TableHead data-testid="header-medicine">Medicine</TableHead>
                    <TableHead data-testid="header-date">Date</TableHead>
                    <TableHead data-testid="header-mrl">MRL Level</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.map((treatment) => (
                    <TableRow key={treatment.id} data-testid={`row-treatment-${treatment.id}`}>
                      <TableCell className="font-medium" data-testid={`text-farm-${treatment.id}`}>
                        {getFarmName(treatment.farmId)}
                      </TableCell>
                      <TableCell data-testid={`text-animal-${treatment.id}`}>
                        {getAnimalName(treatment.animalId)}
                      </TableCell>
                      <TableCell data-testid={`text-medicine-${treatment.id}`}>
                        {treatment.medicineName}
                      </TableCell>
                      <TableCell data-testid={`text-date-${treatment.id}`}>
                        {treatment.administeredDate}
                      </TableCell>
                      <TableCell data-testid={`text-mrl-${treatment.id}`}>
                        {treatment.mrlLevel ? `${treatment.mrlLevel} ppb` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getComplianceBadgeVariant(treatment.complianceStatus)}
                          data-testid={`badge-status-${treatment.id}`}
                        >
                          {treatment.complianceStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-critical">
              {searchTerm ? "No critical treatments match your search" : "No violations or warnings found"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
