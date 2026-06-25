"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DataTableIconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "aria-label" | "children" | "title"
> & {
  label: string;
  children: React.ReactNode;
};

export function DataTableIconButton({
  label,
  children,
  className,
  ...props
}: DataTableIconButtonProps) {
  return (
    <span className="group relative inline-flex">
      <Button
        aria-label={label}
        title={label}
        className={className}
        {...props}
      >
        {children}
      </Button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden max-w-48 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity",
          "whitespace-nowrap group-hover:opacity-100 group-focus-within:opacity-100 sm:block",
        )}
      >
        {label}
      </span>
    </span>
  );
}
