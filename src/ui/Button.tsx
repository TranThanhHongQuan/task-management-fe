import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60";
  const cls =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700 shadow-soft"
      : "border bg-white hover:bg-slate-50 text-slate-800";
  return <button className={`${base} ${cls} ${className}`} {...props} />;
}
