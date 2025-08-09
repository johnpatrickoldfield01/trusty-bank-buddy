
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create Coinbase API signature using Web Crypto API (returns base64)
async function createSignature(timestamp: string, method: string, requestPath: string, body: string, secret: string) {
  const message = timestamp + method + requestPath + body;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  // Coinbase expects base64-encoded HMAC digest
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crypto, amount, toAddress } = await req.json();
    console.log('Received request:', { crypto: crypto.symbol, amount, toAddress });
    
    const apiKey = Deno.env.get('COINBASE_API_KEY');
    const apiSecret = Deno.env.get('COINBASE_API_SECRET');
    const passphrase = Deno.env.get('COINBASE_PASSPHRASE');

    if (!apiKey || !apiSecret) {
      console.error('Missing Coinbase API credentials');
      throw new Error('Coinbase API credentials not configured');
    }

    console.log('API credentials found, proceeding with Coinbase API calls');

    const baseUrl = 'https://api.coinbase.com';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // First, get account information for the cryptocurrency
    const accountsPath = '/v2/accounts';
    const accountsSignature = await createSignature(timestamp, 'GET', accountsPath, '', apiSecret);
    
    console.log('Fetching accounts from Coinbase...');
    const accountsResponse = await fetch(`${baseUrl}${accountsPath}`, {
      method: 'GET',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': accountsSignature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-VERSION': '2023-01-05',
        'Content-Type': 'application/json',
      },
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error('Accounts API error:', errorText);
      throw new Error(`Failed to fetch accounts: ${accountsResponse.status} ${errorText}`);
    }

    const accountsData = await accountsResponse.json();
    console.log('Accounts response:', accountsData);

    // Find the account for the specified cryptocurrency
    const cryptoAccount = accountsData.data?.find(
      (account: any) => account.currency?.code === crypto.symbol
    );

    if (!cryptoAccount) {
      console.error(`No ${crypto.symbol} account found`);
      throw new Error(`No ${crypto.symbol} wallet found in your Coinbase account`);
    }

    console.log(`Found ${crypto.symbol} account:`, cryptoAccount);

    // Check if account has sufficient balance
    const availableBalance = parseFloat(cryptoAccount.balance?.amount || '0');
    if (availableBalance < amount) {
      throw new Error(`Insufficient ${crypto.symbol} balance. Available: ${availableBalance}, Required: ${amount}`);
    }

    // Create a send transaction
    const transactionPath = `/v2/accounts/${cryptoAccount.id}/transactions`;
    const transactionBody = JSON.stringify({
      type: 'send',
      to: toAddress,
      amount: amount.toString(),
      currency: crypto.symbol,
    });

    const transactionTimestamp = Math.floor(Date.now() / 1000).toString();
    const transactionSignature = await createSignature(
      transactionTimestamp, 
      'POST', 
      transactionPath, 
      transactionBody, 
      apiSecret
    );

    console.log('Creating transaction:', { to: toAddress, amount, currency: crypto.symbol });
    
    const transactionResponse = await fetch(`${baseUrl}${transactionPath}`, {
      method: 'POST',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': transactionSignature,
        'CB-ACCESS-TIMESTAMP': transactionTimestamp,
        'CB-VERSION': '2023-01-05',
        'Content-Type': 'application/json',
      },
      body: transactionBody,
    });

    if (!transactionResponse.ok) {
      const errorText = await transactionResponse.text();
      console.error('Transaction API error:', errorText);
      throw new Error(`Failed to create transaction: ${transactionResponse.status} ${errorText}`);
    }

    const transactionData = await transactionResponse.json();
    console.log('Transaction created successfully:', transactionData);

    // Get updated account balance
    const updatedAccountTimestamp = Math.floor(Date.now() / 1000).toString();
    const updatedAccountPath = `/v2/accounts/${cryptoAccount.id}`;
    const updatedAccountSignature = await createSignature(
      updatedAccountTimestamp, 
      'GET', 
      updatedAccountPath, 
      '', 
      apiSecret
    );

    const updatedAccountResponse = await fetch(`${baseUrl}${updatedAccountPath}`, {
      method: 'GET',
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': updatedAccountSignature,
        'CB-ACCESS-TIMESTAMP': updatedAccountTimestamp,
        'CB-VERSION': '2023-01-05',
        'Content-Type': 'application/json',
      },
    });

    let newBalance = availableBalance - amount; // Fallback calculation
    if (updatedAccountResponse.ok) {
      const updatedAccountData = await updatedAccountResponse.json();
      newBalance = parseFloat(updatedAccountData.data?.balance?.amount || '0');
      console.log('Updated balance fetched:', newBalance);
    }

    const response = {
      success: true,
      transactionId: transactionData.data?.id || 'unknown',
      newBalance: Math.round(newBalance * 1000000), // Convert to match frontend format
      transactionHash: transactionData.data?.network?.hash || 'pending',
      status: transactionData.data?.status || 'pending',
      coinbaseTransactionUrl: `https://www.coinbase.com/transactions/${transactionData.data?.id}`,
      network: transactionData.data?.network?.name || 'Coinbase',
      fee: transactionData.data?.network?.transaction_fee?.amount || '0',
    };

    console.log('Returning successful response:', response);

    return new Response(JSON.stringify(response), {
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
