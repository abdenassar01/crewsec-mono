import { v } from 'convex/values';
import { query } from './_generated/server';
import { requireAdmin, requireAdminOrEmployee, getOrganizationId } from './auth/helpers';
import { CustomResponse, failure, success, ErrorCodes } from './util';

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export const getControlFeeStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    groupBy: v.optional(v.union(v.literal('day'), v.literal('week'), v.literal('month'))),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;
    const groupBy = args.groupBy ?? 'day';

    let allControlFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allControlFees = allControlFees.filter((f) => f.organizationId === orgId);
    }

    const filteredFees = allControlFees.filter(
      (fee) => fee.startDate >= startDate && fee.startDate <= endDate,
    );

    const groupedData: Record<string, number> = {};

    filteredFees.forEach((fee) => {
      const date = new Date(fee.startDate);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    const data = Object.entries(groupedData)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return data;
  },
});

export const getControlFeeByStatus = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;

    let allControlFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allControlFees = allControlFees.filter((f) => f.organizationId === orgId);
    }

    const filteredFees = allControlFees.filter(
      (fee) => fee.startDate >= startDate && fee.startDate <= endDate,
    );

    return {
      AWAITING: filteredFees.filter((f) => f.status === 'AWAITING').length,
      PAID: filteredFees.filter((f) => f.status === 'PAID').length,
      CANCELED: filteredFees.filter((f) => f.status === 'CANCELED').length,
      CONFLICT: filteredFees.filter((f) => f.status === 'CONFLICT').length,
      total: filteredFees.length,
    };
  },
});

export const getControlFeeStatsByStatus = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    groupBy: v.optional(v.union(v.literal('day'), v.literal('week'), v.literal('month'))),
    status: v.optional(v.union(v.literal('AWAITING'), v.literal('PAID'), v.literal('CANCELED'), v.literal('CONFLICT'))),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;
    const groupBy = args.groupBy ?? 'day';

    let allControlFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allControlFees = allControlFees.filter((f) => f.organizationId === orgId);
    }

    const filteredFees = allControlFees.filter(
      (fee) => fee.startDate >= startDate && fee.startDate <= endDate,
    );

    const statusFilteredFees = args.status
      ? filteredFees.filter((f) => f.status === args.status)
      : filteredFees;

    const groupedData: Record<string, number> = {};

    statusFilteredFees.forEach((fee) => {
      const date = new Date(fee.startDate);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        key = `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    const data = Object.entries(groupedData)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return data;
  },
});

export const getParkingStats = query({
  args: {
    parkingId: v.id('parkings'),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    await requireAdmin(ctx);
    const parking = await ctx.db.get(args.parkingId);
    if (!parking) {
      return failure('Parking not found', ErrorCodes.NOT_FOUND);
    }

    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .collect();

    const now = Date.now();

    const currentlyParked = vehicles.filter((v) => v.leaveDate > now).length;
    const totalVehicles = vehicles.length;

    const canceledViolations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', args.parkingId))
      .collect();

    const unresolvedViolations = canceledViolations.filter((v) => !v.resolved).length;
    const resolvedViolations = canceledViolations.filter((v) => v.resolved).length;

    const felparkeringCount = canceledViolations.filter(
      (v) => v.cause === 'FELPARKERING',
    ).length;
    const makuleraCount = canceledViolations.filter(
      (v) => v.cause === 'MAKULERA',
    ).length;

    return success({
      currentlyParked,
      totalVehicles,
      unresolvedViolations,
      resolvedViolations,
      felparkeringCount,
      makuleraCount,
      parkingName: parking.name,
    });
  },
});

export const getGlobalStats = query({
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);

    let allParkings = await ctx.db.query('parkings').collect();
    let allVehicles = await ctx.db.query('vehicles').collect();
    let allCanceledViolations = await ctx.db.query('canceledViolations').collect();
    let allControlFees = await ctx.db.query('controlFees').collect();

    if (orgId) {
      allParkings = allParkings.filter((p) => p.organizationId === orgId);
      allVehicles = allVehicles.filter((v) => v.organizationId === orgId);
      allCanceledViolations = allCanceledViolations.filter((v) => v.organizationId === orgId);
      allControlFees = allControlFees.filter((f) => f.organizationId === orgId);
    }

    const now = Date.now();
    const currentlyParked = allVehicles.filter((v) => v.leaveDate > now).length;

    const unresolvedViolations = allCanceledViolations.filter((v) => !v.resolved).length;
    const resolvedViolations = allCanceledViolations.filter((v) => v.resolved).length;

    const controlFeesByStatus = {
      AWAITING: allControlFees.filter((f) => f.status === 'AWAITING').length,
      PAID: allControlFees.filter((f) => f.status === 'PAID').length,
      CANCELED: allControlFees.filter((f) => f.status === 'CANCELED').length,
      CONFLICT: allControlFees.filter((f) => f.status === 'CONFLICT').length,
    };

    return {
      totalParkings: allParkings.length,
      totalVehicles: allVehicles.length,
      currentlyParked,
      totalViolations: allCanceledViolations.length,
      unresolvedViolations,
      resolvedViolations,
      totalControlFees: allControlFees.length,
      controlFeesByStatus,
    };
  },
});

export const getControlFeesByAgent = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;

    let allControlFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allControlFees = allControlFees.filter((f) => f.organizationId === orgId);
    }

    const filteredFees = allControlFees.filter(
      (fee) => fee.startDate >= startDate && fee.startDate <= endDate,
    );

    const groupedByAgent: Record<string, { total: number; paid: number }> = {};

    filteredFees.forEach((fee) => {
      const agentId = fee.createdBy?.toString() || 'unknown';
      if (!groupedByAgent[agentId]) {
        groupedByAgent[agentId] = { total: 0, paid: 0 };
      }
      groupedByAgent[agentId].total += 1;
      if (fee.status === 'PAID') {
        groupedByAgent[agentId].paid += 1;
      }
    });

    const result = await Promise.all(
      Object.entries(groupedByAgent).map(async ([agentId, stats]) => {
        if (agentId === 'unknown') {
          return { name: 'Unknown', total: stats.total, paid: stats.paid };
        }

        const user = await ctx.db.get(agentId as any) as any;
        return {
          name: user?.name || 'Unknown',
          total: stats.total,
          paid: stats.paid,
        };
      }),
    );

    return result.sort((a, b) => b.total - a.total);
  },
});

export const getControlFeesStatistics = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireAdminOrEmployee(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;

    let allFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allFees = allFees.filter((f) => f.organizationId === orgId);
    }
    const filtered = allFees.filter(
      (f) => f.startDate >= startDate && f.startDate <= endDate,
    );

    let totalCollected = 0;
    await Promise.all(
      filtered
        .filter((f) => f.status === 'PAID')
        .map(async (f) => {
          const lv = await ctx.db.get(f.locationViolationId);
          if (lv) totalCollected += lv.price ?? 0;
        }),
    );

    return {
      total: filtered.length,
      paid: filtered.filter((f) => f.status === 'PAID').length,
      unpaid: filtered.filter((f) => f.status === 'AWAITING').length,
      canceled: filtered.filter((f) => f.status === 'CANCELED').length,
      conflict: filtered.filter((f) => f.status === 'CONFLICT').length,
      totalCollected,
    };
  },
});

export const getControlFeesEvolution = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    groupBy: v.optional(v.union(v.literal('day'), v.literal('week'), v.literal('month'))),
    status: v.optional(v.union(v.literal('AWAITING'), v.literal('PAID'), v.literal('CANCELED'), v.literal('CONFLICT'))),
  },
  handler: async (ctx, args) => {
    const user = await requireAdminOrEmployee(ctx);
    const orgId = getOrganizationId(user);
    const now = Date.now();
    const startDate = args.startDate ?? now - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? now;
    const groupBy = args.groupBy ?? 'day';

    let allFees = await ctx.db.query('controlFees').collect();
    if (orgId) {
      allFees = allFees.filter((f) => f.organizationId === orgId);
    }
    let filtered = allFees.filter(
      (f) => f.startDate >= startDate && f.startDate <= endDate,
    );

    if (args.status) {
      filtered = filtered.filter((f) => f.status === args.status);
    }

    const groupedData: Record<string, number> = {};

    filtered.forEach((fee) => {
      const date = new Date(fee.startDate);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        key = `${date.getFullYear()}-W${String(getISOWeek(date)).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    return Object.entries(groupedData)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  },
});

export const getMyParkingStats = query({
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const userProfile = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', user.email!))
      .unique();

    if (!userProfile) {
      return failure('User profile not found', ErrorCodes.NOT_FOUND);
    }

    const parking = await ctx.db
      .query('parkings')
      .withIndex('by_userId', (q) => q.eq('userId', userProfile._id))
      .unique();

    if (!parking) {
      return failure('This account is not associated to a parking', ErrorCodes.NOT_FOUND);
    }

    const vehicles = await ctx.db
      .query('vehicles')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', parking._id))
      .collect();

    const now = Date.now();
    const currentlyParked = vehicles.filter((v) => v.leaveDate > now).length;

    const canceledViolations = await ctx.db
      .query('canceledViolations')
      .withIndex('by_parkingId', (q) => q.eq('parkingId', parking._id))
      .collect();

    const unresolvedViolations = canceledViolations.filter((v) => !v.resolved).length;
    const resolvedViolations = canceledViolations.filter((v) => v.resolved).length;

    const felparkeringCount = canceledViolations.filter(
      (v) => v.cause === 'FELPARKERING',
    ).length;
    const makuleraCount = canceledViolations.filter((v) => v.cause === 'MAKULERA').length;

    return success({
      parkingId: parking._id,
      parkingName: parking.name,
      currentlyParked,
      totalVehicles: vehicles.length,
      unresolvedViolations,
      resolvedViolations,
      felparkeringCount,
      makuleraCount,
      totalViolations: canceledViolations.length,
    });
  },
});
