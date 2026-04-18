import { z } from 'zod';

export const workingDaySchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
  closed: z.boolean().optional(),
});

export const parkingInfoSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  maxCapacity: z.string().optional(),
  instructions: z.string().optional(),
  workingHours: z.array(workingDaySchema),
});

export type ParkingInfoFormValues = z.infer<typeof parkingInfoSchema>;

export const DEFAULT_WORKING_HOURS = [
  { day: 'Monday', open: '08:00', close: '18:00', closed: false },
  { day: 'Tuesday', open: '08:00', close: '18:00', closed: false },
  { day: 'Wednesday', open: '08:00', close: '18:00', closed: false },
  { day: 'Thursday', open: '08:00', close: '18:00', closed: false },
  { day: 'Friday', open: '08:00', close: '18:00', closed: false },
  { day: 'Saturday', open: '09:00', close: '14:00', closed: false },
  { day: 'Sunday', open: '09:00', close: '14:00', closed: true },
];

export const CARD_CLASS =
  'w-full rounded-2xl bg-background-secondary dark:bg-background-secondary-dark p-4 mb-3';
