'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiUpdateProfile } from '@/lib/api';
import HeaderBox from '@/components/HeaderBox';
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

const field = (label: string, name: keyof ProfileData, placeholder: string, disabled = false) =>
  ({ label, name, placeholder, disabled } as const);

const FIELDS = [
  field('First Name', 'firstName', 'John'),
  field('Last Name', 'lastName', 'Doe'),
  field('Address', 'address1', '123 Main St'),
  field('City', 'city', 'New York'),
  field('State', 'state', 'NY'),
  field('Postal Code', 'postalCode', '10001'),
  field('Date of Birth', 'dateOfBirth', 'YYYY-MM-DD'),
];

const Settings = () => {
  const { user, setUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      state: '',
      postalCode: '',
      dateOfBirth: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address1: user.address1 || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
        dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user]);

  const onSubmit = async (data: ProfileData) => {
    setIsSaving(true);
    try {
      const res = await apiUpdateProfile(data);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        toast.success('Profile updated successfully.');
      } else {
        toast.error(res.error?.message || 'Failed to update profile.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="no-scrollbar flex flex-col gap-8 p-5 py-8 sm:px-8 lg:py-10 xl:max-h-screen xl:overflow-y-auto">
      <HeaderBox title="Settings" subtext="Manage your profile and account preferences." />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex flex-col gap-6"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            {/* Personal info */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
              <p className="mt-0.5 text-sm text-gray-500">Update your name and address details.</p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-[680px]">
                {FIELDS.map(({ label, name, placeholder }) => (
                  <FormField key={name} control={form.control} name={name} render={({ field: f, fieldState }) => (
                    <div className="flex flex-col gap-1.5">
                      <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={placeholder}
                          className={`h-11 rounded-lg border-gray-200 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${fieldState.error ? 'border-rose-400' : ''}`}
                          {...f}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-rose-500" />
                    </div>
                  )} />
                ))}

                {/* Email — read only */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="h-11 rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Email cannot be changed.</p>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="max-w-[200px]">
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-150 ease-out hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 will-change-transform"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </div>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </Form>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="text-base font-semibold text-gray-900">Account Info</h3>
          <p className="mt-0.5 text-sm text-gray-500">Read-only account metadata.</p>
          <div className="mt-4 flex flex-col gap-3 max-w-[500px]">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="font-mono text-xs text-gray-700 select-all">{user?.id || '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Member since</span>
              <span className="text-sm font-medium text-gray-700">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
