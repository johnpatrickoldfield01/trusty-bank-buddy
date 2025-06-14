
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransactionDetails {
  recipientName: string;
  bankName: string;
  accountNumber: string;
  branchCode?: string;
  swiftCode?: string;
  amount: number;
  recipientEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
        recipientName, 
        bankName, 
        accountNumber, 
        branchCode, 
        swiftCode, 
        amount, 
        recipientEmail 
    }: TransactionDetails = await req.json();

    const emailHtml = `
      <h1>Transaction Confirmation</h1>
      <p>Hello,</p>
      <p>This is a confirmation that a payment has been processed with the following details.</p>
      <h2>Transaction Details:</h2>
      <ul>
        <li><strong>Amount:</strong> R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
        <li><strong>Recipient Name:</strong> ${recipientName}</li>
        <li><strong>Bank Name:</strong> ${bankName}</li>
        <li><strong>Account Number:</strong> ${accountNumber}</li>
        ${branchCode ? `<li><strong>Branch Code:</strong> ${branchCode}</li>` : ''}
        ${swiftCode ? `<li><strong>SWIFT Code:</strong> ${swiftCode}</li>` : ''}
      </ul>
      <p>Thank you for using our service.</p>
    `;

    const { data, error } = await resend.emails.send({
      from: "Lovable Bank <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: "Transaction Confirmation",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-transaction-email function:", error);
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
