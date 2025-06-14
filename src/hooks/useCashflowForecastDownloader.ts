
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, addMonths } from 'date-fns';
import { type Profile } from '@/components/layout/AppLayout';
import { toast } from 'sonner';

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const useCashflowForecastDownloader = () => {
  const downloadCashflowForecast = (profile: Profile | null, currentBalance: number) => {
    if (!profile) {
      toast.error("User profile not available. Cannot generate forecast.");
      return;
    }

    const doc = new jsPDF() as jsPDFWithAutoTable;
    const forecastMonths = 12;
    const salaryDeposit = 1000000;
    const forecastData = [];
    let runningBalance = currentBalance;
    const currentDate = new Date();

    for (let i = 0; i < forecastMonths; i++) {
      const forecastDate = addMonths(currentDate, i);
      runningBalance += salaryDeposit;
      forecastData.push([
        format(forecastDate, 'MMMM yyyy'),
        'Salary Deposit',
        `R ${salaryDeposit.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `R 0.00`,
        `R ${runningBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ]);
    }

    doc.setFontSize(18);
    doc.text('Cashflow Forecast', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Client: ${profile.full_name}`, 14, 32);
    doc.text(`Date Generated: ${format(new Date(), 'yyyy-MM-dd')}`, 14, 38);
    doc.text(`Starting Balance: R ${currentBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, 44);

    doc.autoTable({
      startY: 50,
      head: [['Month', 'Description', 'Inflow', 'Outflow', 'Closing Balance']],
      body: forecastData,
      theme: 'striped',
      headStyles: { fillColor: [38, 38, 38] },
    });

    doc.save('cashflow-forecast.pdf');
    toast.success("Cashflow forecast downloaded successfully.");
  };

  return { downloadCashflowForecast };
};
