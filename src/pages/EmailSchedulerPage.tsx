import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, Send, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSession } from '@/hooks/useSession';

interface EmailSchedulerSettings {
  id?: string;
  email_address: string;
  salary_slip_enabled: boolean;
  bank_summary_enabled: boolean;
  crypto_summary_enabled: boolean;
  treasury_summary_enabled: boolean;
  bug_report_enabled: boolean;
  schedule_enabled: boolean;
  last_sent_date?: string;
}

const EmailSchedulerPage = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [settings, setSettings] = useState<EmailSchedulerSettings>({
    email_address: 'oldfieldjohnpatrick@gmail.com',
    salary_slip_enabled: false,
    bank_summary_enabled: false,
    crypto_summary_enabled: false,
    treasury_summary_enabled: false,
    bug_report_enabled: false,
    schedule_enabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_scheduler_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          id: data.id,
          email_address: data.email_address,
          salary_slip_enabled: data.salary_slip_enabled,
          bank_summary_enabled: data.bank_summary_enabled,
          crypto_summary_enabled: data.crypto_summary_enabled,
          treasury_summary_enabled: data.treasury_summary_enabled,
          bug_report_enabled: data.bug_report_enabled,
          schedule_enabled: data.schedule_enabled,
          last_sent_date: data.last_sent_date,
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_scheduler_settings')
        .upsert({
          user_id: user.id,
          email_address: settings.email_address,
          salary_slip_enabled: settings.salary_slip_enabled,
          bank_summary_enabled: settings.bank_summary_enabled,
          crypto_summary_enabled: settings.crypto_summary_enabled,
          treasury_summary_enabled: settings.treasury_summary_enabled,
          bug_report_enabled: settings.bug_report_enabled,
          schedule_enabled: settings.schedule_enabled,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Settings saved successfully');
      await fetchSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const sendTestEmail = async () => {
    if (!user) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-scheduled-reports', {
        body: {
          userId: user.id,
          emailAddress: settings.email_address,
          reports: {
            salarySlip: settings.salary_slip_enabled,
            bankSummary: settings.bank_summary_enabled,
            cryptoSummary: settings.crypto_summary_enabled,
            treasurySummary: settings.treasury_summary_enabled,
            bugReport: settings.bug_report_enabled,
          },
          isTest: true,
        },
      });

      if (error) throw error;

      toast.success('Test emails sent successfully! Check your inbox.');
      
      // Update last sent date
      await supabase
        .from('email_scheduler_settings')
        .update({ last_sent_date: new Date().toISOString() })
        .eq('user_id', user.id);
      
      await fetchSettings();
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test emails');
    } finally {
      setSending(false);
    }
  };

  const documentOptions = [
    {
      id: 'salary_slip_enabled',
      label: 'Salary Slip',
      description: 'Monthly mock salary slip from employment system',
    },
    {
      id: 'bank_summary_enabled',
      label: 'Mainbank & Foreign Exchange Summary',
      description: 'Unrealised banking and FX transactions summary',
    },
    {
      id: 'crypto_summary_enabled',
      label: 'Cryptocurrency Reserve Summary',
      description: 'Mock cryptocurrency holdings and transaction report',
    },
    {
      id: 'treasury_summary_enabled',
      label: 'Treasury Reserves Summary',
      description: 'Unrealised treasury reserves and holdings report',
    },
    {
      id: 'bug_report_enabled',
      label: 'Outstanding Bugs Report',
      description: 'List of outstanding and in-progress bugs from tracking system',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Email Scheduler</h1>
        <p className="text-muted-foreground">
          Configure monthly automated reports and summaries
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Reports will be sent to this email address monthly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email_address}
                onChange={(e) => setSettings({ ...settings, email_address: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="schedule_enabled"
                checked={settings.schedule_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, schedule_enabled: checked as boolean })
                }
              />
              <Label htmlFor="schedule_enabled" className="cursor-pointer">
                Enable monthly automated emails
              </Label>
            </div>

            {settings.last_sent_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Last sent: {new Date(settings.last_sent_date).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Reports
            </CardTitle>
            <CardDescription>
              Select which reports to include in monthly emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={option.id}
                    checked={settings[option.id as keyof EmailSchedulerSettings] as boolean}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, [option.id]: checked as boolean })
                    }
                  />
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={option.id} className="cursor-pointer font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Save your settings or send a test email with all selected reports
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
            
            <Button
              onClick={sendTestEmail}
              disabled={sending || !settings.email_address}
              variant="outline"
              className="flex-1"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">📅 Monthly Schedule:</p>
              <p>Reports will be automatically sent on the 1st of each month at 9:00 AM</p>
              <p className="font-medium mt-4">📋 Document Format:</p>
              <p>All documents will clearly display "MOCK" or "UNREALISED" to indicate their nature</p>
              <p className="font-medium mt-4">✉️ Email Content:</p>
              <p>Each report will be sent as a separate email with PDF attachment and detailed summary</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailSchedulerPage;
