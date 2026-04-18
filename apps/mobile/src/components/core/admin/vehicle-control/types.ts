import { type Id } from 'convex/_generated/dataModel';
import { z } from 'zod';

// Zod schema for the vehicle control form
export const vehicleControlItemSchema = z.object({
  id: z.string(),
  reference: z.string().min(1, 'Reference is required'),
  mark: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  townId: z.string().min(1, 'Town is required'),
  violationId: z.string().min(1, 'Violation is required'),
  galleryStorageIds: z.array(z.custom<Id<'_storage'>>()).optional().default([]),
  isSignsChecked: z.boolean().optional().default(false),
  isPhotosTaken: z.boolean().optional().default(false),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  easyParkResponse: z.any().optional(),
  device: z.any().optional(), // The printer device object can remain `any` for now
});

// Inferred TypeScript type from the Zod schema
export type VehicleControlItem = z.infer<typeof vehicleControlItemSchema>;
