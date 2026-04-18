'use client'

import { useRouter } from "next/navigation";
import { api } from "@convex/_generated/api";
import { useState, useMemo, useCallback } from "react";
import {
  StatCard,
  ControlFeeStatusCard,
  ControlFeeTrendChart,
  ViolationsChart,
  MyParkingStats,
  DashboardFilters,
} from "./components";
import {
  Building01FreeIcons,
  Car01FreeIcons,
  MoneyBag02FreeIcons,
} from "@hugeicons/core-free-icons";
import { useSafeQuery } from "@/lib/hooks";

type TimePeriod = 'day' | 'week' | 'month';
type DateRangePreset = '7d' | '30d' | '90d' | 'all';

export default function DashboardPage() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('day');
  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');

  const user = useSafeQuery(api.users.getCurrentUserProfile);

  if (user && user.role === 'CLIENT') {
    return null;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Laddar...</p>
      </div>
    );
  }


  // Memoize date range values to prevent infinite re-renders
  const dateRangeValues = useMemo(() => {
    const now = Date.now();
    const presets: Record<DateRangePreset, { startDate?: number; endDate: number }> = {
      '7d': { startDate: now - 7 * 24 * 60 * 60 * 1000, endDate: now },
      '30d': { startDate: now - 30 * 24 * 60 * 60 * 1000, endDate: now },
      '90d': { startDate: now - 90 * 24 * 60 * 60 * 1000, endDate: now },
      'all': { startDate: undefined, endDate: now },
    };
    return presets[dateRange];
  }, [dateRange]);

  // Fetch statistics data
  const globalStats = useSafeQuery(api.statistics.getGlobalStats);
  const myParkingStats = useSafeQuery(api.statistics.getMyParkingStats);
  const controlFeeStats = useSafeQuery(api.statistics.getControlFeeStats, {
    startDate: dateRangeValues.startDate,
    endDate: dateRangeValues.endDate,
    groupBy: timePeriod,
  });
  const controlFeeByStatus = useSafeQuery(api.statistics.getControlFeeByStatus, {
    startDate: dateRangeValues.startDate,
    endDate: dateRangeValues.endDate,
  });

  const stats = globalStats ?? {
    totalParkings: 0,
    totalVehicles: 0,
    currentlyParked: 0,
    totalViolations: 0,
    unresolvedViolations: 0,
    resolvedViolations: 0,
    totalControlFees: 0,
    controlFeesByStatus: {
      AWAITING: 0,
      PAID: 0,
      CANCELED: 0,
      CONFLICT: 0,
    },
  };

  const myStats = (myParkingStats ?? {
    parkingName: 'Loading...',
    currentlyParked: 0,
    totalVehicles: 0,
    unresolvedViolations: 0,
    resolvedViolations: 0,
    felparkeringCount: 0,
    makuleraCount: 0,
    totalViolations: 0,
  }) as typeof myParkingStats | {
    parkingName: string;
    currentlyParked: number;
    totalVehicles: number;
    unresolvedViolations: number;
    resolvedViolations: number;
    felparkeringCount: number;
    makuleraCount: number;
    totalViolations: number;
  };

  const statusStats = controlFeeByStatus ?? {
    AWAITING: 0,
    PAID: 0,
    CANCELED: 0,
    CONFLICT: 0,
    total: 0,
  };

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value as DateRangePreset);
  }, []);

  const handleTimePeriodChange = useCallback((value: string) => {
    setTimePeriod(value as TimePeriod);
  }, []);

  return (
    <div className="space-y-3 pt-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor your parking statistics and control fees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardFilters
            dateRange={dateRange}
            timePeriod={timePeriod}
            onDateRangeChange={handleDateRangeChange}
            onTimePeriodChange={handleTimePeriodChange}
          />
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Parkings"
          value={stats.totalParkings}
          description="Registered parking locations"
          icon={Building01FreeIcons}
        />
        <StatCard
          title="Currently Parked"
          value={stats.currentlyParked}
          description="Active vehicles now"
          icon={Car01FreeIcons}
          valueClassName="text-blue-600"
        />
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          description="All vehicle records"
          icon={Car01FreeIcons}
        />
        <StatCard
          title="Control Fees"
          value={stats.totalControlFees}
          description="Total fees issued"
          icon={MoneyBag02FreeIcons}
          valueClassName="text-purple-600"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ViolationsChart
          resolved={stats.resolvedViolations}
          unresolved={stats.unresolvedViolations}
          total={stats.totalViolations}
        />
        <ControlFeeStatusCard status={statusStats} />
      </div>

      <ControlFeeTrendChart data={controlFeeStats ?? []} />

      <MyParkingStats stats={myStats} />
    </div>
  );
}
