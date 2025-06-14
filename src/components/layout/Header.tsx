import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Menu, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
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
