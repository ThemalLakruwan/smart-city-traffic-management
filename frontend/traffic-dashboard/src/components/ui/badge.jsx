import React from 'react';

const variantClasses = {
  outline: 'border border-primary text-primary bg-transparent',
  secondary: 'bg-secondary text-secondary-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
  default: 'bg-primary text-primary-foreground',
};

export function Badge({ children, variant = 'default', className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
} 