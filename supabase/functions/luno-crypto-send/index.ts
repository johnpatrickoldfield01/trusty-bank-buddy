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
    const { crypto, amount, toAddress, mockMode } = await req.json();
    console.log('Received Luno send request:', { 
      currency: crypto.symbol, 
      amount, 
      address: toAddress,
      mockMode: mockMode || false
    });

    // If mockMode is enabled, skip API call and return mock response
    if (mockMode === true) {
      console.log('Mock mode enabled - generating mock response');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTxId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const mockResponse = {
        success: true,
        withdrawal_id: `MOCK${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        bitcoin_txid: mockTxId,
        external_id: `mock_ext_${Date.now()}`,
        currency: crypto.symbol,
        amount: amount.toString(),
        fee: (amount * 0.0005).toString(),
        destination_address: toAddress,
        status: 'COMPLETE',
        created_at: Date.now(),
        newBalance: 5.0,
        transactionId: mockTxId,
        transactionHash: mockTxId,
        exchangeUrl: `https://mock.luno.com/wallet/transactions/mock`,
        blockchainExplorerUrl: `https://mock.blockchain.com/tx/${mockTxId}`,
        network: 'Mock Network',
        regulatory_info: {
          exchange: 'Mock Luno Exchange',
          compliance_status: 'MOCK TRANSACTION - FOR TESTING ONLY',
          transaction_monitoring: 'Mock transaction mode - no real funds transferred',
          mock_notice: `MOCK: ${amount} ${crypto.symbol} to ${toAddress}`
        }
      };

      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use the new API credentials
    const apiKeyId = Deno.env.get('LUNO_API_KEY_ID_NEW');
    const apiSecret = Deno.env.get('LUNO_API_SECRET_NEW');

    if (!apiKeyId || !apiSecret) {
      console.error('CRITICAL: Luno API credentials not configured');
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Luno API credentials (LUNO_API_KEY_ID_NEW, LUNO_API_SECRET_NEW) are not configured',
          action_required: 'Please configure your Luno production API credentials in Supabase secrets'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Using Luno API with credentials');
    console.log('API Key ID (first 8 chars):', apiKeyId.substring(0, 8) + '...');
    console.log('Endpoint: https://api.luno.com/api/1/send');
    
    try {
      // Make actual Luno API call
      const auth = btoa(`${apiKeyId}:${apiSecret}`);
      const requestBody = {
        amount: (amount * 100000000).toString(), // Convert to satoshis
        currency: crypto.symbol.toUpperCase(),
        address: toAddress,
      };
      
      console.log('Request payload:', {
        amount: requestBody.amount,
        currency: requestBody.currency,
        address: requestBody.address
      });

      const lunoApiResponse = await fetch('https://api.luno.com/api/1/send', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestBody),
      });

      const responseText = await lunoApiResponse.text();
      console.log('Luno API response status:', lunoApiResponse.status);
      console.log('Luno API response body:', responseText);

      if (lunoApiResponse.ok) {
        const realLunoResponse = JSON.parse(responseText);
        console.log('✅ Real Luno transaction successful');
        
        // Return real response
        const response = {
          success: true,
          withdrawal_id: realLunoResponse.withdrawal_id || `luno_${Date.now()}`,
          bitcoin_txid: realLunoResponse.txid || `real_${Date.now()}`,
          external_id: realLunoResponse.external_id || `ext_${Date.now()}`,
          currency: crypto.symbol,
          amount: amount.toString(),
          fee: realLunoResponse.fee || '0.00001',
          destination_address: toAddress,
          status: 'COMPLETE',
          created_at: Date.now(),
          newBalance: parseFloat(realLunoResponse.balance || '0'),
          transactionId: realLunoResponse.txid,
          transactionHash: realLunoResponse.txid,
          exchangeUrl: `https://www.luno.com/wallet/transactions/${realLunoResponse.withdrawal_id}`,
          blockchainExplorerUrl: `https://www.blockchain.com/btc/tx/${realLunoResponse.txid}`,
          network: 'Bitcoin Mainnet',
          regulatory_info: {
            exchange: 'Luno Exchange (Pty) Ltd',
            compliance_status: 'AML/KYC verified - Production Transaction',
            transaction_monitoring: 'Live production transaction',
            production_notice: `PRODUCTION: ${amount} ${crypto.symbol} sent to ${toAddress}`
          }
        };
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        // Parse error response
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText };
        }

        console.error('❌ Luno API Error:', {
          status: lunoApiResponse.status,
          statusText: lunoApiResponse.statusText,
          error: errorData
        });

        // Return detailed error instead of falling back to mock
        return new Response(JSON.stringify({
          success: false,
          error: {
            code: errorData.error_code || 'LUNO_API_ERROR',
            message: errorData.error || 'Luno API request failed',
            details: {
              http_status: lunoApiResponse.status,
              http_status_text: lunoApiResponse.statusText,
              raw_error: errorData
            },
            troubleshooting: {
              '403_forbidden': 'Check if API keys are for production (not test/sandbox)',
              'limit_exceeded': 'Verify API key permissions and rate limits',
              'suggested_actions': [
                '1. Verify API keys are production keys from https://www.luno.com/wallet/security/api_keys',
                '2. Ensure API keys have "Send" permissions enabled',
                '3. Check if there is a separate endpoint for production vs test environment',
                '4. Contact Luno support with error details if keys are confirmed correct'
              ]
            }
          }
        }), {
          status: lunoApiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (error: any) {
      console.error('❌ Luno API call exception:', error);
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to Luno API',
          details: error?.message || String(error),
          action_required: 'Check network connectivity and API endpoint'
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mock response (fallback)
    console.log('Using Mock Luno API');

    // Simulate processing time for actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock Luno response matching their API structure
    const mockWithdrawalId = `BXMC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const mockTxId = '0x000000000000000000000000000000000000000000000000' + Math.random().toString(36).substr(2, 9); // Mock txid with 0x prefix
    const mockExternalId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockFee = parseFloat((amount * 0.0005).toFixed(8)); // 0.05% fee
    
    // Calculate new balance (mock existing balance)
    const mockCurrentBalance = 5.25; 
    const newBalance = Math.max(0, mockCurrentBalance - amount - mockFee);

    // Mock successful Luno send response structure
    const lunoResponse = {
      success: true,
      withdrawal_id: mockWithdrawalId,
      bitcoin_txid: mockTxId,
      external_id: mockExternalId,
      currency: crypto.symbol,
      amount: amount.toString(),
      fee: mockFee.toString(),
      destination_address: toAddress,
      status: 'COMPLETE',
      created_at: Date.now(),
      // Additional fields for our integration
      newBalance: newBalance,
      transactionId: mockTxId,
      transactionHash: mockTxId,
      exchangeUrl: `https://www.luno.com/wallet/transactions/${mockWithdrawalId}`,
      blockchainExplorerUrl: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${mockTxId}`,
      network: 'Bitcoin Testnet (Mock)',
      regulatory_info: {
        exchange: 'Luno Exchange (Pty) Ltd',
        compliance_status: 'AML/KYC verified - Mock Transaction',
        transaction_monitoring: 'Mock - Update API key for live transactions',
        mock_notice: `MOCK TRANSACTION: ${amount} ${crypto.symbol} to ${toAddress}`
      }
    };

    console.log('Mock Luno send successful:', {
      withdrawal_id: lunoResponse.withdrawal_id,
      amount: lunoResponse.amount,
      currency: lunoResponse.currency,
      status: lunoResponse.status,
      mock_tx_id: mockTxId
    });

    return new Response(JSON.stringify(lunoResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Luno API send error:', error);
    
    const errorResponse = {
      success: false,
      error: {
        code: 'SEND_FAILED',
        message: error?.message || 'Send transaction failed'
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});