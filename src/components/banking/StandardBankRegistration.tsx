
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStandardBankApi } from '@/hooks/useStandardBankApi';
import { Loader2 } from 'lucide-react';

interface RegistrationFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  intendedUse: string;
}

export const StandardBankRegistration = () => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<RegistrationFormData>();
  const { selfRegister, isLoading, registrationStatus } = useStandardBankApi();

  const onSubmit = async (data: RegistrationFormData) => {
    await selfRegister(data);
  };

  if (registrationStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">Registration Successful!</CardTitle>
          <CardDescription>
            Your application has been submitted to Standard Bank. You will receive an email with further instructions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Standard Bank API Registration</CardTitle>
        <CardDescription>
          Register for Standard Bank developer API access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              {...register('companyName', { required: 'Company name is required' })}
              placeholder="Your Company Ltd"
            />
            {errors.companyName && (
              <p className="text-sm text-red-600">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              {...register('contactPerson', { required: 'Contact person is required' })}
              placeholder="John Doe"
            />
            {errors.contactPerson && (
              <p className="text-sm text-red-600">{errors.contactPerson.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="contact@company.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              {...register('phoneNumber', { required: 'Phone number is required' })}
              placeholder="+27 11 123 4567"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Select onValueChange={(value) => setValue('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="software">Software Development</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="consulting">Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-sm text-red-600">{errors.businessType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intendedUse">Intended Use</Label>
            <Textarea
              id="intendedUse"
              {...register('intendedUse', { required: 'Intended use is required' })}
              placeholder="Describe how you plan to use the Standard Bank API..."
              rows={3}
            />
            {errors.intendedUse && (
              <p className="text-sm text-red-600">{errors.intendedUse.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Register for API Access'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
