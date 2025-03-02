import { ButtonHTMLAttributes, ReactNode, forwardRef, ForwardedRef } from 'react';
import ButtonSpinner from './ButtonSpinner';

interface FormSaveButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
  children: ReactNode;
  isLoading?: boolean;
  theme?: 'it' | 'green' | 'me';
}

const FormSaveButton = forwardRef(({ 
  disabled, 
  onClick, 
  children, 
  isLoading,
  theme = 'it' 
}: FormSaveButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  const baseClasses = "font-bold inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform rounded-md focus:outline-none disabled:opacity-25";
  const themeClasses = 
    theme === 'it' ? "bg-it-300 hover:bg-it-400 focus:bg-it-700" : 
    theme === 'green' ? "bg-green-300 hover:bg-green-400 focus:bg-green-700" :
    "bg-me-300 hover:bg-me-400 focus:bg-me-700";

  return (
    <button
      ref={ref}
      type="button"
      className={`
        font-bold inline-flex items-center px-4 py-2 tracking-wide transition-colors duration-200 transform rounded-md focus:outline-none
        ${disabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-200' 
          : theme === 'green'
            ? 'text-green-500 border-2 border-green-500 hover:bg-green-500 hover:text-white focus:bg-green-700'
            : theme === 'me'
              ? 'text-me-1000 dark:text-me-500 border-2 border-me-500 hover:bg-me-500 hover:text-me-1000 dark:hover:text-me-1000 focus:bg-me-500 focus:text-me-600 dark:focus:text-me-800'
              : 'text-it-1000 dark:text-it-500 border-2 border-it-500 hover:bg-it-500 hover:text-it-1000 dark:hover:text-it-1000 focus:bg-it-500 focus:text-it-600 dark:focus:text-it-800'
        }
      `}
      disabled={disabled}
      onClick={onClick}
    >
      {isLoading && <ButtonSpinner />}
      {children}
    </button>
  );
});

// Add display name for better debugging in React DevTools
FormSaveButton.displayName = 'FormSaveButton';

export default FormSaveButton; 