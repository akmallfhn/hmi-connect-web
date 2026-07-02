"use client";

import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "light"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "default" | "lg" | "pill" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      disabled,
      className,
      children,
      ...rest
    },
    ref: ForwardedRef<HTMLButtonElement>
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b8f6a]/40";

    const variantClasses: Record<ButtonVariant, string> = {
      primary: "bg-[#0b8f6a] text-white hover:bg-[#097a5b] active:bg-[#086b50]",
      light:
        "bg-white text-[#172033] shadow-[0_18px_45px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:bg-[#f5f7fb] lg:border lg:border-[#e6e9ef] lg:shadow-none",
      outline:
        "border border-[#dbe3ef] bg-transparent text-[#172033] hover:bg-[#f5fbf8]",
      ghost: "bg-transparent text-[#172033] hover:bg-black/5",
      destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "h-8 rounded-lg px-3 text-xs",
      default: "h-10 rounded-lg px-4 text-sm",
      lg: "h-12 rounded-xl px-6 text-base",
      pill: "h-12 rounded-full px-5 text-sm",
      icon: "size-10 rounded-lg",
    };

    const finalClasses = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={finalClasses}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
