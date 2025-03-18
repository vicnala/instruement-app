'use client';

import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'
import { SlotProps } from 'input-otp'

export const Slot = (props: SlotProps) => {
    return (
        <div
            className={cn(
                'relative w-10 h-12 text-[2rem]',
                'flex items-center justify-center',
                'transition-all duration-300',
                'border-border border-y border-r first:border-l first:rounded-l-md last:rounded-r-md',
                'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
                'outline outline-0 outline-accent-foreground/20',
                { 'outline-4 outline-accent-foreground': props.isActive },
            )}
            >
            <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
                {props.char ?? props.placeholderChar}
            </div>
            {/* {props.hasFakeCaret && <FakeCaret />} */}
        </div>
      )
}

// You can emulate a fake textbox caret!
export function FakeCaret() {
    return (
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
        <div className="w-px h-8 bg-white" />
        </div>
    )
}

// Inspired by Stripe's MFA input.
export function FakeDash() {
    return (
      <div className="flex w-6 justify-center items-center">
        <div className="w-3 h-1 rounded-full bg-border" />
      </div>
    )
  }

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}