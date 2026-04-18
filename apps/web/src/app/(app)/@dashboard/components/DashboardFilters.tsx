import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimePeriod = 'day' | 'week' | 'month';
type DateRangePreset = '7d' | '30d' | '90d' | 'all';

interface DashboardFiltersProps {
  dateRange: DateRangePreset;
  timePeriod: TimePeriod;
  onDateRangeChange: (value: DateRangePreset) => void;
  onTimePeriodChange: (value: TimePeriod) => void;
}

export function DashboardFilters({
  dateRange,
  timePeriod,
  onDateRangeChange,
  onTimePeriodChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="date-range" className="text-xs">Date Range</Label>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger id="date-range" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="time-period" className="text-xs">Group By</Label>
        <Select value={timePeriod} onValueChange={onTimePeriodChange}>
          <SelectTrigger id="time-period" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
