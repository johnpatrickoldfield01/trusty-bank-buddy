import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import jsPDF from "npm:jspdf@2.5.2";
import autoTable from "npm:jspdf-autotable@3.8.4";

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
      // Fetch actual salary data
      const { data: salarySetup } = await supabase
        .from('job_salary_setups')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      const doc = new jsPDF();
      
      // Header with MOCK warning
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 10, 190, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ MOCK DOCUMENT - FOR DEMONSTRATION ONLY', 105, 22, { align: 'center' });
      
      // Title
      doc.setTextColor(0);
      doc.setFontSize(18);
      doc.text('Monthly Salary Slip', 105, 45, { align: 'center' });
      
      // Employee Details
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 14, 60);
      doc.text(`Employee: ${userName}`, 14, 68);
      doc.text(`Job Title: ${salarySetup?.job_title || 'Senior Software Engineer'} (MOCK)`, 14, 76);
      doc.text(`Employee ID: ${salarySetup?.job_id || 'EMP-12345'} (MOCK)`, 14, 84);
      
      // Salary Details Table
      autoTable(doc, {
        startY: 95,
        head: [['Description', 'Amount']],
        body: [
          ['Basic Salary (MOCK)', `R ${(salarySetup?.monthly_gross || 50000).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`],
          ['Tax Deductions (MOCK)', `R ${((salarySetup?.monthly_gross || 50000) - (salarySetup?.monthly_net || 42000)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`],
        ],
        foot: [['Net Pay (MOCK)', `R ${(salarySetup?.monthly_net || 42000).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`]],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
        footStyles: { fillColor: [66, 139, 202], fontStyle: 'bold' },
      });
      
      // Banking Details
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Details (MOCK)', 14, finalY + 15);
      doc.setFont('helvetica', 'normal');
      doc.text(`Bank: FNB (MOCK)`, 14, finalY + 23);
      doc.text(`Account Holder: ${salarySetup?.fnb_account_holder || userName} (MOCK)`, 14, finalY + 31);
      doc.text(`Account Number: ${salarySetup?.fnb_account_number || '****1234'} (MOCK)`, 14, finalY + 39);
      doc.text(`Branch Code: ${salarySetup?.fnb_branch_code || '250655'} (MOCK)`, 14, finalY + 47);
      
      // Footer warning
      doc.setFillColor(255, 243, 205);
      doc.rect(10, finalY + 60, 190, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(133, 100, 4);
      doc.text('This is a MOCK salary slip for demonstration purposes only.', 105, finalY + 69, { align: 'center' });
      
      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[MOCK] Monthly Salary Slip - ${currentDate}`,
          html: `<p>Please find your monthly salary slip attached.</p><p><strong>Note:</strong> This is a MOCK document for demonstration purposes only.</p>`,
          attachments: [{
            filename: `salary-slip-${currentDate}.pdf`,
            content: pdfBase64,
          }],
        })
      );
    }

    // 2. Bank & Foreign Exchange Summary
    if (reports.bankSummary) {
      // Fetch actual account data
      const { data: accounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId);

      const doc = new jsPDF();
      
      // Header with UNREALISED warning
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 10, 190, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ UNREALISED TRANSACTIONS - DEMONSTRATION ONLY', 105, 22, { align: 'center' });
      
      // Title
      doc.setTextColor(0);
      doc.setFontSize(18);
      doc.text('Mainbank & Foreign Exchange Summary', 105, 45, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 14, 60);
      doc.text(`Account Holder: ${userName}`, 14, 68);
      
      // Bank Accounts Table
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Banking Accounts (UNREALISED)', 14, 85);
      
      const bankAccounts = accounts?.filter(a => a.account_type === 'checking' || a.account_type === 'savings') || [];
      const bankData = bankAccounts.map(acc => [
        `${acc.account_name} (UNREALISED)`,
        `R ${acc.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
      ]);
      
      autoTable(doc, {
        startY: 90,
        head: [['Account', 'Balance']],
        body: bankData.length > 0 ? bankData : [['No banking accounts (UNREALISED)', 'R 0.00']],
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
      
      // FX Accounts Table
      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Foreign Exchange Holdings (UNREALISED)', 14, currentY);
      
      const fxAccounts = accounts?.filter(a => a.account_type === 'foreign_exchange') || [];
      const fxData = fxAccounts.map(acc => [
        `${acc.account_name} (UNREALISED)`,
        `R ${acc.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
      ]);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Currency Account', 'ZAR Equivalent']],
        body: fxData.length > 0 ? fxData : [['No FX holdings (UNREALISED)', 'R 0.00']],
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69] },
      });
      
      // Footer warning
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFillColor(255, 243, 205);
      doc.rect(10, finalY + 10, 190, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(133, 100, 4);
      doc.text('All transactions shown are UNREALISED and for demonstration purposes only.', 105, finalY + 19, { align: 'center' });
      
      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[UNREALISED] Banking & FX Summary - ${currentDate}`,
          html: `<p>Please find your banking and foreign exchange summary attached.</p><p><strong>Note:</strong> All transactions are UNREALISED and for demonstration purposes only.</p>`,
          attachments: [{
            filename: `banking-fx-summary-${currentDate}.pdf`,
            content: pdfBase64,
          }],
        })
      );
    }

    // 3. Cryptocurrency Reserve Summary
    if (reports.cryptoSummary) {
      // Fetch crypto account data
      const { data: cryptoAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('account_type', 'crypto');

      const doc = new jsPDF();
      
      // Header with MOCK warning
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 10, 190, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ MOCK HOLDINGS - DEMONSTRATION ONLY', 105, 22, { align: 'center' });
      
      // Title
      doc.setTextColor(0);
      doc.setFontSize(18);
      doc.text('Cryptocurrency Reserve Summary', 105, 45, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 14, 60);
      doc.text(`Account Holder: ${userName}`, 14, 68);
      
      // Crypto Holdings Table
      const cryptoData = cryptoAccounts?.map(acc => [
        `${acc.account_name} (MOCK)`,
        `${acc.balance.toFixed(8)} (MOCK)`,
        `$${(acc.balance * 50000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      ]) || [];
      
      const totalValue = cryptoAccounts?.reduce((sum, acc) => sum + (acc.balance * 50000), 0) || 0;
      
      autoTable(doc, {
        startY: 80,
        head: [['Cryptocurrency', 'Holdings (MOCK)', 'USD Value']],
        body: cryptoData.length > 0 ? cryptoData : [['No crypto holdings (MOCK)', '0.00000000', '$0.00']],
        foot: [['Total Reserve (MOCK)', '', `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`]],
        theme: 'striped',
        headStyles: { fillColor: [255, 153, 0] },
        footStyles: { fillColor: [255, 153, 0], fontStyle: 'bold' },
      });
      
      // Footer warning
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFillColor(255, 243, 205);
      doc.rect(10, finalY + 10, 190, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(133, 100, 4);
      doc.text('These are MOCK cryptocurrency holdings for demonstration purposes only.', 105, finalY + 19, { align: 'center' });
      
      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[MOCK] Cryptocurrency Reserve Summary - ${currentDate}`,
          html: `<p>Please find your cryptocurrency reserve summary attached.</p><p><strong>Note:</strong> These are MOCK holdings for demonstration purposes only.</p>`,
          attachments: [{
            filename: `crypto-reserve-summary-${currentDate}.pdf`,
            content: pdfBase64,
          }],
        })
      );
    }

    // 4. Treasury Reserves Summary
    if (reports.treasurySummary) {
      // Fetch treasury holdings data
      const { data: treasuryHoldings } = await supabase
        .from('treasury_holdings')
        .select('*')
        .order('amount', { ascending: false });

      const doc = new jsPDF();
      
      // Header with UNREALISED warning
      doc.setFillColor(248, 249, 250);
      doc.rect(10, 10, 190, 20, 'F');
      doc.setFontSize(14);
      doc.setTextColor(220, 53, 69);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ UNREALISED RESERVES - DEMONSTRATION ONLY', 105, 22, { align: 'center' });
      
      // Title
      doc.setTextColor(0);
      doc.setFontSize(18);
      doc.text('Treasury Reserves Summary', 105, 45, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 14, 60);
      doc.text(`Report Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 14, 68);
      
      // Treasury Holdings Table
      const treasuryData = treasuryHoldings?.map(holding => [
        `${holding.currency_name} (${holding.currency_code}) (UNREALISED)`,
        holding.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        `${(holding.reserve_ratio * 100).toFixed(1)}%`,
        `${(holding.liquidity_ratio * 100).toFixed(1)}%`
      ]) || [];
      
      autoTable(doc, {
        startY: 80,
        head: [['Currency', 'Holdings (UNREALISED)', 'Reserve Ratio', 'Liquidity Ratio']],
        body: treasuryData.length > 0 ? treasuryData : [['No treasury reserves (UNREALISED)', '0.00', '0.0%', '0.0%']],
        theme: 'striped',
        headStyles: { fillColor: [139, 69, 19] },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'center' },
          3: { halign: 'center' }
        }
      });
      
      // Footer warning
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFillColor(255, 243, 205);
      doc.rect(10, finalY + 10, 190, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(133, 100, 4);
      doc.text('These are UNREALISED treasury reserves for demonstration purposes only.', 105, finalY + 19, { align: 'center' });
      
      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `[UNREALISED] Treasury Reserves Summary - ${currentDate}`,
          html: `<p>Please find your treasury reserves summary attached.</p><p><strong>Note:</strong> These are UNREALISED reserves for demonstration purposes only.</p>`,
          attachments: [{
            filename: `treasury-reserves-summary-${currentDate}.pdf`,
            content: pdfBase64,
          }],
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
        .limit(50);

      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Outstanding Bugs Report', 105, 25, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${currentDate}`, 14, 40);
      doc.text(`Total Outstanding: ${bugs?.length || 0} bugs`, 14, 48);
      
      // Bugs Table
      const bugData = bugs?.map(bug => [
        bug.title.substring(0, 40),
        bug.category,
        bug.priority.toUpperCase(),
        bug.status.replace('_', ' ').toUpperCase()
      ]) || [];
      
      autoTable(doc, {
        startY: 55,
        head: [['Title', 'Category', 'Priority', 'Status']],
        body: bugData.length > 0 ? bugData : [['No outstanding bugs', '-', '-', '-']],
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 35, halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const priority = data.cell.text[0];
            if (priority === 'CRITICAL') data.cell.styles.textColor = [220, 53, 69];
            else if (priority === 'HIGH') data.cell.styles.textColor = [253, 126, 20];
            else if (priority === 'MEDIUM') data.cell.styles.textColor = [255, 193, 7];
          }
        }
      });
      
      // Footer note
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFillColor(209, 236, 241);
      doc.rect(10, finalY + 10, 190, 15, 'F');
      doc.setFontSize(9);
      doc.setTextColor(12, 84, 96);
      doc.text('This report shows actual outstanding bugs from the tracking system.', 105, finalY + 19, { align: 'center' });
      
      const pdfBuffer = doc.output('arraybuffer');
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

      emailPromises.push(
        resend.emails.send({
          from: "TrustyBank Reports <noreply@resend.dev>",
          to: [emailAddress],
          subject: `Outstanding Bugs Report - ${currentDate}`,
          html: `<p>Please find your outstanding bugs report attached.</p><p><strong>Total:</strong> ${bugs?.length || 0} outstanding bugs</p>`,
          attachments: [{
            filename: `bugs-report-${currentDate}.pdf`,
            content: pdfBase64,
          }],
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
