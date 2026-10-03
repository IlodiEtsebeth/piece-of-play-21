import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Sparkles, ShoppingBag } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { fetchProductBySlug, resolveSignedUrl, resolvePreviewUrls, formatPrice, type Product } from "@/lib/products-db";
import { cart } from "@/lib/cart";
import { QuantityPicker } from "@/components/quantity-picker";
import { DigitalNotice } from "@/components/digital-notice";

export const Route = createFileRoute("/shop/$slug")({
  component: ProductPage,
  head: ({ params }) => ({
    meta: [
      { title: `Product — Piece of Play` },
      { name: "description", content: `Details for ${params?.slug ?? "product"}` },
    ],
  }),
});

function AddToCartBox({ product }: { product: Product }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    cart.add(
      {
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        price_cents: product.price_cents,
        image_url: product.image_url,
      },
      quantity,
    );
  }

  return (
    <>
      <AccentBadge tone="mustard">Ready to order?</AccentBadge>
      <h2 className="mt-3 text-3xl">Add to your cart</h2>
      <p className="mt-3 text-foreground/75 max-w-lg mx-auto">
        Add this booklet to your cart, or buy it now. You pay once for everything in your cart, and your downloads unlock
        straight after payment.
      </p>
      <div className="mt-7 flex flex-col items-center gap-2">
        <QuantityPicker value={quantity} onChange={setQuantity} />
        <p className="text-xs text-foreground/60">Buying for a school? Choose one licence per teacher.</p>
      </div>
      <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            addToCart();
            setAdded(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary text-primary px-8 py-3 font-semibold hover:bg-blush transition whitespace-nowrap"
        >
          <ShoppingBag className="h-5 w-5" /> Add to cart
        </button>
        <button
          type="button"
          onClick={() => {
            addToCart();
            navigate({ to: "/cart" });
          }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 font-semibold shadow-soft hover:opacity-90 transition whitespace-nowrap"
        >
          Buy now
        </button>
      </div>
      {added && (
        <p className="mt-4 text-sm text-primary" role="status">
          <Check className="inline h-4 w-4 -mt-0.5" /> Added to your cart.{" "}
          <Link to="/cart" className="underline underline-offset-2 font-semibold">
            View cart
          </Link>{" "}
          or{" "}
          <Link to="/shop" className="underline underline-offset-2">
            keep shopping
          </Link>
          .
        </p>
      )}
      <DigitalNotice className="mt-8 max-w-lg mx-auto text-left sm:text-center" />
    </>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const p = await fetchProductBySlug(slug);
      if (!p) throw notFound();
      return p;
    },
  });

  const [img, setImg] = useState<string | null>(null);
  const previewUrls = product ? resolvePreviewUrls(product.preview_images) : [];
  useEffect(() => {
    if (!product) return;
    resolveSignedUrl("product-images", product.image_url).then(setImg);
  }, [product]);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }
  if (!product) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl">Product not found</h1>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </div>
      </SiteLayout>
    );
  }

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
            {img ? (
              <img src={img} alt={product.name} className="paint w-full h-auto max-w-md" />
            ) : (
              <div className="w-full max-w-md aspect-square grid place-items-center font-display text-5xl text-primary/40">
                {product.name.split(" ")[0]}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {product.age_group && <AccentBadge tone="sage">{product.age_group}</AccentBadge>}
              {product.badge && <AccentBadge tone="coral">{product.badge}</AccentBadge>}
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-foreground/75 leading-relaxed">{product.description}</p>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl text-primary">{formatPrice(product.price_cents)}</span>
              <span className="text-sm text-muted-foreground">once-off download</span>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-6">
              {product.included.length > 0 && (
                <Panel title="What's Included">
                  <ul className="mt-3 space-y-2">
                    {product.included.map((i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /> <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
              {product.skills.length > 0 && (
                <Panel title="Skills Developed">
                  <ul className="mt-3 space-y-2">
                    {product.skills.map((s) => (
                      <li key={s} className="flex gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-mustard mt-0.5 shrink-0" /> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4">
          <h2 className="text-2xl text-center">A peek inside</h2>
          <p className="mt-2 text-center text-foreground/70">
            A few sample pages from {product.name}
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previewUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Sample page ${i + 1} from ${product.name}`}
                className="w-full h-auto rounded-2xl border border-border/60 shadow-soft"
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-[2.5rem] surface-paper p-8 sm:p-12 text-center shadow-soft">
          {product.coming_soon ? (
            <>
              <AccentBadge tone="mustard">Ready to order?</AccentBadge>
              <h2 className="mt-3 text-3xl">Coming soon</h2>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-lilac/60 text-forest px-6 py-3.5 font-medium">
                Coming soon — join the waitlist
              </div>
            </>
          ) : product.is_free ? (
            <>
              <AccentBadge tone="mustard">Free resource</AccentBadge>
              <h2 className="mt-3 text-3xl">This one is free!</h2>
              <Link
                to="/free"
                className="mt-6 inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 font-semibold shadow-soft hover:opacity-90"
              >
                Go to Free Resources
              </Link>
            </>
          ) : (
            <AddToCartBox product={product} />
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] surface-paper p-5 shadow-soft">
      <div className="font-display text-lg text-primary">{title}</div>
      {children}
    </div>
  );
}
