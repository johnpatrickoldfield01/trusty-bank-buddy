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
import { Plus, X } from 'lucide-react';
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

const DEFAULT_BANKS = [
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
  beneficiaryToEdit?: any;
  onClose?: () => void;
}

const AddBeneficiaryDialog = ({ trigger, beneficiaryToEdit, onClose }: AddBeneficiaryDialogProps) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [customBanks, setCustomBanks] = useState<string[]>(() => {
    const saved = localStorage.getItem('customBanks');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAddingNewBank, setIsAddingNewBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [formData, setFormData] = useState({
    beneficiary_name: beneficiaryToEdit?.beneficiary_name || '',
    bank_name: beneficiaryToEdit?.bank_name || '',
    account_number: beneficiaryToEdit?.account_number || '',
    swift_code: beneficiaryToEdit?.swift_code || '',
    branch_code: beneficiaryToEdit?.branch_code || '',
    beneficiary_email: beneficiaryToEdit?.beneficiary_email || '',
  });

  const allBanks = [...DEFAULT_BANKS, ...customBanks].sort();

  React.useEffect(() => {
    if (beneficiaryToEdit) {
      setFormData({
        beneficiary_name: beneficiaryToEdit.beneficiary_name || '',
        bank_name: beneficiaryToEdit.bank_name || '',
        account_number: beneficiaryToEdit.account_number || '',
        swift_code: beneficiaryToEdit.swift_code || '',
        branch_code: beneficiaryToEdit.branch_code || '',
        beneficiary_email: beneficiaryToEdit.beneficiary_email || '',
      });
      setOpen(true);
    }
  }, [beneficiaryToEdit]);

  const addBeneficiary = useMutation({
    mutationFn: async (data: typeof formData) => {
      const validated = beneficiarySchema.parse(data);
      
      if (beneficiaryToEdit) {
        // Update existing beneficiary
        const { data: result, error } = await supabase
          .from('beneficiaries')
          .update({
            beneficiary_name: validated.beneficiary_name,
            bank_name: validated.bank_name,
            account_number: validated.account_number,
            swift_code: validated.swift_code || null,
            branch_code: validated.branch_code || null,
            beneficiary_email: validated.beneficiary_email || null,
          })
          .eq('id', beneficiaryToEdit.id);

        if (error) throw error;
        return result;
      } else {
        // Insert new beneficiary
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
            kyc_verified: true, // Auto-verify for real bank testing
          }]);

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      toast.success(beneficiaryToEdit ? 'Beneficiary updated successfully' : 'Beneficiary added successfully');
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
      onClose?.();
    },
    onError: (error) => {
      toast.error(`Failed to add beneficiary: ${error.message}`);
    }
  });

  const handleAddCustomBank = () => {
    if (newBankName.trim() && !allBanks.includes(newBankName.trim())) {
      const updatedCustomBanks = [...customBanks, newBankName.trim()];
      setCustomBanks(updatedCustomBanks);
      localStorage.setItem('customBanks', JSON.stringify(updatedCustomBanks));
      setFormData(prev => ({ ...prev, bank_name: newBankName.trim() }));
      setNewBankName('');
      setIsAddingNewBank(false);
      toast.success('Bank added successfully');
    } else {
      toast.error('Bank name already exists or is empty');
    }
  };

  const handleRemoveCustomBank = (bankToRemove: string) => {
    const updatedCustomBanks = customBanks.filter(bank => bank !== bankToRemove);
    setCustomBanks(updatedCustomBanks);
    localStorage.setItem('customBanks', JSON.stringify(updatedCustomBanks));
    toast.success('Bank removed successfully');
  };

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
          <DialogTitle>{beneficiaryToEdit ? 'Edit Beneficiary' : 'Add New Beneficiary'}</DialogTitle>
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
              <div className="space-y-2">
                <Select 
                  value={formData.bank_name} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, bank_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBanks.map(bank => (
                      <SelectItem key={bank} value={bank}>
                        <div className="flex items-center justify-between w-full">
                          <span>{bank}</span>
                          {customBanks.includes(bank) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCustomBank(bank);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {isAddingNewBank ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new bank name"
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomBank();
                        }
                        if (e.key === 'Escape') {
                          setIsAddingNewBank(false);
                          setNewBankName('');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={handleAddCustomBank}
                      disabled={!newBankName.trim()}
                    >
                      Add
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setIsAddingNewBank(false);
                        setNewBankName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAddingNewBank(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Bank
                  </Button>
                )}
              </div>
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
              {beneficiaryToEdit ? 'Update Beneficiary' : 'Add Beneficiary'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBeneficiaryDialog;