import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BankErrorNotification {
  userEmail: string;
  userPhone?: string;
  errorCode: string;
  errorMessage: string;
  transferAmount: number;
  beneficiaryName: string;
  bankName: string;
  fixProvisions: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userEmail,
      userPhone,
      errorCode,
      errorMessage,
      transferAmount,
      beneficiaryName,
      bankName,
      fixProvisions
    }: BankErrorNotification = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Bank Transfer Error Alert</h1>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0;">
          <h2 style="color: #dc2626; margin: 0 0 8px 0;">Transfer Failed</h2>
          <p><strong>Error Code:</strong> ${errorCode}</p>
          <p><strong>Error Message:</strong> ${errorMessage}</p>
        </div>
        
        <h3>Transfer Details:</h3>
        <ul>
          <li><strong>Amount:</strong> R ${transferAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li><strong>Beneficiary:</strong> ${beneficiaryName}</li>
          <li><strong>Bank:</strong> ${bankName}</li>
        </ul>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 16px 0;">
          <h3 style="color: #0ea5e9; margin: 0 0 8px 0;">Recommended Fix:</h3>
          <p>${fixProvisions}</p>
        </div>
        
        <p style="margin-top: 24px;">This error was reported by the recipient bank's system. Please take the recommended action and retry your transfer.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          This is an automated notification from TrustyBank's error monitoring system.
        </p>
      </div>
    `;

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "TrustyBank Alerts <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Transfer Error Alert - ${errorCode}`,
      html: emailHtml,
    });

    console.log("Bank error notification sent successfully:", emailResponse);

    // Simulate SMS notification (in real implementation, use SMS service like Twilio)
    const smsMessage = `TrustyBank Alert: Transfer of R${transferAmount} to ${beneficiaryName} failed. Error: ${errorCode}. ${fixProvisions}`;
    
    console.log("SMS notification simulated:", {
      to: userPhone,
      message: smsMessage
    });

    return new Response(JSON.stringify({ 
      message: "Bank error notifications sent successfully",
      emailSent: true,
      smsSent: !!userPhone
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending bank error notification:", error);
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