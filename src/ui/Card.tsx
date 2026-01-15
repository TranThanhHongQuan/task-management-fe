import React from "react";
export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border bg-white shadow-soft ${className}`} {...props} />;
}
