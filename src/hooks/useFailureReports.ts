import { useSendCrypto } from './useSendCrypto';

export const useFailureReports = () => {
  const { downloadFailureReportPDF } = useSendCrypto();

  const getFailureReports = () => {
    const reports = JSON.parse(localStorage.getItem('failure_reports') || '[]');
    return reports;
  };

  const getFailureForTransaction = (txHash: string) => {
    const reports = getFailureReports();
    return reports.find((r: any) => 
      r.toAddress === txHash || 
      r.reportId.includes(txHash.substring(0, 10))
    );
  };

  const downloadReport = async (reportId: string) => {
    const reports = getFailureReports();
    const report = reports.find((r: any) => r.reportId === reportId);
    
    if (report) {
      await downloadFailureReportPDF(report);
    }
  };

  const clearOldReports = () => {
    localStorage.removeItem('failure_reports');
    localStorage.removeItem('crypto_failures');
  };

  return {
    getFailureReports,
    getFailureForTransaction,
    downloadReport,
    clearOldReports
  };
};
