
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sendMoneyFormSchema, type SendMoneyFormValues } from '@/schemas/sendMoneySchema';
import SendMoneyForm from './SendMoneyForm';

interface SendMoneyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendMoney: (data: { amount: number; recipientName: string }) => Promise<void>;
}

const SendMoneyDialog = ({ isOpen, onOpenChange, onSendMoney }: SendMoneyDialogProps) => {
  const form = useForm<SendMoneyFormValues>({
    resolver: zodResolver(sendMoneyFormSchema),
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

  async function onSubmit(values: SendMoneyFormValues) {
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
        <SendMoneyForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SendMoneyDialog;
