// Starts a PayFast payment: creates a pending order, builds a signed
// PayFast field set, and returns everything the browser needs to
// auto-submit a POST straight to PayFast's payment page.
import { createClient } from "npm:@supabase/supabase-js@2";
import md5 from "npm:md5@2.3.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id, email, site_url } = await req.json();
    if (!product_id || !email || !site_url) {
      return new Response(JSON.stringify({ error: "Missing product_id, email or site_url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, name, price_cents, active, is_free")
      .eq("id", product_id)
      .single();

    if (productErr || !product || !product.active || product.is_free) {
      return new Response(JSON.stringify({ error: "Product not available for purchase" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        product_id: product.id,
        product_name: product.name,
        email,
        amount_cents: product.price_cents,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Could not create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    // Field order matters for PayFast's signature — do not alphabetize.
    const fields: [string, string][] = [
      ["merchant_id", merchantId],
      ["merchant_key", merchantKey],
      ["return_url", `${site_url}/thank-you?order=${order.id}`],
      ["cancel_url", `${site_url}/shop/`],
      ["notify_url", notifyUrl],
      ["email_address", email],
      ["m_payment_id", order.id],
      ["amount", (product.price_cents / 100).toFixed(2)],
      ["item_name", product.name],
    ];

    const pfParamString = fields
      .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, "+")}`)
      .join("&");
    const withPassphrase = passphrase
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
      : pfParamString;
    const signature = md5(withPassphrase);

    return new Response(
      JSON.stringify({
        process_url: processUrl,
        fields: Object.fromEntries(fields),
        signature,
        order_id: order.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
