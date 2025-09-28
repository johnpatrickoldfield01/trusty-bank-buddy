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
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    
    // Support different endpoint formats: /tx/{txid} or /hash/{hash}
    const endpoint = pathParts[1]; // 'tx' or 'hash'
    const identifier = pathParts[2]; // transaction ID or hash
    
    console.log(`Blockchain Explorer API: ${endpoint}/${identifier}`);

    // Mock blockchain explorer database - in real scenario this would be a proper database
    const mockTransactions = new Map([
      ['BXLC2CJ7HNB88UIYAMQN', {
        txid: 'BXLC2CJ7HNB88UIYAMQN',
        hash: '0xa3552867d759',
        blockHeight: 867543,
        blockHash: '0x00000000000000000001a2b3c4d5e6f7890abcdef1234567890abcdef1234567',
        confirmations: 6,
        timestamp: 1727508773, // Sept 28, 2025
        fee: 0.0005,
        size: 250,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        inputs: [{
          txid: '0xprev123456789abcdef',
          vout: 0,
          scriptSig: {
            asm: 'mock_signature_data',
            hex: '473044022...'
          },
          sequence: 4294967295,
          value: 1.0005
        }],
        outputs: [{
          value: 1.0000,
          n: 0,
          scriptPubKey: {
            asm: 'OP_DUP OP_HASH160 38vbWK3Z7SoQKVdrutUaGZVWhtn9fohmsP OP_EQUALVERIFY OP_CHECKSIG',
            hex: '76a914...',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: ['38vbWK3Z7SoQKVdrutUaGZVWhtn9fohmsP']
          }
        }],
        hex: 'mock_raw_transaction_hex_data_would_be_here',
        status: 'confirmed',
        network: 'bitcoin-testnet',
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${identifier}`
      }],
      ['0xa3552867d759', {
        txid: 'BXLC2CJ7HNB88UIYAMQN',
        hash: '0xa3552867d759',
        blockHeight: 867543,
        blockHash: '0x00000000000000000001a2b3c4d5e6f7890abcdef1234567890abcdef1234567',
        confirmations: 6,
        timestamp: 1727508773,
        fee: 0.0005,
        size: 250,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        inputs: [{
          txid: '0xprev123456789abcdef',
          vout: 0,
          scriptSig: {
            asm: 'mock_signature_data',
            hex: '473044022...'
          },
          sequence: 4294967295,
          value: 1.0005
        }],
        outputs: [{
          value: 1.0000,
          n: 0,
          scriptPubKey: {
            asm: 'OP_DUP OP_HASH160 38vbWK3Z7SoQKVdrutUaGZVWhtn9fohmsP OP_EQUALVERIFY OP_CHECKSIG',
            hex: '76a914...',
            reqSigs: 1,
            type: 'pubkeyhash',
            addresses: ['38vbWK3Z7SoQKVdrutUaGZVWhtn9fohmsP']
          }
        }],
        hex: 'mock_raw_transaction_hex_data_would_be_here',
        status: 'confirmed',
        network: 'bitcoin-testnet',
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/${identifier}`
      }]
    ]);

    // Look up transaction by either txid or hash
    const transaction = mockTransactions.get(identifier);
    
    if (!transaction) {
      return new Response(JSON.stringify({
        error: 'Transaction not found',
        message: `No transaction found with identifier: ${identifier}`,
        explorer_info: {
          network: 'Bitcoin Testnet (Simulated)',
          api_version: '1.0',
          supported_endpoints: [
            '/tx/{transaction_id}',
            '/hash/{transaction_hash}',
            '/block/{block_height}',
            '/address/{bitcoin_address}'
          ]
        }
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add some additional explorer metadata
    const explorerResponse = {
      ...transaction,
      explorer_metadata: {
        api_endpoint: `${endpoint}/${identifier}`,
        network_name: 'Bitcoin Testnet (Simulated)',
        explorer_name: 'Mock Bitcoin Explorer API',
        api_version: '1.0',
        last_updated: new Date().toISOString(),
        blockchain_info: {
          current_block_height: 867545,
          network_hashrate: '187.5 EH/s',
          difficulty: 83148355189239.77,
          mempool_size: 142,
          next_retarget: 869568
        },
        verification_status: {
          confirmed: true,
          confirmations: 6,
          required_confirmations: 6,
          finality_status: 'final'
        }
      },
      raw_data_available: true,
      alternative_formats: [
        `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${transaction.txid}`,
        `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/${transaction.hash}`
      ]
    };

    console.log(`Transaction found: ${transaction.txid}, Status: ${transaction.status}`);

    return new Response(JSON.stringify(explorerResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Blockchain Explorer API error:', error);
    
    return new Response(JSON.stringify({
      error: 'API Error',
      message: error?.message || 'Failed to process request',
      explorer_info: {
        network: 'Bitcoin Testnet (Simulated)',
        status: 'error',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});