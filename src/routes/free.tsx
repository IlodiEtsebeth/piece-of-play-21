import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Download, CheckCircle2, Mail, User } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import checklist from "@/assets/checklist.jpg";

export const Route = createFileRoute("/free")({
  component: FreePage,
  head: () => ({
    meta: [
      { title: "Free School Readiness Checklist — Piece of Play" },
      {
        name: "description",
        content: "Download our free School Readiness Checklist for parents of children aged 3–6.",
      },
      { property: "og:title", content: "Free School Readiness Checklist" },
      { property: "og:description", content: "A simple, gentle guide for parents." },
    ],
    links: [{ rel: "canonical", href: "/free" }],
  }),
});

function FreePage() {
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <AccentBadge tone="mustard">FREE Download</AccentBadge>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">School Readiness Checklist</h1>
            <p className="mt-4 text-foreground/75 leading-relaxed">
              A gentle, teacher-designed checklist to help you see the skills your little one has mastered — and the ones we can play with together.
            </p>
            <ul className="mt-6 space-y-2 text-foreground/80">
              {["Covers ages 3–6", "Fine-motor, language, maths & social skills", "Ready to print & use today"].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-8 wash-sage -z-10" />
            <img src={checklist} alt="Checklist illustration" className="paint w-full h-auto max-w-md mx-auto" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2.5rem] surface-paper shadow-soft p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto h-16 w-16 rounded-full bg-sage/60 grid place-items-center">
                <CheckCircle2 className="h-8 w-8 text-forest" />
              </div>
              <h2 className="mt-5 text-2xl">Thank you!</h2>
              <p className="mt-2 text-foreground/70">
                Your free checklist is ready to download.
              </p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <h2 className="text-2xl">Send it to me</h2>
                <p className="text-sm text-foreground/70 mt-1">Enter your details to receive your free checklist.</p>
              </div>
              <Field label="Your name" icon={<User className="h-4 w-4" />}>
                <input
                  required
                  type="text"
                  placeholder="Jane"
                  className="w-full bg-transparent outline-none py-2"
                />
              </Field>
              <Field label="Email address" icon={<Mail className="h-4 w-4" />}>
                <input
                  required
                  type="email"
                  placeholder="jane@email.com"
                  className="w-full bg-transparent outline-none py-2"
                />
              </Field>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Send me the checklist
              </button>
              <p className="text-xs text-muted-foreground text-center">
                No spam, ever. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-2xl border-2 border-border bg-background px-4 focus-within:border-mustard transition-colors">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
