import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageCircle, Sparkles } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { getProduct, products, whatsappLink } from "@/lib/products";

export const Route = createFileRoute("/shop/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — Piece of Play` : "Product — Piece of Play" },
        { name: "description", content: p?.short ?? "" },
        { property: "og:title", content: p?.name ?? "Piece of Play" },
        { property: "og:description", content: p?.short ?? "" },
        { property: "og:type", content: "product" },
      ],
      links: p ? [{ rel: "canonical", href: `/shop/${p.slug}` }] : [],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const message = `Hi Ilodi 😊 I'd like to order this resource: ${product.name}`;
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <SiteLayout>
      <div className="bg-hero-blush">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid lg:grid-cols-2 gap-10 items-start">
          <div className="relative flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-8 wash-mustard -z-10" />
            <img src={product.image} alt={product.name} className="paint w-full h-auto max-w-md" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <AccentBadge tone="sage">{product.ageGroup}</AccentBadge>
              {product.badge && <AccentBadge tone="coral">{product.badge}</AccentBadge>}
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-foreground/75 leading-relaxed">{product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl text-primary">{product.price}</span>
              <span className="text-sm text-muted-foreground">once-off download</span>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              <Panel title="What's Included">
                <ul className="mt-3 space-y-2">
                  {product.included.map((i: string) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Skills Developed">
                <ul className="mt-3 space-y-2">
                  {product.skills.map((s: string) => (
                    <li key={s} className="flex gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-mustard mt-0.5 shrink-0" /> <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        </div>
      </div>

      {product.previewPages > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <AccentBadge tone="lilac">Sneak peek</AccentBadge>
          <h2 className="mt-3 text-3xl">Preview Pages</h2>
          <p className="mt-2 text-foreground/70">A few pages from inside the pack.</p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: Math.min(product.previewPages, 4) }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-card shadow-soft overflow-hidden">
                <img src={product.image} alt={`Preview page ${i + 1}`} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: `${25 * i}% ${25 * i}%` }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Order CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-[2.5rem] bg-sage/50 p-8 sm:p-12 text-center">
          <AccentBadge tone="mustard">Ready to order?</AccentBadge>
          <h2 className="mt-3 text-3xl">Order in one message on WhatsApp</h2>
          <p className="mt-3 text-foreground/75 max-w-lg mx-auto">
            Send me a quick message and I'll pop the pack straight into your inbox after payment.
          </p>
          {product.comingSoon ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-lilac/60 text-forest px-6 py-3.5 font-medium">
              Coming soon — join the waitlist
            </div>
          ) : (
            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-8 py-4 font-semibold text-lg shadow-pop hover:brightness-105 transition"
            >
              <MessageCircle className="h-5 w-5" /> Order on WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-2xl">You might also love</h3>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {related.map((p) => (
            <Link
              key={p.slug}
              to="/shop/$slug"
              params={{ slug: p.slug }}
              className="group block bg-card rounded-3xl overflow-hidden shadow-soft hover:shadow-pop transition-shadow"
            >
              <div className="aspect-square bg-blush overflow-hidden">
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-5">
                <div className="text-xs text-muted-foreground">{p.ageGroup}</div>
                <h4 className="mt-1 text-lg">{p.name}</h4>
                <div className="mt-2 font-display text-primary">{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <div className="font-display text-lg text-primary">{title}</div>
      {children}
    </div>
  );
}
