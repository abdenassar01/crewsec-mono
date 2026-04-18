import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ViolationsChartProps {
  resolved: number;
  unresolved: number;
  total: number;
}

const COLORS = {
  resolved: 'hsl(142, 76%, 36%)',
  unresolved: 'hsl(25, 95%, 53%)',
};

export function ViolationsChart({ resolved, unresolved, total }: ViolationsChartProps) {
  const data = [
    { name: 'Resolved', value: resolved, color: COLORS.resolved },
    { name: 'Unresolved', value: unresolved, color: COLORS.unresolved },
  ].filter(d => d.value > 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Violations Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No violations data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Violations Overview</CardTitle>
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
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{resolved}</p>
              <p className="text-xs text-muted-foreground">
                {((resolved / total) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Unresolved</p>
              <p className="text-2xl font-bold text-orange-500">{unresolved}</p>
              <p className="text-xs text-muted-foreground">
                {((unresolved / total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
