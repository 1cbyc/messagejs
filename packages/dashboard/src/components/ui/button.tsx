import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Brackets from './brackets';

const buttonVariants = cva(
  'relative flex items-center border transition-colors uppercase text-xs tracking-[0.2em]',
  {
    variants: {
      variant: {
        default: 'border-white hover:bg-white/10',
        destructive: 'border-red-500 text-red-300 hover:bg-red-500/10',
        outline: 'border-gray-700 hover:bg-white/5',
        secondary: 'border-gray-600 hover:bg-white/5',
        ghost: 'border-gray-800 hover:bg-white/5',
        link: 'border-0 hover:bg-white/5',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 text-[11px] px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10 aspect-square justify-center px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  showBrackets?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, showBrackets = true, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <div className="relative">
        <Comp
          className={cn(buttonVariants({ variant, size, className }), icon && !size?.includes('icon') && 'pl-0')}
          ref={ref}
          {...props}
        >
          {icon && (
            <span className="bg-white/10 h-full aspect-square flex items-center justify-center px-2">
              {icon}
            </span>
          )}
          {children && <span className={icon ? 'pr-2' : 'px-4'}>{children}</span>}
        </Comp>
        {showBrackets && (
          <div className="opacity-100">
            <Brackets />
          </div>
        )}
      </div>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

