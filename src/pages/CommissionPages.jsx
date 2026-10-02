import { useParams } from "react-router-dom";
import EntryCard from "../components/cards/EntryCard";
import WorkCard from "../components/cards/WorkCard";
import EnquiryForm from "../components/forms/EnquiryForm";
import CardGrid from "../components/layout/CardGrid";
import { PageIntro } from "../components/layout/PageIntro";
import PageState from "../components/layout/PageState";
import TextLink from "../components/ui/TextLink";
import { getCommissionTypes, getPublishedWorks } from "../lib/queries";
import { normalizeWork } from "../lib/normalise";
import { usePageTitle } from "../lib/resourceState";
import useDirectusResource from "../lib/useDirectusResource";
import "./CorePages.css";
import { recordPath } from "../lib/paths";

// Disciplines from the site plan. Directus commission_types, when the Public
// role can read them, take precedence; descriptions stay local.
const DISCIPLINES = [
  {
    slug: "painting",
    name: "Painting",
    description: "Original paintings made for a person, a place or a project.",
    workCategory: "paintings",
  },
  {
    slug: "3d-modelling",
    name: "3D Modelling",
    description: "Modelled objects, environments and characters for screens, print and installation.",
    workCategory: "3d-modelling",
  },
  {
    slug: "music-performance",
    name: "Music Performance",
    description: "Live sets, performances and bookings for events and spaces.",
    workCategory: "performances",
  },
  {
    slug: "writing",
    name: "Writing",
    description: "Essays, poetry, copy and critical writing.",
  },
  {
    slug: "creative-direction",
    name: "Creative Direction",
    description: "Direction for campaigns, releases, shoots and visual identities.",
  },
  {
    slug: "editorial-collaboration",
    name: "Editorial Collaboration",
    description: "Features, interviews and collaborations with Razz and the wider house.",
  },
];

const identity = (record) => record;

function useDisciplines() {
  const { data, status } = useDirectusResource(getCommissionTypes, [], identity);
  const fromCms = (data || []).filter((type) => type?.slug && type?.name);
  const disciplines = fromCms.length
    ? fromCms.map((type) => ({ ...(DISCIPLINES.find((item) => item.slug === type.slug) || {}), ...type }))
    : DISCIPLINES;
  return { disciplines, loading: status === "loading" };
}

export function CommissionsPage() {
  usePageTitle("Bookings and commissions");
  const { disciplines, loading } = useDisciplines();

  if (loading) return <PageState status="loading" />;

  return (
    <main className="core-page page-content">
      <PageIntro
        eyebrow="Bookings + Commissions"
        title="Work with the house."
        description="Commissions and collaborations are personal and selective. Choose a discipline to see past work and start a brief."
      />
      <div className="core-page__list">
        {disciplines.map((discipline) => (
          <EntryCard
            key={discipline.slug}
            to={recordPath("/commissions", discipline.slug)}
            title={discipline.name}
            excerpt={discipline.description}
            linkLabel="Book a commission"
          />
        ))}
      </div>
    </main>
  );
}

export function CommissionDisciplinePage() {
  const { discipline: slug } = useParams();
  const { disciplines, loading } = useDisciplines();
  const discipline = disciplines.find((item) => item.slug === slug);
  const workCategory = discipline?.workCategory || "";
  const { data: examples } = useDirectusResource(
    ({ signal }) => (workCategory ? getPublishedWorks({ signal, categorySlug: workCategory, limit: 3 }) : Promise.resolve([])),
    [],
    normalizeWork,
    `${slug}:${workCategory}`
  );
  usePageTitle(discipline ? `${discipline.name} commissions` : "Commissions");

  if (loading) return <PageState status="loading" />;

  if (!discipline) {
    return <PageState status="notFound" actionTo="/commissions" actionLabel="See all disciplines" />;
  }

  return (
    <main className="core-page page-content">
      <PageIntro eyebrow="Commissions" title={discipline.name} description={discipline.description} />

      {examples.length > 0 && (
        <section className="core-section" aria-label="Past work">
          <h2>Past work</h2>
          <CardGrid min="220px">
            {examples.map((work) => <WorkCard key={work.slug} {...work} />)}
          </CardGrid>
        </section>
      )}

      <section className="core-section" aria-labelledby="brief-title">
        <h2 id="brief-title">Start a brief</h2>
        <EnquiryForm
          kind="commission"
          subject={`Commission enquiry: ${discipline.name}`}
          submitLabel="Send enquiry"
          successMessage="Thank you. We read every brief and reply personally with next steps."
          initialValues={{ discipline: discipline.name }}
          fields={[
            {
              name: "discipline",
              label: "Discipline",
              type: "select",
              required: true,
              options: disciplines.map((item) => ({ value: item.name, label: item.name })),
            },
            { name: "summary", label: "Project in one sentence", required: true },
            { name: "timeline", label: "Desired timeline", hint: "For example: by March, or flexible." },
            { name: "budget", label: "Budget range", hint: "A rough range is enough, or say if you are not sure yet." },
            { name: "name", label: "Name", required: true, autoComplete: "name" },
            { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
            { name: "message", label: "Anything else", type: "textarea", rows: 5 },
          ]}
        />
      </section>

      <p>
        <TextLink to="/commissions" arrow>
          All disciplines
        </TextLink>
      </p>
    </main>
  );
}
