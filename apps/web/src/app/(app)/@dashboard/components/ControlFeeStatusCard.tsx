import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ControlFeeStatusCardProps {
  status: {
    AWAITING: number;
    PAID: number;
    CANCELED: number;
    CONFLICT: number;
    total: number;
  };
}

const statusConfig = {
  AWAITING: { label: 'Awaiting', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500' },
  PAID: { label: 'Paid', colorClass: 'text-green-500', bgClass: 'bg-green-500' },
  CANCELED: { label: 'Canceled', colorClass: 'text-gray-500', bgClass: 'bg-gray-500' },
  CONFLICT: { label: 'Conflict', colorClass: 'text-red-500', bgClass: 'bg-red-500' },
} as const;

export function ControlFeeStatusCard({ status }: ControlFeeStatusCardProps) {
  const maxCount = Math.max(status.AWAITING, status.PAID, status.CANCELED, status.CONFLICT, 1);

  return (
    <Card >
      <CardHeader>
        <CardTitle>Control Fee Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
            const config = statusConfig[key];
            const count = status[key];
            const percentage = (count / status.total) * 100;
            const barWidth = (count / maxCount) * 100;

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                  <span className={`text-xl font-bold ${config.colorClass}`}>{count}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`${config.bgClass} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
              </div>
            );
          })}
          <div className="pt-4 border-t border-primary/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{status.total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
