import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { fetchProducts, resolveSignedUrl, formatPrice, type Product } from "@/lib/products-db";

export const Route = createFileRoute("/shop")({
  component: ShopLayout,
  head: () => ({
    meta: [
      { title: "Shop — Piece of Play" },
      { name: "description", content: "Printable play-based learning packs for Grade R through Grade 3." },
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

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => fetchProducts({ activeOnly: true }),
  });
  const products = allProducts.filter((p) => !p.is_free);
  const ageGroups = Array.from(new Set(products.map((p) => p.age_group))).sort();
  const [filter, setFilter] = useState<string | null>(null);
  const filtered = filter ? products.filter((p) => p.age_group === filter) : products;

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
        {ageGroups.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            <button
              onClick={() => setFilter(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === null ? "bg-primary text-primary-foreground" : "surface-paper text-foreground/70 hover:text-foreground"
              }`}
            >
              All
            </button>
            {ageGroups.map((ag) => (
              <button
                key={ag}
                onClick={() => setFilter(ag)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === ag ? "bg-primary text-primary-foreground" : "surface-paper text-foreground/70 hover:text-foreground"
                }`}
              >
                {ag}
              </button>
            ))}
          </div>
        )}
        {isLoading && <p className="text-muted-foreground">Loading products…</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground">No products in this category yet.</p>
        )}
      </section>
    </SiteLayout>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    resolveSignedUrl("product-images", p.image_url).then(setImg);
  }, [p.image_url]);

  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className="group block surface-paper rounded-[2rem] overflow-hidden shadow-soft hover:shadow-pop transition-shadow"
    >
      <div className="relative aspect-square overflow-hidden p-4">
        <div className="absolute inset-6 wash-blush -z-0" />
        {img ? (
          <img src={img} alt={p.name} loading="lazy" className="paint relative z-10 h-full w-full object-contain group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div className="relative z-10 h-full w-full grid place-items-center font-display text-3xl text-primary/40">
            {p.name.split(" ")[0]}
          </div>
        )}
        {p.badge && (
          <span className="absolute top-3 left-3 z-20 font-accent text-lg leading-none bg-mustard/80 text-forest rounded-full px-3 py-1">
            {p.badge}
          </span>
        )}
      </div>
      <div className="p-5 pt-2">
        <div className="text-xs font-medium text-muted-foreground">{p.age_group}</div>
        <h3 className="mt-1 text-xl">{p.name}</h3>
        <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{p.short}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg text-primary">{formatPrice(p.price_cents)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            View product <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
