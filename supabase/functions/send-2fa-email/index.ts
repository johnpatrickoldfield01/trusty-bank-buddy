import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TwoFactorEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: TwoFactorEmailRequest = await req.json();
    
    console.log(`2FA code requested for: ${email}`);

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Generated 2FA code: ${verificationCode}`);

    const emailResponse = await resend.emails.send({
      from: "TrustyBank Security <security@resend.dev>",
      to: [email],
      subject: "🔐 Your TrustyBank 2FA Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 10px; text-align: center; color: white; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🏦 TrustyBank</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Secure Banking Platform</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">Your Two-Factor Authentication Code</h2>
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 25px; border-radius: 12px; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);">
              ${verificationCode}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 15px;">This code expires in 5 minutes</p>
          </div>

          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 16px;">🛡️ Security Information</h3>
            <ul style="color: #075985; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>This code is valid for 5 minutes only</li>
              <li>Use this code to complete your login to TrustyBank</li>
              <li>Never share this code with anyone</li>
              <li>TrustyBank will never ask for this code via phone</li>
            </ul>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">⚠️ Important Notice</h3>
            <p style="color: #78350f; margin: 0; line-height: 1.6;">
              If you didn't request this code, please contact our security team immediately at 
              <strong>security@trustybank.com</strong> or call our emergency line.
            </p>
          </div>

          <div style="background: #e5f3ff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">📱 Login Details</h3>
            <p style="color: #1e40af; margin: 5px 0;"><strong>Account:</strong> ${email}</p>
            <p style="color: #1e40af; margin: 5px 0;"><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #1e40af; margin: 5px 0;"><strong>Device:</strong> Web Browser</p>
          </div>

          <div style="text-align: center; margin: 30px 0; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This is an automated security message from TrustyBank<br>
              Customer Support: support@trustybank.com | Security Hotline: +27-800-SECURITY<br>
              © ${new Date().getFullYear()} TrustyBank. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log("2FA email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "2FA code sent successfully",
      // In production, don't return the code in the response
      verificationCode: verificationCode // Only for demo purposes
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-2fa-email function:", error);
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