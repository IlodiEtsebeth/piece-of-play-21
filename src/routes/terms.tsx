import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList, EmailLink } from "@/components/policy-page";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms and Conditions — Piece of Play" },
      { name: "description", content: "The terms that apply when you buy or use Piece of Play educational resources." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
});

function TermsPage() {
  return (
    <PolicyPage badge="The fine print" title="Terms and Conditions">
      <PolicySection title="1. About Piece of Play">
        <p>
          Piece of Play is run by Ilodi Etsebeth, a sole trader based in Bloemfontein, Free State, South Africa. You can
          contact us at <EmailLink />. Piece of Play is not VAT-registered, so no VAT is charged.
        </p>
        <p>By buying from or using this website, you agree to these terms.</p>
      </PolicySection>

      <PolicySection title="2. Our products">
        <p>
          Piece of Play sells educational products for parents, teachers, remedial teachers and LSEN teachers. We do not
          sell services such as consultations, assessments or training on this website.
        </p>
      </PolicySection>

      <PolicySection title="3. Prices and payment">
        <p>
          All prices are in South African rand (R). Payments are processed securely through PayFast. We never see or
          store your card details.
        </p>
      </PolicySection>

      <PolicySection title="4. Digital downloads">
        <p>
          Digital products, such as PDF booklets and printables, are delivered straight after payment by download link,
          email, or both. If you haven't received your product within 2 hours, please check your spam folder and then
          email us.
        </p>
      </PolicySection>

      <PolicySection title="5. Online access (apps and programmes)">
        <p>
          Some products give you online access to an app or programme. Access lasts for the length stated on the product
          page. For example, a 12-week programme gives you access for the full programme, at your own pace. We may offer
          free trials, and each trial's length will be stated clearly. If we ever need to close an app or programme, we
          will give you reasonable notice by email first.
        </p>
      </PolicySection>

      <PolicySection title="6. Your licence">
        <p>
          When you buy a product, you receive one licence for one person. You may use the product with your own
          children or learners, and print copies for that use.
        </p>
        <p>You may not:</p>
        <PolicyList
          ordered
          items={[
            "Share the files or your login with colleagues, friends or other parents.",
            "Upload the files to any website, shared drive, group or platform.",
            "Sell, copy for others, or claim the resources as your own.",
          ]}
        />
        <p>
          Schools buy one licence per teacher who will use the product. Schools that need a quote or invoice before
          paying can email us. Free resources fall under the same licence.
        </p>
        <p>All content remains the property of Piece of Play.</p>
      </PolicySection>

      <PolicySection title="7. Educational disclaimer">
        <p>
          Our resources support children's learning and development. They are not a diagnosis, therapy or formal
          assessment, and they do not replace advice from a qualified professional such as a doctor, psychologist,
          occupational therapist or speech therapist. If you have concerns about a child's development, please speak to
          a professional.
        </p>
      </PolicySection>

      <PolicySection title="8. Limit of liability">
        <p>
          We work hard to make sure our products are accurate and useful. However, Piece of Play is not responsible for
          any loss or damage arising from the use of our products, except where the law does not allow this limit. Our
          total liability for any product is limited to the price you paid for it.
        </p>
      </PolicySection>

      <PolicySection title="9. Changes to these terms">
        <p>
          We may update these terms from time to time. The date at the top shows when they were last changed. The terms
          that apply to your purchase are the ones in place when you bought.
        </p>
      </PolicySection>

      <PolicySection title="10. Governing law">
        <p>These terms are governed by the laws of the Republic of South Africa.</p>
      </PolicySection>
    </PolicyPage>
  );
}
