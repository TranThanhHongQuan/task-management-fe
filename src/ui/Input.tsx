import React from "react";

export function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none
      focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${className}`}
    />
  );
}
