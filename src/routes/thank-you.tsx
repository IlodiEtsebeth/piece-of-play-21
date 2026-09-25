import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : undefined,
  }),
});

type OrderState = "loading" | "pending" | "paid" | "error";

function ThankYouPage() {
  const { order } = Route.useSearch();
  const [state, setState] = useState<OrderState>("loading");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!order) {
      setState("error");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    async function check() {
      attempts += 1;
      const { data, error } = await supabase.functions.invoke("order-download", {
        body: { order_id: order },
      });
      if (cancelled) return;
      if (error || !data) {
        setState("error");
        return;
      }
      if (data.status === "paid" && data.download_url) {
        setDownloadUrl(data.download_url);
        setProductName(data.product_name ?? null);
        setState("paid");
      } else if (data.status === "not_found") {
        setState("error");
        setErrorMsg("We couldn't find that order.");
      } else if (attempts < 20) {
        // PayFast's confirmation can take a few seconds to arrive — keep checking.
        setState("pending");
        setTimeout(check, 3000);
      } else {
        setState("pending");
        setErrorMsg(
          "Still waiting on payment confirmation. If you completed payment, check back in a minute or WhatsApp me the reference.",
        );
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [order]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {state === "loading" || state === "pending" ? (
          <>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <h1 className="mt-6 font-display text-3xl">Confirming your payment…</h1>
            <p className="mt-3 text-foreground/70">This usually takes just a few seconds. Please don't close this page.</p>
            {errorMsg && <p className="mt-4 text-sm text-muted-foreground">{errorMsg}</p>}
          </>
        ) : state === "paid" ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
            <h1 className="mt-6 font-display text-3xl">Payment confirmed! 🎉</h1>
            <p className="mt-3 text-foreground/70">
              Thank you for your order{productName ? ` of "${productName}"` : ""}. Your download is ready below.
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-4 font-semibold shadow-soft hover:opacity-90 transition"
              >
                <Download className="h-5 w-5" /> Download your booklet
              </a>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              This download link is valid for 30 minutes. Save the file somewhere safe once downloaded.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl">Something went wrong</h1>
            <p className="mt-3 text-foreground/70">
              {errorMsg ?? "We couldn't confirm this order. If you were charged, please contact me directly."}
            </p>
          </>
        )}
        <Link to="/shop" className="mt-10 block text-sm text-primary hover:underline">
          Back to shop
        </Link>
      </section>
    </SiteLayout>
  );
}
