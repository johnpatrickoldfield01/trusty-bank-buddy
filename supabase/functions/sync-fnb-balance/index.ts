import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accountNumber, userId } = await req.json();
    
    console.log('Fetching FNB balance for account:', accountNumber);

    // Get FNB access token (you'll need to implement OAuth flow)
    const fnbAccessToken = Deno.env.get('FNB_ACCESS_TOKEN');
    
    if (!fnbAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'FNB_ACCESS_TOKEN not configured. Please add it to Edge Function secrets.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch balance from FNB API
    const fnbResponse = await fetch(`https://api-gateway.standardbank.co.za/sbsa/ext-prod/accounts/${accountNumber}/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fnbAccessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!fnbResponse.ok) {
      const errorData = await fnbResponse.text();
      console.error('FNB API Error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch FNB balance', 
          details: errorData,
          status: fnbResponse.status 
        }),
        { status: fnbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const balanceData = await fnbResponse.json();
    console.log('FNB balance data:', balanceData);

    // Update Supabase account balance
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: updateData, error: updateError } = await supabase
      .from('accounts')
      .update({ 
        balance: balanceData.availableBalance || balanceData.currentBalance 
      })
      .eq('account_number', accountNumber)
      .eq('user_id', userId)
      .select();

    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update account balance', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: balanceData,
        updated: updateData 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Sync FNB balance error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error', details: error?.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
