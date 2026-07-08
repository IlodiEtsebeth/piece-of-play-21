import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { products } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  component: ShopLayout,
  head: () => ({
    meta: [
      { title: "Shop — Piece of Play" },
      {
        name: "description",
        content: "Printable play-based learning packs for Grade R through Grade 3.",
      },
      { property: "og:title", content: "Shop — Piece of Play" },
      { property: "og:description", content: "Printable play-based learning packs." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
});

function ShopLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/shop/$slug");
  if (isChild) return <Outlet />;
  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <AccentBadge tone="coral">Shop</AccentBadge>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Playful Learning Packs</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Beautifully printable resources for every stage of your child's early learning journey.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p.slug}
              to="/shop/$slug"
              params={{ slug: p.slug }}
              className="group block surface-paper rounded-[2rem] overflow-hidden shadow-soft hover:shadow-pop transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden p-4">
                <div className="absolute inset-6 wash-blush -z-0" />
                <img src={p.image} alt={p.name} loading="lazy" className="paint relative z-10 h-full w-full object-contain group-hover:scale-[1.03] transition-transform duration-500" />
                {p.badge && (
                  <span className="absolute top-3 left-3 z-20 font-accent text-lg leading-none bg-mustard/80 text-forest rounded-full px-3 py-1">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="p-5 pt-2">
                <div className="text-xs font-medium text-muted-foreground">{p.ageGroup}</div>
                <h3 className="mt-1 text-xl">{p.name}</h3>
                <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{p.short}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-lg text-primary">{p.price}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    View product <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
