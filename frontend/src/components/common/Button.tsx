import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../../lib/utils/cn";

const ButtonVariant = {
  primary:
    "rounded-md px-2 py-1.5 bg-primary text-white font-semibold cursor-pointer hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-gray-300",
} as const;

type TButtonProps = {
  variant?: keyof typeof ButtonVariant;
} & ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren;

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className,
  ...restProps
}: TButtonProps) {
  return (
    <button
      className={cn(ButtonVariant[variant], className)}
      type={type}
      {...restProps}
    >
      {children}
    </button>
  );
}
