type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  color?: string;
  spacing?: '0' | 'sm' | 'md' | 'lg';
}

export default function Divider({ 
  orientation = 'horizontal',
  className = '',
  color = 'bg-gray-200',
  spacing = 'md'
}: DividerProps) {
  const spacingClasses = {
    horizontal: {
      '0': 'my-0',
      sm: 'my-4',
      md: 'my-6',
      lg: 'my-8'
    } as const,
    vertical: {
      '0': 'mx-0',
      sm: 'mx-4',
      md: 'mx-6',
      lg: 'mx-8'
    } as const
  };

  const baseClasses = orientation === 'horizontal'
    ? `${spacingClasses.horizontal[spacing]} min-h-[4px] rounded-[2px]`
    : `${spacingClasses.vertical[spacing]} min-w-[4px] rounded-[2px] h-full`;

  return (
    <div className={`${baseClasses} ${color} ${className}`} />
  );
} 