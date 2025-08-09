
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

    // For now, return a mock success response
    // In a real implementation, you would integrate with Binance API
    toast.info('Binance integration coming soon! This is a demo response.');
    
    const mockResponse = {
      success: true,
      transactionId: `binance_${Date.now()}`,
      newBalance: 1000000 - (amount * 1000000), // Mock balance calculation
      transactionHash: `0x${Math.random().toString(16).substr(2, 8)}`,
      status: 'pending',
      exchangeUrl: `https://binance.com/transaction/${Date.now()}`,
      network: 'Binance',
      fee: '0.001',
    };

    console.log('Returning Binance mock response:', mockResponse);

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Binance mock API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Binance integration: ${error.message}` 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
