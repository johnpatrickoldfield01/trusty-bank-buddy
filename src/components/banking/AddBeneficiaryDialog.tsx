import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const beneficiarySchema = z.object({
  beneficiary_name: z.string().min(1, 'Name is required'),
  bank_name: z.string().min(1, 'Bank is required'),
  account_number: z.string().min(1, 'Account number is required'),
  swift_code: z.string().optional(),
  branch_code: z.string().optional(),
  beneficiary_email: z.string().email().optional().or(z.literal('')),
});

const BANKS = [
  'Capitec Bank',
  'Standard Bank',
  'First National Bank (FNB)',
  'Discovery Bank',
  'HSBC Hong Kong',
  'Bank of China Hong Kong',
  'ABSA Bank',
  'Nedbank',
  'Investec',
  'African Bank'
];

interface AddBeneficiaryDialogProps {
  trigger?: React.ReactNode;
}

const AddBeneficiaryDialog = ({ trigger }: AddBeneficiaryDialogProps) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    bank_name: '',
    account_number: '',
    swift_code: '',
    branch_code: '',
    beneficiary_email: '',
  });

  const addBeneficiary = useMutation({
    mutationFn: async (data: typeof formData) => {
      const validated = beneficiarySchema.parse(data);
      
      const { data: result, error } = await supabase
        .from('beneficiaries')
        .insert([{
          user_id: user?.id,
          beneficiary_name: validated.beneficiary_name,
          bank_name: validated.bank_name,
          account_number: validated.account_number,
          swift_code: validated.swift_code || null,
          branch_code: validated.branch_code || null,
          beneficiary_email: validated.beneficiary_email || null,
          kyc_verified: true, // Auto-verify for demo purposes
        }]);

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success('Beneficiary added successfully');
      setOpen(false);
      setFormData({
        beneficiary_name: '',
        bank_name: '',
        account_number: '',
        swift_code: '',
        branch_code: '',
        beneficiary_email: '',
      });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
    onError: (error) => {
      toast.error(`Failed to add beneficiary: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addBeneficiary.mutate(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Add New
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Beneficiary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiary_name">Beneficiary Name *</Label>
              <Input
                id="beneficiary_name"
                value={formData.beneficiary_name}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank *</Label>
              <Select 
                value={formData.bank_name} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bank_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="1234567890"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch_code">Branch Code</Label>
              <Input
                id="branch_code"
                value={formData.branch_code}
                onChange={(e) => setFormData(prev => ({ ...prev, branch_code: e.target.value }))}
                placeholder="051001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="swift_code">SWIFT Code</Label>
              <Input
                id="swift_code"
                value={formData.swift_code}
                onChange={(e) => setFormData(prev => ({ ...prev, swift_code: e.target.value }))}
                placeholder="SBZAZAJJ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="beneficiary_email">Email</Label>
              <Input
                id="beneficiary_email"
                type="email"
                value={formData.beneficiary_email}
                onChange={(e) => setFormData(prev => ({ ...prev, beneficiary_email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addBeneficiary.isPending}>
              Add Beneficiary
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeneficiaryDialog;