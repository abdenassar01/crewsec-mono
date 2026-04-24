import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { mutation } from './_generated/server';
import { createAuth } from './auth';

export const seedAdmin = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(
        v.literal('ADMIN'),
        v.literal('SUPER_ADMIN'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.email,
        password: args.password,
        name: args.name,
      },
    });

    if (!session?.user?.id) {
      throw new Error('Failed to create user in Better Auth');
    }

    const userId = await ctx.db.insert('users', {
      email: args.email,
      name: args.name,
      role: args.role ?? 'ADMIN',
      enabled: true,
      userId: session.user.id,
    });

    return userId;
  },
});

export const seedOrganizationWithAdmin = mutation({
  args: {
    orgName: v.string(),
    orgDescription: v.optional(v.string()),
    orgEmail: v.optional(v.string()),
    adminEmail: v.string(),
    adminPassword: v.string(),
    adminName: v.string(),
  },
  handler: async (ctx, args) => {
    const orgId = await ctx.db.insert('organizations', {
      name: args.orgName,
      description: args.orgDescription,
      email: args.orgEmail,
      subscriptionStatus: 'TRIAL',
      createdAt: Date.now(),
    });

    const session = await createAuth(ctx).api.signUpEmail({
      body: {
        email: args.adminEmail,
        password: args.adminPassword,
        name: args.adminName,
      },
    });

    if (!session?.user?.id) {
      throw new Error('Failed to create admin user in Better Auth');
    }

    const userId = await ctx.db.insert('users', {
      email: args.adminEmail,
      name: args.adminName,
      role: 'ADMIN',
      enabled: true,
      userId: session.user.id,
      organizationId: orgId,
    });

    return { orgId, userId };
  },
});

async function signUpAndInsertUser(
  ctx: any,
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT',
  orgId: Id<'organizations'>,
) {
  const session = await createAuth(ctx).api.signUpEmail({
    body: { email, password, name },
  });
  if (!session?.user?.id) {
    throw new Error(`Failed to create user ${email} in Better Auth`);
  }
  return ctx.db.insert('users', {
    email,
    name,
    role,
    enabled: true,
    userId: session.user.id,
    organizationId: orgId,
  });
}

export const seedAll = mutation({
  args: {
    orgName: v.string(),
    orgDescription: v.optional(v.string()),
    orgEmail: v.optional(v.string()),
    adminEmail: v.string(),
    adminPassword: v.string(),
    adminName: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const orgId = await ctx.db.insert('organizations', {
      name: args.orgName,
      description: args.orgDescription,
      email: args.orgEmail,
      subscriptionStatus: 'TRIAL',
      createdAt: now,
    });

    const adminUserId = await signUpAndInsertUser(
      ctx,
      args.adminEmail,
      args.adminPassword,
      args.adminName,
      'ADMIN',
      orgId,
    );

    const employeeUserId = await signUpAndInsertUser(
      ctx,
      'employee@seed.dev',
      'SeedEmp123!',
      'Seed Employee',
      'EMPLOYEE',
      orgId,
    );

    const clientUserId = await signUpAndInsertUser(
      ctx,
      'client@seed.dev',
      'SeedClient123!',
      'Seed Client',
      'CLIENT',
      orgId,
    );

    const parkingId = await ctx.db.insert('parkings', {
      name: 'Seed Parking Central',
      description: 'Main seed parking facility for testing',
      location: 'Stockholm',
      address: 'Storgatan 1, 111 23 Stockholm',
      website: 'https://seed-parking.example.com',
      userId: clientUserId,
      maxCapacity: 50,
      unresolvedMakuleras: 0,
      unresolvedFelparkering: 0,
      organizationId: orgId,
    });

    const locationIds: Id<'locations'>[] = [];
    const seedLocations = ['Stockholm', 'Göteborg', 'Malmö'];
    for (const label of seedLocations) {
      locationIds.push(await ctx.db.insert('locations', { label, organizationId: orgId }));
    }

    const violationIds: Id<'violations'>[] = [];
    const seedViolations = [
      { label: 'Felparkering', number: 1 },
      { label: 'Makulering', number: 2 },
      { label: 'Överträdelse', number: 3 },
    ];
    for (const sv of seedViolations) {
      violationIds.push(await ctx.db.insert('violations', { ...sv, organizationId: orgId }));
    }

    const townIds: Id<'towns'>[] = [];
    const seedTowns = [
      { label: 'Norrmalm', number: 101, locationIndex: 0 },
      { label: 'Södermalm', number: 102, locationIndex: 0 },
      { label: 'Johanneberg', number: 201, locationIndex: 1 },
      { label: 'Hisingen', number: 202, locationIndex: 1 },
      { label: 'Centrum', number: 301, locationIndex: 2 },
      { label: 'Rosengård', number: 302, locationIndex: 2 },
    ];
    for (const t of seedTowns) {
      townIds.push(
        await ctx.db.insert('towns', {
          label: t.label,
          number: t.number,
          locationId: locationIds[t.locationIndex],
          organizationId: orgId,
        }),
      );
    }

    const seedCarBrands = ['Volvo', 'Saab', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Toyota', 'Tesla'];
    for (const brand of seedCarBrands) {
      await ctx.db.insert('carBrands', { label: brand, organizationId: orgId });
    }

    const locationViolationIds: Id<'locationViolations'>[] = [];
    for (const locId of locationIds) {
      for (const violId of violationIds) {
        locationViolationIds.push(
          await ctx.db.insert('locationViolations', {
            price: 500,
            locationId: locId,
            violationId: violId,
            organizationId: orgId,
          }),
        );
      }
    }

    const seedVehicles = [
      { reference: 'ABC123', name: 'Volvo XC60', joinDate: now - 86400000 * 5, leaveDate: now + 86400000 * 10 },
      { reference: 'DEF456', name: 'BMW X5', joinDate: now - 86400000 * 3, leaveDate: now + 86400000 * 7 },
      { reference: 'GHI789', name: 'Tesla Model 3', joinDate: now - 86400000 * 1, leaveDate: now + 86400000 * 14 },
      { reference: 'JKL012', name: 'Audi A4', joinDate: now, leaveDate: now + 86400000 * 30 },
      { reference: 'MNO345', name: 'Toyota Camry', joinDate: now - 86400000 * 7, leaveDate: now + 86400000 * 3 },
    ];
    for (const veh of seedVehicles) {
      await ctx.db.insert('vehicles', {
        ...veh,
        parkingId,
        organizationId: orgId,
      });
    }

    const seedControlFee = await ctx.db.insert('controlFees', {
      reference: 'CTRL-SEED-001',
      mark: 'A1',
      startDate: now - 86400000,
      endDate: now,
      isSignsChecked: true,
      isPhotosTaken: true,
      status: 'AWAITING',
      galleryStorageIds: [],
      townId: townIds[0],
      locationViolationId: locationViolationIds[0],
      createdAt: now,
      createdBy: employeeUserId,
      organizationId: orgId,
    });

    const seedCanceledViolation = await ctx.db.insert('canceledViolations', {
      reference: 'CANCEL-SEED-001',
      cause: 'FELPARKERING',
      resolved: false,
      parkingId,
      notes: 'Seed canceled violation for testing',
      createdAt: now,
      organizationId: orgId,
    });

    return {
      organization: orgId,
      admin: adminUserId,
      employee: employeeUserId,
      client: clientUserId,
      parking: parkingId,
      locations: locationIds.length,
      violations: violationIds.length,
      towns: townIds.length,
      carBrands: seedCarBrands.length,
      locationViolations: locationViolationIds.length,
      vehicles: seedVehicles.length,
      controlFee: seedControlFee,
      canceledViolation: seedCanceledViolation,
    };
  },
});
