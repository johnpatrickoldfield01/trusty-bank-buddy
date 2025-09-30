import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SalaryNotificationRequest {
  userEmail: string;
  jobTitle: string;
  monthlySalary: string;
  setupComplete: boolean;
  paymentReminder?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, jobTitle, monthlySalary, setupComplete, paymentReminder }: SalaryNotificationRequest = await req.json();

    console.log("Sending salary notification to:", userEmail);

    let subject: string;
    let htmlContent: string;

    if (setupComplete) {
      subject = `Dual Salary System Setup Complete - ${jobTitle}`;
      htmlContent = `
        <h1>Dual Salary System Activated</h1>
        <p>Your dual salary system has been successfully set up for the position: <strong>${jobTitle}</strong></p>
        
        <h2>Payment Details:</h2>
        <ul>
          <li><strong>Monthly Payment per Account:</strong> ${monthlySalary}</li>
          <li><strong>Payment Date:</strong> 1st of each month</li>
          <li><strong>Account 1:</strong> FNB Account (as provided)</li>
          <li><strong>Account 2:</strong> Mock Salary Account (auto-generated)</li>
        </ul>
        
        <h2>What happens next:</h2>
        <ul>
          <li>Monthly salary payments will be automatically processed</li>
          <li>Salary slips will be emailed to you monthly</li>
          <li>You can download salary slips anytime from the jobs portal</li>
          <li>Forward these to your bank or university as needed</li>
        </ul>
        
        <p><strong>Important:</strong> This is an automated system for regulatory compliance and budget approval purposes.</p>
        
        <p>Best regards,<br>
        Employment Portal System</p>
      `;
    } else {
      subject = `Monthly Salary Payment Processed - ${jobTitle}`;
      htmlContent = `
        <h1>Monthly Salary Payment Notification</h1>
        <p>Your monthly salary payment has been processed for: <strong>${jobTitle}</strong></p>
        
        <h2>Payment Details:</h2>
        <ul>
          <li><strong>Amount per Account:</strong> ${monthlySalary}</li>
          <li><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</li>
          <li><strong>Status:</strong> Processed</li>
        </ul>
        
        <p>Please find your salary slips attached or download them from the jobs portal.</p>
        
        <p>You can forward these documents to your bank or university for regulatory compliance.</p>
        
        <p>Best regards,<br>
        Employment Portal System</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "Employment Portal <noreply@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-salary-notification function:", error);
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