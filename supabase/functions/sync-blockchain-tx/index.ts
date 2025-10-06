import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { txHash, network, userId } = await req.json();

    if (!txHash || !network) {
      return new Response(
        JSON.stringify({ error: 'Missing txHash or network parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing transaction: ${txHash} on ${network}`);

    let txData = null;

    // Fetch transaction data based on network
    if (network.toLowerCase() === 'ethereum' || network.toLowerCase() === 'eth') {
      txData = await fetchEthereumTransaction(txHash);
    } else if (network.toLowerCase() === 'bitcoin' || network.toLowerCase() === 'btc') {
      txData = await fetchBitcoinTransaction(txHash);
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported network: ${network}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!txData) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch transaction data' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert transaction into database
    const { data, error } = await supabase
      .from('crypto_transactions')
      .upsert({
        user_id: userId,
        tx_hash: txHash,
        network: network.toLowerCase(),
        status: txData.status,
        confirmations: txData.confirmations || 0,
        from_address: txData.from,
        to_address: txData.to,
        amount: txData.amount,
        fee: txData.fee,
        timestamp: txData.timestamp,
        explorer_url: txData.explorerUrl,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tx_hash'
      })
      .select()
      .single();

    if (error) {
      console.error('Database upsert error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save transaction', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Transaction synced successfully:', data);

    return new Response(
      JSON.stringify({ success: true, transaction: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchEthereumTransaction(txHash: string) {
  const etherscanApiKey = Deno.env.get('ETHERSCAN_API_KEY');
  
  try {
    // Try Blockchain.com first
    const blockchainResponse = await fetch(
      `https://blockchain.info/rawtx/${txHash}?cors=true`
    );
    
    if (blockchainResponse.ok) {
      const data = await blockchainResponse.json();
      return parseBlockchainEthTx(data, txHash);
    }
  } catch (e) {
    console.log('Blockchain.com failed, trying Etherscan...');
  }

  // Fallback to Etherscan
  if (etherscanApiKey) {
    try {
      const etherscanResponse = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${etherscanApiKey}`
      );
      
      const data = await etherscanResponse.json();
      
      if (data.result) {
        return parseEtherscanTx(data.result, txHash);
      }
    } catch (e) {
      console.error('Etherscan API error:', e);
    }
  }

  return null;
}

async function fetchBitcoinTransaction(txHash: string) {
  try {
    const response = await fetch(
      `https://blockchain.info/rawtx/${txHash}?cors=true`
    );
    
    if (!response.ok) {
      throw new Error(`Bitcoin API error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseBlockchainBtcTx(data, txHash);
  } catch (error) {
    console.error('Bitcoin transaction fetch error:', error);
    return null;
  }
}

function parseBlockchainEthTx(data: any, txHash: string) {
  return {
    from: data.from || 'Unknown',
    to: data.to || 'Unknown',
    amount: data.value ? (parseInt(data.value) / 1e18).toString() : '0',
    fee: data.gas ? (parseInt(data.gas) / 1e18).toString() : '0',
    confirmations: data.confirmations || 0,
    status: data.confirmations > 0 ? 'confirmed' : 'pending',
    timestamp: data.time ? new Date(data.time * 1000).toISOString() : new Date().toISOString(),
    explorerUrl: `https://www.blockchain.com/eth/tx/${txHash}`
  };
}

function parseEtherscanTx(data: any, txHash: string) {
  return {
    from: data.from || 'Unknown',
    to: data.to || 'Unknown',
    amount: data.value ? (parseInt(data.value, 16) / 1e18).toString() : '0',
    fee: data.gas ? (parseInt(data.gas, 16) / 1e18).toString() : '0',
    confirmations: data.blockNumber ? 1 : 0,
    status: data.blockNumber ? 'confirmed' : 'pending',
    timestamp: new Date().toISOString(),
    explorerUrl: `https://etherscan.io/tx/${txHash}`
  };
}

function parseBlockchainBtcTx(data: any, txHash: string) {
  const totalInput = data.inputs?.reduce((sum: number, input: any) => 
    sum + (input.prev_out?.value || 0), 0) || 0;
  const totalOutput = data.out?.reduce((sum: number, output: any) => 
    sum + (output.value || 0), 0) || 0;
  const fee = totalInput - totalOutput;

  return {
    from: data.inputs?.[0]?.prev_out?.addr || 'Unknown',
    to: data.out?.[0]?.addr || 'Unknown',
    amount: (totalOutput / 1e8).toString(),
    fee: (fee / 1e8).toString(),
    confirmations: data.block_height ? 1 : 0,
    status: data.block_height ? 'confirmed' : 'pending',
    timestamp: data.time ? new Date(data.time * 1000).toISOString() : new Date().toISOString(),
    explorerUrl: `https://www.blockchain.com/btc/tx/${txHash}`
  };
}


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface BlockchainTxRequest {
  txHash: string;
  network: 'ethereum' | 'bitcoin';
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { txHash, network, userId }: BlockchainTxRequest = await req.json();
    
    console.log(`Fetching ${network} transaction:`, txHash);

    let txData;

    if (network === 'ethereum') {
      // Use Blockchain.com Ethereum API (no key required for basic lookups)
      const ethResponse = await fetch(`https://blockchain.info/eth/tx/${txHash}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!ethResponse.ok) {
        // Fallback to Etherscan if Blockchain.com fails
        const etherscanKey = Deno.env.get('ETHERSCAN_API_KEY');
        if (etherscanKey) {
          const etherscanResponse = await fetch(
            `https://api.etherscan.io/api?module=transaction&action=gettxinfo&txhash=${txHash}&apikey=${etherscanKey}`
          );
          const etherscanData = await etherscanResponse.json();
          
          if (etherscanData.status === '1') {
            txData = {
              hash: txHash,
              network: 'ethereum',
              status: etherscanData.result.isError === '0' ? 'confirmed' : 'failed',
              confirmations: etherscanData.result.confirmations,
              from: etherscanData.result.from,
              to: etherscanData.result.to,
              value: etherscanData.result.value,
              fee: etherscanData.result.gasUsed,
              timestamp: new Date(parseInt(etherscanData.result.timeStamp) * 1000).toISOString(),
              explorer_url: `https://etherscan.io/tx/${txHash}`
            };
          } else {
            throw new Error(`Etherscan error: ${etherscanData.message}`);
          }
        } else {
          throw new Error('Transaction not found and ETHERSCAN_API_KEY not configured');
        }
      } else {
        const ethData = await ethResponse.json();
        txData = {
          hash: txHash,
          network: 'ethereum',
          status: ethData.confirmations > 0 ? 'confirmed' : 'pending',
          confirmations: ethData.confirmations,
          from: ethData.from,
          to: ethData.to,
          value: ethData.value,
          fee: ethData.fee,
          timestamp: new Date(ethData.time * 1000).toISOString(),
          explorer_url: `https://www.blockchain.com/explorer/transactions/eth/${txHash}`
        };
      }
    } else if (network === 'bitcoin') {
      // Use Blockchain.com Bitcoin API (no key required)
      const btcResponse = await fetch(`https://blockchain.info/rawtx/${txHash}`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!btcResponse.ok) {
        throw new Error(`Blockchain.com API error: ${btcResponse.status}`);
      }

      const btcData = await btcResponse.json();
      txData = {
        hash: txHash,
        network: 'bitcoin',
        status: btcData.block_height ? 'confirmed' : 'pending',
        confirmations: btcData.block_height ? 1 : 0,
        from: btcData.inputs[0]?.prev_out?.addr,
        to: btcData.out[0]?.addr,
        value: btcData.out[0]?.value,
        fee: btcData.fee,
        timestamp: new Date(btcData.time * 1000).toISOString(),
        explorer_url: `https://www.blockchain.com/explorer/transactions/btc/${txHash}`
      };
    } else {
      throw new Error('Unsupported network');
    }

    // Store transaction data in Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: insertData, error: insertError } = await supabase
      .from('crypto_transactions')
      .upsert({
        user_id: userId,
        tx_hash: txHash,
        network: network,
        status: txData.status,
        confirmations: txData.confirmations,
        from_address: txData.from,
        to_address: txData.to,
        amount: txData.value,
        fee: txData.fee,
        timestamp: txData.timestamp,
        explorer_url: txData.explorer_url,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tx_hash'
      })
      .select();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store transaction', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction: txData,
        stored: insertData 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync blockchain transaction error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error?.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
