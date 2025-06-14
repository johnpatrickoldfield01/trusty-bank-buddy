
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { localTransferFormSchema, type LocalTransferFormValues } from '@/schemas/localTransferSchema';
import LocalTransferForm from './LocalTransferForm';

interface LocalTransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LocalTransferDialog = ({ isOpen, onOpenChange }: LocalTransferDialogProps) => {
  const form = useForm<LocalTransferFormValues>({
    resolver: zodResolver(localTransferFormSchema),
    defaultValues: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      swiftCode: '',
      amount: undefined,
    },
  });

  const { formState: { isSubmitting } } = form;

  useEffect(() => {
    if (isOpen) {
      form.reset({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        swiftCode: '',
        amount: undefined,
      });
    }
  }, [isOpen, form]);

  async function onSubmit(values: LocalTransferFormValues) {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Successfully transferred R ${values.amount.toLocaleString()} to ${values.accountHolderName}.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Local Account Transfer</DialogTitle>
          <DialogDescription>
            Enter the recipient's bank details to make a transfer.
          </DialogDescription>
        </DialogHeader>
        <LocalTransferForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LocalTransferDialog;
