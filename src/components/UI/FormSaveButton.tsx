import { ButtonHTMLAttributes, ReactNode } from 'react';
import ButtonSpinner from './ButtonSpinner';

interface FormSaveButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
  children: ReactNode;
  isLoading?: boolean;
  theme?: 'it' | 'green';
}

const FormSaveButton = ({ 
  disabled, 
  onClick, 
  children, 
  isLoading,
  theme = 'it' 
}: FormSaveButtonProps) => {
  const baseClasses = "inline-flex items-center px-4 py-2 tracing-wide transition-colors duration-200 transform rounded-md focus:outline-none disabled:opacity-25";
  const themeClasses = theme === 'it' 
    ? "bg-it-300 hover:bg-it-400 focus:bg-it-700" 
    : "bg-green-300 hover:bg-green-400 focus:bg-green-700";

  return (
    <button
      type="button"
      className={`${baseClasses} ${themeClasses}`}
      disabled={disabled}
      onClick={onClick}
    >
      {isLoading && <ButtonSpinner />}
      {children}
    </button>
  );
};

export default FormSaveButton; 