
import { z } from 'zod';

export const localTransferFormSchema = z.object({
  accountHolderName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  bankName: z.string().min(2, { message: "Bank name must be at least 2 characters." }),
  accountNumber: z.string().min(8, { message: "Account number must be at least 8 digits." }).max(20),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
});

export type LocalTransferFormValues = z.infer<typeof localTransferFormSchema>;
