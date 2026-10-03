// Given a paid order, returns short-lived signed download links for
// every booklet in it. Runs with the service role so it can reach the
// private product-pdfs bucket, but only ever does so for orders
// already marked "paid" by the payfast-itn function.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (typeof order_id !== "string" || !UUID_RE.test(order_id)) {
      return json({ status: "not_found" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, product_id, product_name")
      .eq("id", order_id)
      .maybeSingle();

    if (!order) return json({ status: "not_found" });
    if (order.status !== "paid") return json({ status: "pending" });

    // Cart orders list their booklets in order_items; older single-product
    // orders only have orders.product_id.
    const { data: lines } = await supabase
      .from("order_items")
      .select("product_id, product_name, quantity")
      .eq("order_id", order.id);

    const wanted =
      lines && lines.length > 0
        ? lines
        : order.product_id
          ? [{ product_id: order.product_id, product_name: order.product_name, quantity: 1 }]
          : [];

    const ids = wanted.map((l) => l.product_id).filter(Boolean) as string[];
    const { data: products } = ids.length
      ? await supabase.from("products").select("id, name, pdf_url").in("id", ids)
      : { data: [] as { id: string; name: string; pdf_url: string | null }[] };

    const downloads = await Promise.all(
      wanted.map(async (l) => {
        const p = products?.find((x) => x.id === l.product_id);
        const name = l.product_name ?? p?.name ?? "Your booklet";
        if (!p?.pdf_url) return { product_name: name, quantity: l.quantity, download_url: null, error: "File not attached yet" };
        if (p.pdf_url.startsWith("http")) return { product_name: name, quantity: l.quantity, download_url: p.pdf_url };
        const { data: signed } = await supabase.storage.from("product-pdfs").createSignedUrl(p.pdf_url, 60 * 30);
        return signed
          ? { product_name: name, quantity: l.quantity, download_url: signed.signedUrl }
          : { product_name: name, quantity: l.quantity, download_url: null, error: "Could not create link" };
      }),
    );

    return json({
      status: "paid",
      items: downloads,
      // Kept for older thank-you pages that expect a single link.
      download_url: downloads[0]?.download_url ?? null,
      product_name: order.product_name,
    });
  } catch (e) {
    console.error("order-download error:", e);
    return json({ error: "Something went wrong" }, 500);
  }
});
