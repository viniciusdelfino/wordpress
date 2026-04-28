import { ButtonHTMLAttributes } from 'react';
import Image from 'next/image';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'red' | 'dark-blue';
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
}

export default function Button({
  children,
  color = 'dark-blue',
  icon,
  iconPosition = 'left',
  iconSize = 16,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'flex items-center justify-center gap-2 rounded-md transition hover:opacity-90 font-medium';
  
  const colors = {
    'red': 'bg-red text-white',
    'dark-blue': 'bg-dark-blue text-white',
  };
  
  return (
    <button
      className={`${baseStyles} ${colors[color]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <Image src={icon} width={iconSize} height={iconSize} alt="" aria-hidden="true" />
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <Image src={icon} width={iconSize} height={iconSize} alt="" aria-hidden="true" />
      )}
    </button>
  );
}