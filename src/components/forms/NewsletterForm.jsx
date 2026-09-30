import EnquiryForm from "./EnquiryForm";

const interestOptions = [
  { value: "everything", label: "Everything" },
  { value: "razz", label: "Razz Magazine" },
  { value: "vault", label: "Vault drops and editions" },
  { value: "commissions", label: "Commissions and bookings" },
];

export default function NewsletterForm({ context }) {
  return (
    <EnquiryForm
      kind="newsletter"
      subject="UpsetXociety: newsletter signup"
      submitLabel="Subscribe"
      successMessage="You are on the list. Welcome to the house."
      initialValues={context ? { interest: context } : {}}
      fields={[
        { name: "email", label: "Email address", type: "email", required: true, autoComplete: "email" },
        { name: "interest", label: "I would like to hear about", type: "select", options: interestOptions },
      ]}
    />
  );
}
