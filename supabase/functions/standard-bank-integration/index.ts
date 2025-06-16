
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SelfRegistrationRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  intendedUse: string;
}

interface StandardBankApiRequest {
  endpoint: string;
  method: string;
  data?: any;
  accessToken?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...requestData } = await req.json();

    switch (action) {
      case 'self-register':
        return await handleSelfRegistration(requestData as SelfRegistrationRequest);
      case 'api-call':
        return await handleApiCall(requestData as StandardBankApiRequest);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Standard Bank integration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleSelfRegistration(registrationData: SelfRegistrationRequest) {
  try {
    console.log('Attempting Standard Bank self-registration:', registrationData);

    const response = await fetch('https://api-gateway.standardbank.co.za/sbsa/ext-prod/self-register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        companyName: registrationData.companyName,
        contactPerson: registrationData.contactPerson,
        email: registrationData.email,
        phoneNumber: registrationData.phoneNumber,
        businessType: registrationData.businessType,
        intendedUse: registrationData.intendedUse,
        applicationName: 'Banking App Integration',
        redirectUri: 'https://your-app-domain.com/callback',
      }),
    });

    const responseData = await response.json();
    console.log('Standard Bank registration response:', responseData);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Registration failed', 
          details: responseData,
          status: response.status 
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData,
        message: 'Registration successful. Check your email for further instructions.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Self-registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleApiCall(apiRequest: StandardBankApiRequest) {
  try {
    const { endpoint, method, data, accessToken } = apiRequest;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`https://api-gateway.standardbank.co.za${endpoint}`, {
      method: method.toUpperCase(),
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseData = await response.json();
    console.log(`Standard Bank API ${method} ${endpoint} response:`, responseData);

    return new Response(
      JSON.stringify({ 
        success: response.ok,
        data: responseData,
        status: response.status
      }),
      { status: response.ok ? 200 : response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('API call error:', error);
    return new Response(
      JSON.stringify({ error: 'API call failed', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
