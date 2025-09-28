
import { z } from 'zod';

export const localTransferFormSchema = z.object({
  accountHolderName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bankName: z.string().min(2, { message: "Bank name must be at least 2 characters." }),
  accountNumber: z.string().min(8, { message: "Account number must be at least 8 digits." }).max(20),
  swiftCode: z.string().min(8, { message: "SWIFT code must be 8 or 11 characters." }).max(11, { message: "SWIFT code must be 8 or 11 characters." }),
  currency: z.string().min(3, { message: "Currency is required." }),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  recipientEmail: z.string().email({ message: "Valid email required." }).optional(),
});

export type LocalTransferFormValues = z.infer<typeof localTransferFormSchema>;
