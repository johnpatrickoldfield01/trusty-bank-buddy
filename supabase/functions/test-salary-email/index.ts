import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    console.log("Sending test salary notification to oldfieldjohnpatrick@gmail.com");

    const testEmailResponse = await resend.emails.send({
      from: "Employment Portal <noreply@resend.dev>",
      to: ["oldfieldjohnpatrick@gmail.com"],
      subject: "TEST - Monthly Salary Payment Processed - Commerce Graduate Position",
      html: `
        <h1>🧪 TEST EMAIL - Monthly Salary Payment Notification</h1>
        <p><strong>This is a test email to verify the salary notification system is working.</strong></p>
        
        <p>Your monthly salary payment has been processed for: <strong>Commerce Graduate Position</strong></p>
        
        <h2>Payment Details:</h2>
        <ul>
          <li><strong>Amount per Account:</strong> R8,333.33 (R100,000 annual ÷ 12 months ÷ 2 accounts)</li>
          <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
          <li><strong>Status:</strong> ✅ Test Processed</li>
          <li><strong>Account 1:</strong> FNB Account (as configured)</li>
          <li><strong>Account 2:</strong> Mock Salary Account (auto-generated)</li>
        </ul>
        
        <h2>📅 Regular Schedule:</h2>
        <p><strong>Monthly salary emails will be automatically sent on the 1st of each month</strong> when you have active salary setups.</p>
        
        <h2>📄 Salary Slips:</h2>
        <p>You can download detailed salary slips from the jobs portal anytime. These documents include:</p>
        <ul>
          <li>Gross salary breakdown</li>
          <li>Tax calculations</li>
          <li>Net payment amounts</li>
          <li>Bank account details</li>
        </ul>
        
        <p>Forward these documents to your bank or university for regulatory compliance and budget approval.</p>
        
        <hr style="margin: 20px 0; border: 1px solid #eee;">
        
        <p style="color: #666; font-size: 14px;">
          <strong>Next automatic payment:</strong> 1st of next month<br>
          <strong>System:</strong> Automated Employment Portal<br>
          <strong>Purpose:</strong> Regulatory compliance and budget approval
        </p>
        
        <p>Best regards,<br>
        Employment Portal System</p>
      `,
    });

    console.log("Test email sent successfully:", testEmailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: testEmailResponse.data?.id,
      message: "Test salary notification sent to oldfieldjohnpatrick@gmail.com",
      scheduledPayments: "Monthly emails are scheduled for the 1st of each month",
      testTime: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in test-salary-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Failed to send test email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);