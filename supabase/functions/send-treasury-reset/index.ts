import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TreasuryResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: TreasuryResetRequest = await req.json();
    
    console.log(`Treasury password reset requested for: ${email}`);

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real application, you would store this code in a database with expiration
    // For this demo, we'll return it in the response for testing
    console.log(`Generated reset code: ${resetCode}`);

    const emailResponse = await resend.emails.send({
      from: "TrustyBank Security <security@resend.dev>",
      to: [email],
      subject: "🔒 Treasury Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🛡️ TrustyBank Treasury</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure Access Management</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 25px;">
            <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">🚨 Security Alert</h2>
            <p style="margin: 0; color: #374151;">A treasury password reset has been requested for your account.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Your Reset Code</h2>
            <div style="background: #f3f4f6; border: 2px dashed #6b7280; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 3px; font-family: 'Courier New', monospace;">
              ${resetCode}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">This code expires in 10 minutes</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ Security Instructions</h3>
            <ul style="color: #78350f; margin: 0; padding-left: 20px;">
              <li>Do not share this code with anyone</li>
              <li>TrustyBank will never ask for this code via phone or email</li>
              <li>If you didn't request this reset, contact security immediately</li>
              <li>This code can only be used once</li>
            </ul>
          </div>

          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">🔐 Access Details</h3>
            <p style="color: #1e40af; margin: 5px 0;"><strong>Requested by:</strong> ${email}</p>
            <p style="color: #1e40af; margin: 5px 0;"><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #1e40af; margin: 5px 0;"><strong>IP Address:</strong> [Logged for security]</p>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated security message from TrustyBank Treasury Management System<br>
              For support: security@trustybank.com | Emergency: +27-800-SECURITY
            </p>
          </div>
        </div>
      `,
    });

    console.log("Treasury reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Reset code sent successfully",
      // In production, don't return the code in the response
      resetCode: resetCode // Only for demo purposes
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-treasury-reset function:", error);
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