import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MyParkingStatsProps {
  stats: {
    parkingName: string;
    currentlyParked: number;
    totalVehicles: number;
    unresolvedViolations: number;
    resolvedViolations: number;
    felparkeringCount: number;
    makuleraCount: number;
    totalViolations: number;
  };
}

export function MyParkingStats({ stats }: MyParkingStatsProps) {
  const utilizationRate = stats.totalVehicles > 0
    ? ((stats.currentlyParked / stats.totalVehicles) * 100).toFixed(1)
    : '0.0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Parking Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Parking Name */}
          <div className="pb-4 border-b">
            <p className="text-sm text-muted-foreground mb-1">Parking Location</p>
            <p className="text-lg font-semibold">{stats.parkingName}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Currently Parked</p>
              <p className="text-2xl font-bold">{stats.currentlyParked}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Vehicles</p>
              <p className="text-2xl font-bold">{stats.totalVehicles}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Utilization</p>
              <p className="text-2xl font-bold">{utilizationRate}%</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Violations</p>
              <p className="text-2xl font-bold">{stats.totalViolations}</p>
            </div>
          </div>

          {/* Violations Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Violations Breakdown</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Felparkering</p>
                  <p className="text-xl font-bold text-orange-500">{stats.felparkeringCount}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Makulera</p>
                  <p className="text-xl font-bold text-blue-500">{stats.makuleraCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Status */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Resolution Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="font-bold text-green-600">{stats.resolvedViolations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="font-bold text-orange-500">{stats.unresolvedViolations}</span>
              </div>
            </div>
            {stats.totalViolations > 0 && (
              <div className="mt-3">
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.resolvedViolations / stats.totalViolations) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {((stats.resolvedViolations / stats.totalViolations) * 100).toFixed(1)}% resolved
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
