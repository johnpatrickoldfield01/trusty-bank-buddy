import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Smartphone, QrCode, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TwoFactorAuthProps {
  userEmail: string;
  onTwoFactorComplete: () => void;
  onBack: () => void;
}

const TwoFactorAuth = ({ userEmail, onTwoFactorComplete, onBack }: TwoFactorAuthProps) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'totp'>('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [totpSetupComplete, setTotpSetupComplete] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    // Check if TOTP is already set up for this user
    const storedSecret = localStorage.getItem(`totp_secret_${userEmail}`);
    const userSetupComplete = localStorage.getItem(`totp_setup_complete_${userEmail}`);
    
    if (storedSecret && userSetupComplete === 'true') {
      setTotpSetupComplete(true);
      setTotpSecret(storedSecret);
      setIsExistingUser(true);
      // For existing users with 2FA, default to TOTP method
      setSelectedMethod('totp');
    }
  }, [userEmail]);

  const generateTOTPSecret = () => {
    // Generate a random 32-character base32 secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setTotpSecret(secret);
    
    // Generate QR code URL for Google Authenticator
    const issuer = 'TrustyBank';
    const accountName = userEmail;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    setQrCodeUrl(qrUrl);
  };

  const setupTOTP = () => {
    if (!totpSecret) {
      generateTOTPSecret();
    }
  };

  const confirmTOTPSetup = () => {
    if (verificationCode.length === 6) {
      // In a real app, you'd verify the TOTP code on the server
      // For demo, we'll accept any 6-digit code
      localStorage.setItem(`totp_secret_${userEmail}`, totpSecret);
      localStorage.setItem(`totp_setup_complete_${userEmail}`, 'true');
      setTotpSetupComplete(true);
      setIsExistingUser(true);
      toast.success('Google Authenticator setup completed!');
      setVerificationCode('');
    } else {
      toast.error('Please enter a 6-digit code from your authenticator app');
    }
  };

  const sendEmailCode = async () => {
    try {
      setIsVerifying(true);
      const { error } = await supabase.functions.invoke('send-2fa-email', {
        body: { email: userEmail }
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('2FA code sent to your email');
    } catch (error) {
      toast.error('Failed to send 2FA code');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }

    setIsVerifying(true);

    try {
      if (selectedMethod === 'email') {
        // Verify email code (in real app, this would be validated on server)
        const storedCode = sessionStorage.getItem('2fa_email_code');
        if (verificationCode === storedCode || verificationCode === '123456') { // Fallback for demo
          toast.success('2FA verification successful');
          onTwoFactorComplete();
        } else {
          toast.error('Invalid verification code');
        }
      } else if (selectedMethod === 'totp') {
        // Verify TOTP code (in real app, this would be validated on server)
        // For demo, accept any 6-digit code
        if (/^\d{6}$/.test(verificationCode)) {
          toast.success('2FA verification successful');
          onTwoFactorComplete();
        } else {
          toast.error('Invalid authenticator code');
        }
      }
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show existing user message */}
          {isExistingUser ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">2FA Verification Required</span>
              </div>
              <p className="text-blue-700 text-sm">
                Enter your authenticator code to complete sign in.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">2FA Setup Required</span>
              </div>
              <p className="text-red-700 text-sm">
                This account requires 2FA but it's not configured. Please contact your administrator to set up 2FA through the secure induction process.
              </p>
            </div>
          )}

          {/* Only show 2FA verification for existing users - no setup during login */}
          {isExistingUser && selectedMethod === 'totp' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                  <CheckCircle className="h-5 w-5" />
                  <span>Please enter your authenticator code to continue</span>
                </div>

                <div>
                  <Label htmlFor="totpCode">Enter Authenticator Code</Label>
                  <Input
                    id="totpCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>

                <Button 
                  onClick={verifyCode} 
                  disabled={isVerifying || verificationCode.length !== 6} 
                  className="w-full"
                >
                  Verify Code
                </Button>
              </div>
            </div>
          )}

          {/* Show message for users without 2FA setup */}
          {!isExistingUser && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                Contact your administrator to complete the secure 2FA setup process.
              </p>
              <Button variant="outline" onClick={onBack} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;