import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ControlFeesByAgentChartProps {
  data: Array<{ name: string; total: number; paid: number }>;
}

export function ControlFeesByAgentChart({ data }: ControlFeesByAgentChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Control Fees by Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.total, d.paid)), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Fees by Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              domain={[0, Math.ceil(maxValue * 1.1)]}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="paid" name="Paid" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
