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
    
    // Handle Supabase edge function URL structure: /functions/v1/blockchain-explorer-api/tx/{txid}
    // Find the indices after 'blockchain-explorer-api'
    const apiIndex = pathParts.indexOf('blockchain-explorer-api');
    const endpoint = pathParts[apiIndex + 1]; // 'tx' or 'hash'
    const identifier = pathParts[apiIndex + 2]; // transaction ID or hash
    
    console.log(`Blockchain Explorer API: Full path: ${url.pathname}`);
    console.log(`Parsed - endpoint: ${endpoint}, identifier: ${identifier}`);

    // Mock blockchain explorer database - Bitcoin txids are 64-character hex strings
    const mockTransactions = new Map([
      // Luno transaction data (BXLC2CJ7HNB88UYQSRHA is the Luno withdrawal ID)
      ['BXLC2CJ7HNB88UYQSRHA', {
        txid: '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f',
        hash: '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f',
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
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${identifier}`,
        exchange: 'luno'
      }],
      // Legacy Binance transaction for backward compatibility
      ['BXLC2CJ7HNB88UIYAMQN', {
        txid: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        hash: '0xa3552867d759abcd1234567890abcdef1234567890abcdef1234567890abcd12',
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
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${identifier}`,
        exchange: 'binance'
      }],
      ['96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f', {
        txid: '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f',
        hash: '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f',
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
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/${identifier}`,
        exchange: 'luno'
      }]
    ]);

    // Look up transaction by either txid or hash
    let transaction = mockTransactions.get(identifier);
    
    // Handle dynamically generated mock transactions (those starting with 0x000000000000000000000000000000000000000000000000)
    if (!transaction && identifier?.startsWith('0x000000000000000000000000000000000000000000000000')) {
      console.log(`Generating mock transaction data for: ${identifier}`);
      
      // Extract the random suffix after the mock prefix
      const randomSuffix = identifier.split('.')[1] || 'mock';
      
      // Generate mock transaction data for this ID
      transaction = {
        txid: identifier,
        hash: identifier,
        blockHeight: 867543 + Math.floor(Math.random() * 100), // Random recent block
        blockHash: `0x00000000000000000001${randomSuffix}abcdef1234567890abcdef1234567`,
        confirmations: 6,
        timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600), // Random time in last hour
        fee: 0.0005,
        size: 250,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        inputs: [{
          txid: `0xprev${randomSuffix}`,
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
        hex: `mock_raw_transaction_hex_data_${randomSuffix}`,
        status: 'confirmed',
        network: 'bitcoin-testnet-mock',
        explorer_url: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${identifier}`,
        exchange: 'luno'
      };
    }
    
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
          `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`,
          `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/0xa3552867d759abcd1234567890abcdef1234567890abcdef1234567890abcd12`
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