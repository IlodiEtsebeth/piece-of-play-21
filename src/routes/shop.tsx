import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Download,
  Gift,
  GraduationCap,
  Layers,
  LayoutGrid,
  Shapes,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { fetchProducts, fetchCategories, resolveSignedUrl, formatPrice, type Product } from "@/lib/products-db";

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
  // Keep the product list in its own component so moving between the
  // shop and a product page never changes the number of React hooks
  // (that was causing the "Something went wrong" page).
  return isChild ? <Outlet /> : <ShopList />;
}

// Soft watercolour colours for the category tiles (they repeat in this order).
const TILE_COLOURS = ["bg-coral/35", "bg-mustard/35", "bg-sage/60", "bg-lilac/50", "bg-blush"];

// Picks a matching icon from the category name. Anything else gets a playful shapes icon.
function iconFor(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (n.includes("flash") || n.includes("card")) return Layers;
  if (n.includes("book")) return BookOpen;
  if (n.includes("bundle") || n.includes("pack")) return Gift;
  if (n.includes("app")) return Smartphone;
  if (n.includes("free")) return Download;
  if (n.includes("grade")) return GraduationCap;
  return Shapes;
}

function ShopList() {
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => fetchProducts({ activeOnly: true }),
  });
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const products = allProducts.filter((p) => !p.is_free);

  // null = show the category tiles, "all" = every product, otherwise a category id
  const [selected, setSelected] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const usedCategoryIds = new Set(products.map((p) => p.category_id).filter(Boolean));
  const activeCategories = categories.filter((c) => usedCategoryIds.has(c.id));
  const showTiles = activeCategories.length > 1;

  const view = showTiles ? selected : "all";
  const filtered = view && view !== "all" ? products.filter((p) => p.category_id === view) : products;
  const currentName =
    view && view !== "all" ? activeCategories.find((c) => c.id === view)?.name ?? "Products" : "All products";

  function choose(id: string | null) {
    setSelected(id);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <AccentBadge tone="coral">Shop</AccentBadge>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Playful Learning Packs</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            Beautifully printable resources for every stage of your child's early learning journey.
          </p>
        </div>
      </section>

      <section ref={topRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16 scroll-mt-20">
        {isLoading && <p className="text-muted-foreground">Loading products…</p>}

        {/* STEP 1: all categories as big colourful tiles */}
        {!isLoading && view === null && (
          <>
            <h2 className="font-display text-2xl sm:text-3xl mb-5 sm:mb-8">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {activeCategories.map((c, i) => {
                const Icon = iconFor(c.name);
                const count = products.filter((p) => p.category_id === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => choose(c.id)}
                    className={`${TILE_COLOURS[i % TILE_COLOURS.length]} text-left rounded-3xl p-4 sm:p-6 min-h-[140px] sm:min-h-[170px] flex flex-col justify-between shadow-soft hover:shadow-pop transition-shadow`}
                  >
                    <span className="grid place-items-center h-12 w-12 rounded-2xl bg-card text-forest">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block font-display text-lg sm:text-xl text-forest leading-tight">{c.name}</span>
                      <span className="block mt-1 text-xs sm:text-sm text-foreground/70">
                        {count} {count === 1 ? "product" : "products"}
                      </span>
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => choose("all")}
                className="bg-forest text-left rounded-3xl p-4 sm:p-6 min-h-[140px] sm:min-h-[170px] flex flex-col justify-between shadow-soft hover:shadow-pop transition-shadow"
              >
                <span className="grid place-items-center h-12 w-12 rounded-2xl bg-background/15 text-background">
                  <LayoutGrid className="h-6 w-6" />
                </span>
                <span className="flex items-center justify-between font-display text-lg sm:text-xl text-background">
                  Shop all <ArrowRight className="h-5 w-5" />
                </span>
              </button>
            </div>
          </>
        )}

        {/* STEP 2: products, 2 per row on phones */}
        {!isLoading && view !== null && (
          <>
            {showTiles && (
              <button
                onClick={() => choose(null)}
                className="inline-flex items-center gap-2 h-11 px-4 rounded-full surface-paper shadow-soft text-sm font-semibold text-forest"
              >
                <ArrowLeft className="h-4 w-4" /> All categories
              </button>
            )}
            <h2 className="mt-5 mb-5 sm:mb-8 font-display text-2xl sm:text-3xl">{currentName}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} compact />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground">No products in this category yet.</p>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

export function ProductCard({ p, compact = false }: { p: Product; compact?: boolean }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    resolveSignedUrl("product-images", p.image_url).then(setImg);
  }, [p.image_url]);

  return (
    <Link
      to="/shop/$slug"
      params={{ slug: p.slug }}
      className={`group flex flex-col surface-paper overflow-hidden shadow-soft hover:shadow-pop transition-shadow ${
        compact ? "rounded-3xl sm:rounded-[2rem]" : "rounded-[2rem]"
      }`}
    >
      <div className={`relative aspect-square overflow-hidden ${compact ? "p-2 sm:p-4" : "p-4"}`}>
        <div className="absolute inset-6 wash-blush -z-0" />
        {img ? (
          <img src={img} alt={p.name} loading="lazy" className="paint relative z-10 h-full w-full object-contain group-hover:scale-[1.03] transition-transform duration-500" />
        ) : (
          <div className="relative z-10 h-full w-full grid place-items-center font-display text-2xl sm:text-3xl text-primary/40">
            {p.name.split(" ")[0]}
          </div>
        )}
        {p.badge && (
          <span
            className={`absolute z-20 font-accent leading-none bg-mustard/80 text-forest rounded-full ${
              compact ? "top-2 left-2 text-base px-2 py-1 sm:top-3 sm:left-3 sm:text-lg sm:px-3" : "top-3 left-3 text-lg px-3 py-1"
            }`}
          >
            {p.badge}
          </span>
        )}
      </div>
      <div className={compact ? "p-3 pt-1 sm:p-5 sm:pt-2 flex flex-col flex-1" : "p-5 pt-2"}>
        <div className="text-xs font-medium text-muted-foreground">{p.age_group}</div>
        <h3 className={compact ? "mt-1 text-base sm:text-xl leading-snug" : "mt-1 text-xl"}>{p.name}</h3>
        <p className={`mt-2 text-sm text-foreground/70 line-clamp-2 ${compact ? "hidden sm:block" : ""}`}>{p.short}</p>
        <div className={`flex items-center justify-between ${compact ? "mt-auto pt-3 sm:pt-4" : "mt-4"}`}>
          <span className="font-display text-lg text-primary">{formatPrice(p.price_cents)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            <span className={compact ? "hidden sm:inline" : ""}>View product</span>
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
