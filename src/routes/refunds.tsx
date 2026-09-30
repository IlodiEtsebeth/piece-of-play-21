import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList, EmailLink } from "@/components/policy-page";

export const Route = createFileRoute("/refunds")({
  component: RefundsPage,
  head: () => ({
    meta: [
      { title: "Refund Policy — Piece of Play" },
      { name: "description", content: "When and how you can get a refund on Piece of Play digital products." },
    ],
    links: [{ rel: "canonical", href: "/refunds" }],
  }),
});

function RefundsPage() {
  return (
    <PolicyPage
      badge="Fair and simple"
      title="Refund Policy"
      intro="Our products are digital and delivered instantly, so we usually can't offer a refund once a product has been downloaded or used."
    >
      <PolicySection title="We will always refund you or fix the problem if:">
        <PolicyList
          ordered
          items={[
            "A file or your online access doesn't work and we can't fix it.",
            "You were charged twice for the same order.",
            "You bought the wrong product by mistake and haven't downloaded or opened it yet.",
          ]}
        />
      </PolicySection>

      <PolicySection title="How to ask for a refund">
        <p>
          Email <EmailLink /> within 7 days of your purchase. Please include your name, the product, the date you paid,
          and what went wrong. We will reply within 3 working days.
        </p>
        <p>
          Approved refunds are paid back to your original payment method within 7 working days. Your bank may take a few
          extra days to show the money.
        </p>
      </PolicySection>

      <PolicySection title="Your rights">
        <p>This policy does not affect your rights under South African consumer law.</p>
      </PolicySection>
    </PolicyPage>
  );
}
