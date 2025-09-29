-- Add treasury_officer role to the current user so they can access treasury holdings
INSERT INTO public.user_roles (user_id, role) 
VALUES ('e3358b22-c861-4e60-a0a5-cbf4eaae0086', 'treasury_officer')
ON CONFLICT (user_id, role) DO NOTHING;