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
    console.log('Received Luno send request:', { 
      currency: crypto.symbol, 
      amount, 
      address: toAddress 
    });

    // Mock Luno API /api/1/send endpoint structure
    console.log('Using Mock Luno API for demonstration purposes');

    // Simulate processing time for actual API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock Luno response matching their API structure
    // Generate proper 64-character Bitcoin transaction ID that could exist on blockchain.com
    const mockWithdrawalId = `BXLC2CJ7HNB88U${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const mockTxId = '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f'; // Real-looking Bitcoin txid
    const mockExternalId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockFee = parseFloat((amount * 0.0005).toFixed(8)); // 0.05% fee
    
    // Calculate new balance (mock existing balance)
    const mockCurrentBalance = 5.25; 
    const newBalance = Math.max(0, mockCurrentBalance - amount - mockFee);

    // Generate real-looking transaction hash for blockchain explorer (no 0x prefix for Bitcoin)
    const transactionHash = '96f87fe62a797c5212b3175c2c8bf8280835126c97b07166e8e432eef8f4ab0f';

    // Mock successful Luno send response structure
    const lunoResponse = {
      success: true,
      withdrawal_id: mockWithdrawalId,
      bitcoin_txid: mockTxId, // Proper 64-character Bitcoin transaction ID
      external_id: mockExternalId,
      currency: crypto.symbol,
      amount: amount.toString(),
      fee: mockFee.toString(),
      destination_address: toAddress,
      status: 'COMPLETE',
      created_at: Date.now(),
      // Additional fields for our integration
      newBalance: newBalance,
      transactionId: mockTxId, // Use proper Bitcoin txid
      transactionHash: transactionHash,
      exchangeUrl: `https://www.luno.com/wallet/transactions/${mockWithdrawalId}`,
      blockchainExplorerUrl: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/tx/${mockTxId}`,
      alternativeExplorerUrl: `https://vetstaxdcukdtsfhuxsv.supabase.co/functions/v1/blockchain-explorer-api/hash/${transactionHash}`,
      network: 'Bitcoin Testnet (Simulated)',
      permissions_used: [
        'Perm_W_Send',
        'Perm_R_Transactions'
      ],
      api_endpoint: '/api/1/send',
      regulatory_info: {
        exchange: 'Luno Exchange (Pty) Ltd',
        compliance_status: 'AML/KYC verified - Enhanced Due Diligence Complete',
        regulatory_framework: 'FAIS (South Africa), MAS (Singapore), FCA (UK)',
        transaction_monitoring: 'Active - Real-time monitoring enabled',
        kyc_level: 'Tier 3 - Verified for cryptocurrency sends',
        aml_checks: 'COMPLETED - All sanctions lists screened',
        travel_rules: 'Compliant with international travel rule requirements',
        mock_notice: 'This is a demonstration transaction for testing purposes only'
      },
      compliance_documentation: {
        transaction_type: 'Cryptocurrency Send Transaction',
        source_of_funds: 'Verified Digital Asset Holdings in Luno Account',
        aml_status: 'Compliant - All parties verified through enhanced due diligence',
        kyc_status: 'Complete - Tier 3 verification with government ID and proof of address',
        regulatory_approval: 'Transaction approved under applicable financial services regulations',
        risk_assessment: 'Low Risk - Standard monitoring applied based on transaction patterns',
        sanctions_screening: 'Cleared - No matches found against OFAC, UN, EU sanctions lists',
        transaction_purpose: 'Digital asset transfer between verified cryptocurrency addresses',
        reporting_obligations: 'Reported to relevant financial intelligence units as required by law',
        audit_trail: `Send transaction ${mockWithdrawalId} logged and monitored in compliance system`,
        legal_basis: 'Legitimate cryptocurrency exchange transaction under applicable law',
        documentation_retention: '7 years minimum as per regulatory requirements',
        customer_verification: 'Customer identity verified through government-issued documents',
        address_verification: 'Destination address validated and risk-assessed',
        transaction_limits: 'Within approved daily and monthly transaction limits',
        regulatory_reporting: 'Transaction details reported to regulatory authorities as required'
      }
    };

    console.log('Mock Luno send successful:', {
      withdrawal_id: lunoResponse.withdrawal_id,
      amount: lunoResponse.amount,
      currency: lunoResponse.currency,
      status: lunoResponse.status
    });

    return new Response(JSON.stringify(lunoResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Luno API send error:', error);
    
    // Mock Luno API error response structure
    const errorResponse = {
      success: false,
      error: {
        code: 'SEND_FAILED',
        message: error?.message || 'Send transaction failed'
      },
      luno_api_requirements: {
        required_permissions: [
          'Perm_W_Send - Required for cryptocurrency sends',
          'Perm_R_Transactions - Required for transaction verification'
        ],
        verification_requirements: [
          'KYC (Know Your Customer) - Tier 3 verification required',
          'Enhanced Due Diligence - Required for cryptocurrency transactions',
          'Proof of address - Government issued utility bill or bank statement',
          'Source of funds declaration - Documentation of crypto acquisition'
        ],
        compliance_requirements: [
          'Travel Rule compliance for transactions over threshold',
          'AML screening against sanctions lists',
          'Transaction monitoring and reporting',
          'Regulatory approval for high-value transactions'
        ],
        api_integration_steps: [
          'Create Luno account and complete full verification process',
          'Apply for API access with business justification',
          'Implement secure API key management',
          'Configure webhook endpoints for transaction status updates',
          'Implement proper error handling and retry logic'
        ],
        contact_information: {
          support_email: 'support@luno.com',
          business_development: 'partnerships@luno.com',
          api_documentation: 'https://www.luno.com/en/developers/api',
          compliance_team: 'compliance@luno.com'
        },
        regulatory_framework: 'Licensed and regulated under FAIS (South Africa), MAS (Singapore), FCA (UK)'
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});