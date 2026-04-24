import { z } from 'zod';

export const updateUserFormSchema = z.object({
  // User fields
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'CLIENT', 'SUPER_ADMIN']).optional(),

  // Parking fields
  parkingName: z.string().min(1, 'Parking name is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  website: z.string().optional(),
  address: z.string().optional(),
  image: z.string().optional(),
  maxCapacity: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
