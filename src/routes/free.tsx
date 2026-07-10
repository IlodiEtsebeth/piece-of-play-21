import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { fetchProducts, resolveSignedUrl, resolveFreeFileUrl, type Product } from "@/lib/products-db";

export const Route = createFileRoute("/free")({
  component: FreePage,
  head: () => ({
    meta: [
      { title: "Free Resources — Piece of Play" },
      {
        name: "description",
        content: "Free printable resources for parents and teachers — download instantly, no sign-up needed.",
      },
    ],
    links: [{ rel: "canonical", href: "/free" }],
  }),
});

function FreePage() {
  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products", "active"],
    queryFn: () => fetchProducts({ activeOnly: true }),
  });
  const resources = allProducts.filter((p) => p.is_free);

  return (
    <SiteLayout>
      <section className="bg-hero-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <AccentBadge tone="mustard">Free Resources</AccentBadge>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Free for you to download</h1>
          <p className="mt-4 text-foreground/70 max-w-xl mx-auto">
            A few printable resources, free of charge — download instantly, no email needed.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {isLoading && <p className="text-muted-foreground">Loading resources…</p>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <FreeResourceCard key={r.id} r={r} />
          ))}
        </div>
        {!isLoading && resources.length === 0 && (
          <p className="text-center text-muted-foreground">
            No free resources just yet — check back soon.
          </p>
        )}
      </section>
    </SiteLayout>
  );
}

function FreeResourceCard({ r }: { r: Product }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    resolveSignedUrl("product-images", r.image_url).then(setImg);
  }, [r.image_url]);
  const fileUrl = resolveFreeFileUrl(r.pdf_url);

  return (
    <div className="group block surface-paper rounded-[2rem] overflow-hidden shadow-soft hover:shadow-pop transition-shadow">
      <div className="relative aspect-square overflow-hidden p-4">
        <div className="absolute inset-6 wash-sage -z-0" />
        {img ? (
          <img
            src={img}
            alt={r.name}
            loading="lazy"
            className="paint relative z-10 h-full w-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="relative z-10 h-full w-full grid place-items-center font-display text-3xl text-primary/40">
            {r.name.split(" ")[0]}
          </div>
        )}
        <span className="absolute top-3 left-3 z-20 font-accent text-lg leading-none bg-sage/80 text-forest rounded-full px-3 py-1">
          FREE
        </span>
      </div>
      <div className="p-5 pt-2">
        <div className="text-xs font-medium text-muted-foreground">{r.age_group}</div>
        <h3 className="mt-1 text-xl">{r.name}</h3>
        <p className="mt-2 text-sm text-foreground/70 line-clamp-2">{r.short}</p>
        {fileUrl ? (
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:opacity-90 transition"
          >
            <Download className="h-4 w-4" /> Download now
          </a>
        ) : (
          <span className="mt-4 block text-center text-sm text-muted-foreground">Coming soon</span>
        )}
      </div>
    </div>
  );
}
