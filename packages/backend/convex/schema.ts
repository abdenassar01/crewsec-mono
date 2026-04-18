import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const workingDay = v.object({
  day: v.string(),
  open: v.string(),
  close: v.string(),
  closed: v.optional(v.boolean()),
});

const controlFeeStatus = v.union(
  v.literal('AWAITING'),
  v.literal('PAID'),
  v.literal('CANCELED'),
  v.literal('CONFLICT'),
);
const vehicleControlStatus = v.union(
  v.literal('CREATED'),
  v.literal('PAID'),
  v.literal('UNPAID'),
);

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    avatar: v.optional(v.id('_storage')),
    role: v.union(
      v.literal('CLIENT'),
      v.literal('EMPLOYEE'),
      v.literal('ADMIN'),
    ),
    ocr: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    userId: v.string(),
  })
    .index('by_email', ['email'])
    .index('by_userId', ['userId'])
    .index('by_role', ['role']),

  parkings: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),
    imageStorageId: v.optional(v.id('_storage')),
    website: v.optional(v.string()),
    address: v.string(),
    userId: v.id('users'),
    unresolvedMakuleras: v.optional(v.number()),
    unresolvedMarkuleras: v.optional(v.number()),
    unresolvedFelparkering: v.optional(v.number()),
    workingHours: v.optional(v.array(workingDay)),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    maxCapacity: v.optional(v.number()),
    instructions: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .searchIndex('by_name', { searchField: 'name' }),

  parkingAvailability: defineTable({
    parkingId: v.id('parkings'),
    startDate: v.number(),
    endDate: v.number(),
    status: v.union(
      v.literal('AVAILABLE'),
      v.literal('BOOKED'),
      v.literal('MAINTENANCE'),
    ),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  })
    .index('by_parkingId', ['parkingId'])
    .index('by_date_range', ['startDate', 'endDate']),

  vehicles: defineTable({
    reference: v.string(),
    name: v.string(),
    leaveDate: v.number(),
    joinDate: v.number(),
    parkingId: v.id('parkings'),
  })
    .index('by_parkingId', ['parkingId'])
    .index('by_reference', ['reference'])
    .searchIndex('by_reference_search', {
      searchField: 'reference',
      filterFields: ['parkingId'],
    }),

  canceledViolations: defineTable({
    reference: v.string(),
    cause: v.union(v.literal('FELPARKERING'), v.literal('MAKULERA')),
    resolved: v.boolean(),
    parkingId: v.id('parkings'),
    notes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index('by_parkingId', ['parkingId'])
    .index('by_cause', ['cause'])
    .index('by_parkingId_and_cause', ['parkingId', 'cause'])
    .index('by_parkingId_and_resolved', ['parkingId', 'resolved']),

  controlFees: defineTable({
    reference: v.string(),
    mark: v.string(),
    ticketUrl: v.optional(v.id('_storage')),
    easyParkResponse: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    isSignsChecked: v.boolean(),
    isPhotosTaken: v.boolean(),
    status: controlFeeStatus,
    galleryStorageIds: v.array(v.id('_storage')),
    townId: v.id('towns'),
    locationViolationId: v.id('locationViolations'),
    createdAt: v.optional(v.number()),
    createdBy: v.optional(v.id('users')),
  })
    .index('by_townId', ['townId'])
    .index('by_locationViolationId', ['locationViolationId'])
    .index('by_reference', ['reference'])
    .index('by_createdBy', ['createdBy']),

  violationControls: defineTable({
    reference: v.string(),
    description: v.string(),
    vehicle: v.string(),
    status: vehicleControlStatus,
    signChecked: v.boolean(),
    imagesChecked: v.boolean(),
    imagesStorageIds: v.optional(v.array(v.id('_storage'))),
    locationViolationId: v.id('locationViolations'),
  }).searchIndex('by_reference', {
    searchField: 'reference',
  }),

  // Static Data Tables
  carBrands: defineTable({
    label: v.string(),
  })
    .searchIndex('by_label', { searchField: 'label' })
    .index('by_label_db', ['label']),

  locations: defineTable({
    label: v.string(),
  })
    .searchIndex('by_label', { searchField: 'label' })
    .index('by_label_db', ['label']),

  violations: defineTable({
    label: v.string(),
    number: v.number(),
  })
    .searchIndex('by_label', { searchField: 'label' })
    .index('by_label_db', ['label']),

  towns: defineTable({
    label: v.string(),
    number: v.number(),
    locationId: v.id('locations'),
  })
    .index('by_locationId', ['locationId'])
    .index('by_label_db', ['label'])
    .searchIndex('by_label', {
      searchField: 'label',
      filterFields: ['locationId'],
    }),

  locationViolations: defineTable({
    price: v.number(),
    locationId: v.id('locations'),
    violationId: v.id('violations'),
  })
    .index('by_locationId', ['locationId'])
    .index('by_violationId', ['violationId']),

  pushNotificationParams: defineTable({
    userId: v.id('users'),
    expoPushToken: v.string(),
    deviceId: v.optional(v.string()),
    lastUsed: v.optional(v.number()),
  })
    .index('by_userId', ['userId'])
    .index('by_userId_and_token', ['userId', 'expoPushToken']),
});
