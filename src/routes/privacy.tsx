import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection, PolicyList, EmailLink } from "@/components/policy-page";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Piece of Play" },
      { name: "description", content: "How Piece of Play collects, uses and protects your personal information under POPIA." },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

function PrivacyPage() {
  return (
    <PolicyPage
      badge="Your information"
      title="Privacy Policy"
      intro="Piece of Play respects your privacy and protects your personal information in line with the Protection of Personal Information Act (POPIA)."
    >
      <PolicySection title="1. Who is responsible">
        <p>
          Ilodi Etsebeth is the Information Officer for Piece of Play. Contact: <EmailLink />, Bloemfontein, Free State.
        </p>
      </PolicySection>

      <PolicySection title="2. What we collect">
        <p>Depending on what you buy or use, we may collect:</p>
        <PolicyList
          ordered
          items={[
            "Your name and email address.",
            "Your payment confirmation from PayFast. We never receive your card details.",
            "In our apps and programmes: your child's or learner's first name and details you choose to add, their progress, and any activity photos you upload.",
          ]}
        />
      </PolicySection>

      <PolicySection title="3. Children's information">
        <p>
          We only collect a child's information with the permission of their parent or guardian, or a teacher acting
          with the school's and parents' permission. We collect only what the app needs to work.
        </p>
      </PolicySection>

      <PolicySection title="4. Why we collect it">
        <p>
          We collect this information to deliver your products, give you access to apps and programmes, show progress,
          answer your questions, and send you information about your purchase. We will only send you marketing emails if
          you agree, and you can unsubscribe at any time.
        </p>
      </PolicySection>

      <PolicySection title="5. How we keep it safe">
        <p>
          Your information is stored securely with trusted service providers, which may store data on servers outside
          South Africa with appropriate protection. Only Piece of Play has access to your account information.
        </p>
      </PolicySection>

      <PolicySection title="6. We never sell your information">
        <p>
          We never sell, rent or share your personal information with anyone for their marketing. We only share it with
          service providers that help us run the website, such as PayFast for payments, and only as needed.
        </p>
      </PolicySection>

      <PolicySection title="7. Your rights">
        <p>You have the right to:</p>
        <PolicyList
          ordered
          items={[
            "Ask what information we hold about you or your child.",
            "Ask us to correct it.",
            "Ask us to delete it.",
            "Object to how we use it.",
          ]}
        />
        <p>
          To make a request, email <EmailLink />. We will respond within 30 days. If you are unhappy with how we handle
          your information, you may complain to the Information Regulator of South Africa (
          <a
            href="https://inforegulator.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            inforegulator.org.za
          </a>
          ).
        </p>
      </PolicySection>

      <PolicySection title="8. Changes">
        <p>We may update this policy from time to time. The date at the top shows the latest version.</p>
      </PolicySection>
    </PolicyPage>
  );
}
