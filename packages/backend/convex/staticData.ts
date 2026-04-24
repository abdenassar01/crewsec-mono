import { v } from 'convex/values';

import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { requireAdmin, getAuthenticatedUser, getOrganizationId } from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

// --- Car Brands ---
export const listCarBrands = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const orgId = getOrganizationId(user);
    const q = args.search
      ? ctx.db
          .query('carBrands')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('carBrands');
    let results = await q.collect();
    if (orgId) {
      results = results.filter((r) => r.organizationId === orgId);
    }
    return success(results);
  },
});

export const createCarBrand = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    return ctx.db.insert('carBrands', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

export const updateCarBrand = mutation({
  args: { id: v.id('carBrands'), label: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.patch(args.id, { label: args.label });
  },
});

export const deleteCarBrand = mutation({
  args: { id: v.id('carBrands') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.delete(args.id);
  },
});

export const listLocations = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<Doc<'locations'>[]>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const orgId = getOrganizationId(user);
    const q = args.search
      ? ctx.db
          .query('locations')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('locations');
    let results = await q.collect();
    if (orgId) {
      results = results.filter((r) => r.organizationId === orgId);
    }
    return success(results);
  },
});

export const listLocationsWithTowns = query({
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const orgId = getOrganizationId(user);

    let locations = await ctx.db.query('locations').collect();
    if (orgId) {
      locations = locations.filter((l) => l.organizationId === orgId);
    }

    const results = await Promise.all(
      locations.map(async (location) => {
        const towns = await ctx.db
          .query('towns')
          .withIndex('by_locationId', (q) => q.eq('locationId', location._id))
          .collect();

        return { ...location, towns };
      }),
    );

    return success(results);
  },
});

export const createLocation = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    return ctx.db.insert('locations', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

export const updateLocation = mutation({
  args: { id: v.id('locations'), label: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.patch(args.id, { label: args.label });
  },
});

export const deleteLocation = mutation({
  args: { id: v.id('locations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.delete(args.id);
  },
});

// --- Towns ---
export const listTowns = query({
  args: {
    search: v.optional(v.string()),
    locationId: v.optional(v.id('locations')),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const orgId = getOrganizationId(user);

    let results;
    if (args.search) {
      results = await ctx.db
        .query('towns')
        .withSearchIndex('by_label', (q) => q.search('label', args.search!))
        .collect();
    } else if (args.locationId) {
      results = await ctx.db
        .query('towns')
        .withIndex('by_locationId', (q) =>
          q.eq('locationId', args.locationId!),
        )
        .collect();
    } else {
      results = await ctx.db.query('towns').collect();
    }
    if (orgId) {
      results = results.filter((r) => r.organizationId === orgId);
    }
    return success(results);
  },
});

export const listTownsByLocationId = query({
  args: {
    locationId: v.id('locations'),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const orgId = getOrganizationId(user);

    let towns = await ctx.db
      .query('towns')
      .withIndex('by_locationId', (q) => q.eq('locationId', args.locationId!))
      .collect();

    if (args.search) {
      towns = towns.filter((town) =>
        town.label.toLowerCase().includes(args.search!.toLowerCase()),
      );
    }
    if (orgId) {
      towns = towns.filter((t) => t.organizationId === orgId);
    }
    return success(towns);
  },
});

export const createTown = mutation({
  args: {
    label: v.string(),
    number: v.number(),
    locationId: v.id('locations'),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    return ctx.db.insert('towns', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

export const updateTown = mutation({
  args: {
    id: v.id('towns'),
    label: v.optional(v.string()),
    number: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    return ctx.db.patch(id, rest);
  },
});

export const deleteTown = mutation({
  args: { id: v.id('towns') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.delete(args.id);
  },
});

// --- Violations ---
export const listViolations = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<Doc<'violations'>[]>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const orgId = getOrganizationId(user);
    const q = args.search
      ? ctx.db
          .query('violations')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('violations');
    let results = await q.collect();
    if (orgId) {
      results = results.filter((r) => r.organizationId === orgId);
    }
    return success(results);
  },
});

export const createViolation = mutation({
  args: { label: v.string(), number: v.number() },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    return ctx.db.insert('violations', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

export const updateViolation = mutation({
  args: {
    id: v.id('violations'),
    label: v.optional(v.string()),
    number: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    return ctx.db.patch(id, rest);
  },
});

export const deleteViolation = mutation({
  args: { id: v.id('violations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.delete(args.id);
  },
});

// --- LocationViolations (Join Table) ---
export const listLocationViolations = query({
  args: {
    locationId: v.optional(v.id('locations')),
    violationId: v.optional(v.id('violations')),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const orgId = getOrganizationId(user);
    const q = args.locationId
      ? ctx.db
          .query('locationViolations')
          .withIndex('by_locationId', (q) =>
            q.eq('locationId', args.locationId!),
          )
      : args.violationId
        ? ctx.db
            .query('locationViolations')
            .withIndex('by_violationId', (q) =>
              q.eq('violationId', args.violationId!),
            )
        : ctx.db.query('locationViolations');

    let locationViolations = await q.collect();
    if (orgId) {
      locationViolations = locationViolations.filter(
        (lv) => lv.organizationId === orgId,
      );
    }

    const results = await Promise.all(
      locationViolations.map(async (lv) => {
        const violation = await ctx.db.get(lv.violationId);
        return {
          ...lv,
          label: violation?.label || '',
          number: violation?.number || 0,
        };
      }),
    );

    return success(results);
  },
});

export const getLocationViolation = query({
  args: { id: v.id('locationViolations') },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const user = await getAuthenticatedUser(ctx);

    if (!user) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const locationViolation = await ctx.db.get(args.id);

    if (!locationViolation) {
      return failure('Location violation not found', ErrorCodes.NOT_FOUND);
    }

    const violation = await ctx.db.get(locationViolation.violationId);
    const location = await ctx.db.get(locationViolation.locationId);
    return success({
      ...locationViolation,
      violation,
      location,
    });
  },
});

export const createLocationViolation = mutation({
  args: {
    price: v.number(),
    locationId: v.id('locations'),
    violationId: v.id('violations'),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);
    return ctx.db.insert('locationViolations', {
      ...args,
      organizationId: getOrganizationId(user) ?? undefined,
    });
  },
});

export const updateLocationViolation = mutation({
  args: { id: v.id('locationViolations'), price: v.optional(v.number()) },
  handler: async (ctx, { id, ...rest }) => {
    await requireAdmin(ctx);
    return ctx.db.patch(id, rest);
  },
});

export const deleteLocationViolation = mutation({
  args: { id: v.id('locationViolations') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.delete(args.id);
  },
});
