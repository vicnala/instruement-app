import { ButtonHTMLAttributes, ReactNode, forwardRef, ForwardedRef } from 'react';
import ButtonSpinner from './ButtonSpinner';

interface FormSaveButtonProps extends Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> {
  children: ReactNode;
  isLoading?: boolean;
  theme?: 'it' | 'me' | 'we' | 'us';
  'aria-label'?: string;
}

const FormSaveButton = forwardRef(({ 
  disabled, 
  onClick, 
  children, 
  isLoading,
  theme = 'it',
  'aria-label': ariaLabel
}: FormSaveButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
  return (
    <button
      ref={ref}
      type="button"
      data-theme={theme}
      aria-label={ariaLabel}
      className={`
        inline-flex items-center px-4 py-2 transition-colors duration-200 transform 
        focus:outline-none
        font-bold 
        bg-transparent hover:bg-scope-500 active:bg-scope-200
        border-[0.1rem] border-scope-400 hover:border-scope-500 focus:border-scope-700 active:border-scope-200
        text-scope-500 hover:text-scope-1000 focus:text-scope-700 active:text-scope-500
        active:scale-[0.98]
        disabled:border-us-200 disabled:text-us-200 disabled:hover:bg-transparent disabled:hover:text-us-200
        disabled:cursor-not-allowed disabled:active:scale-100
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