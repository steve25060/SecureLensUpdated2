import { ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveContainer = ({ children, className = '' }: ResponsiveLayoutProps) => {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export const ResponsiveGrid = ({ 
  children, 
  cols = 1,
  className = '' 
}: ResponsiveLayoutProps & { cols?: number }) => {
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {children}
    </div>
  );
};

export const ResponsiveSection = ({ 
  children, 
  maxWidth = 'max-w-7xl',
  className = '' 
}: ResponsiveLayoutProps & { maxWidth?: string }) => {
  return (
    <div className={`relative z-10 mx-auto ${maxWidth} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};
