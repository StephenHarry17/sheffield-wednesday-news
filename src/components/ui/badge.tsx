import * as React from "react";

const categoryColors: Record<string, string> = {
  "Match Report": "bg-[#003399] text-white",
  Transfer: "bg-purple-100 text-purple-800",
  Transfers: "bg-purple-100 text-purple-800",
  Opinion: "bg-amber-100 text-amber-800",
  "Fan Zone": "bg-green-100 text-green-800",
  Latest: "bg-blue-100 text-blue-800",
  Matches: "bg-[#003399] text-white",
  Club: "bg-gray-200 text-gray-700",
};

export function Badge({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const label = typeof children === "string" ? children : "";
  const color = categoryColors[label] ?? "bg-gray-200 text-gray-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
