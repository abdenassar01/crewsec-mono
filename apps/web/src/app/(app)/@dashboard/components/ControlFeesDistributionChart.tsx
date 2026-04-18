import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ControlFeesDistributionChartProps {
  total: number;
  paid: number;
  unpaid: number;
  canceled: number;
  conflict: number;
}

const COLORS = {
  paid: 'hsl(142, 76%, 36%)',
  unpaid: 'hsl(25, 95%, 53%)',
  canceled: 'hsl(0, 0%, 60%)',
  conflict: 'hsl(271, 81%, 56%)',
};

const LABELS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  canceled: 'Canceled',
  conflict: 'Conflict',
};

export function ControlFeesDistributionChart({
  total,
  paid,
  unpaid,
  canceled,
  conflict,
}: ControlFeesDistributionChartProps) {
  const data = [
    { name: LABELS.paid, value: paid, color: COLORS.paid },
    { name: LABELS.unpaid, value: unpaid, color: COLORS.unpaid },
    { name: LABELS.canceled, value: canceled, color: COLORS.canceled },
    { name: LABELS.conflict, value: conflict, color: COLORS.conflict },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Control Fees Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Fees Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-4">
            {data.map((item) => (
              <div key={item.name} className="text-center">
                <p className="text-sm text-muted-foreground">{item.name}</p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
