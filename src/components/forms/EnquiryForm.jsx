import { useState } from "react";
import { contactEmail, hasFormsEndpoint, submitForm, validateEnquiry } from "../../lib/forms";
import "./EnquiryForm.css";

// Config-driven enquiry form used by Contact, Commissions and Vault requests.
// fields: [{ name, label, type: "text" | "email" | "textarea" | "select", options, required, autoComplete, hint }]
export default function EnquiryForm({
  kind,
  fields,
  initialValues = {},
  subject,
  submitLabel = "Send enquiry",
  successMessage = "Thank you. We reply personally, usually within a few days.",
}) {
  const [values, setValues] = useState(() => ({
    ...Object.fromEntries(fields.map((field) => [field.name, ""])),
    ...initialValues,
    company: "",
  }));
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: "idle", message: "", href: "" });

  const required = fields.filter((field) => field.required).map((field) => field.name);

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (state.status === "sending") return;

    const nextErrors = validateEnquiry(values, required);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setState({ status: "invalid", message: "Please check the highlighted fields.", href: "" });
      return;
    }

    setState({ status: "sending", message: "", href: "" });

    try {
      const summaryLines = fields.map((field) => {
        const value = String(values[field.name] || "").trim();
        return value ? `${field.label}: ${value}` : "";
      });
      const result = await submitForm(kind, values, { subject, summaryLines });

      if (result.mode === "mailto") {
        setState({ status: "mailto", message: "", href: result.href });
        window.location.href = result.href;
      } else {
        setState({ status: "sent", message: successMessage, href: "" });
      }
    } catch (error) {
      setState({
        status: "failed",
        message: `${error.message} You can also write to ${contactEmail}.`,
        href: "",
      });
    }
  }

  return (
    <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
      {fields.map((field) => {
        const id = `${kind}-${field.name}`;
        const error = errors[field.name];
        const describedBy = [error ? `${id}-error` : "", field.hint ? `${id}-hint` : ""].filter(Boolean).join(" ") || undefined;
        const common = {
          id,
          name: field.name,
          value: values[field.name],
          onChange: update,
          required: field.required,
          "aria-invalid": Boolean(error),
          "aria-describedby": describedBy,
          autoComplete: field.autoComplete,
        };

        return (
          <div className="enquiry-form__field" key={field.name}>
            <label htmlFor={id}>
              {field.label}
              {field.required && <span aria-hidden="true"> *</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea rows={field.rows || 6} {...common} />
            ) : field.type === "select" ? (
              <select {...common}>
                <option value="">Choose one</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input type={field.type || "text"} {...common} />
            )}
            {field.hint && (
              <p className="enquiry-form__hint" id={`${id}-hint`}>
                {field.hint}
              </p>
            )}
            {error && (
              <p className="enquiry-form__error" id={`${id}-error`}>
                {error}
              </p>
            )}
          </div>
        );
      })}

      <div className="enquiry-form__trap" aria-hidden="true">
        <label htmlFor={`${kind}-company`}>Company</label>
        <input id={`${kind}-company`} name="company" tabIndex={-1} autoComplete="off" value={values.company} onChange={update} />
      </div>

      <button type="submit" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Sending…" : submitLabel}
      </button>

      {!hasFormsEndpoint && state.status === "idle" && (
        <p className="enquiry-form__hint">
          Sending opens your email app with this enquiry filled in, addressed to {contactEmail}.
        </p>
      )}

      <div role="status" aria-live="polite" className="enquiry-form__status">
        {state.status === "mailto" && (
          <p>
            Your email app should have opened with the enquiry ready to send. If it did not,{" "}
            <a href={state.href}>open it here</a> or write to {contactEmail}.
          </p>
        )}
        {(state.status === "sent" || state.status === "invalid" || state.status === "failed") && (
          <p className={state.status === "sent" ? "" : "enquiry-form__error"}>{state.message}</p>
        )}
      </div>
    </form>
  );
}
