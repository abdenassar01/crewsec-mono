import { z } from 'zod';

export const staticDataSchema = z.object({
  label: z.string({
    required_error: 'You must provide a name for the town to create it',
  }),
});

export type StaticData = z.infer<typeof staticDataSchema>;

export const locationViolationSchema = z.object({
  price: z.number({ required_error: 'Price is required' }),
  location: z.string({ required_error: 'Location is required' }),
  violation: z.string({ required_error: 'Violation is required' }),
});

export type LocationValidationFrom = z.infer<typeof locationViolationSchema>;
