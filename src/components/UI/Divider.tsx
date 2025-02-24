type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  color?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export default function Divider({ 
  orientation = 'horizontal',
  className = '',
  color = 'bg-gray-200',
  spacing = 'md'
}: DividerProps) {
  const spacingClasses = {
    horizontal: {
      sm: 'my-4',
      md: 'my-6',
      lg: 'my-8'
    },
    vertical: {
      sm: 'mx-4',
      md: 'mx-6',
      lg: 'mx-8'
    }
  };

  const baseClasses = orientation === 'horizontal'
    ? `${spacingClasses.horizontal[spacing]} min-h-[4px] rounded-[2px]`
    : `${spacingClasses.vertical[spacing]} min-w-[4px] rounded-[2px] h-full`;

  return (
    <div className={`${baseClasses} ${color} ${className}`} />
  );
} 