import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankSettlementRequest {
  paymentReference: string;
  beneficiaryDetails: {
    name: string;
    bankName: string;
    accountNumber: string;
    swiftCode?: string;
  };
  amount: number;
  currency: string;
  transactionDate: string;
  senderDetails: {
    fspNumber: string;
    institutionName: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      paymentReference, 
      beneficiaryDetails, 
      amount, 
      currency, 
      transactionDate,
      senderDetails 
    }: BankSettlementRequest = await req.json();

    console.log('Processing bank settlement for:', paymentReference);

    // 1. Create receiving bank account simulation (if it doesn't exist)
    const bankAccountNumber = `RECV_${beneficiaryDetails.bankName.replace(/\s+/g, '_').toUpperCase()}_${beneficiaryDetails.accountNumber}`;
    
    let { data: receivingAccount, error: accountLookupError } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_number', bankAccountNumber)
      .single();

    if (accountLookupError || !receivingAccount) {
      // Create simulated receiving bank account
      const { data: newAccount, error: createError } = await supabase
        .from('accounts')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // System account
          account_name: `${beneficiaryDetails.bankName} - ${beneficiaryDetails.name}`,
          account_number: bankAccountNumber,
          account_type: 'savings',
          balance: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating receiving account:', createError);
        throw new Error('Failed to create receiving account');
      }
      
      receivingAccount = newAccount;
      console.log('Created new receiving account:', receivingAccount.account_name);
    }

    // 2. Credit the receiving bank account
    const newBalance = parseFloat(receivingAccount.balance) + amount;
    const { error: creditError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', receivingAccount.id);

    if (creditError) {
      console.error('Error crediting receiving account:', creditError);
      throw new Error('Failed to credit receiving account');
    }

    // 3. Log incoming transaction to receiving account
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        account_id: receivingAccount.id,
        name: `Incoming Payment - ${senderDetails.institutionName}`,
        amount: amount,
        category: 'Incoming Transfer',
        icon: '💰',
        recipient_name: beneficiaryDetails.name,
        recipient_bank_name: beneficiaryDetails.bankName,
        recipient_account_number: beneficiaryDetails.accountNumber,
        recipient_swift_code: beneficiaryDetails.swiftCode || 'N/A'
      });

    if (transactionError) {
      console.error('Error logging incoming transaction:', transactionError);
    }

    // 4. Generate settlement confirmation
    const settlementConfirmation = {
      settlement_reference: `SETTLE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      payment_reference: paymentReference,
      receiving_bank: beneficiaryDetails.bankName,
      beneficiary_account: beneficiaryDetails.accountNumber,
      beneficiary_name: beneficiaryDetails.name,
      amount_credited: amount,
      currency: currency,
      settlement_time: new Date().toISOString(),
      sending_fsp: senderDetails.fspNumber,
      clearing_system: 'SARB_RTC',
      status: 'SETTLED',
      confirmation_method: 'ELECTRONIC_CREDIT'
    };

    // 5. Store settlement record for audit
    const { error: settlementError } = await supabase
      .from('cbs_notes')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        amount: amount,
        note_type: 'manual_credit',
        description: `Bank Settlement - ${beneficiaryDetails.name} received ${currency} ${amount} from ${senderDetails.institutionName} (Ref: ${paymentReference})`,
        account_reference: beneficiaryDetails.accountNumber,
        status: 'completed',
        compliance_status: 'approved'
      });

    if (settlementError) {
      console.error('Error storing settlement record:', settlementError);
    }

    console.log('Bank settlement completed successfully:', settlementConfirmation);

    return new Response(JSON.stringify({
      success: true,
      settlementConfirmation,
      receivingAccount: {
        bankName: beneficiaryDetails.bankName,
        accountNumber: beneficiaryDetails.accountNumber,
        accountHolder: beneficiaryDetails.name,
        newBalance: newBalance,
        amountCredited: amount
      },
      message: 'Payment successfully settled and credited to receiving bank'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Bank settlement error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);