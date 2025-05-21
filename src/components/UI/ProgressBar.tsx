import React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, Circle, Eye } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  // onStepChange: (step: number) => void;
  completed?: boolean;
  onCompletedChange?: (completed: boolean) => void;
}

const ProgressBar = ({ 
  currentStep, 
  // onStepChange, 
  completed = false,
  onCompletedChange 
}: ProgressBarProps) => {
  const t = useTranslations('components.UI.ProgressBar');
  
  const steps = [
    {
      number: 1,
      title: t('basic_info.title'),
      description: t('basic_info.description')
    },
    {
      number: 2,
      title: t('media.title'),
      description: t('media.description')
    },
    {
      number: 3,
      title: t('description.title'),
      description: t('description.description')
    }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      // onStepChange(currentStep + 1);
    } else {
      onCompletedChange?.(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // onStepChange(currentStep - 1);
      onCompletedChange?.(false);
    }
  };

  // Calculate progress width based on current step
  const getProgressWidth = () => {
    if (completed) return '100%';
    if (currentStep === 1) return '0%';
    return `${((currentStep - 1) / 3) * 100}%`;
  };

  return (
    <div className="w-full mx-auto px-3">
      <div className="relative">
        {/* Progress bar container */}
        <div className="absolute top-4 sm:top-5 left-11 right-11 h-1 bg-it-200"/>
        
        {/* Active progress bar */}
        <div 
          className="absolute top-4 sm:top-5 left-11 h-1 bg-it-300 transition-all duration-300"
          style={{ width: getProgressWidth() }}
        />

        {/* Steps container with added preview icon */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center max-w-[110px] sm:max-w-none">
              {/* Step indicators */}
              {step.number < currentStep ? (
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-it-400 bg-it-50 rounded-full" />
              ) : step.number === currentStep ? (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-it-400 text-white flex items-center justify-center text-sm sm:text-base font-semibold">
                  {step.number}
                </div>
              ) : (
                <Circle className="w-8 h-8 sm:w-10 sm:h-10 text-it-300 bg-it-50 rounded-full" />
              )}
              
              {/* Step labels */}
              <div className="mt-2 sm:mt-4 text-center">
                <div className="text-sm sm:text-base font-medium truncate">{step.title}</div>
                <div className="hidden sm:block text-xs sm:text-sm text-gray-500 truncate">{step.description}</div>
              </div>
            </div>
          ))}
          
          {/* Preview icon at the end */}
          <div className="flex flex-col items-center max-w-[110px] sm:max-w-none">
            {completed ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-400 text-white flex items-center justify-center">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-it-200 text-it-300 flex items-center justify-center bg-white">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="mt-2 sm:mt-4 text-center">
              <div className="text-sm sm:text-base font-medium truncate">{t('preview.title')}</div>
              <div className="hidden sm:block text-xs sm:text-sm text-gray-500 truncate">{t('preview.description')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;