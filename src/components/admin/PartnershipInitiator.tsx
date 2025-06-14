
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const PartnershipInitiator = () => {
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const yourCompanyName = 'Odinnova (Pty) Ltd';
  const targetBank = 'FNB Ltd';

  const handleGenerateEmail = () => {
    if (!contactPerson || !contactEmail) {
      toast.error('Please enter the contact person\'s name and email.');
      return;
    }

    const subject = `Fintech Partnership Inquiry: ${yourCompanyName} & ${targetBank}`;
    const body = `Dear ${contactPerson},

My name is [Your Name], and I am the founder of ${yourCompanyName}. We have developed a user-centric digital banking application designed to provide accessible and modern banking solutions.

We are deeply impressed with ${targetBank}'s commitment to innovation in the financial sector. This aligns perfectly with our vision, and we believe a partnership would be mutually beneficial.

${yourCompanyName} provides the modern, user-friendly front-end experience, and we are seeking a regulated banking partner to provide the core infrastructure, including accounts, payments, and compliance, through a BaaS model.

You can view a live, interactive prototype of our application here: ${window.location.origin}

Would you be available for a brief 15-minute call next week to discuss how a partnership could work?

Thank you for your time and consideration.

Best regards,

[Your Name]
Founder
${yourCompanyName}
[Your Website/LinkedIn]
[Your Phone Number]
`;

    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Initiate Banking Partnership</CardTitle>
        <CardDescription>
          Generate a pre-filled email to send to a potential banking partner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Your Company</Label>
          <Input value={yourCompanyName} disabled />
        </div>
        <div className="space-y-2">
          <Label>Target Bank</Label>
          <Input value={targetBank} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-person">Contact Person's Name</Label>
          <Input
            id="contact-person"
            placeholder="e.g., Jane Doe"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Contact Person's Email</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="e.g., jane.doe@fnb.co.za"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerateEmail} className="w-full bg-bank-primary hover:bg-bank-primary/90">
          Generate & Send Email
        </Button>
      </CardContent>
    </Card>
  );
};

export default PartnershipInitiator;
