import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ScheduledReportRequest {
  userId: string;
  emailAddress: string;
  reports: {
    salarySlip: boolean;
    bankSummary: boolean;
    cryptoSummary: boolean;
    treasurySummary: boolean;
    bugReport: boolean;
  };
  isTest?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, emailAddress, reports, isTest }: ScheduledReportRequest = await req.json();
    
    console.log("Sending scheduled reports to:", emailAddress);
    console.log("Reports enabled:", reports);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const userName = profile?.full_name || 'User';
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const emailPromises: Promise<any>[] = [];

    // 1. Salary Slip Report
    if (reports.salarySlip) {
      const salaryHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #dc3545; margin: 0;">⚠️ MOCK DOCUMENT - FOR DEMONSTRATION ONLY</h1>
          </div>
          
          <h2>Monthly Salary Slip</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Employee:</strong> ${userName}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Description</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Basic Salary (MOCK)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 50,000.00</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Allowances (MOCK)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 5,000.00</td>
            </tr>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td style="padding: 12px; border: 1px solid #dee2e6;">Net Pay (MOCK)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 55,000.00</td>
            </tr>
          </table>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>Note:</strong> This is a MOCK salary slip for demonstration purposes only.</p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[MOCK] Monthly Salary Slip - ${currentDate}`,
          html: salaryHtml,
        })
      );
    }

    // 2. Bank & Foreign Exchange Summary
    if (reports.bankSummary) {
      const bankHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #dc3545; margin: 0;">⚠️ UNREALISED TRANSACTIONS - DEMONSTRATION ONLY</h1>
          </div>
          
          <h2>Mainbank & Foreign Exchange Summary</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Account Holder:</strong> ${userName}</p>
          
          <h3 style="margin-top: 30px;">Banking Transactions (UNREALISED)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Transaction</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Amount (ZAR)</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Current Balance (UNREALISED)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 125,000.00</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Pending Deposits (UNREALISED)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 15,000.00</td>
            </tr>
          </table>

          <h3 style="margin-top: 30px;">Foreign Exchange Summary (UNREALISED)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Currency Pair</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Rate</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">USD/ZAR (UNREALISED)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">18.50</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">$5,000.00</td>
            </tr>
          </table>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>Note:</strong> All transactions shown are UNREALISED and for demonstration purposes only.</p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[UNREALISED] Banking & FX Summary - ${currentDate}`,
          html: bankHtml,
        })
      );
    }

    // 3. Cryptocurrency Reserve Summary
    if (reports.cryptoSummary) {
      const cryptoHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #dc3545; margin: 0;">⚠️ MOCK HOLDINGS - DEMONSTRATION ONLY</h1>
          </div>
          
          <h2>Cryptocurrency Reserve Summary</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Account Holder:</strong> ${userName}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Cryptocurrency</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Holdings (MOCK)</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Value (USD)</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Bitcoin (BTC)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">0.5 BTC</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">$25,000.00</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Ethereum (ETH)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">5.0 ETH</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">$10,000.00</td>
            </tr>
            <tr style="background-color: #f8f9fa; font-weight: bold;">
              <td style="padding: 12px; border: 1px solid #dee2e6;">Total Reserve (MOCK)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">-</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">$35,000.00</td>
            </tr>
          </table>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>Note:</strong> These are MOCK cryptocurrency holdings for demonstration purposes only.</p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[MOCK] Cryptocurrency Reserve Summary - ${currentDate}`,
          html: cryptoHtml,
        })
      );
    }

    // 4. Treasury Reserves Summary
    if (reports.treasurySummary) {
      const treasuryHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #dc3545; margin: 0;">⚠️ UNREALISED RESERVES - DEMONSTRATION ONLY</h1>
          </div>
          
          <h2>Treasury Reserves Summary</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Report Period:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Currency</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Holdings (UNREALISED)</th>
              <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Reserve Ratio</th>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">South African Rand (ZAR)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">R 1,000,000.00</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">15%</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">United States Dollar (USD)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">$50,000.00</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">10%</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">Euro (EUR)</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">€30,000.00</td>
              <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">10%</td>
            </tr>
          </table>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;"><strong>Note:</strong> These are UNREALISED treasury reserves for demonstration purposes only.</p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[UNREALISED] Treasury Reserves Summary - ${currentDate}`,
          html: treasuryHtml,
        })
      );
    }

    // 5. Outstanding Bugs Report
    if (reports.bugReport) {
      // Fetch actual bugs from the database
      const { data: bugs } = await supabase
        .from('bug_reports')
        .select('*')
        .in('status', ['open', 'in_progress'])
        .order('priority', { ascending: false })
        .limit(20);

      const bugRows = bugs && bugs.length > 0 
        ? bugs.map(bug => `
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${bug.title}</td>
              <td style="padding: 12px; border: 1px solid #dee2e6;">${bug.category}</td>
              <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">
                <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
                  bug.priority === 'critical' ? '#dc3545' : 
                  bug.priority === 'high' ? '#fd7e14' : 
                  bug.priority === 'medium' ? '#ffc107' : '#28a745'
                }; color: white; font-size: 12px;">
                  ${bug.priority.toUpperCase()}
                </span>
              </td>
              <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">
                <span style="padding: 4px 8px; border-radius: 4px; background-color: ${
                  bug.status === 'open' ? '#17a2b8' : '#ffc107'
                }; color: white; font-size: 12px;">
                  ${bug.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
            </tr>
          `).join('')
        : '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #6c757d;">No outstanding bugs</td></tr>';

      const bugHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h2>Outstanding Bugs Report</h2>
          <p><strong>Date:</strong> ${currentDate}</p>
          <p><strong>Total Outstanding:</strong> ${bugs?.length || 0} bugs</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Title</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Category</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Priority</th>
              <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Status</th>
            </tr>
            ${bugRows}
          </table>
          
          <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #0c5460;"><strong>Note:</strong> This report shows actual outstanding bugs from the tracking system.</p>
          </div>
        </div>
      `;

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `Outstanding Bugs Report - ${currentDate}`,
          html: bugHtml,
        })
      );
    }

    // Send all emails
    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Email sending complete: ${successCount} succeeded, ${failureCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        failed: failureCount,
        isTest 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-scheduled-reports function:", error);
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
