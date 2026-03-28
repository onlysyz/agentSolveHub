import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#575f72]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded border border-[#5e7da5]/30 bg-white text-[#1a1a1a] placeholder-[#575f72]/50',
          'focus:outline-none focus:ring-2 focus:ring-[#005bc4]/30 focus:border-[#005bc4]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#575f72]">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded border border-[#5e7da5]/30 bg-white text-[#1a1a1a] placeholder-[#575f72]/50',
          'focus:outline-none focus:ring-2 focus:ring-[#005bc4]/30 focus:border-[#005bc4]',
          'disabled:opacity-50 disabled:cursor-not-allowed resize-none',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#575f72]">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-3 py-2 rounded border border-[#5e7da5]/30 bg-white text-[#1a1a1a]',
          'focus:outline-none focus:ring-2 focus:ring-[#005bc4]/30 focus:border-[#005bc4]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
