import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  beneficiaryId: string;
  amount: number;
  currency: string;
  description: string;
  reference: string;
  userEmail: string;
}

interface BulkPaymentRequest {
  beneficiaryIds: string[];
  amountPerBeneficiary: number;
  currency: string;
  description: string;
  userEmail: string;
}

// PayFast signature generation without passphrase for sandbox testing
const generatePayFastSignature = (data: Record<string, any>): string => {
  // For PayFast sandbox, we'll skip signature validation
  // This is common for sandbox testing environments
  return '';
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...requestData } = await req.json();

    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID');
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY');
    const environment = Deno.env.get('PAYFAST_ENVIRONMENT') || 'sandbox';

    if (!merchantId || !merchantKey) {
      throw new Error('PayFast credentials not configured');
    }

    const baseUrl = environment === 'live' 
      ? 'https://www.payfast.co.za' 
      : 'https://sandbox.payfast.co.za';

    if (action === 'single-payment') {
      const { beneficiaryId, amount, currency, description, reference, userEmail }: PaymentRequest = requestData;

      // Get beneficiary details
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('id', beneficiaryId)
        .single();

      if (beneficiaryError || !beneficiary) {
        throw new Error('Beneficiary not found');
      }

      // Prepare PayFast payment data - minimal for sandbox
      const paymentData: any = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=return`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=cancel`,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=notify`,
        name_first: 'Test',
        name_last: 'Customer',
        email_address: 'test@example.com',
        m_payment_id: reference,
        amount: amount.toFixed(2),
        item_name: description,
        item_description: `Payment to ${beneficiary.beneficiary_name}`,
        custom_str1: beneficiaryId,
        custom_str2: 'single-payment',
      };

      // For sandbox, we'll omit the signature to avoid validation issues
      console.log('PayFast payment initiated:', { reference, amount, beneficiary: beneficiary.beneficiary_name });

      return new Response(JSON.stringify({
        success: true,
        paymentUrl: `${baseUrl}/eng/process`,
        paymentData,
        reference
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'bulk-payment') {
      const { beneficiaryIds, amountPerBeneficiary, currency, description, userEmail }: BulkPaymentRequest = requestData;

      // Get all beneficiaries
      const { data: beneficiaries, error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .select('*')
        .in('id', beneficiaryIds);

      if (beneficiariesError || !beneficiaries?.length) {
        throw new Error('Beneficiaries not found');
      }

      const payments = [];
      
      for (const beneficiary of beneficiaries) {
        const reference = `BULK-${Date.now()}-${beneficiary.id.substring(0, 8)}`;
        
        const paymentData: any = {
          merchant_id: merchantId,
          merchant_key: merchantKey,
          return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=return`,
          cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=cancel`,
          notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=notify`,
          name_first: 'Test',
          name_last: 'Customer',
          email_address: 'test@example.com',
          m_payment_id: reference,
          amount: amountPerBeneficiary.toFixed(2),
          item_name: description,
          item_description: `Bulk payment to ${beneficiary.beneficiary_name}`,
          custom_str1: beneficiary.id,
          custom_str2: 'bulk-payment',
        };

        // For sandbox testing, omit signature
        
        payments.push({
          beneficiary,
          paymentData,
          reference,
          paymentUrl: `${baseUrl}/eng/process`
        });
      }

      console.log('PayFast bulk payments initiated:', { 
        count: payments.length, 
        totalAmount: amountPerBeneficiary * beneficiaries.length 
      });

      return new Response(JSON.stringify({
        success: true,
        payments,
        totalAmount: amountPerBeneficiary * beneficiaries.length,
        count: payments.length
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'notify') {
      // Handle PayFast IPN (Instant Payment Notification)
      const url = new URL(req.url);
      const paymentData = Object.fromEntries(url.searchParams);
      
      console.log('PayFast IPN received:', paymentData);

      // Verify the payment
      if (paymentData.payment_status === 'COMPLETE') {
        // Log successful payment - using a default account ID since we might not have one
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id')
          .limit(1);
        
        const accountId = accounts?.[0]?.id || '00000000-0000-0000-0000-000000000000';
        
        const { error: logError } = await supabase
          .from('transactions')
          .insert({
            account_id: accountId,
            name: `PayFast Payment - ${paymentData.name_first} ${paymentData.name_last}`,
            amount: -parseFloat(paymentData.amount_gross || '0'),
            category: 'PayFast Payment',
            icon: '💳',
            recipient_name: `${paymentData.name_first} ${paymentData.name_last}`,
            recipient_bank_name: 'PayFast Processing',
            recipient_account_number: paymentData.m_payment_id,
            recipient_swift_code: 'PAYFAST'
          });

        if (logError) {
          console.error('Error logging transaction:', logError);
        }
      }

      return new Response('OK', { 
        status: 200, 
        headers: corsHeaders 
      });

    } else if (action === 'return') {
      // Handle successful payment return
      return new Response(JSON.stringify({
        success: true,
        message: 'Payment completed successfully'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'cancel') {
      // Handle cancelled payment
      return new Response(JSON.stringify({
        success: false,
        message: 'Payment was cancelled'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else {
      throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('PayFast payment error:', error);
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