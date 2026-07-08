import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { MessageCircle, Instagram, Facebook, Mail, Send, CheckCircle2 } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { whatsappLink } from "@/lib/products";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Piece of Play" },
      { name: "description", content: "Get in touch with Piece of Play via WhatsApp, Instagram, Facebook or email." },
      { property: "og:title", content: "Contact — Piece of Play" },
      { property: "og:description", content: "Say hello — we'd love to hear from you." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const channels = [
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with me", href: whatsappLink("Hi Ilodi 😊"), tone: "bg-sage/50" },
  { icon: Instagram, label: "Instagram", value: "@pieceofplay", href: "https://instagram.com", tone: "bg-coral/30" },
  { icon: Facebook, label: "Facebook", value: "Piece of Play", href: "https://facebook.com", tone: "bg-lilac/40" },
  { icon: Mail, label: "Email", value: "hello@pieceofplay.co", href: "mailto:hello@pieceofplay.co", tone: "bg-mustard/30" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <AccentBadge tone="coral">Say hello</AccentBadge>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Let's chat</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Questions about a resource, custom requests or just want to share a win? I'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl">Reach me directly</h2>
          <p className="mt-2 text-foreground/70">Pick your favourite way to get in touch.</p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="surface-paper rounded-[1.75rem] p-5 shadow-soft hover:shadow-pop transition-shadow flex items-center gap-4"
              >
                <div className={`h-12 w-12 shrink-0 rounded-2xl grid place-items-center ${c.tone}`}>
                  <c.icon className="h-6 w-6 text-forest" />
                </div>
                <div className="min-w-0">
                  <div className="font-display text-lg text-primary">{c.label}</div>
                  <div className="text-sm text-foreground/70 truncate">{c.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] surface-paper shadow-soft p-8">
          {sent ? (
            <div className="text-center py-10">
              <div className="mx-auto h-16 w-16 rounded-full bg-sage/60 grid place-items-center">
                <CheckCircle2 className="h-8 w-8 text-forest" />
              </div>
              <h3 className="mt-4 text-2xl">Message sent!</h3>
              <p className="mt-2 text-foreground/70">I'll get back to you as soon as I can.</p>
            </div>
          ) : (
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <h2 className="text-2xl">Send a message</h2>
              <TextField label="Your name" placeholder="Jane" />
              <TextField label="Email address" type="email" placeholder="jane@email.com" />
              <label className="block">
                <span className="text-sm font-medium text-foreground/80">Message</span>
                <textarea
                  required
                  rows={5}
                  placeholder="How can I help?"
                  className="mt-1.5 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 outline-none focus:border-mustard transition-colors resize-none"
                />
              </label>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 font-medium shadow-soft hover:opacity-90"
              >
                <Send className="h-4 w-4" /> Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function TextField({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <input
        required
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border-2 border-border bg-background px-4 py-3 outline-none focus:border-mustard transition-colors"
      />
    </label>
  );
}
