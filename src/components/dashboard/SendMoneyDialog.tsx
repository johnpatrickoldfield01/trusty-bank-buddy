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
  recipientName: z.string().min(2, { message: 'Recipient name is required.' }),
  bankName: z.string().min(2, { message: 'Bank name is required.' }),
  accountNumber: z.string().regex(/^\d+$/, { message: 'Account number must be digits only.' }),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
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
      recipientName: 'MR JOHN P OLDFIELD',
      bankName: 'First National Bank',
      accountNumber: '63155335110',
      branchCode: '220526',
      swiftCode: 'FIRNZAJJ',
      amount: 896476.27,
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        recipientName: 'MR JOHN P OLDFIELD',
        bankName: 'First National Bank',
        accountNumber: '63155335110',
        branchCode: '220526',
        swiftCode: 'FIRNZAJJ',
        amount: 896476.27,
      });
    }
  }, [isOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await onSendMoney({ amount: values.amount, recipientName: values.recipientName });
      toast.success(`Successfully sent R ${values.amount.toLocaleString()} to ${values.recipientName}.`);

      try {
        const { error } = await supabase.functions.invoke('send-transaction-email', {
          body: {
            ...values,
            recipientEmail: 'oldfieldjohnpatrick@gmail.com'
          }
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
            Enter the transaction details. Fields are pre-filled based on your request.
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (R)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <FormLabel>Branch Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>SWIFT Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
