import type { ReactNode } from "react";

export default function V4LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="font-heading text-lg font-bold tracking-tight">{heading}</h2>
      <div className="mt-2 flex flex-col gap-2 text-pretty text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
