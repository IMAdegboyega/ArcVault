'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import CustomInput from './CustomInput';
import { authFormSchema } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { apiLogin, apiRegister } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import ConnectBank from './ConnectBank';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const { setUser } = useAuth();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (type === 'sign-up') {
        const res = await apiRegister(data as SignUpParams);
        if (res.success && res.data?.user) {
          setLocalUser(res.data.user);
          setUser(res.data.user);
        } else {
          toast.error(res.error?.message || 'Registration failed');
        }
      } else {
        const res = await apiLogin({ email: data.email, password: data.password });
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          router.push('/');
        } else {
          toast.error(res.error?.message || 'Invalid credentials');
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex w-full max-w-[420px] flex-col justify-center gap-6 py-10"
    >
      {/* Logo + Header */}
      <header className="flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/logo.svg" width={30} height={30} alt="ArcVault" />
          <span className="text-xl font-bold font-ibm-plex-serif text-gray-900">ArcVault</span>
        </Link>
        <div>
          <h2 className="text-[26px] font-semibold text-gray-900">
            {localUser ? 'Link Account' : type === 'sign-in' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-1 text-[15px] text-gray-500">
            {localUser ? 'Link your bank account to get started' : type === 'sign-in' ? 'Enter your credentials to access your account' : 'Fill in your details to get started'}
          </p>
        </div>
      </header>

      {localUser ? (
        <ConnectBank user={localUser} variant="primary" />
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {type === 'sign-up' && (
                <>
                  <div className="flex gap-3">
                    <CustomInput control={form.control} name="firstName" label="First Name" placeholder="John" />
                    <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Doe" />
                  </div>
                  <CustomInput control={form.control} name="address1" label="Address" placeholder="123 Main St" />
                  <CustomInput control={form.control} name="city" label="City" placeholder="New York" />
                  <div className="flex gap-3">
                    <CustomInput control={form.control} name="state" label="State" placeholder="NY" />
                    <CustomInput control={form.control} name="postalCode" label="Postal Code" placeholder="10001" />
                  </div>
                  <div className="flex gap-3">
                    <CustomInput control={form.control} name="dateOfBirth" label="Date of Birth" placeholder="YYYY-MM-DD" />
                    <CustomInput control={form.control} name="ssn" label="SSN" placeholder="1234" />
                  </div>
                </>
              )}

              <CustomInput control={form.control} name="email" label="Email" placeholder="you@email.com" />
              <CustomInput control={form.control} name="password" label="Password" placeholder="Enter your password" />

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-150 ease-out hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 will-change-transform"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </div>
                ) : type === 'sign-in' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </Form>

          <p className="text-center text-sm text-gray-500">
            {type === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
            <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className="font-semibold text-blue-600 hover:text-blue-700">
              {type === 'sign-in' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </>
      )}
    </motion.section>
  );
};

export default AuthForm;
