import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

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
