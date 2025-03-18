"use client";

import React, { forwardRef } from "react";
import { OTPInput, REGEXP_ONLY_DIGITS } from "input-otp";
import { cn } from "@/lib/utils";

type OTPFormProps = {
  maxLength?: number;
  value?: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
  className?: string;
  inputMode?: "numeric" | "text" | "decimal" | "tel" | "search" | "email" | "url";
  autoFocus?: boolean;
};

export const OTPForm = forwardRef<HTMLDivElement, OTPFormProps>(({
  maxLength = 6,
  value,
  onChange,
  containerClassName,
  className,
  inputMode = "numeric",
  autoFocus = false,
}, ref) => {
  // Clean up pasted text by removing whitespace and non-digit characters
  const cleanPastedText = (text: string) => {
    // Remove all whitespace and keep only digits
    return text.replace(/\s+/g, '').replace(/\D/g, '');
  };

  return (
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      inputMode={inputMode}
      pattern={REGEXP_ONLY_DIGITS}
      pasteTransformer={cleanPastedText}
      autoFocus={autoFocus}
      containerClassName={cn(
        "group flex items-center gap-2",
        containerClassName
      )}
      className={cn("hidden", className)}
      render={({ slots }) => (
        <div ref={ref} className={cn("flex items-center gap-2", containerClassName)}>
          {slots.map((slot, index) => (
            <div
              key={index}
              className={cn(
                "relative flex h-14 w-10 items-center justify-center rounded-md border bg-white border-input text-sm transition-all",
                slot.isActive && "border-primary ring-2 ring-ring"
              )}
            >
              {slot.char ? (
                <div className="animate-in fade-in-50 text-lg font-medium">
                  {slot.char}
                </div>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center",
                    slot.isActive && slot.hasFakeCaret && "animate-pulse"
                  )}
                >
                  <div className="h-4 w-0.5 rounded-full bg-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    />
  );
}); 