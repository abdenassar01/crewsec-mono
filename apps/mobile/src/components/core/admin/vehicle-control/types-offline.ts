import { type Id } from 'convex/_generated/dataModel';
import { z } from 'zod';

// Zod schema for the offline reference entry
export const referenceEntrySchema = z.object({
  id: z.string(),
  reference: z.string().min(1, 'Reference is required'),
  mark: z.string().optional(),
  locationId: z.custom<Id<'locations'>>(),
  townId: z.custom<Id<'towns'>>(),
  violationId: z.custom<Id<'locationViolations'>>(),
  galleryStorageIds: z.array(z.string()).optional().default([]),
  isSignsChecked: z.boolean().optional().default(false),
  isPhotosTaken: z.boolean().optional().default(false),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  easyParkResponse: z.any().optional(),
  ticketUrl: z.string().optional(),
  device: z.any().optional(),
  createdAt: z.number(),
  completedAt: z.number().optional(),
  userId: z.string(),
});

export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;

export interface TownReferenceItem {
  reference: string;
  createdAt: number;
  userId: string;
}

export interface TownReferences {
  townId: string;
  townName: string;
  locationId: string;
  locationName: string;
  references: TownReferenceItem[];
  lastUpdated: number;
}
