
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SessionProvider } from "./hooks/useSession";
import AuthPage from "./pages/AuthPage";
import AppLayout from "./components/layout/AppLayout";
import CardsPage from "./pages/CardsPage";
import CardDetailsPage from "./pages/CardDetailsPage";
import ForeignExchangePage from "./pages/ForeignExchangePage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import TransactionDetailsPage from "./pages/TransactionDetailsPage";
import LoansPage from "./pages/LoansPage";
import PaymentsPage from "./pages/PaymentsPage";
import LoanDetailsPage from "./pages/LoanDetailsPage";
import StandardBankPage from "./pages/StandardBankPage";
import CryptoPage from "./pages/CryptoPage";
import CryptoDetailsPage from "./pages/CryptoDetailsPage";
import TaxationPage from "./pages/TaxationPage";
import CompliancePage from "./pages/CompliancePage";
import CBSDashboard from "./pages/CBSDashboard";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import JobPortalDashboard from "./pages/JobPortalDashboard";
import StockExchangeDashboard from "./pages/StockExchangeDashboard";
import BankingCertificatePage from "./pages/BankingCertificatePage";
import BulkPaymentsPage from "./pages/BulkPaymentsPage";
import SecurityProtocolsPage from "./pages/SecurityProtocolsPage";
import { useCapacitor } from "./hooks/useCapacitor";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isNative, networkStatus } = useCapacitor();

  useEffect(() => {
    // Remove loading screen once React app is ready
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }, []);

  return (
    <div className={`min-h-screen ${isNative ? 'pt-safe-area-inset-top pb-safe-area-inset-bottom' : ''}`}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/:cardIndex" element={<CardDetailsPage />} />
          <Route path="/foreign-exchange" element={<ForeignExchangePage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/loans/:loanId" element={<LoanDetailsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelledPage />} />
          <Route path="/transaction/:id" element={<TransactionDetailsPage />} />
          <Route path="/standard-bank" element={<StandardBankPage />} />
          <Route path="/crypto" element={<CryptoPage />} />
          <Route path="/crypto/:symbol" element={<CryptoDetailsPage />} />
          <Route path="/taxation" element={<TaxationPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/cbs" element={<CBSDashboard />} />
          <Route path="/treasury" element={<TreasuryDashboard />} />
          <Route path="/jobs" element={<JobPortalDashboard />} />
          <Route path="/stock-exchange" element={<StockExchangeDashboard />} />
          <Route path="/banking-certificate" element={<BankingCertificatePage />} />
          <Route path="/bulk-payments" element={<BulkPaymentsPage />} />
          <Route path="/security-protocols" element={<SecurityProtocolsPage />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Offline indicator for mobile */}
      {isNative && networkStatus && !networkStatus.connected && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white text-center py-2 z-50">
          You're offline. Some features may not work.
        </div>
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
