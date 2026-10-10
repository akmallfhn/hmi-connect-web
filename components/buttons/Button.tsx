"use client";

import { ButtonHTMLAttributes, ForwardedRef, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "light"
  | "dark"
  | "outline"
  | "soft"
  | "secondarySoft"
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
      "inline-flex shrink-0 items-center truncate whitespace-nowrap justify-center gap-2 font-semibold transition active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        "bg-primary text-on-primary-action hover:bg-primary-hover active:bg-primary-hover",
      secondary:
        "bg-secondary text-on-secondary hover:bg-secondary-hover active:bg-secondary-hover",
      tertiary: "bg-tertiary text-on-dark hover:bg-tertiary-hover active:bg-tertiary-hover",
      light:
        "border border-border bg-surface text-heading hover:-translate-y-0.5 hover:bg-surface-muted",
      dark: "bg-dark-control text-on-dark hover:bg-dark-control-hover active:bg-dark-control-active",
      outline:
        "border border-border-strong bg-transparent text-heading hover:bg-primary-soft",
      soft: "bg-primary-soft text-primary-foreground hover:bg-primary-soft/80",
      secondarySoft:
        "bg-secondary-soft text-secondary-foreground hover:bg-secondary-soft/80",
      ghost: "bg-transparent text-heading hover:bg-media-backdrop/5",
      destructive:
        "bg-destructive text-on-destructive hover:bg-destructive-hover active:bg-destructive-hover",
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
