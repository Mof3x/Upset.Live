import ContentState from "../ui/ContentState";

// Full-page loading / closed / error / notFound state inside the page layout.
export default function PageState({ status, className = "core-page", ...props }) {
  return (
    <main className={`${className} page-content`}>
      <ContentState status={status} {...props} />
    </main>
  );
}
