import TextLink from "../components/ui/TextLink";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <main className="not-found-page page-content">
      <p className="eyebrow">Archive signal: 404</p>
      <h1>Nothing here yet.</h1>
      <p className="not-found-page__message">
        This address does not lead to a published part of the archive.
      </p>

      <div className="not-found-page__links">
        <TextLink to="/" arrow>
          Return home
        </TextLink>
        <TextLink to="/works" arrow>
          Enter the works archive
        </TextLink>
      </div>
    </main>
  );
}
