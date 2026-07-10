import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Facebook, Mail } from "lucide-react";
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
  { icon: Facebook, label: "Facebook", value: "Piece of Play", href: "https://www.facebook.com/share/19DCqYmyMK/", tone: "bg-lilac/40" },
  { icon: Mail, label: "Email", value: "hello@pieceofplay.co", href: "mailto:hello@pieceofplay.co", tone: "bg-mustard/30" },
];

function ContactPage() {
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

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-2">
          <h2 className="text-2xl">Reach me directly</h2>
          <p className="mt-2 text-foreground/70">Pick your favourite way to get in touch — I reply personally to every message.</p>
        </div>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
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
      </section>
    </SiteLayout>
  );
}
