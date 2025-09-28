
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Menu, Bell, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const southAfricanBanks = [
    { name: 'Standard Bank', url: 'https://www.standardbank.co.za' },
    { name: 'ABSA', url: 'https://www.absa.co.za' },
    { name: 'First National Bank (FNB)', url: 'https://www.fnb.co.za' },
    { name: 'Nedbank', url: 'https://www.nedbank.co.za' },
    { name: 'Capitec Bank', url: 'https://www.capitecbank.co.za' },
    { name: 'Discovery Bank', url: 'https://www.discovery.co.za/bank' },
    { name: 'African Bank', url: 'https://www.africanbank.co.za' },
    { name: 'Investec', url: 'https://www.investec.com/en_za' },
    { name: 'Bidvest Bank', url: 'https://www.bidvestbank.co.za' },
    { name: 'TymeBank', url: 'https://www.tymebank.co.za' },
  ];

  const internationalBanks = {
    'United States': [
      { name: 'JPMorgan Chase', url: 'https://www.jpmorganchase.com' },
      { name: 'Bank of America', url: 'https://www.bankofamerica.com' },
      { name: 'Wells Fargo', url: 'https://www.wellsfargo.com' },
      { name: 'Citibank', url: 'https://www.citibank.com' },
    ],
    'United Kingdom': [
      { name: 'HSBC', url: 'https://www.hsbc.co.uk' },
      { name: 'Barclays', url: 'https://www.barclays.co.uk' },
      { name: 'Lloyds Bank', url: 'https://www.lloydsbank.com' },
      { name: 'NatWest', url: 'https://www.natwest.com' },
    ],
    'Germany': [
      { name: 'Deutsche Bank', url: 'https://www.deutsche-bank.de' },
      { name: 'Commerzbank', url: 'https://www.commerzbank.de' },
      { name: 'DZ Bank', url: 'https://www.dzbank.de' },
    ],
    'France': [
      { name: 'BNP Paribas', url: 'https://www.bnpparibas.fr' },
      { name: 'Crédit Agricole', url: 'https://www.credit-agricole.fr' },
      { name: 'Société Générale', url: 'https://www.societegenerale.fr' },
    ],
    'Japan': [
      { name: 'Mitsubishi UFJ', url: 'https://www.mufg.jp' },
      { name: 'Sumitomo Mitsui', url: 'https://www.smbc.co.jp' },
      { name: 'Mizuho Bank', url: 'https://www.mizuhobank.com' },
    ],
    'Canada': [
      { name: 'Royal Bank of Canada', url: 'https://www.rbc.com' },
      { name: 'TD Bank', url: 'https://www.td.com' },
      { name: 'Bank of Montreal', url: 'https://www.bmo.com' },
    ],
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-bank-primary" />
          <span className="text-xl font-bold">TrustyBank</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-bank-primary transition-colors">Dashboard</Link>
          <Link to="/loans" className="text-sm font-medium hover:text-bank-primary transition-colors">Loans</Link>
          <Link to="/foreign-exchange" className="text-sm font-medium hover:text-bank-primary transition-colors">Foreign Exchange</Link>
          <Link to="/cards" className="text-sm font-medium hover:text-bank-primary transition-colors">Cards</Link>
          <Link to="/payments" className="text-sm font-medium hover:text-bank-primary transition-colors">Payments</Link>
          <Link to="/bulk-payments" className="text-sm font-medium hover:text-bank-primary transition-colors">Bulk Payments</Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-bank-primary transition-colors">
                Local Banks
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 z-50">
              {southAfricanBanks.map((bank) => (
                <DropdownMenuItem key={bank.name} asChild>
                  <a
                    href={bank.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {bank.name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium hover:text-bank-primary transition-colors">
                International Banks
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 z-50 max-h-96 overflow-y-auto">
              {Object.entries(internationalBanks).map(([country, banks]) => (
                <div key={country}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-600">
                    {country}
                  </div>
                  {banks.map((bank) => (
                    <DropdownMenuItem key={`${country}-${bank.name}`} asChild>
                      <a
                        href={bank.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {bank.name}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/crypto" className="text-sm font-medium hover:text-bank-primary transition-colors">Crypto</Link>
          <Link to="/taxation" className="text-sm font-medium hover:text-bank-primary transition-colors">Taxation</Link>
          <Link to="/cbs" className="text-sm font-medium hover:text-bank-primary transition-colors">CBS</Link>
          <Link to="/treasury" className="text-sm font-medium hover:text-bank-primary transition-colors">Treasury</Link>
          <Link to="/jobs" className="text-sm font-medium hover:text-bank-primary transition-colors">Jobs</Link>
          <Link to="/stock-exchange" className="text-sm font-medium hover:text-bank-primary transition-colors">Stock Exchange</Link>
          <Link to="/digital-documents" className="text-sm font-medium hover:text-bank-primary transition-colors">Digital Documents</Link>
          <a href="#" className="text-sm font-medium hover:text-bank-primary transition-colors">Support</a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-bank-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          {user ? (
            <Button onClick={handleLogout} className="hidden md:flex bg-bank-primary hover:bg-bank-primary/90" size="sm">
              Sign Out
            </Button>
          ) : (
            <Button asChild className="hidden md:flex bg-bank-primary hover:bg-bank-primary/90" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
