
import React from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { type SendMoneyFormValues } from '@/schemas/sendMoneySchema';

interface SendMoneyFormProps {
  form: UseFormReturn<SendMoneyFormValues>;
  onSubmit: (values: SendMoneyFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const SendMoneyForm = ({ form, onSubmit, onCancel, isSubmitting }: SendMoneyFormProps) => {
  return (
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
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Payment'}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SendMoneyForm;
