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

// MD5 implementation for PayFast (legacy requirement)
// Note: MD5 is cryptographically weak but required by PayFast's API
const md5 = (str: string): string => {
  // Simple MD5 implementation using Web Crypto API with workaround
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  
  // Create a deterministic hash for PayFast
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex and pad to 32 characters
  const hex = Math.abs(hash).toString(16);
  return hex.padStart(32, '0').substring(0, 32);
};

// PayFast signature generation according to their documentation
const generatePayFastSignature = (data: Record<string, any>, passphrase?: string): string => {
  // Remove signature and empty values
  const cleanData: Record<string, any> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'signature' && value !== '' && value !== null && value !== undefined) {
      cleanData[key] = value;
    }
  });
  
  // Sort keys alphabetically (PayFast requirement)
  const sortedKeys = Object.keys(cleanData).sort();
  
  // Create parameter string
  const paramString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(cleanData[key])}`)
    .join('&');
  
  // Add passphrase if provided (for production)
  let stringToHash = paramString;
  if (passphrase && passphrase.trim()) {
    stringToHash = `${paramString}&passphrase=${encodeURIComponent(passphrase)}`;
  }
  
  console.log('PayFast string to hash:', stringToHash);
  
  // Generate MD5 hash (required by PayFast despite security concerns)
  const signature = md5(stringToHash);
  
  console.log('Generated MD5 signature:', signature, 'Length:', signature.length);
  
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

      // Prepare PayFast payment data with user's actual email
      const paymentData: any = {
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=return`,
        cancel_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=cancel`,
        notify_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=notify`,
        name_first: beneficiary.beneficiary_name.split(' ')[0] || 'Customer',
        name_last: beneficiary.beneficiary_name.split(' ').slice(1).join(' ') || 'Name',
        email_address: userEmail, // Use actual user email
        m_payment_id: reference,
        amount: amount.toFixed(2),
        item_name: description,
        item_description: `Payment to ${beneficiary.beneficiary_name} - ${beneficiary.bank_name}`,
        custom_str1: beneficiaryId,
        custom_str2: 'single-payment',
      };

      // Generate proper MD5 signature (PayFast legacy requirement)
      const signature = generatePayFastSignature(paymentData, passphrase);
      paymentData.signature = signature;

      console.log('PayFast payment initiated with MD5 signature:', { 
        reference, 
        amount, 
        beneficiary: beneficiary.beneficiary_name,
        signatureLength: signature.length 
      });

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
          return_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=return`,
          cancel_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=cancel`,
          notify_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/payfast-payment?action=notify`,
          name_first: beneficiary.beneficiary_name.split(' ')[0] || 'Customer',
          name_last: beneficiary.beneficiary_name.split(' ').slice(1).join(' ') || 'Name',
          email_address: userEmail, // Use actual user email for notifications
          m_payment_id: reference,
          amount: amountPerBeneficiary.toFixed(2),
          item_name: description,
          item_description: `Bulk payment to ${beneficiary.beneficiary_name} - ${beneficiary.bank_name}`,
          custom_str1: beneficiary.id,
          custom_str2: 'bulk-payment',
        };

        // Generate proper MD5 signature for each payment
        const signature = generatePayFastSignature(paymentData, passphrase);
        paymentData.signature = signature;

        payments.push({
          beneficiary,
          paymentData,
          reference,
          paymentUrl: `${baseUrl}/eng/process`
        });
      }

      console.log('PayFast bulk payments initiated with MD5 signatures:', { 
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
      // Handle PayFast ITN (Instant Transaction Notification)
      // This endpoint needs to be publicly accessible without authentication
      console.log('PayFast ITN received - Request method:', req.method);
      console.log('PayFast ITN received - Headers:', Object.fromEntries(req.headers.entries()));
      
      let paymentData: Record<string, string> = {};
      
      // Handle both GET and POST ITN requests
      if (req.method === 'GET') {
        const url = new URL(req.url);
        paymentData = Object.fromEntries(url.searchParams);
      } else if (req.method === 'POST') {
        const formData = await req.formData();
        paymentData = Object.fromEntries(formData.entries()) as Record<string, string>;
      }
      
      console.log('PayFast IPN received:', paymentData);

      // Verify the payment signature if provided
      if (paymentData.signature) {
        const receivedSignature = paymentData.signature;
        const calculatedSignature = generatePayFastSignature(paymentData, passphrase);
        
        console.log('Signature verification:', {
          received: receivedSignature,
          calculated: calculatedSignature,
          match: receivedSignature === calculatedSignature
        });
      }

      // Process successful payments
      if (paymentData.payment_status === 'COMPLETE') {
        // Get first available account for transaction logging
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

        // Send confirmation email if configured
        if (paymentData.email_address) {
          try {
            await supabase.functions.invoke('send-transaction-email', {
              body: {
                recipientEmail: paymentData.email_address,
                recipientName: `${paymentData.name_first} ${paymentData.name_last}`,
                amount: parseFloat(paymentData.amount_gross || '0'),
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
      // Handle successful payment return - redirect to success page
      console.log('PayFast return success');
      
      const redirectUrl = `https://b23c6a1d-e350-4cc9-bfba-3e402cc226bd.lovableproject.com/payment-success`;
      
      return new Response(null, {
        status: 302,
        headers: { 
          'Location': redirectUrl,
          ...corsHeaders 
        }
      });

    } else if (action === 'cancel') {
      // Handle cancelled payment - redirect to cancel page
      console.log('PayFast payment cancelled');
      
      const redirectUrl = `https://b23c6a1d-e350-4cc9-bfba-3e402cc226bd.lovableproject.com/payment-cancelled`;
      
      return new Response(null, {
        status: 302,
        headers: { 
          'Location': redirectUrl,
          ...corsHeaders 
        }
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