import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useSession';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import AddBeneficiaryDialog from './AddBeneficiaryDialog';

interface Beneficiary {
  id: string;
  beneficiary_name: string;
  bank_name: string;
  account_number: string;
  swift_code?: string;
  branch_code?: string;
  beneficiary_email?: string;
  kyc_verified: boolean;
  created_at: string;
}

const BeneficiaryManager = ({ onSelectBeneficiary }: { onSelectBeneficiary?: (beneficiary: Beneficiary) => void }) => {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const { data: beneficiaries, isLoading } = useQuery({
    queryKey: ['beneficiaries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Beneficiary[];
    },
    enabled: !!user,
  });

  const transferToBeneficiary = useMutation({
    mutationFn: async ({ beneficiaryId, amount }: { beneficiaryId: string; amount: number }) => {
      const beneficiary = beneficiaries?.find(b => b.id === beneficiaryId);
      if (!beneficiary) throw new Error('Beneficiary not found');

      // Simulate transfer with potential error from recipient bank
      const hasError = Math.random() < 0.3; // 30% chance of error for demo
      
      if (hasError) {
        const errorCodes = ['INSUF_FUNDS', 'ACCT_CLOSED', 'INVALID_SWIFT', 'DAILY_LIMIT'];
        const errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
        
        // Insert error record
        const { error: insertError } = await supabase
          .from('bank_transfer_errors')
          .insert({
            user_id: user?.id,
            beneficiary_id: beneficiaryId,
            transfer_amount: amount,
            error_code: errorCode,
            error_message: `Transfer failed due to ${errorCode}`,
            error_source: 'recipient_bank',
            fix_provisions: getFixProvision(errorCode)
          });

        if (insertError) throw insertError;

        // Send notification
        await supabase.functions.invoke('send-bank-error-notification', {
          body: {
            userEmail: user?.email,
            userPhone: '+27123456789',
            errorCode,
            errorMessage: `Transfer failed due to ${errorCode}`,
            transferAmount: amount,
            beneficiaryName: beneficiary.beneficiary_name,
            bankName: beneficiary.bank_name,
            fixProvisions: getFixProvision(errorCode)
          }
        });

        throw new Error(`Transfer failed: ${errorCode}`);
      }

      // Successful transfer simulation
      return { success: true, amount, beneficiary: beneficiary.beneficiary_name };
    },
    onSuccess: (data) => {
      toast.success(`Successfully transferred R${data.amount.toLocaleString()} to ${data.beneficiary}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast.error(`Transfer failed: ${error.message}`);
    }
  });

  const getFixProvision = (errorCode: string): string => {
    const fixes: Record<string, string> = {
      'INSUF_FUNDS': 'Contact recipient to confirm account details and ensure account is active',
      'ACCT_CLOSED': 'Obtain new account details from beneficiary or use alternative payment method',
      'INVALID_SWIFT': 'Verify SWIFT code with beneficiary bank and update beneficiary details',
      'DAILY_LIMIT': 'Transfer amount exceeds daily limit. Split transfer or try again tomorrow'
    };
    return fixes[errorCode] || 'Contact recipient bank for more information';
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading beneficiaries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">KYC-Verified Beneficiaries</h3>
        </div>
        <AddBeneficiaryDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {beneficiaries?.map((beneficiary) => (
          <Card key={beneficiary.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{beneficiary.beneficiary_name}</CardTitle>
                {beneficiary.kyc_verified && (
                  <Badge variant="secondary" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    KYC Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Bank:</span> {beneficiary.bank_name}</div>
                <div><span className="font-medium">Account:</span> {beneficiary.account_number}</div>
                {beneficiary.swift_code && (
                  <div><span className="font-medium">SWIFT:</span> {beneficiary.swift_code}</div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onSelectBeneficiary?.(beneficiary)}
                  className="flex-1"
                >
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Quick Transfer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => transferToBeneficiary.mutate({ beneficiaryId: beneficiary.id, amount: 1000 })}
                  disabled={transferToBeneficiary.isPending}
                >
                  Test R1,000
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!beneficiaries || beneficiaries.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No beneficiaries found. Add your KYC-verified recipients to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BeneficiaryManager;