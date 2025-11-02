'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-400',
          actionButton:
            'group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-500',
          cancelButton:
            'group-[.toast]:bg-gray-700 group-[.toast]:text-gray-300 group-[.toast]:hover:bg-gray-600',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

