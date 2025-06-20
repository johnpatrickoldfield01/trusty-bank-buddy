
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
    const apiKey = Deno.env.get('COINBASE_API_KEY');
    const apiSecret = Deno.env.get('COINBASE_API_SECRET');
    const passphrase = Deno.env.get('COINBASE_PASSPHRASE');

    if (!apiKey || !apiSecret || !passphrase) {
      throw new Error('Coinbase API credentials not configured');
    }

    // Create authentication headers for Coinbase API
    const timestamp = Date.now() / 1000;
    const method = 'POST';
    const requestPath = '/accounts';
    const body = '';
    
    // Get Coinbase accounts first to find the crypto wallet
    const accountsResponse = await fetch('https://api.coinbase.com/v2/accounts', {
      method: 'GET',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': await createSignature(timestamp, 'GET', '/v2/accounts', '', apiSecret),
        'CB-ACCESS-TIMESTAMP': timestamp.toString(),
        'CB-ACCESS-PASSPHRASE': passphrase,
        'CB-VERSION': '2021-06-23',
        'Content-Type': 'application/json'
      }
    });

    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch Coinbase accounts: ${accountsResponse.statusText}`);
    }

    const accountsData = await accountsResponse.json();
    
    // Find the specific cryptocurrency account
    const cryptoAccount = accountsData.data.find((account: any) => 
      account.currency.code === crypto.symbol.toUpperCase()
    );

    if (!cryptoAccount) {
      throw new Error(`No ${crypto.symbol} wallet found in Coinbase account`);
    }

    // Check if sufficient balance exists
    const currentBalance = parseFloat(cryptoAccount.balance.amount);
    if (currentBalance < amount) {
      throw new Error(`Insufficient ${crypto.symbol} balance. Available: ${currentBalance}`);
    }

    // Create the send transaction
    const sendTimestamp = Date.now() / 1000;
    const sendPath = `/v2/accounts/${cryptoAccount.id}/transactions`;
    const sendBody = JSON.stringify({
      type: 'send',
      to: toAddress,
      amount: amount.toString(),
      currency: crypto.symbol.toUpperCase(),
      description: `Send ${amount} ${crypto.symbol} via TrustyBank`
    });

    const sendResponse = await fetch(`https://api.coinbase.com${sendPath}`, {
      method: 'POST',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': await createSignature(sendTimestamp, 'POST', sendPath, sendBody, apiSecret),
        'CB-ACCESS-TIMESTAMP': sendTimestamp.toString(),
        'CB-ACCESS-PASSPHRASE': passphrase,
        'CB-VERSION': '2021-06-23',
        'Content-Type': 'application/json'
      },
      body: sendBody
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      console.error('Coinbase send error:', errorData);
      throw new Error(`Failed to send ${crypto.symbol}: ${errorData.errors?.[0]?.message || sendResponse.statusText}`);
    }

    const transactionData = await sendResponse.json();
    
    // Get updated balance
    const updatedAccountResponse = await fetch(`https://api.coinbase.com/v2/accounts/${cryptoAccount.id}`, {
      method: 'GET',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': await createSignature(Date.now() / 1000, 'GET', `/v2/accounts/${cryptoAccount.id}`, '', apiSecret),
        'CB-ACCESS-TIMESTAMP': (Date.now() / 1000).toString(),
        'CB-ACCESS-PASSPHRASE': passphrase,
        'CB-VERSION': '2021-06-23',
        'Content-Type': 'application/json'
      }
    });

    const updatedAccountData = await updatedAccountResponse.json();
    const newBalance = parseFloat(updatedAccountData.data.balance.amount);

    return new Response(JSON.stringify({
      success: true,
      transactionId: transactionData.data.id,
      newBalance,
      transactionHash: transactionData.data.network?.hash || transactionData.data.id,
      status: transactionData.data.status,
      coinbaseTransactionUrl: `https://www.coinbase.com/transactions/${transactionData.data.id}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Coinbase API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSignature(timestamp: number, method: string, requestPath: string, body: string, secret: string): Promise<string> {
  const message = timestamp + method.toUpperCase() + requestPath + body;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
