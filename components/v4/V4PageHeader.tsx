import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type V4PageHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

export default function V4PageHeader({ title, description, icon, className }: V4PageHeaderProps) {
  return (
    <div className={cn("border-b border-border pb-5", className)}>
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
