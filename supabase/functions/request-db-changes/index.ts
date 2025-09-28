import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DatabaseChangeRequest {
  requesterEmail: string;
  requestType: string;
  currentNaming: string;
  proposedNaming: string;
  reason: string;
  dependencyDetails: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      requesterEmail,
      requestType,
      currentNaming,
      proposedNaming,
      reason,
      dependencyDetails
    }: DatabaseChangeRequest = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">Database Change Request</h1>
        
        <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; margin: 16px 0;">
          <h2 style="color: #0ea5e9; margin: 0 0 8px 0;">Change Request Details</h2>
          <p><strong>Request Type:</strong> ${requestType}</p>
          <p><strong>Current Naming/Structure:</strong> ${currentNaming}</p>
          <p><strong>Proposed Changes:</strong> ${proposedNaming}</p>
        </div>
        
        <h3>Justification:</h3>
        <p>${reason}</p>
        
        <h3>Dependency Information:</h3>
        <p>${dependencyDetails}</p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
          <h3 style="color: #f59e0b; margin: 0 0 8px 0;">Action Required</h3>
          <p>Please review this change request and provide feedback on:</p>
          <ul>
            <li>Naming convention compliance</li>
            <li>Impact on existing integrations</li>
            <li>Required migration steps</li>
            <li>Timeline for implementation</li>
          </ul>
        </div>
        
        <p>Reply to this email with your approval or suggested modifications.</p>
        
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          Requested by: ${requesterEmail}<br>
          Timestamp: ${new Date().toISOString()}
        </p>
      </div>
    `;

    // Send to database personnel
    const dbPersonnelEmail = "db-admin@trustybank.com"; // Mock email
    
    const emailResponse = await resend.emails.send({
      from: "TrustyBank System <system@trustybank.com>",
      to: [dbPersonnelEmail],
      cc: [requesterEmail],
      subject: `DB Change Request: ${requestType} - ${currentNaming}`,
      html: emailHtml,
    });

    console.log("Database change request sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      message: "Database change request sent to personnel",
      requestId: crypto.randomUUID(),
      status: "pending_review"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending database change request:", error);
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