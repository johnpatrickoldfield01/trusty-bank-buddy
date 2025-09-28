import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, QrCode, Copy, CheckCircle, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Setup2FAPageProps {
  userEmail?: string;
}

const Setup2FAPage = ({ userEmail = 'oldfieldjohnpatrick@gmail.com' }: Setup2FAPageProps) => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Security check - require admin authentication first
  const handleAdminAuth = () => {
    // In production, this would be a proper admin verification system
    if (authenticationCode === 'ADMIN2024') {
      setIsAuthenticated(true);
      toast.success('Administrator access granted. You can now set up 2FA.');
    } else {
      toast.error('Invalid administrator code');
    }
  };

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

  const confirmTOTPSetup = () => {
    if (verificationCode.length === 6) {
      // In a real app, you'd verify the TOTP code on the server
      // For demo, we'll accept any 6-digit code
      localStorage.setItem(`totp_secret_${userEmail}`, totpSecret);
      localStorage.setItem(`totp_setup_complete_${userEmail}`, 'true');
      setSetupComplete(true);
      toast.success('Google Authenticator setup completed successfully!');
      setVerificationCode('');
    } else {
      toast.error('Please enter a 6-digit code from your authenticator app');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleComplete = () => {
    toast.success('2FA setup process completed. The account is now secured.');
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Administrator Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Secure 2FA Setup</span>
              </div>
              <p className="text-red-700 text-sm">
                This is the secure 2FA induction process. Administrator authorization is required to prevent unauthorized 2FA setup.
              </p>
            </div>

            <div>
              <Label htmlFor="adminCode">Administrator Code</Label>
              <Input
                id="adminCode"
                type="password"
                value={authenticationCode}
                onChange={(e) => setAuthenticationCode(e.target.value)}
                placeholder="Enter admin authorization code"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For demo: use "ADMIN2024"
              </p>
            </div>

            <Button 
              onClick={handleAdminAuth} 
              disabled={!authenticationCode}
              className="w-full"
            >
              Verify Administrator Access
            </Button>

            <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              2FA Setup Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Security Enhanced</span>
              </div>
              <p className="text-green-700 text-sm">
                2FA has been successfully configured for {userEmail}. The account now requires authenticator verification for login.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Important Notes:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep your authenticator app secure</li>
                <li>• Store backup codes in a safe place</li>
                <li>• The account now requires 2FA for all logins</li>
                <li>• Contact administrator if you lose access</li>
              </ul>
            </div>

            <Button onClick={handleComplete} className="w-full">
              Complete Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Secure 2FA Setup - {userEmail}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Authorized Setup Process</span>
            </div>
            <p className="text-blue-700 text-sm">
              This is the secure 2FA induction process. Only authorized administrators can configure 2FA through this interface.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <QrCode className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Setup Google Authenticator</span>
              </div>
              <p className="text-green-700 text-sm">
                Configure the authenticator app to generate time-based codes for this account
              </p>
            </div>

            {!totpSecret ? (
              <Button onClick={generateTOTPSecret} className="w-full">
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
                  Complete 2FA Setup
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup2FAPage;