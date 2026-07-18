"use client";

import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "light"
  | "dark"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize =
  | "sm"
  | "default"
  | "lg"
  | "pill"
  | "pillSm"
  | "icon"
  | "iconSm";

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
      "inline-flex items-center justify-center gap-2 font-semibold transition active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        "bg-primary text-white hover:bg-[#128488] active:bg-primary-foreground",
      secondary:
        "bg-secondary text-white hover:bg-[#e6534b] active:bg-secondary-foreground",
      light:
        "border border-[#e6e9ef] bg-white text-[#172033] hover:-translate-y-0.5 hover:bg-[#f5f7fb]",
      dark: "bg-[#202125] text-white hover:bg-[#2b2c31] active:bg-[#17181b]",
      outline:
        "border border-[#dbe3ef] bg-transparent text-[#172033] hover:bg-primary-soft",
      ghost: "bg-transparent text-[#172033] hover:bg-black/5",
      destructive:
        "bg-destructive text-white hover:bg-[#c92e25] active:bg-destructive-foreground",
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "h-8 rounded-lg px-3 text-xs",
      default: "h-9 rounded-lg px-3 text-sm",
      lg: "h-12 rounded-xl px-6 text-base",
      pill: "h-12 rounded-full px-5 text-sm",
      pillSm: "h-9 rounded-full px-4 text-sm",
      icon: "size-10 rounded-lg",
      iconSm: "size-7 rounded-full",
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
