[Open Innovation Grant | Directus](https://directus.com/oig?utm_source=self_hosted&utm_medium=product&utm_campaign=2026_05_licensing&utm_term=12.1.1&utm_content=status_notice_open_innovation_grant_link)


# THE COMPLETE DIRECTUS SCHEMA — EXPLAINED LIKE A SYSTEM ARCHITECT
grouped by **content domain**, matching your sitemap.

# 🎨 1. ARTISTS

**What this table represents:**  
Every artist associated with the collective — including core members (Gor, Kanyin, Mofe, Q, Mbana, Rae, Demi) and guest/external artists.

**Why it exists:**  
Artists appear everywhere:

- About → Artists
- Works → Artist pages
- Texts → Author pages
- Vault → Artist-linked items
- Commissions → Artist selection
- Razz Magazine → Contributors

**Key fields (conceptually):**

- **name** — the artist’s public name
- **slug** — URL identifier
- **bio** — long-form biography
- **portrait** — profile image
- **is_collective_member** — _critical flag_ for vault logic
- **social links** — Instagram, website
- **order / featured** — for homepage or About page curation

**Relationships:**

- An artist can have **many works**
- An artist can have **many texts** (as author)
- An artist can be linked to **many vault items**
- An artist can appear in **commissions**

**Wireframe mapping:**

- Artist profile pages
- Artist rail on Work pages
- About → Artists list

---

# 🖼️ 2. WORKS

**What this table represents:**  
Every artwork, music release, performance, or creative output.

**Why it exists:**  
This powers the entire “Works” section of your site.

**Key fields:**

- **title, slug** — for routing
- **artists** — many-to-many (collaborations allowed)
- **category** — hierarchical (Paintings, 3D Modelling, Releases, Performances)
- **year, medium, dimensions** — metadata
- **description** — long-form text
- **thumbnail** — used in grids
- **images** — gallery
- **status** — available / sold / archived
- **price** — optional
- **featured** — homepage or section highlights

**Relationships:**

- Many artists → many works
- Many works → many related works
- Many works → many related texts

**Wireframe mapping:**

- Works index page
- Work detail page
- Related works rail
- Artist pages → list of works

---

# 🗂️ 3. WORK CATEGORIES (self‑relational)

**What this table represents:**  
Your entire Works navigation tree.

**Why it exists:**  
Your sitemap has nested categories:

```
Works
├── Visual Arts
│   ├── Paintings
│   └── 3D Modelling
└── Music
    ├── Releases
    └── Performances
```

**Key fields:**

- **name**
- **slug**
- **parent_category** — allows nesting

**Wireframe mapping:**

- Works navigation
- Category landing pages
- Filtering

---

# ✍️ 4. TEXTS

**What this table represents:**  
All editorial writing:

- Poetry
- Essays
- Journalism

**Why it exists:**  
This powers the “Texts” section.

**Key fields:**

- **title, slug**
- **authors** — many-to-many (multiple writers allowed)
- **category** — Poetry / Essays / Journalism
- **body** — long-form writing
- **cover image**
- **published date**
- **featured**

**Relationships:**

- Many authors → many texts
- Many texts → many related works

**Wireframe mapping:**

- Texts index
- Text detail page
- Related works rail

---

# 🗂️ 5. TEXT CATEGORIES

**What this table represents:**  
Your three editorial categories.

**Why it exists:**  
To group texts cleanly.

**Categories:**

- Poetry + Short Stories
- Essays + Manifestos
- Journalism + Advocacy

---

# 📓 6. JOURNAL

**What this table represents:**  
Your internal editorial stream:

- Process
- Reflections
- Notes
- Updates

**Why it exists:**  
This is your “living archive” section.

**Key fields:**

- **title, slug**
- **category**
- **body**
- **cover image**
- **tags**
- **published date**
- **featured**

---

# 🗂️ 7. JOURNAL CATEGORIES

**What this table represents:**  
Your four journal categories.

**Categories:**

- Process
- Reflections
- Notes
- Updates

---

# 📰 8. RAZZ MAGAZINE

This is a **mini CMS** inside your CMS.

### **Razz Issues**

Represents each magazine issue.

Fields:

- title
- slug
- issue number
- cover image
- release date
- description

### **Razz Features**

Represents individual articles inside issues.

Fields:

- title
- slug
- body
- images
- issue (relation)

### **Razz Contributors**

Represents writers, photographers, designers.

Fields:

- name
- slug
- bio
- portrait

**Relationships:**

- Features → many contributors
- Features → many images
- Issues → many features

**Wireframe mapping:**

- Razz Magazine index
- Issue pages
- Feature pages

---

# 🏛️ 9. VAULT

This is the most complex domain — and the most important.

You now have **two conceptual vaults**:

### **Closed Vault**

- Original works by collective members
- Limited editions by collective members
- Archive objects
- _Strict rule:_ only collective members can be linked

### **Open Vault**

- Prints
- Publications
- Posters
- Apparel
- Music + Digital Releases
- Guest artist works
- _Anyone can be linked_

### **Vault Items**

Represents any object in the vault.

Fields:

- **title, slug**
- **category** (Vault Categories)
- **vault_classification**
    - `closed_collective`
    - `open_public`
- **artists** (many-to-many)
- **images**
- **description**
- **status** (private, archived, available)
- **price**
- **inventory**
- **edition fields**
- **location**
- **notes** (private)

### **Vault Categories**

Your vault taxonomy:

```
Closed Vault
    Original Works (collective)
    Limited Editions (collective)
    Archive Objects

Open Vault
    Prints
    Publications
    Posters
    Apparel
    Music + Digital Releases
    Guest Artist Works
```

### **Vault Provenance**

Optional but powerful:

- acquisition
- previous owners
- exhibition history
- condition report

**Wireframe mapping:**

- Vault index
- Vault item detail
- Category pages
- Artist pages → vault items

---

# 🎟️ 10. COMMISSIONS + BOOKINGS

Represents incoming requests for creative work.

### **Commission Requests**

Fields:

- name
- email
- message
- type (Painting, 3D Modelling, etc.)
- artists (optional)
- works (optional)
- status (new, in progress, completed)

### **Commission Types**

Your six commission categories.

---

# ✉️ 11. CONTACT MESSAGES

Represents messages from the Contact page.

Fields:

- name
- email
- message
- type (general, collaboration, socials)

---

# 📨 12. NEWSLETTER SIGNUPS

Simple email capture.

---

# ⚙️ 13. SITE SETTINGS

Global content for your site.

Fields:

- site title
- tagline
- footer statement
- social links
- homepage featured works
- homepage featured texts
- homepage featured artists

---

# 🧭 14. NAVIGATION ITEMS

Optional dynamic navigation system.

Fields:

- label
- slug
- url
- parent (for nested nav)
- location (top or footer)
- order

---

# ⭐ DOES THIS MATCH YOUR SITE PLAN?

Let’s check:

### **Home**

→ Site Settings (featured items)

### **About**

→ Artists table

### **Works**

→ Works + Work Categories

### **Texts**

→ Texts + Text Categories

### **Journal**

→ Journal + Journal Categories

### **Razz Magazine**

→ Razz Issues + Features + Contributors

### **Vault**

→ Vault Items + Vault Categories + Vault Classification

### **Bookings + Commissions**

→ Commission Requests + Commission Types

### **Newsletter**

→ Newsletter Signups

### **Contact**

→ Contact Messages

w the db matches wireframes
- Every page type has a corresponding table
- Every rail (related works, related texts, artist rail) is supported
- Every detail page has the fields it needs
- Every index page has categories and filters
- The Vault logic is enforced at the database level
- Multi-artist and multi-author support is built in
- Razz Magazine is fully structured
- Homepage content is controlled via Site Settings

# possible next steps

-  visual ERD diagram (entity relationship diagram)
- A simplified “editor’s guide” for how content flows through the CMS
- A mapping of each wireframe to the exact fields it uses


### Final Directus Schema — production ready

Below is the **complete, explicit Directus / Postgres schema** you can run in Supabase (SQL editor) and then import into Directus. It includes:

- **All tables** with columns and Postgres types
- **All join tables** for many‑to‑many relations
- **Enum types, constraints, triggers** (vault classification enforcement)
- **Indexes and uniqueness rules**
- **Directus field mapping** for each collection so the UI is ready

Run the SQL in order. Enable the `pgcrypto`  first:

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

### SQL DDL (run this as a single file)

```sql
-- ENUMS
CREATE TYPE works_status_t AS ENUM ('available','reserved','sold','archived');
CREATE TYPE vault_classification_t AS ENUM ('closed_collective','open_public');
CREATE TYPE vault_status_t AS ENUM ('private','archived','available');
CREATE TYPE commission_status_t AS ENUM ('new','in_progress','completed');
CREATE TYPE contact_type_t AS ENUM ('general','collaboration','social');

-- CORE TABLES
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  portrait_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  year_of_birth INTEGER,
  location TEXT,
  website TEXT,
  instagram TEXT,
  is_collective_member BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE work_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES work_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  year TEXT,
  medium TEXT,
  dimensions TEXT,
  description TEXT,
  thumbnail_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  category_id UUID REFERENCES work_categories(id) ON DELETE SET NULL,
  status works_status_t DEFAULT 'available',
  price NUMERIC(12,2),
  featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE work_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (work_id, file_id)
);

CREATE TABLE work_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (work_id, artist_id)
);

CREATE TABLE works_related (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  related_work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  relation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (work_id, related_work_id)
);

CREATE TABLE text_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES text_categories(id) ON DELETE SET NULL,
  body TEXT,
  cover_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  published_date DATE,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE text_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (text_id, artist_id)
);

CREATE TABLE text_related_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text_id UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  note TEXT,
  UNIQUE (text_id, work_id)
);

CREATE TABLE journal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES journal_categories(id) ON DELETE SET NULL,
  body TEXT,
  cover_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  published_date DATE,
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE razz_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  issue_number TEXT,
  cover_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  release_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE razz_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  portrait_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE razz_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT,
  issue_id UUID REFERENCES razz_issues(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE razz_feature_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES razz_features(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  UNIQUE (feature_id, file_id)
);

CREATE TABLE razz_feature_contributors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES razz_features(id) ON DELETE CASCADE,
  contributor_id UUID NOT NULL REFERENCES razz_contributors(id) ON DELETE CASCADE,
  role TEXT,
  UNIQUE (feature_id, contributor_id)
);

CREATE TABLE vault_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES vault_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE vault_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES vault_categories(id) ON DELETE SET NULL,
  vault_classification vault_classification_t NOT NULL DEFAULT 'open_public',
  description TEXT,
  status vault_status_t DEFAULT 'private',
  price NUMERIC(12,2),
  inventory INTEGER DEFAULT 0,
  edition_number TEXT,
  edition_size INTEGER,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE vault_item_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  caption TEXT,
  UNIQUE (vault_item_id, file_id)
);

CREATE TABLE vault_item_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (vault_item_id, artist_id)
);

CREATE TABLE vault_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_item_id UUID NOT NULL REFERENCES vault_items(id) ON DELETE CASCADE,
  acquired_date DATE,
  acquired_from TEXT,
  previous_owners TEXT[],
  exhibition_history TEXT,
  condition_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE commission_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE commission_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  type_id UUID REFERENCES commission_types(id) ON DELETE SET NULL,
  status commission_status_t DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE commission_request_artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_request_id UUID NOT NULL REFERENCES commission_requests(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  UNIQUE (commission_request_id, artist_id)
);

CREATE TABLE commission_request_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_request_id UUID NOT NULL REFERENCES commission_requests(id) ON DELETE CASCADE,
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  UNIQUE (commission_request_id, work_id)
);

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  message TEXT,
  type contact_type_t DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT,
  tagline TEXT,
  footer_statement TEXT,
  social_instagram TEXT,
  social_youtube TEXT,
  social_bandcamp TEXT,
  social_email TEXT,
  homepage_featured_works UUID[],
  homepage_featured_texts UUID[],
  homepage_featured_artists UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  slug TEXT,
  url TEXT,
  parent_id UUID REFERENCES navigation_items(id) ON DELETE SET NULL,
  location TEXT CHECK (location IN ('top','footer')) DEFAULT 'top',
  "order" INTEGER DEFAULT 0
);

-- INDEXES
CREATE INDEX idx_work_files_work_id ON work_files(work_id);
CREATE INDEX idx_work_artists_work_id ON work_artists(work_id);
CREATE INDEX idx_text_authors_text_id ON text_authors(text_id);
CREATE INDEX idx_vault_item_artists_vault_item_id ON vault_item_artists(vault_item_id);
CREATE INDEX idx_journal_tags ON journal USING GIN (tags);

-- TRIGGERS to keep updated_at current (optional simple trigger)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to tables that have updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;', tbl);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', tbl);
  END LOOP;
END;
$$;

-- VAULT BUSINESS RULE TRIGGERS
CREATE OR REPLACE FUNCTION enforce_closed_collective_artists_on_via()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  classification vault_classification_t;
  non_collective_count INT;
  v_vault_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_vault_id := NEW.vault_item_id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_vault_id := NEW.vault_item_id;
  ELSE
    v_vault_id := OLD.vault_item_id;
  END IF;

  SELECT vault_classification INTO classification FROM vault_items WHERE id = v_vault_id;

  IF classification = 'closed_collective' THEN
    SELECT COUNT(*) INTO non_collective_count
    FROM vault_item_artists via
    JOIN artists a ON via.artist_id = a.id
    WHERE via.vault_item_id = v_vault_id
      AND (a.is_collective_member IS NOT TRUE);

    IF non_collective_count > 0 THEN
      RAISE EXCEPTION 'Vault item classified as closed_collective may only reference collective members. Found % non-collective artist(s).', non_collective_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_closed_collective_artists_via
AFTER INSERT OR UPDATE OR DELETE ON vault_item_artists
FOR EACH ROW EXECUTE FUNCTION enforce_closed_collective_artists_on_via();

CREATE OR REPLACE FUNCTION enforce_closed_collective_on_vault_items()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  non_collective_count INT;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.vault_classification = 'closed_collective')
     OR (TG_OP = 'UPDATE' AND NEW.vault_classification = 'closed_collective' AND OLD.vault_classification IS DISTINCT FROM NEW.vault_classification) THEN

    SELECT COUNT(*) INTO non_collective_count
    FROM vault_item_artists via
    JOIN artists a ON via.artist_id = a.id
    WHERE via.vault_item_id = NEW.id
      AND (a.is_collective_member IS NOT TRUE);

    IF non_collective_count > 0 THEN
      RAISE EXCEPTION 'Cannot classify vault_item as closed_collective: % linked artist(s) are not collective members.', non_collective_count;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_closed_collective_on_vault_items
AFTER INSERT OR UPDATE ON vault_items
FOR EACH ROW EXECUTE FUNCTION enforce_closed_collective_on_vault_items();
```

---

### Enforcement and admin UX recommendations

See [Directus public permissions policy](Directus%20public%20permissions.md)
for the public role, Artist, Editor, and Administrator permission matrix and
the signed-out verification tests.

- Keep `is_collective_member` editable only by admin role.
- Use the DB triggers above to **enforce** closed vault business rule. Directus will surface DB errors when editors attempt invalid operations.
- Add a computed view or read-only field `all_artists_collective` for `vault_items` (via a view) so editors can see qualification status.
- Use Directus roles and permissions to restrict `vault_items.notes` and provenance tables to internal staff.
- Seed `work_categories`, `text_categories`, `journal_categories`, `vault_categories`, and `commission_types` to match your sitemap before content import.

---

### Next steps checklist

1. Run the SQL DDL in Supabase SQL editor.
2. Seed category tables with your sitemap values.
3. Import tables into Directus (Directus will detect relations).
4. Configure Directus interfaces: slug generators, file pickers, tags, select fields.
5. Create Directus roles and permissions and test RLS policies in Supabase.
6. Add sample content and verify triggers enforce closed vault rules.
7. If you want, I can produce: Directus import JSON, seed SQL for categories, RLS policy examples, or a one‑file combined SQL with seeds and comments.

Tell me which of those you want next and I’ll generate it exactly.