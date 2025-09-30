import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing monthly salary payments...");

    // Get all active salary setups due for payment
    const { data: salarySetups, error: fetchError } = await supabase
      .from('job_salary_setups')
      .select('*')
      .eq('is_active', true)
      .lte('next_payment_date', new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching salary setups:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${salarySetups?.length || 0} salary setups to process`);

    const processedPayments = [];

    for (const setup of salarySetups || []) {
      try {
        console.log(`Processing salary for job ${setup.job_title} (ID: ${setup.id})`);

        // Get user's main account
        const { data: mainAccount, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', setup.user_id)
          .eq('account_type', 'main')
          .single();

        if (accountError || !mainAccount) {
          console.error("Error fetching main account:", accountError);
          continue;
        }

        // Check if main account has sufficient funds
        const halfSalary = setup.monthly_net / 2;
        if (mainAccount.balance < setup.monthly_net) {
          console.log(`Insufficient funds in main account for user ${setup.user_id}`);
          continue;
        }

        // Deduct salary from main account
        const { error: deductError } = await supabase
          .from('accounts')
          .update({ balance: mainAccount.balance - setup.monthly_net })
          .eq('id', mainAccount.id);

        if (deductError) {
          console.error("Error deducting from main account:", deductError);
          continue;
        }

        // Add half to mock salary account
        const { error: creditError } = await supabase
          .from('accounts')
          .update({ balance: halfSalary })
          .eq('id', setup.mock_account_id);

        if (creditError) {
          console.error("Error crediting mock account:", creditError);
        }

        // Record payment transactions
        const { error: paymentError } = await supabase
          .from('monthly_salary_payments')
          .insert([
            {
              salary_setup_id: setup.id,
              amount_paid: halfSalary,
              account_type: 'fnb',
              payment_status: 'completed'
            },
            {
              salary_setup_id: setup.id,
              amount_paid: halfSalary,
              account_type: 'mock',
              payment_status: 'completed'
            }
          ]);

        if (paymentError) {
          console.error("Error recording payments:", paymentError);
        }

        // Send email notification
        if (setup.auto_email_enabled) {
          const { data: userProfile } = await supabase.auth.admin.getUserById(setup.user_id);
          if (userProfile?.user?.email) {
            await supabase.functions.invoke('send-salary-notification', {
              body: {
                userEmail: userProfile.user.email,
                jobTitle: setup.job_title,
                monthlySalary: `R${halfSalary.toFixed(2)}`,
                setupComplete: false,
                paymentReminder: true
              }
            });
          }
        }

        // Update next payment date
        const nextPaymentDate = new Date(setup.next_payment_date);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        const { error: updateError } = await supabase
          .from('job_salary_setups')
          .update({ next_payment_date: nextPaymentDate.toISOString() })
          .eq('id', setup.id);

        if (updateError) {
          console.error("Error updating next payment date:", updateError);
        }

        processedPayments.push({
          jobTitle: setup.job_title,
          amount: setup.monthly_net,
          status: 'completed'
        });

      } catch (error) {
        console.error(`Error processing salary for setup ${setup.id}:`, error);
      }
    }

    console.log(`Processed ${processedPayments.length} salary payments`);

    return new Response(JSON.stringify({ 
      success: true, 
      processedCount: processedPayments.length,
      payments: processedPayments 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in process-monthly-salaries function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);