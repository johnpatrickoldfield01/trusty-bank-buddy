import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useTreasuryReservesDownloader = () => {
  const downloadTreasuryReserves = async () => {
    try {
      toast.info("Generating treasury reserves report...");

      // Fetch treasury holdings data
      const { data: holdings, error } = await supabase
        .from('treasury_holdings')
        .select('*')
        .order('currency_code', { ascending: true });

      if (error) throw error;

      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(18);
      doc.text('Treasury Reserves Summary', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 32);
      
      // Add warning banner
      doc.setFontSize(10);
      doc.setTextColor(220, 38, 38);
      doc.text('⚠️ UNREALISED DATA - For demonstration purposes only', 14, 40);
      doc.setTextColor(100);

      if (!holdings || holdings.length === 0) {
        doc.text('No treasury holdings found.', 14, 50);
      } else {
        // Prepare table data
        const tableData = holdings.map(holding => [
          holding.currency_code,
          holding.currency_name,
          `${holding.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${(holding.reserve_ratio * 100).toFixed(1)}%`,
          `${(holding.liquidity_ratio * 100).toFixed(1)}%`,
          `${holding.risk_weight.toFixed(2)}`,
          format(new Date(holding.last_updated), 'yyyy-MM-dd')
        ]);

        // Calculate totals
        const totalAmount = holdings.reduce((sum, h) => sum + Number(h.amount), 0);
        const avgReserveRatio = holdings.reduce((sum, h) => sum + Number(h.reserve_ratio), 0) / holdings.length;
        const avgLiquidityRatio = holdings.reduce((sum, h) => sum + Number(h.liquidity_ratio), 0) / holdings.length;

        autoTable(doc, {
          startY: 48,
          head: [['Currency', 'Name', 'Amount', 'Reserve %', 'Liquidity %', 'Risk Weight', 'Last Updated']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [38, 38, 38] },
          styles: { fontSize: 9 },
        });

        // Add summary section
        const finalY = (doc as any).lastAutoTable.finalY || 48;
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Summary Statistics', 14, finalY + 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Total Holdings: ${holdings.length} currencies`, 14, finalY + 23);
        doc.text(`Average Reserve Ratio: ${(avgReserveRatio * 100).toFixed(1)}%`, 14, finalY + 30);
        doc.text(`Average Liquidity Ratio: ${(avgLiquidityRatio * 100).toFixed(1)}%`, 14, finalY + 37);
      }

      doc.save('treasury-reserves-summary.pdf');
      toast.success("Treasury reserves report downloaded successfully.");
    } catch (error: any) {
      console.error('Error generating treasury reserves report:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    }
  };

  return { downloadTreasuryReserves };
};
