
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crypto, amount, toAddress } = await req.json();
    console.log('Received Binance request:', { crypto: crypto.symbol, amount, toAddress });

    // Mock Binance API response with COMPLETE status for demonstration
    console.log('Using Mock Binance API for demonstration purposes');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const transactionId = `binance_${Date.now()}`;
    const transactionHash = `0x${Math.random().toString(16).substr(2, 12)}`;
    
    const mockResponse = {
      success: true,
      transactionId: transactionId,
      newBalance: 1000000 - (amount * 1000000), // Mock balance calculation
      transactionHash: transactionHash,
      status: 'COMPLETE', // Changed from 'pending' to 'COMPLETE'
      exchangeUrl: `https://binance.com/transaction/${transactionId}`,
      blockchainExplorerUrl: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${transactionId}`,
      network: 'Binance Smart Chain (Simulated)',
      fee: '0.001',
      regulatory_info: {
        exchange: 'Binance',
        compliance_status: 'KYC verified - Standard verification complete',
        transaction_monitoring: 'Active monitoring enabled',
        kyc_level: 'Basic verification completed'
      }
    };

    console.log('Returning Binance mock response:', mockResponse);

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Binance mock API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Binance integration: ${error?.message || 'Unknown error'}` 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
