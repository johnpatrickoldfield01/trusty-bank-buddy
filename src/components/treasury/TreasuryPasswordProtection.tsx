import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface TreasuryPasswordProtectionProps {
  onAuthenticated: () => void;
}

const TreasuryPasswordProtection = ({ onAuthenticated }: TreasuryPasswordProtectionProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  const TREASURY_PASSWORD = 'Guppie7332! 1234567890';
  const MAX_ATTEMPTS = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error('Access blocked due to multiple failed attempts. Contact system administrator.');
      return;
    }

    if (password === TREASURY_PASSWORD) {
      // Store authentication in sessionStorage (not localStorage for security)
      sessionStorage.setItem('treasury_authenticated', 'true');
      sessionStorage.setItem('treasury_auth_time', Date.now().toString());
      
      toast.success('Treasury access granted');
      onAuthenticated();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        toast.error(`Maximum login attempts exceeded. Access blocked.`);
      } else {
        toast.error(`Invalid password. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
      
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Treasury Access Control</h1>
          <p className="text-blue-200">Secure Treasury Management System</p>
        </div>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <h3 className="font-semibold text-amber-800 mb-1">Security Notice</h3>
                <p className="text-amber-700">
                  This system contains sensitive treasury operations. All access attempts 
                  are logged and monitored. Unauthorized access is prohibited and may 
                  result in legal action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="border-slate-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Treasury Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter treasury access password"
                    className="pr-10"
                    disabled={isBlocked}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isBlocked}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {attempts > 0 && !isBlocked && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                  Warning: {attempts} failed attempt(s). {MAX_ATTEMPTS - attempts} remaining.
                </div>
              )}

              {isBlocked && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Access blocked due to multiple failed attempts. Contact system administrator.
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isBlocked || !password.trim()}
              >
                <Shield className="h-4 w-4 mr-2" />
                Access Treasury System
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-blue-200 text-xs space-y-1">
          <p>TrustyBank Treasury Management System v2.1</p>
          <p>Encrypted • Monitored • Audited</p>
          <p className="text-blue-300">Session expires after 30 minutes of inactivity</p>
        </div>
      </div>
    </div>
  );
};

export default TreasuryPasswordProtection;