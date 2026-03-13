'use client';

import { useState } from 'react';
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { authFormSchema } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = authFormSchema('sign-up');

interface CustomInputProps {
  control: Control<z.infer<typeof formSchema>>;
  name: FieldPath<z.infer<typeof formSchema>>;
  label: string;
  placeholder: string;
  optional?: boolean;
}

const CustomInput = ({ control, name, label, placeholder, optional }: CustomInputProps) => {
  const isPassword = name === 'password';
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex w-full flex-col gap-1.5">
          <FormLabel className="text-sm font-medium text-gray-700">
            {label}
            {optional && <span className="ml-1 font-normal text-gray-400">(optional)</span>}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                placeholder={placeholder}
                type={isPassword && !showPassword ? 'password' : 'text'}
                className={cn(
                  'h-11 rounded-lg border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all',
                  isPassword && 'pr-10',
                  fieldState.error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                )}
                {...field}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          </FormControl>
          <FormMessage className="text-xs text-rose-500" />
        </div>
      )}
    />
  );
};

export default CustomInput;
