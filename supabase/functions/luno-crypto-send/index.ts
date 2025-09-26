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
    console.log('Received Luno request:', { crypto: crypto.symbol, amount, toAddress });

    // Mock Luno Integration - Always succeeds for demonstration
    console.log('Using Mock Luno API for demonstration purposes');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock transaction data
    const mockTransactionId = `luno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const mockFee = '0.0005';
    
    // Calculate new balance (mock existing balance)
    const mockCurrentBalance = 5.25; // Mock existing balance
    const newBalance = Math.max(0, mockCurrentBalance - amount - parseFloat(mockFee));

    const response = {
      success: true,
      transactionId: mockTransactionId,
      newBalance: newBalance,
      transactionHash: mockTransactionHash,
      status: 'completed',
      exchangeUrl: `https://www.luno.com/wallet/transactions/${mockTransactionId}`,
      network: 'Luno (Mock)',
      fee: mockFee,
      completedAt: Date.now(),
      regulatory_info: {
        exchange: 'Luno',
        compliance_status: 'AML/KYC verified',
        regulatory_framework: 'FAIS (South Africa), MAS (Singapore), FCA (UK)',
        transaction_monitoring: 'Active',
        mock_notice: 'This is a demonstration transaction for testing purposes only'
      },
      compliance_documentation: {
        transaction_type: 'Cryptocurrency Transfer',
        source_of_funds: 'Verified Digital Asset Holdings',
        aml_status: 'Compliant - All parties verified',
        kyc_status: 'Complete - Enhanced Due Diligence Performed',
        regulatory_approval: 'Transaction approved under applicable regulations',
        risk_assessment: 'Low Risk - Standard monitoring applied',
        sanctions_screening: 'Cleared - No matches found',
        transaction_purpose: 'Digital asset transfer between verified accounts',
        reporting_obligations: 'Reported to relevant financial intelligence units',
        audit_trail: `Transaction ${mockTransactionId} logged and monitored`,
        legal_basis: 'Legitimate cryptocurrency exchange under applicable law',
        documentation_retention: '7 years as per regulatory requirements'
      }
    };

    console.log('Returning mock Luno response:', response.transactionId);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Luno API error:', error);
    
    // Provide detailed regulatory compliance information for failures
    const errorResponse = {
      success: false,
      error: error?.message || 'Unknown error',
      regulatory_requirements: {
        verification_needed: [
          'KYC (Know Your Customer) verification',
          'Proof of address documentation',
          'Source of funds declaration',
          'Enhanced due diligence for high-value transactions'
        ],
        compliance_steps: [
          'Complete identity verification on Luno platform',
          'Upload required documentation',
          'Verify email and phone number',
          'Complete financial questionnaire if required'
        ],
        contact_support: 'support@luno.com',
        regulatory_framework: 'Operating under FAIS (South Africa), MAS (Singapore), FCA (UK)'
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});