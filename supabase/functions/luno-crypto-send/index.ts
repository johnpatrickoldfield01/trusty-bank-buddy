import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LunoSendRequest {
  amount: string;
  currency: string;
  address: string;
  description?: string;
}

interface LunoWithdrawal {
  id: string;
  status: string;
  type: string;
  amount: string;
  currency: string;
  created_at: number;
  completed_at?: number;
  fee: string;
  external_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crypto, amount, toAddress } = await req.json();
    console.log('Received Luno request:', { crypto: crypto.symbol, amount, toAddress });

    const keyId = Deno.env.get('LUNO_API_KEY_ID');
    const secret = Deno.env.get('LUNO_API_SECRET');

    if (!keyId || !secret) {
      throw new Error('Luno API credentials not configured');
    }

    // Prepare authentication header
    const credentials = btoa(`${keyId}:${secret}`);
    const authHeader = `Basic ${credentials}`;

    console.log('Using Luno API with Key ID:', keyId);

    // First, get account balance to verify sufficient funds
    const balanceResponse = await fetch('https://api.luno.com/api/1/balance', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!balanceResponse.ok) {
      const balanceError = await balanceResponse.text();
      console.error('Luno balance check failed:', balanceError);
      throw new Error(`Luno balance check failed: ${balanceError}`);
    }

    const balanceData = await balanceResponse.json();
    console.log('Luno balance response:', balanceData);

    // Find the account for the specific cryptocurrency
    const cryptoAccount = balanceData.balance?.find((acc: any) => 
      acc.asset === crypto.symbol.toUpperCase()
    );

    if (!cryptoAccount) {
      throw new Error(`No ${crypto.symbol.toUpperCase()} account found on Luno`);
    }

    const availableBalance = parseFloat(cryptoAccount.balance);
    console.log(`Available ${crypto.symbol} balance:`, availableBalance);

    if (availableBalance < amount) {
      throw new Error(`Insufficient ${crypto.symbol} balance. Available: ${availableBalance}, Required: ${amount}`);
    }

    // Prepare withdrawal request
    const withdrawalRequest: LunoSendRequest = {
      amount: amount.toString(),
      currency: crypto.symbol.toUpperCase(),
      address: toAddress,
      description: `Crypto transfer via app - ${crypto.symbol} to ${toAddress.substring(0, 10)}...`
    };

    console.log('Sending withdrawal request:', withdrawalRequest);

    // Send cryptocurrency withdrawal
    const withdrawalResponse = await fetch('https://api.luno.com/api/1/send', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(withdrawalRequest as any),
    });

    if (!withdrawalResponse.ok) {
      const withdrawalError = await withdrawalResponse.text();
      console.error('Luno withdrawal failed:', withdrawalError);
      
      // Check for specific regulatory/compliance errors
      if (withdrawalError.includes('compliance') || withdrawalError.includes('verification')) {
        throw new Error(`Compliance verification required: ${withdrawalError}. Please complete KYC verification on Luno.`);
      }
      
      if (withdrawalError.includes('limit') || withdrawalError.includes('daily')) {
        throw new Error(`Transaction limit exceeded: ${withdrawalError}. Please check your daily withdrawal limits.`);
      }
      
      throw new Error(`Luno withdrawal failed: ${withdrawalError}`);
    }

    const withdrawalData: LunoWithdrawal = await withdrawalResponse.json();
    console.log('Luno withdrawal success:', withdrawalData);

    // Get updated balance after withdrawal
    const updatedBalanceResponse = await fetch('https://api.luno.com/api/1/balance', {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    let newBalance = availableBalance - amount;
    if (updatedBalanceResponse.ok) {
      const updatedBalanceData = await updatedBalanceResponse.json();
      const updatedCryptoAccount = updatedBalanceData.balance?.find((acc: any) => 
        acc.asset === crypto.symbol.toUpperCase()
      );
      if (updatedCryptoAccount) {
        newBalance = parseFloat(updatedCryptoAccount.balance);
      }
    }

    const response = {
      success: true,
      transactionId: withdrawalData.id,
      newBalance: newBalance,
      transactionHash: withdrawalData.external_id || withdrawalData.id,
      status: withdrawalData.status,
      exchangeUrl: `https://www.luno.com/wallet/transactions/${withdrawalData.id}`,
      network: 'Luno',
      fee: withdrawalData.fee,
      completedAt: withdrawalData.completed_at,
      regulatory_info: {
        exchange: 'Luno',
        compliance_status: 'AML/KYC verified',
        regulatory_framework: 'FAIS (South Africa), MAS (Singapore), FCA (UK)',
        transaction_monitoring: 'Active'
      }
    };

    console.log('Returning Luno response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Luno API error:', error);
    
    // Provide detailed regulatory compliance information for failures
    const errorResponse = {
      success: false,
      error: error.message,
      regulatory_requirements: {
        verification_needed: [
          'KYC (Know Your Customer) verification',
          'Proof of address documentation',
          'Source of funds declaration',
          'Enhanced due diligence for high-value transactions'
        ],
        compliance_steps: [
          'Complete identity verification on Luno platform',
          'Upload required documentation',
          'Verify email and phone number',
          'Complete financial questionnaire if required'
        ],
        contact_support: 'support@luno.com',
        regulatory_framework: 'Operating under FAIS (South Africa), MAS (Singapore), FCA (UK)'
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});