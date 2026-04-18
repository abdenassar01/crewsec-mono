import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useSafeQuery } from "@/lib/hooks";
import { DatePicker } from "@/components/ui/date-picker";

export type VehicleFilters = {
  searchTerm: string;
  parkingId: Id<"parkings"> | undefined;
  startDate: number | undefined;
  leaveDate: number | undefined;
};

interface VehicleFiltersProps {
  filters: VehicleFilters;
  onFiltersChange: (filters: VehicleFilters) => void;
  onReset: () => void;
}

export function VehicleFilters({ filters, onFiltersChange, onReset }: VehicleFiltersProps) {
  const parkings = useSafeQuery(api.parkings.list, { query: '' });

  const handleStartDateChange = (timestamp: number | undefined) => {
    onFiltersChange({ ...filters, startDate: timestamp });
  };

  const handleLeaveDateChange = (timestamp: number | undefined) => {
    onFiltersChange({ ...filters, leaveDate: timestamp });
  };

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="search" className="text-xs">Search Reference</Label>
        <Input
          id="search"
          placeholder="Search by reference..."
          value={filters.searchTerm}
          onChange={(e) => onFiltersChange({ ...filters, searchTerm: e.target.value })}
        />
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="parking" className="text-xs">Parking</Label>
        <Select
          value={filters.parkingId || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              parkingId: value === "all" ? undefined : (value as Id<"parkings">),
            })
          }
        >
          <SelectTrigger id="parking">
            <SelectValue placeholder="All parkings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All parkings</SelectItem>
            {(parkings ?? []).map((parking) => (
              <SelectItem key={parking._id} value={parking._id}>
                {parking.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <Label htmlFor="startDate" className="text-xs">Start Date (From)</Label>
        <DatePicker
          value={filters.startDate}
          onChange={(timestamp) => handleStartDateChange(timestamp)}
          placeholder="Select start date"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <Label htmlFor="leaveDate" className="text-xs">Leave Date (To)</Label>
        <DatePicker
          value={filters.leaveDate}
          onChange={(timestamp) => handleLeaveDateChange(timestamp)}
          placeholder="Select leave date"
        />
      </div>

      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
