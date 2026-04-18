import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon?: any;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  valueClassName?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, valueClassName }: StatCardProps) {
  return (
    <Card className="hover: transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <HugeiconsIcon
            icon={Icon}
            className="h-4 w-4 text-muted-foreground"
          />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
