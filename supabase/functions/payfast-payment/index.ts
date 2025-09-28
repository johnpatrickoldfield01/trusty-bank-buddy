import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

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

const generateSignature = async (data: Record<string, any>, passphrase: string): Promise<string> => {
  // Remove signature if it exists
  const cleanData = { ...data };
  delete cleanData.signature;
  
  // Sort the data by key and create query string
  const sortedData = Object.keys(cleanData)
    .sort()
    .filter(key => cleanData[key] !== "" && cleanData[key] !== null && cleanData[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(cleanData[key])}`)
    .join('&');
  
  // Add passphrase if provided
  const stringToHash = passphrase ? `${sortedData}&passphrase=${passphrase}` : sortedData;
  
  console.log('PayFast signature string:', stringToHash);
  
  // Use SHA-1 and truncate to 32 characters for PayFast compatibility
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(stringToHash));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // PayFast expects exactly 32 characters
  const signature = hashHex.substring(0, 32);
  console.log('Generated signature:', signature, 'Length:', signature.length);
  
  return signature;
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
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE');
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

      // Prepare PayFast payment data with test-friendly settings
      const paymentData: any = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=return`,
        cancel_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=cancel`,
        notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payfast-payment?action=notify`,
        name_first: 'Test',
        name_last: 'Customer',
        email_address: 'test@payfast.co.za', // Use PayFast test email to avoid merchant conflict
        m_payment_id: reference,
        amount: amount.toFixed(2),
        item_name: description,
        item_description: `Payment to ${beneficiary.beneficiary_name} - ${beneficiary.bank_name}`,
        custom_str1: beneficiaryId,
        custom_str2: 'single-payment',
      };

      // Generate signature
      const signature = await generateSignature(paymentData, passphrase || '');
      paymentData.signature = signature;

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
          email_address: 'test@payfast.co.za', // Use PayFast test email for sandbox
          m_payment_id: reference,
          amount: amountPerBeneficiary.toFixed(2),
          item_name: description,
          item_description: `Bulk payment to ${beneficiary.beneficiary_name} - ${beneficiary.bank_name}`,
          custom_str1: beneficiary.id,
          custom_str2: 'bulk-payment',
        };

        const signature = await generateSignature(paymentData, passphrase || '');
        paymentData.signature = signature;

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
        // Log successful payment
        const { error: logError } = await supabase
          .from('transactions')
          .insert({
            account_id: paymentData.custom_str1, // Using beneficiary ID as account reference
            name: `PayFast Payment - ${paymentData.name_first} ${paymentData.name_last}`,
            amount: -parseFloat(paymentData.amount_gross),
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

        // Send confirmation emails if configured
        if (paymentData.email_address) {
          try {
            await supabase.functions.invoke('send-transaction-email', {
              body: {
                recipientEmail: paymentData.email_address,
                recipientName: `${paymentData.name_first} ${paymentData.name_last}`,
                amount: parseFloat(paymentData.amount_gross),
                currency: 'ZAR',
                reference: paymentData.m_payment_id,
                paymentMethod: 'PayFast',
                transactionDate: new Date().toISOString()
              }
            });
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
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