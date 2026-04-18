import { v } from 'convex/values';

import type { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';
import { authComponent } from './auth';
import { requireAdmin } from './auth/helpers';
import { type CustomResponse, ErrorCodes, failure, success } from './util';

// --- Car Brands ---
export const listCarBrands = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const query = args.search
      ? ctx.db
          .query('carBrands')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('carBrands');
    const results = await query.collect();
    return success(results);
  },
});

export const createCarBrand = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert('carBrands', args);
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const query = args.search
      ? ctx.db
          .query('locations')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('locations');
    const results = await query.collect();
    return success(results);
  },
});

export const listLocationsWithTowns = query({
  handler: async (ctx): Promise<CustomResponse<any>> => {
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const query = ctx.db.query('locations');

    const locations = await query.collect();

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
    await requireAdmin(ctx);
    return ctx.db.insert('locations', args);
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const query = ctx.db.query('towns');

    if (args.locationId) {
      query
        .withIndex('by_locationId', (q) => q.eq('locationId', args.locationId!))
        .collect();
    }

    let results;
    if (args.search) {
      results = await ctx.db
        .query('towns')
        .withSearchIndex('by_label', (q) => q.search('label', args.search!))
        .collect();
    } else {
      results = await query.collect();
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }

    const towns = await ctx.db
      .query('towns')
      .withIndex('by_locationId', (q) => q.eq('locationId', args.locationId!))
      .collect();

    let filteredTowns = towns;
    if (args.search) {
      filteredTowns = towns.filter((town) =>
        town.label.toLowerCase().includes(args.search!.toLowerCase()),
      );
    }
    return success(filteredTowns);
  },
});

export const createTown = mutation({
  args: {
    label: v.string(),
    number: v.number(),
    locationId: v.id('locations'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert('towns', args);
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const query = args.search
      ? ctx.db
          .query('violations')
          .withSearchIndex('by_label', (q) => q.search('label', args.search!))
      : ctx.db.query('violations');
    const results = await query.collect();
    return success(results);
  },
});

export const createViolation = mutation({
  args: { label: v.string(), number: v.number() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return ctx.db.insert('violations', args);
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
      return failure('Not authenticated', ErrorCodes.UNAUTHORIZED);
    }
    const query = args.locationId
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

    const locationViolations = await query.collect();

    // Fetch violation details for each location violation
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
    const authUser = await authComponent.getAuthUser(ctx);

    if (!authUser) {
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
    await requireAdmin(ctx);
    return ctx.db.insert('locationViolations', args);
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
