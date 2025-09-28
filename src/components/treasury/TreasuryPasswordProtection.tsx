import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, RotateCcw, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TreasuryPasswordProtectionProps {
  onAuthenticated: () => void;
}

const TreasuryPasswordProtection = ({ onAuthenticated }: TreasuryPasswordProtectionProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code' | 'newpassword'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const TREASURY_PASSWORD = 'Guppie7332! 1234567890';
  const MAX_ATTEMPTS = 3;
  const AUTHORIZED_RESET_EMAIL = 'oldfieldjohnpatrick@gmail.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error('Access blocked due to multiple failed attempts. Contact system administrator.');
      return;
    }

    const currentPassword = sessionStorage.getItem('treasury_temp_password') || TREASURY_PASSWORD;

    if (password === currentPassword) {
      // Store authentication in sessionStorage (not localStorage for security)
      sessionStorage.setItem('treasury_authenticated', 'true');
      sessionStorage.setItem('treasury_auth_time', Date.now().toString());
      sessionStorage.removeItem('treasury_temp_password'); // Clear temp password if used
      
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

  const handlePasswordReset = async () => {
    if (resetStep === 'email') {
      if (resetEmail !== AUTHORIZED_RESET_EMAIL) {
        toast.error('Unauthorized email address for treasury password reset.');
        return;
      }

      try {
        const { error } = await supabase.functions.invoke('send-treasury-reset', {
          body: { email: resetEmail }
        });

        if (error) throw error;

        toast.success('Reset code sent to your email');
        setResetStep('code');
      } catch (error) {
        toast.error('Failed to send reset code');
      }
    } else if (resetStep === 'code') {
      // Verify the reset code (this would normally validate against a database)
      const storedCode = sessionStorage.getItem('treasury_reset_code');
      if (resetCode === storedCode || resetCode === '123456') { // Fallback for demo
        setResetStep('newpassword');
        toast.success('Code verified successfully');
      } else {
        toast.error('Invalid reset code');
      }
    } else if (resetStep === 'newpassword') {
      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      // Store new password temporarily (in real app, this would be encrypted and stored securely)
      sessionStorage.setItem('treasury_temp_password', newPassword);
      
      toast.success('Treasury password updated successfully');
      setShowResetFlow(false);
      setResetStep('email');
      setResetEmail('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setAttempts(0);
      setIsBlocked(false);
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
              {showResetFlow ? 'Password Reset' : 'Authentication Required'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showResetFlow ? (
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
                    Access blocked due to multiple failed attempts. Use password reset or contact system administrator.
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

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowResetFlow(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {resetStep === 'email' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Authorized Email Address</Label>
                      <Input
                        id="resetEmail"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your authorized email"
                        required
                      />
                    </div>
                    <Button onClick={handlePasswordReset} className="w-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reset Code
                    </Button>
                  </>
                )}

                {resetStep === 'code' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="resetCode">Reset Code</Label>
                      <Input
                        id="resetCode"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit reset code"
                        maxLength={6}
                        required
                      />
                    </div>
                    <Button onClick={handlePasswordReset} className="w-full">
                      Verify Code
                    </Button>
                  </>
                )}

                {resetStep === 'newpassword' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    <Button onClick={handlePasswordReset} className="w-full">
                      Update Password
                    </Button>
                  </>
                )}

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setShowResetFlow(false);
                    setResetStep('email');
                    setResetEmail('');
                    setResetCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Back to Login
                </Button>
              </div>
            )}
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