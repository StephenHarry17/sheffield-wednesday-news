import * as React from "react";

export function Button({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50";

  const variants = {
    default: "bg-[#003399] text-white hover:bg-[#002277]",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  } as const;

  const sizes = {
    default: "h-9 px-4 py-2 rounded-lg text-sm",
    sm: "h-7 px-3 rounded-md text-xs",
    lg: "h-11 px-6 rounded-lg text-base",
    icon: "h-9 w-9 rounded-lg",
  } as const;

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
