import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  recipientName: z.string().min(2, { message: 'Recipient name must be at least 2 characters.' }),
  recipientEmail: z.string().email({ message: 'Please enter a valid email.' }),
  bankName: z.string().min(2, { message: 'Bank name is required.' }),
  accountNumber: z.string()
    .min(10, { message: 'Account number must be at least 10 digits.'})
    .max(16, { message: 'Account number cannot exceed 16 digits.'})
    .regex(/^\d+$/, { message: 'Account number must contain only digits.' }),
  branchCode: z.string().length(6, { message: 'Branch code must be 6 digits.'}).regex(/^\d+$/, { message: 'Branch code must contain only digits.'}).optional().or(z.literal('')),
  swiftCode: z.string().regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { message: 'Please enter a valid SWIFT/BIC code.'}).optional().or(z.literal('')),
  amount: z.coerce
    .number()
    .positive({ message: 'Amount must be positive.' })
    .max(1000000, { message: 'Transaction amount cannot exceed R 1,000,000.' })
    .refine(val => (val.toString().split('.')[1] || '').length <= 2, { message: 'Amount can have at most 2 decimal places.' }),
});

interface SendMoneyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMoney: (data: { amount: number; recipientName: string }) => Promise<void>;
}

const SendMoneyDialog = ({ isOpen, onOpenChange, onSendMoney }: SendMoneyDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientName: '',
      recipientEmail: '',
      bankName: '',
      accountNumber: '',
      branchCode: '',
      swiftCode: '',
      amount: undefined,
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        recipientName: '',
        recipientEmail: '',
        bankName: '',
        accountNumber: '',
        branchCode: '',
        swiftCode: '',
        amount: undefined,
      });
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await onSendMoney({ amount: values.amount, recipientName: values.recipientName });
      toast.success(`Successfully sent R ${values.amount.toLocaleString()} to ${values.recipientName}.`);

      try {
        const { error } = await supabase.functions.invoke('send-transaction-email', {
          body: values
        });
        if (error) throw error;
        toast.info("Transaction confirmation email sent.");
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
        toast.error("Failed to send confirmation email.");
      }
      
      onOpenChange(false);
    } catch (error: any) {
      // Error toast is already handled by the caller or mutation
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Enter the transaction details. All fields are required unless marked optional.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipient's full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="recipient@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (R)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 500.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Standard Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="branchCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 051001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="swiftCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SBZAZAJJ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Payment'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SendMoneyDialog;
