import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  jobTitle?: string;
  jobDescription?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  bankName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: TestEmailRequest = await req.json().catch(() => ({}));
    
    const {
      jobTitle = 'Commerce Graduate Position',
      jobDescription = 'General position for commerce graduates',
      salaryMin = 100000,
      salaryMax = 120000,
      currency = 'ZAR',
      location = 'South Africa',
      bankName = 'FNB'
    } = requestBody;
    
    const monthlySalaryPerAccount = ((salaryMin + salaryMax) / 2) / 12 / 2;
    const formattedSalary = new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: currency === 'ZAR' ? 'ZAR' : 'USD'
    }).format(monthlySalaryPerAccount);
    
    const annualSalary = new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: currency === 'ZAR' ? 'ZAR' : 'USD'
    }).format((salaryMin + salaryMax) / 2);
    
    console.log(`Sending test salary notification for ${jobTitle} to oldfieldjohnpatrick@gmail.com`);

    const testEmailResponse = await resend.emails.send({
      from: "Employment Portal <noreply@resend.dev>",
      to: ["oldfieldjohnpatrick@gmail.com"],
      subject: `TEST - Monthly Salary Payment Processed - ${jobTitle}`,
      html: `
        <h1>🧪 TEST EMAIL - Monthly Salary Payment Notification</h1>
        <p><strong>This is a test email to verify the salary notification system is working.</strong></p>
        
        <h2>Position Details:</h2>
        <ul>
          <li><strong>Job Title:</strong> ${jobTitle}</li>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Annual Salary Range:</strong> ${annualSalary} (average)</li>
        </ul>
        
        <h3>Job Description:</h3>
        <p style="padding: 10px; background: #f5f5f5; border-left: 4px solid #007bff;">${jobDescription}</p>
        
        <h2>💰 Payment Details:</h2>
        <ul>
          <li><strong>Amount per Account:</strong> ${formattedSalary}</li>
          <li><strong>Calculation:</strong> ${annualSalary} annual ÷ 12 months ÷ 2 accounts</li>
          <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
          <li><strong>Status:</strong> ✅ Test Processed</li>
          <li><strong>Account 1:</strong> ${bankName} Account (as configured)</li>
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
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #856404;">⚠️ Important Payment Authorization Notice</h3>
          <p style="color: #856404; margin-bottom: 0;">
            <strong>FOOTNOTE CLAUSE:</strong> If the salary payment is not automatically paid, authorized, and available for withdrawal 
            at the relevant/nominated bank (${bankName}), this document request must be forwarded via email to the relevant 
            Human Resources Department pending legal and regulatory arbitrage for relevant authorization/approval.
          </p>
        </div>
        
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