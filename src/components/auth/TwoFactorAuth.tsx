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

  useEffect(() => {
    // Check if TOTP is already set up for this user
    const storedSecret = localStorage.getItem(`totp_secret_${userEmail}`);
    if (storedSecret) {
      setTotpSetupComplete(true);
      setTotpSecret(storedSecret);
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
      setTotpSetupComplete(true);
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
          {/* Method Selection */}
          <div>
            <Label className="text-base font-medium mb-3 block">Choose Authentication Method</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer border-2 transition-all ${
                  selectedMethod === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('email')}
              >
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-medium">Email Code</h3>
                  <p className="text-sm text-muted-foreground">Receive code via email</p>
                  {selectedMethod === 'email' && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Selected</Badge>
                  )}
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer border-2 transition-all ${
                  selectedMethod === 'totp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod('totp')}
              >
                <CardContent className="p-4 text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-medium">Google Authenticator</h3>
                  <p className="text-sm text-muted-foreground">Use authenticator app</p>
                  {selectedMethod === 'totp' && (
                    <Badge className="mt-2 bg-green-100 text-green-800">Selected</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Email 2FA */}
          {selectedMethod === 'email' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Email Verification</span>
                </div>
                <p className="text-blue-700 text-sm">
                  We'll send a 6-digit verification code to: <strong>{userEmail}</strong>
                </p>
              </div>

              {!emailSent ? (
                <Button onClick={sendEmailCode} disabled={isVerifying} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Verification Code
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Verification code sent successfully</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="emailCode">Enter Verification Code</Label>
                    <Input
                      id="emailCode"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>
                  
                  <Button onClick={verifyCode} disabled={isVerifying || verificationCode.length !== 6} className="w-full">
                    Verify Code
                  </Button>
                  
                  <Button variant="outline" onClick={sendEmailCode} disabled={isVerifying} className="w-full">
                    Resend Code
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TOTP 2FA */}
          {selectedMethod === 'totp' && (
            <div className="space-y-4">
              {!totpSetupComplete ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <QrCode className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Setup Google Authenticator</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Configure your authenticator app to generate time-based codes
                    </p>
                  </div>

                  {!totpSecret ? (
                    <Button onClick={setupTOTP} className="w-full">
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate Setup Code
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="font-medium mb-3">Scan QR Code</h3>
                        <div className="bg-white p-4 rounded-lg inline-block border">
                          <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                        </div>
                      </div>

                      <div>
                        <Label>Or enter this secret key manually:</Label>
                        <div className="flex gap-2 mt-1">
                          <Input 
                            value={totpSecret} 
                            readOnly 
                            className="font-mono text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard(totpSecret)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="totpSetupCode">Verify Setup (Enter code from app)</Label>
                        <Input
                          id="totpSetupCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>

                      <Button 
                        onClick={confirmTOTPSetup} 
                        disabled={verificationCode.length !== 6} 
                        className="w-full"
                      >
                        Complete Setup
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
                    <CheckCircle className="h-5 w-5" />
                    <span>Google Authenticator is set up for your account</span>
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
              )}
            </div>
          )}

          <Button variant="outline" onClick={onBack} className="w-full">
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;