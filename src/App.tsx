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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SessionProvider>
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
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
