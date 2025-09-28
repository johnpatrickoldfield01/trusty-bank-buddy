import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';

const signUpSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(12, { message: "Password must be at least 12 characters." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter."})
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter."})
    .regex(/[0-9]/, { message: "Must contain at least one number."})
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character."}),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const password = signUpForm.watch("password");

  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message || "An error occurred during sign up");
    } else {
      toast.success("Check your email for the confirmation link!");
    }
    setLoading(false);
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setLoading(true);
    
    // Check if 2FA is enabled for the specific authorized email
    const AUTHORIZED_2FA_EMAIL = 'oldfieldjohnpatrick@gmail.com';
    
    if (values.email === AUTHORIZED_2FA_EMAIL) {
      // For the authorized email, require 2FA
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "An error occurred during sign in");
        setLoading(false);
        return;
      }

      // Sign out immediately to require 2FA
      await supabase.auth.signOut();
      
      // Show 2FA screen
      setUserEmail(values.email);
      setShow2FA(true);
      toast.success("Password verified. Please complete 2FA verification.");
    } else {
      // Regular sign in for other users
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "An error occurred during sign in");
      } else {
        toast.success("Signed in successfully!");
        navigate('/');
      }
    }
    
    setLoading(false);
  };

  const handle2FAComplete = async () => {
    // Complete the sign-in process after 2FA verification
    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: signInForm.getValues('password'),
    });

    if (error) {
      toast.error("Failed to complete sign in");
      setShow2FA(false);
      return;
    }

    toast.success("Signed in successfully with 2FA!");
    navigate('/');
  };

  // Show 2FA screen if triggered
  if (show2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg">
          <TwoFactorAuth 
            userEmail={userEmail}
            onTwoFactorComplete={handle2FAComplete}
            onBack={() => {
              setShow2FA(false);
              setUserEmail('');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Tabs defaultValue="signin" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
                {userEmail === 'oldfieldjohnpatrick@gmail.com' && (
                  <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    🔐 Enhanced security: 2FA required for this account
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a new account to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                   <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        <PasswordStrengthIndicator password={password} />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPage;
