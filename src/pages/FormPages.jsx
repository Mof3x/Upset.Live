import { useSearchParams } from "react-router-dom";
import EnquiryForm from "../components/forms/EnquiryForm";
import NewsletterForm from "../components/forms/NewsletterForm";
import { PageIntro } from "../components/layout/PageIntro";
import TextLink from "../components/ui/TextLink";
import { usePageTitle } from "../lib/resourceState";
import "./CorePages.css";

// Matches the contact_type_t enum in the database: general | collaboration | social.
const enquiryTypes = [
  { value: "general", label: "General enquiry" },
  { value: "collaboration", label: "Collaboration or institutional project" },
  { value: "social", label: "Social or press" },
];

export function ContactPage() {
  usePageTitle("Contact");
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get("type");
  const type = enquiryTypes.some((option) => option.value === requestedType) ? requestedType : "";

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Contact"
        title="Bring us a question, idea or proposition."
        description="For general enquiries, collaborations and press. For commissions, start from a discipline."
      />
      <EnquiryForm
        kind="contact"
        subject="UpsetXociety: enquiry"
        initialValues={{ type }}
        fields={[
          { name: "name", label: "Name", required: true, autoComplete: "name" },
          { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
          { name: "type", label: "Enquiry type", type: "select", required: true, options: enquiryTypes },
          { name: "message", label: "Message", type: "textarea", required: true, rows: 7 },
        ]}
      />
      <section className="core-section core-page__prose">
        <TextLink to="/commissions" arrow>
          Bookings and commissions
        </TextLink>
        <TextLink to="/newsletter" arrow>
          Join the newsletter
        </TextLink>
      </section>
    </main>
  );
}

export function NewsletterPage() {
  usePageTitle("Newsletter");
  const [searchParams] = useSearchParams();

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Newsletter"
        title="Stay connected."
        description="News, works, releases and archive updates, occasionally. Early word on Razz issues and Vault editions."
      />
      <NewsletterForm context={searchParams.get("interest") || ""} />
    </main>
  );
}
