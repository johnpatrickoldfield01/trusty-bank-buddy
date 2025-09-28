
import * as z from 'zod';

export const sendMoneyFormSchema = z.object({
  recipientName: z.string().min(2, { message: 'Recipient name must be at least 2 characters.' }),
  recipientEmail: z.string().email({ message: 'Please enter a valid email.' }),
  bankName: z.string().min(2, { message: 'Bank name is required.' }),
  accountNumber: z.string()
    .min(10, { message: 'Account number must be at least 10 digits.'})
    .max(16, { message: 'Account number cannot exceed 16 digits.'})
    .regex(/^\d+$/, { message: 'Account number must contain only digits.' }),
  branchCode: z.string().length(6, { message: 'Branch code must be 6 digits.'}).regex(/^\d+$/, { message: 'Branch code must contain only digits.'}).optional().or(z.literal('')),
  swiftCode: z.string().regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { message: 'Please enter a valid SWIFT/BIC code.'}).optional().or(z.literal('')),
  currency: z.string().min(3, { message: 'Currency is required.' }),
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be positive.' })
    .max(1000000, { message: 'Transaction amount cannot exceed 1,000,000.' })
    .refine(val => (val.toString().split('.')[1] || '').length <= 2, { message: 'Amount can have at most 2 decimal places.' }),
});

export type SendMoneyFormValues = z.infer<typeof sendMoneyFormSchema>;
