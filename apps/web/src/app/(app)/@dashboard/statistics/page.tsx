'use client'

import { useState, useMemo, useCallback } from "react"
import { api } from "@convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { useSafeQuery } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard, ControlFeesByAgentChart, ControlFeesDistributionChart } from "../components"
import { ControlFeeTrendChart } from "../components/ControlFeeTrendChart"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Calendar01FreeIcons, MoneyBag02FreeIcons, Tick01FreeIcons, Cancel01FreeIcons, RefreshFreeIcons } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type DateRangePreset = '7d' | '30d' | '90d' | 'all' | 'custom'
type TimeGroupBy = 'day' | 'week' | 'month'

function getPresetRange(preset: Exclude<DateRangePreset, 'custom'>) {
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  switch (preset) {
    case '7d': return { from: now - 7 * DAY, to: now }
    case '30d': return { from: now - 30 * DAY, to: now }
    case '90d': return { from: now - 90 * DAY, to: now }
    case 'all': return { from: undefined, to: now }
  }
}

function detectPreset(from: number | undefined, to: number | undefined): DateRangePreset {
  if (from === undefined && to !== undefined) return 'all'
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000
  if (!from) return 'custom'
  const diff = now - from
  const toDiff = Math.abs((to ?? now) - now)
  if (toDiff < DAY && Math.abs(diff - 7 * DAY) < DAY) return '7d'
  if (toDiff < DAY && Math.abs(diff - 30 * DAY) < DAY) return '30d'
  if (toDiff < DAY && Math.abs(diff - 90 * DAY) < DAY) return '90d'
  return 'custom'
}

export default function StatisticsPage() {
  const [rangeFrom, setRangeFrom] = useState<number | undefined>(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [rangeTo, setRangeTo] = useState<number | undefined>(Date.now())
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [selectedTown, setSelectedTown] = useState<string>('all')
  const [timeGroupBy, setTimeGroupBy] = useState<TimeGroupBy>('day')

  const adminUsers = useSafeQuery(api.users.getUsersByRole, { role: 'ADMIN' as const })
  const employeeUsers = useSafeQuery(api.users.getUsersByRole, { role: 'EMPLOYEE' as const })
  const towns = useSafeQuery(api.staticData.listTowns, { search: '' })

  const activePreset = useMemo(() => detectPreset(rangeFrom, rangeTo), [rangeFrom, rangeTo])

  const filterArgs = useMemo(() => ({
    startDate: rangeFrom,
    endDate: rangeTo,
    ...(selectedAgent !== 'all' ? { createdBy: selectedAgent as Id<"users"> } : {}),
    ...(selectedTown !== 'all' ? { townId: selectedTown as Id<"towns"> } : {}),
  }), [rangeFrom, rangeTo, selectedAgent, selectedTown])

  const stats = useSafeQuery(api.statistics.getControlFeesStatistics, filterArgs)
  const byAgentData = useSafeQuery(api.statistics.getControlFeesByAgent, filterArgs)

  const totalEvolutionData = useSafeQuery(api.statistics.getControlFeesEvolution, { ...filterArgs, groupBy: timeGroupBy })
  const paidEvolutionData = useSafeQuery(api.statistics.getControlFeesEvolution, { ...filterArgs, groupBy: timeGroupBy, status: 'PAID' as const })
  const canceledEvolutionData = useSafeQuery(api.statistics.getControlFeesEvolution, { ...filterArgs, groupBy: timeGroupBy, status: 'CANCELED' as const })
  const conflictEvolutionData = useSafeQuery(api.statistics.getControlFeesEvolution, { ...filterArgs, groupBy: timeGroupBy, status: 'CONFLICT' as const })

  const handlePresetChange = useCallback((value: string) => {
    if (value === 'custom') return
    const r = getPresetRange(value as Exclude<DateRangePreset, 'custom'>)
    setRangeFrom(r.from)
    setRangeTo(r.to)
  }, [])

  const handleRangeChange = useCallback((range: { from: number | undefined; to: number | undefined }) => {
    setRangeFrom(range.from)
    setRangeTo(range.to)
  }, [])

  const handleResetFilters = useCallback(() => {
    const r = getPresetRange('30d')
    setRangeFrom(r.from)
    setRangeTo(r.to)
    setSelectedAgent('all')
    setSelectedTown('all')
    setTimeGroupBy('day')
  }, [])

  const statsData = stats
    ? { total: stats.total, paid: stats.paid, unpaid: stats.unpaid, canceled: stats.canceled, conflict: stats.conflict, totalCollected: stats.totalCollected }
    : { total: 0, paid: 0, unpaid: 0, canceled: 0, conflict: 0, totalCollected: 0 }

  const agentUsers = useMemo(() => {
    const admins = Array.isArray(adminUsers) ? adminUsers : []
    const employees = Array.isArray(employeeUsers) ? employeeUsers : []
    return [...admins, ...employees]
  }, [adminUsers, employeeUsers])

  return (
    <div className="space-y-6 pt-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">Control fees statistics and analytics</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 mr-2">
          {(['7d', '30d', '90d', 'all'] as const).map((preset) => (
            <Button
              key={preset}
              variant={activePreset === preset ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handlePresetChange(preset)}
            >
              {preset === '7d' ? '7d' : preset === '30d' ? '30d' : preset === '90d' ? '90d' : 'All'}
            </Button>
          ))}
        </div>

        <DateRangePicker
          value={{ from: rangeFrom, to: rangeTo }}
          onChange={handleRangeChange}
          className="w-[260px]"
        />

        <Select value={timeGroupBy} onValueChange={(v) => setTimeGroupBy(v as TimeGroupBy)}>
          <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agentUsers.map((user: any) => (
              <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTown} onValueChange={setSelectedTown}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Town" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Towns</SelectItem>
            {Array.isArray(towns) && towns.map((town: any) => (
              <SelectItem key={town._id} value={town._id}>{town.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={handleResetFilters} title="Reset filters">
          <HugeiconsIcon icon={RefreshFreeIcons} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tickets" value={statsData.total} description="All control fees issued" icon={Calendar01FreeIcons} />
        <StatCard title="Paid Tickets" value={statsData.paid} description="Successfully paid" icon={Tick01FreeIcons} valueClassName="text-green-600" />
        <StatCard title="Unpaid Tickets" value={statsData.unpaid} description="Awaiting payment" icon={Cancel01FreeIcons} valueClassName="text-orange-500" />
        <StatCard title="Total Collected" value={`${statsData.totalCollected.toLocaleString()} Kr`} description="Total amount collected" icon={MoneyBag02FreeIcons} valueClassName="text-purple-600" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ControlFeesDistributionChart total={statsData.total} paid={statsData.paid} unpaid={statsData.unpaid} canceled={statsData.canceled} conflict={statsData.conflict} />
        <ControlFeesByAgentChart data={byAgentData ?? []} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ControlFeeTrendChart data={totalEvolutionData ?? []} title={`Total Fines by ${timeGroupBy === 'day' ? 'Day' : timeGroupBy === 'week' ? 'Week' : 'Month'}`} color="hsl(var(--primary))" />
        <ControlFeeTrendChart data={paidEvolutionData ?? []} title={`Paid Fines by ${timeGroupBy === 'day' ? 'Day' : timeGroupBy === 'week' ? 'Week' : 'Month'}`} color="hsl(142, 76%, 36%)" />
        <ControlFeeTrendChart data={canceledEvolutionData ?? []} title={`Canceled Fines by ${timeGroupBy === 'day' ? 'Day' : timeGroupBy === 'week' ? 'Week' : 'Month'}`} color="hsl(0, 0%, 60%)" />
        <ControlFeeTrendChart data={conflictEvolutionData ?? []} title={`Disputed Fines by ${timeGroupBy === 'day' ? 'Day' : timeGroupBy === 'week' ? 'Week' : 'Month'}`} color="hsl(271, 81%, 56%)" />
      </div>
    </div>
  )
}
