// Receives PayFast's Instant Transaction Notification (ITN).
// Verifies the signature, confirms with PayFast directly, then marks
// the matching order as paid. PayFast requires a fast 200 response.
import { createClient } from "npm:@supabase/supabase-js@2";
import md5 from "npm:md5@2.3.0";

Deno.serve(async (req) => {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const data: Record<string, string> = {};
    for (const [k, v] of params.entries()) data[k] = v;

    const receivedSignature = data["signature"];
    const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "jt7NOE43FZPn";
    const mode = Deno.env.get("PAYFAST_MODE") ?? "sandbox";

    // Rebuild the signature string in the exact order PayFast sent it, minus signature itself.
    const withoutSignature = bodyText
      .split("&")
      .filter((pair) => !pair.startsWith("signature="))
      .join("&");
    const withPassphrase = passphrase
      ? `${withoutSignature}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
      : withoutSignature;
    const expectedSignature = md5(withPassphrase);

    if (expectedSignature !== receivedSignature) {
      console.error("PayFast ITN signature mismatch");
      return new Response("invalid signature", { status: 400 });
    }

    // Confirm directly with PayFast that this data is genuine (not spoofed).
    const validateUrl =
      mode === "live"
        ? "https://www.payfast.co.za/eng/query/validate"
        : "https://sandbox.payfast.co.za/eng/query/validate";
    const validateRes = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyText,
    });
    const validateText = (await validateRes.text()).trim();
    if (validateText !== "VALID") {
      console.error("PayFast ITN validate failed:", validateText);
      return new Response("not valid", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const orderId = data["m_payment_id"];
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) {
      console.error("PayFast ITN: order not found", orderId);
      return new Response("order not found", { status: 404 });
    }

    const grossCents = Math.round(parseFloat(data["amount_gross"] ?? "0") * 100);
    if (Math.abs(grossCents - order.amount_cents) > 1) {
      console.error("PayFast ITN: amount mismatch", grossCents, order.amount_cents);
      return new Response("amount mismatch", { status: 400 });
    }

    if (data["payment_status"] === "COMPLETE" && order.status !== "paid") {
      await supabase
        .from("orders")
        .update({ status: "paid", paid_at: new Date().toISOString(), pf_payment_id: data["pf_payment_id"] ?? null })
        .eq("id", orderId);
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("PayFast ITN error:", e);
    return new Response("error", { status: 500 });
  }
});
