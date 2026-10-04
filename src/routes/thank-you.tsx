import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { supabase } from "@/integrations/supabase/client";
import { cart } from "@/lib/cart";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : undefined,
  }),
});

type OrderState = "loading" | "pending" | "paid" | "error";
type DownloadItem = { product_name: string; quantity?: number; download_url: string | null; error?: string };

function ThankYouPage() {
  const { order } = Route.useSearch();
  const [state, setState] = useState<OrderState>("loading");
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
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
      if (data.status === "paid") {
        const items: DownloadItem[] = Array.isArray(data.items)
          ? data.items
          : [{ product_name: data.product_name ?? "Your booklet", download_url: data.download_url ?? null }];
        setDownloads(items);
        setState("paid");
        cart.clear();
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
              Thank you for your order! Your {downloads.length === 1 ? "download is" : "downloads are"} ready below.
            </p>
            <ul className="mt-8 space-y-3 text-left">
              {downloads.map((d, i) => (
                <li
                  key={i}
                  className="rounded-[1.5rem] surface-paper p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
                >
                  <span className="font-semibold">
                    {d.product_name}
                    {d.quantity && d.quantity > 1 ? (
                      <span className="font-normal text-foreground/60"> ({d.quantity} licences)</span>
                    ) : null}
                  </span>
                  {d.download_url ? (
                    <a
                      href={d.download_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 font-semibold shadow-soft hover:opacity-90 transition whitespace-nowrap"
                    >
                      <Download className="h-5 w-5" /> Download
                    </a>
                  ) : (
                    <span className="text-sm text-foreground/70">
                      This file isn't ready yet. Please WhatsApp or email me and I'll send it to you.
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Please save each file on your device once downloaded. Tip: bookmark this page, as you can come back to it any time to download your files again. If you lose it, just WhatsApp or email me.
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
