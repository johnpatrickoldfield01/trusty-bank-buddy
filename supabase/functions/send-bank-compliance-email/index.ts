import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ComplianceError {
  id: string;
  errorCode: string;
  errorMessage: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'database' | 'compliance' | 'api' | 'regulatory';
  description: string;
  resolution: string;
  baasRequest?: string;
  timeoutCode?: number;
  lastOccurred: string;
  affectedTransfers: number;
}

interface ComplianceEmailRequest {
  bankEmail: string;
  ccEmail: string;
  selectedErrors: ComplianceError[];
  proofDocuments: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  transferDetails: {
    amounts: number[];
    accountNumber: string;
    clid: string;
    supportNumber: string;
    techRef: string;
    currentBalance: number;
    expectedBalance: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bankEmail,
      ccEmail,
      selectedErrors,
      proofDocuments = [],
      transferDetails
    }: ComplianceEmailRequest = await req.json();

    const totalTransfers = transferDetails.amounts.reduce((sum, amount) => sum + amount, 0);
    const totalAffected = selectedErrors.reduce((sum, error) => sum + error.affectedTransfers, 0);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; line-height: 1.6;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; margin: 0; text-align: center;">COMPLIANCE & TECHNICAL REVIEW LETTER</h1>
          <p style="text-align: center; margin: 10px 0 0 0; color: #666;">
            Date: ${new Date().toLocaleDateString()}<br>
            Reference: BULK-TRANSFER-${Date.now()}
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>To:</strong> FNB Bank – Compliance & Technical Operations Team</p>
          <p><strong>Subject:</strong> Compliance & Technical Review – Bulk Transfer Operations</p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">URGENT: Account Balance Update Issue</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Account Number:</strong> ${transferDetails.accountNumber}</li>
            <li><strong>CLID:</strong> ${transferDetails.clid}</li>
            <li><strong>Support Number:</strong> ${transferDetails.supportNumber}</li>
            <li><strong>Tech Reference:</strong> ${transferDetails.techRef}</li>
            <li><strong>Transfer Amounts:</strong> ${transferDetails.amounts.map(amt => `R${amt.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(', ')}</li>
            <li><strong>Total Transferred:</strong> R${totalTransfers.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
            <li><strong>Current Balance:</strong> R${transferDetails.currentBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
            <li><strong>Expected Balance:</strong> R${transferDetails.expectedBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          </ul>
        </div>

        <h3 style="color: #dc3545;">1. LEGAL AND REGULATORY DOCUMENTATION</h3>
        <p>The following identifiers may be required to complete compliance review:</p>
        <ul>
          <li>NCR Number: [Pending Bank Confirmation]</li>
          <li>FSP Number: [Pending Bank Confirmation]</li>
          <li>Banking Licence Number: [Pending Bank Confirmation]</li>
        </ul>
        <p>Kindly confirm if any of these identifiers are mandatory and advise the procedure to register or provide them.</p>

        <h3 style="color: #dc3545;">2. COMPLIANCE REVIEW BLOCKER</h3>
        <p>Bulk transfers are pending full acceptance on your systems. Until compliance checks are confirmed, beneficiary balances cannot be updated.</p>
        <p><strong>Total affected transfers:</strong> ${totalAffected}</p>

        <h3 style="color: #dc3545;">3. TECHNICAL DATABASE ERRORS</h3>
        <p>During processing, the following error codes were raised:</p>
        
        ${selectedErrors.map(error => `
          <div style="background: #f8f9fa; border-left: 3px solid #dc3545; padding: 15px; margin: 15px 0;">
            <h4 style="color: #dc3545; margin: 0 0 10px 0;">${error.errorCode} (${error.timeoutCode || 'N/A'})</h4>
            <p><strong>Error Message:</strong> ${error.errorMessage}</p>
            <p><strong>Resolution:</strong> ${error.resolution}</p>
            ${error.baasRequest ? `<p><strong>BaaS Request:</strong> ${error.baasRequest}</p>` : ''}
            <p><strong>Affected Transfers:</strong> ${error.affectedTransfers}</p>
            <p><strong>Severity:</strong> <span style="color: ${error.severity === 'critical' ? '#dc3545' : error.severity === 'high' ? '#fd7e14' : '#ffc107'}">${error.severity.toUpperCase()}</span></p>
          </div>
        `).join('')}

        <h3 style="color: #dc3545;">4. BAAS ARBITRAGE INFORMATION REQUESTS</h3>
        <p>We request your technical team provide the following for system integration:</p>
        
        <h4 style="color: #17a2b8;">PRIMARY & FOREIGN KEY INFORMATION:</h4>
        <ul>
          <li>Account table primary key specifications</li>
          <li>Foreign key constraints between transaction and account tables</li>
          <li>Database schema for contra table mappings</li>
          <li>Index configurations for performance optimization</li>
        </ul>

        <h4 style="color: #17a2b8;">API CONFIGURATION DETAILS:</h4>
        <ul>
          <li>Authentication endpoints and token refresh procedures</li>
          <li>Rate limiting configurations and retry policies</li>
          <li>Webhook specifications for real-time status updates</li>
          <li>API versioning and compatibility documentation</li>
        </ul>

        <h3 style="color: #dc3545;">5. SERVICE-LEVEL EXPECTATION</h3>
        <p>We request acknowledgement of this letter within 3 business days, and a proposed resolution or interim workaround within 14 days.</p>

        <h3 style="color: #dc3545;">6. ESCALATION PATH</h3>
        <p>If blockers cannot be resolved internally, this matter may be escalated to the South African Reserve Bank (SARB) for regulatory review.</p>

        <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">Attachments:</h4>
          <ul style="margin: 0;">
            ${proofDocuments.length > 0 ? 
              proofDocuments.map(doc => `<li>${doc.name} (uploaded: ${new Date(doc.uploadedAt).toLocaleDateString()})</li>`).join('') :
              '<li>Proof of Payment Documents (separate)</li>'
            }
            <li>System Error Logs (available on request)</li>
          </ul>
          ${proofDocuments.length > 0 ? 
            `<p style="color: #28a745; font-weight: bold; margin-top: 10px;">✓ ${proofDocuments.length} proof of payment document(s) attached</p>` :
            '<p style="color: #ffc107; margin-top: 10px;">⚠️ Proof of payment documents to follow separately</p>'
          }
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p><strong>Signed,</strong></p>
          <p>TrustyBank Technical Team</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This is an automated compliance letter generated by TrustyBank's system.
          </p>
        </div>
      </div>
    `;

    // Send email notification - In testing mode, send only to verified email
    const emailResponse = await resend.emails.send({
      from: "TrustyBank Compliance <onboarding@resend.dev>",
      to: [ccEmail], // Send to user's verified email only in testing mode
      subject: `URGENT: Compliance & Technical Review - Account ${transferDetails.accountNumber} (INTENDED FOR: ${bankEmail})`,
      html: `
        <div style="background: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">📧 EMAIL DELIVERY NOTICE</h3>
          <p style="margin: 0; color: #856404;">
            <strong>INTENDED RECIPIENT:</strong> ${bankEmail}<br>
            <strong>ACTUAL RECIPIENT:</strong> ${ccEmail} (testing mode)<br>
            <strong>ACTION REQUIRED:</strong> Forward this email to ${bankEmail} or verify domain in Resend
          </p>
        </div>
        ${emailHtml}
      `,
    });

    console.log("Bank compliance email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      message: "Compliance email sent successfully (testing mode - sent to your verified email)",
      emailSent: true,
      actualRecipient: ccEmail,
      intendedRecipient: bankEmail,
      note: "Email sent to your verified email due to Resend testing limitations. Forward to bank manually."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending bank compliance email:", error);
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