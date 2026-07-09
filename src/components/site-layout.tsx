import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Instagram, Facebook, Mail, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";
import handMadeBadge from "@/assets/hand-made-badge.png.asset.json";
import { whatsappLink } from "@/lib/products";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/free", label: "Free Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src={logo} alt="Piece of Play" className="h-11 w-11 shrink-0 rounded-2xl object-cover" />
            <span className="font-display text-lg sm:text-xl font-semibold text-primary truncate">
              Piece of Play
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-4 py-2 rounded-full text-sm font-medium text-foreground/80 hover:text-primary hover:bg-blush transition-colors"
                activeProps={{ className: "bg-blush text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/shop"
              className="ml-2 inline-flex items-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 shadow-soft"
            >
              Shop now
            </Link>
          </nav>
          <button
            className="md:hidden p-2 rounded-full hover:bg-blush"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border/60 bg-background">
            <div className="px-4 py-3 flex flex-col gap-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-2xl text-base font-medium hover:bg-blush"
                  activeProps={{ className: "bg-blush text-primary" }}
                  activeOptions={{ exact: n.to === "/" }}
                >
                  {n.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-12 w-12 rounded-2xl object-cover" />
              <span className="font-display text-xl font-semibold">Piece of Play</span>
            </div>
            <p className="mt-4 text-primary-foreground/80 text-sm leading-relaxed max-w-xs">
              Play-based learning resources helping little learners aged 3–9 build big skills and start school with confidence.
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg text-primary-foreground">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              {nav.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-mustard transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg text-primary-foreground">Say hello</h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li>
                <a href={whatsappLink("Hi Ilodi 😊")} className="inline-flex items-center gap-2 hover:text-mustard">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </li>
              <li>
                <a href="https://instagram.com" className="inline-flex items-center gap-2 hover:text-mustard">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" className="inline-flex items-center gap-2 hover:text-mustard">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </li>
              <li>
                <a href="mailto:hello@pieceofplay.co" className="inline-flex items-center gap-2 hover:text-mustard">
                  <Mail className="h-4 w-4" /> hello@pieceofplay.co
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-primary-foreground/70 flex flex-wrap justify-between gap-3">
            <span>© {new Date().getFullYear()} Piece of Play. Learning through play, one piece at a time.</span>
            <span className="font-accent text-mustard text-sm">Made with love for little learners ♥</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AccentBadge({
  children,
  tone = "mustard",
}: {
  children: ReactNode;
  tone?: "mustard" | "coral" | "sage" | "lilac";
}) {
  const map = {
    mustard: "bg-mustard/25 text-forest",
    coral: "bg-coral/25 text-forest",
    sage: "bg-sage/40 text-forest",
    lilac: "bg-lilac/40 text-forest",
  } as const;
  return (
    <span
      className={`font-accent text-lg leading-none inline-flex items-center rounded-full px-3 py-1 ${map[tone]}`}
    >
      {children}
    </span>
  );
}
