import TextLink from "./TextLink";
import "./ContentState.css";

const stateCopy = {
  loading: {
    title: "Loading the archive",
    message: "The next record is coming into focus.",
  },
  error: {
    title: "The archive is unavailable",
    message: "Something went wrong while retrieving this content.",
  },
  empty: {
    title: "Nothing has been published here yet",
    message: "Check back when the next record enters the archive.",
  },
  notFound: {
    title: "Record not found",
    message: "This record may have moved or is not published yet.",
  },
};

export default function ContentState({
  status,
  title,
  message,
  actionTo,
  actionLabel,
}) {
  const copy = stateCopy[status] || stateCopy.error;
  const isError = status === "error";

  return (
    <section
      className={`content-state content-state--${status}`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      <p className="content-state__status">{status}</p>
      <h2>{title || copy.title}</h2>
      <p>{message || copy.message}</p>
      {actionTo && actionLabel && (
        <TextLink to={actionTo} arrow>
          {actionLabel}
        </TextLink>
      )}
    </section>
  );
}
