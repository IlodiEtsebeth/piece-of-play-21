import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag, Trash2, Lock } from "lucide-react";
import { SiteLayout, AccentBadge } from "@/components/site-layout";
import { QuantityPicker } from "@/components/quantity-picker";
import { DigitalNotice } from "@/components/digital-notice";
import { cart, useCart, type CartItem } from "@/lib/cart";
import { formatPrice, resolveSignedUrl } from "@/lib/products-db";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cart")({
  component: CartPage,
  head: () => ({
    meta: [
      { title: "Your cart — Piece of Play" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CartPage() {
  const { items, count, totalCents } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <AccentBadge tone="sage">Your cart</AccentBadge>
          <h1 className="mt-3 font-display text-4xl">Your cart</h1>
        </div>

        {!mounted ? null : items.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] surface-paper p-10 text-center shadow-soft">
            <ShoppingBag className="mx-auto h-12 w-12 text-primary/60" />
            <p className="mt-4 text-foreground/75">Your cart is empty.</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center rounded-full bg-primary text-primary-foreground px-8 py-3.5 font-semibold shadow-soft hover:opacity-90"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-10 space-y-4">
              {items.map((item) => (
                <CartRow key={item.product_id} item={item} />
              ))}
            </ul>

            <div className="mt-6 flex items-baseline justify-between rounded-[1.5rem] bg-blush/60 px-6 py-4">
              <span className="font-display text-xl">
                Total ({count} {count === 1 ? "item" : "items"})
              </span>
              <span className="font-display text-2xl text-primary">{formatPrice(totalCents)}</span>
            </div>
            <Link to="/shop" className="mt-3 inline-block text-sm text-primary hover:underline">
              ← Keep shopping
            </Link>

            <DigitalNotice className="mt-6" />

            <CheckoutForm items={items} />
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const [img, setImg] = useState<string | null>(null);
  useEffect(() => {
    resolveSignedUrl("product-images", item.image_url).then(setImg);
  }, [item.image_url]);

  return (
    <li className="rounded-[1.5rem] surface-paper p-4 sm:p-5 shadow-soft flex gap-4 items-center">
      <div className="h-20 w-16 shrink-0 rounded-xl bg-blush/50 overflow-hidden flex items-center justify-center">
        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="h-6 w-6 text-primary/50" />}
      </div>
      <div className="min-w-0 flex-1">
        <Link to="/shop/$slug" params={{ slug: item.slug }} className="font-semibold hover:text-primary line-clamp-2">
          {item.name}
        </Link>
        <div className="text-sm text-foreground/60">{formatPrice(item.price_cents)} each</div>
        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <QuantityPicker
            value={item.quantity}
            onChange={(n) => cart.setQuantity(item.product_id, n)}
            label={`Quantity of ${item.name}`}
          />
          <button
            type="button"
            onClick={() => cart.remove(item.product_id)}
            className="inline-flex items-center gap-1 text-sm text-foreground/60 hover:text-destructive"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" /> Remove
          </button>
        </div>
      </div>
      <div className="font-display text-lg text-primary whitespace-nowrap self-start">
        {formatPrice(item.price_cents * item.quantity)}
      </div>
    </li>
  );
}

function CheckoutForm({ items }: { items: CartItem[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("payfast-initiate", {
        body: {
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          site_url: window.location.origin,
        },
      });
      if (fnError || !data || data.error) {
        throw new Error(data?.error ?? fnError?.message ?? "Something went wrong");
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.process_url;
      for (const [key, value] of Object.entries(data.fields as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
      const sigInput = document.createElement("input");
      sigInput.type = "hidden";
      sigInput.name = "signature";
      sigInput.value = data.signature;
      form.appendChild(sigInput);
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Something went wrong"
          ? err.message
          : "Something went wrong, please try again or WhatsApp me.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="mt-10 rounded-[1.75rem] surface-paper p-6 sm:p-8 shadow-soft">
      <h2 className="font-display text-2xl">Your details</h2>
      <p className="mt-1 text-sm text-foreground/70">So we know where your downloads belong.</p>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Name
          <input
            required
            autoComplete="name"
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            maxLength={100}
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          <span>
            Phone or WhatsApp <span className="font-normal text-foreground/60">(optional)</span>
          </span>
          <input
            type="tel"
            autoComplete="tel"
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-semibold shadow-soft hover:opacity-90 transition disabled:opacity-60"
      >
        <Lock className="h-4 w-4" /> {submitting ? "Taking you to PayFast…" : "Pay securely with PayFast"}
      </button>
      <p className="mt-3 text-xs text-foreground/60 text-center">
        By paying, you agree to our{" "}
        <Link to="/terms" className="underline underline-offset-2 hover:text-primary">
          Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link to="/refunds" className="underline underline-offset-2 hover:text-primary">
          Refund Policy
        </Link>
        .
      </p>
      {error && (
        <p className="mt-3 text-sm text-destructive text-center" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
