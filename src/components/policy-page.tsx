import type { ReactNode } from "react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";

export const POLICY_LAST_UPDATED = "30 September 2026";

export function PolicyPage({
  badge,
  title,
  intro,
  children,
}: {
  badge: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16 text-center">
          <AccentBadge tone="sage">{badge}</AccentBadge>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-foreground/60">Last updated: {POLICY_LAST_UPDATED}</p>
          {intro && <p className="mt-4 text-foreground/75 max-w-2xl mx-auto">{intro}</p>}
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="surface-paper rounded-[1.75rem] p-6 sm:p-10 shadow-soft space-y-8 text-foreground/85 leading-relaxed">
          {children}
        </div>
      </section>
    </SiteLayout>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-primary">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export function PolicyList({ items, ordered = false }: { items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={`${ordered ? "list-decimal" : "list-disc"} pl-6 space-y-1.5`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export const EmailLink = () => (
  <a href="mailto:sensorypiece@gmail.com" className="text-primary underline underline-offset-2 hover:opacity-80">
    sensorypiece@gmail.com
  </a>
);
