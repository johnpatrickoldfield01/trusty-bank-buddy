
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-bank-primary" />
              <span className="text-lg font-bold">TrustyBank</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure, simple banking for everyone. Your financial partner for a better tomorrow.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Accounts</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Cards</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Savings</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Investments</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">About</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Privacy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Terms</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-bank-primary">Licenses</a></li>
              <li><Link to="/compliance" className="text-sm text-muted-foreground hover:text-bank-primary">Compliance</Link></li>
              <li><Link to="/banking-certificate" className="text-sm text-muted-foreground hover:text-bank-primary">Banking Certificate</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} TrustyBank. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
