// Starts a PayFast payment for a cart: re-reads every price from the
// database, creates a pending order plus its order_items, builds a
// signed PayFast field set, and returns everything the browser needs
// to auto-submit a POST straight to PayFast's payment page.
//
// Accepts { items: [{ product_id, quantity }], name, email, phone?, site_url }.
// The older single-product shape { product_id, email, site_url } still works.
import { createClient } from "npm:@supabase/supabase-js@2";
import md5 from "npm:md5@2.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MAX_QTY = 50;
const MAX_LINES = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 100) : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 20) : "";
    const site_url = typeof body.site_url === "string" ? body.site_url.replace(/\/+$/, "") : "";

    // Normalise the cart: merge duplicates, clamp quantities.
    const rawItems: { product_id?: unknown; quantity?: unknown }[] = Array.isArray(body.items)
      ? body.items
      : body.product_id
        ? [{ product_id: body.product_id, quantity: 1 }]
        : [];
    const qtyById = new Map<string, number>();
    for (const it of rawItems.slice(0, MAX_LINES)) {
      if (typeof it?.product_id !== "string") continue;
      const q = Math.max(1, Math.min(MAX_QTY, Math.floor(Number(it.quantity)) || 1));
      qtyById.set(it.product_id, Math.min(MAX_QTY, (qtyById.get(it.product_id) ?? 0) + q));
    }

    if (!EMAIL_RE.test(email) || !site_url || qtyById.size === 0) {
      return json({ error: "Please add something to your cart and enter a valid email address." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: products, error: productErr } = await supabase
      .from("products")
      .select("id, name, price_cents, active, is_free, coming_soon")
      .in("id", [...qtyById.keys()]);

    if (productErr || !products) {
      return json({ error: "Could not load your cart. Please try again." }, 500);
    }

    const unavailable = [...qtyById.keys()].filter((id) => {
      const p = products.find((x) => x.id === id);
      return !p || !p.active || p.is_free || p.coming_soon || p.price_cents <= 0;
    });
    if (unavailable.length > 0) {
      return json(
        { error: "One of the booklets in your cart is no longer available. Please remove it and try again." },
        400,
      );
    }

    const lines = products.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      quantity: qtyById.get(p.id)!,
      unit_price_cents: p.price_cents,
    }));
    const totalCents = lines.reduce((n, l) => n + l.unit_price_cents * l.quantity, 0);
    const itemCount = lines.reduce((n, l) => n + l.quantity, 0);
    const summary =
      lines.length === 1 && lines[0].quantity === 1
        ? lines[0].product_name
        : lines.length === 1
          ? `${lines[0].product_name} x${lines[0].quantity}`
          : `Piece of Play order (${itemCount} items)`;

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_id: lines.length === 1 ? lines[0].product_id : null,
        product_name: summary,
        email,
        customer_name: name || null,
        phone: phone || null,
        amount_cents: totalCents,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("payfast-initiate: order insert failed", orderErr);
      return json({ error: "Could not create your order. Please try again." }, 500);
    }

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(lines.map((l) => ({ ...l, order_id: order.id })));
    if (itemsErr) {
      console.error("payfast-initiate: order_items insert failed", itemsErr);
      await supabase.from("orders").delete().eq("id", order.id);
      return json({ error: "Could not create your order. Please try again." }, 500);
    }

    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID") ?? "10000100";
    const merchantKey = Deno.env.get("PAYFAST_MERCHANT_KEY") ?? "46f0cd694581a";
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "jt7NOE43FZPn";
    const mode = Deno.env.get("PAYFAST_MODE") ?? "sandbox";
    const processUrl =
      mode === "live" ? "https://www.payfast.co.za/eng/process" : "https://sandbox.payfast.co.za/eng/process";

    const projectUrl = Deno.env.get("SUPABASE_URL")!;
    const projectRef = new URL(projectUrl).hostname.split(".")[0];
    const notifyUrl = `https://${projectRef}.supabase.co/functions/v1/payfast-itn`;

    const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
    const lastName = rest.join(" ");

    // Field order matters for PayFast's signature — keep PayFast's documented order.
    const fields: [string, string][] = [
      ["merchant_id", merchantId],
      ["merchant_key", merchantKey],
      ["return_url", `${site_url}/thank-you?order=${order.id}`],
      ["cancel_url", `${site_url}/cart`],
      ["notify_url", notifyUrl],
    ];
    if (firstName) fields.push(["name_first", firstName.slice(0, 100)]);
    if (lastName) fields.push(["name_last", lastName.slice(0, 100)]);
    fields.push(
      ["email_address", email],
      ["m_payment_id", order.id],
      ["amount", (totalCents / 100).toFixed(2)],
      ["item_name", summary.slice(0, 100)],
    );

    const pfParamString = fields
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
      .join("&");
    const withPassphrase = passphrase
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
      : pfParamString;
    const signature = md5(withPassphrase);

    return json({
      process_url: processUrl,
      fields: Object.fromEntries(fields),
      signature,
      order_id: order.id,
    });
  } catch (e) {
    console.error("payfast-initiate error:", e);
    return json({ error: "Something went wrong, please try again." }, 500);
  }
});
