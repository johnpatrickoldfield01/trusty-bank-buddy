
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { type Profile } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

interface AccountData {
  name: string;
  balance: number;
}

interface BalanceSheetData {
  assets: AccountData[];
  liabilities: AccountData[];
}

export const useBalanceSheetDownloader = () => {
  const downloadBalanceSheet = (profile: Profile | null, data: BalanceSheetData) => {
    if (!profile) {
      toast.error("User profile not available. Cannot generate balance sheet.");
      return;
    }

    const doc = new jsPDF();
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.balance, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.balance, 0);
    const netWorth = totalAssets + totalLiabilities; // liabilities are negative

    doc.setFontSize(18);
    doc.text('Personal Balance Sheet', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Client: ${profile.full_name}`, 14, 32);
    doc.text(`Date Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 14, 38);

    // Assets Table
    autoTable(doc, {
      startY: 50,
      head: [['Assets', 'Amount']],
      body: data.assets.map(asset => [
        asset.name,
        `R ${asset.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]),
      foot: [[
        { content: 'Total Assets', styles: { fontStyle: 'bold' } },
        { content: `R ${totalAssets.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }
      ]],
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
      footStyles: { fillColor: [22, 163, 74], textColor: '#fff' },
    });

    // Liabilities Table
    const assetsTableEnd = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      startY: assetsTableEnd + 10,
      head: [['Liabilities', 'Amount']],
      body: data.liabilities.map(liability => [
        liability.name,
        `R ${liability.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]),
      foot: [[
        { content: 'Total Liabilities', styles: { fontStyle: 'bold' } },
        { content: `R ${totalLiabilities.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }
      ]],
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38] },
      footStyles: { fillColor: [220, 38, 38], textColor: '#fff' },
    });

    // Net Worth
    const liabilitiesTableEnd = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Worth', 14, liabilitiesTableEnd + 15);
    doc.text(`R ${netWorth.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 205, liabilitiesTableEnd + 15, { align: 'right' });


    doc.save('personal-balance-sheet.pdf');
    toast.success("Personal balance sheet downloaded successfully.");
  };

  return { downloadBalanceSheet };
};
