
# ⭐ FULL STACK 

# 1️⃣ **Frontend Layer — Your Actual Website**

### **GitHub Pages (Free)**
→ `https://yourdomain.com`
- Hosts your React app as static HTML/CSS/JS.
- No server, no backend, no cost.
- Perfect for a content‑driven site.

### **Cloudflare CDN (Free)**

- Sits in front of GitHub Pages.
- Makes your site load instantly worldwide.
- Gives you free SSL, caching, DDoS protection.

**Why this layer exists:**  
It delivers your website to users — fast, secure, and free.
**Public** This is the only thing the world should see.
`yourdomain.com`
Everything else is infrastructure behind the scenes.

# 2️⃣ **CMS Layer — Your Content Brain**

### **Directus (Headless CMS)**
Hosted on DigitalOcean → `https://cms.yourdomain.com` (or `https://directus.yourdomain.com`)
- Your admin dashboard.
- Your API for content.
- Your permissions system.
- Your content modelling tool.

### **Docker (Free)**

- Runs Directus in a container.
- Ensures your local and production environments match.
- Makes deployment simple and stable.

### Heroku 
side is the **runtime/hosting layer**: Directus runs in a Heroku app, Heroku boots it in a dyno, manages releases when config vars change, and can run Docker-based deploys through its container registry/runtime as well. Heroku’s stack is the operating system/build environment under that app, while dynos are the lightweight containers actually running your code.**DigitalOcean Droplet (Paid by your GitHub credit)**

**Why this layer exists:**  
It manages all your content: artists, works, editions, rails, vault, reservations.
**You choose whether it’s public or private.**

Most people do this:
- **Public URL** (so the API can be accessed by your frontend)
- **Admin panel locked behind login**
- **Permissions locked down so anonymous users can only read what you allow**

Meaning:
- The CMS dashboard is **not** publicly accessible
- The API only exposes the collections you choose
- Sensitive collections stay private
- Admin access is fully protected
    
So yes — **Directus can be publicly reachable but not publicly usable**.

This is normal for headless CMS setups.

# 3️⃣ **Database Layer — Your Structured Data**

### **Supabase Postgres (Free Tier)**

- Stores all your relational data:
    - Artists
    - Works
    - Editions
    - Inventory
    - Reservations
    - Rails
    - Metadata
- 500MB free.
    
- Enough for thousands of records.
    

**Why this layer exists:**  
It’s your permanent, structured data store.

---

# 4️⃣ **Storage Layer — Your Media Files**

### **Supabase Storage (Free Tier)**
Supabase Storage → `https://yourdomain.supabase.co/storage/...` (doesn’t require a domain at all)
- Stores images (artwork, editions, thumbnails).
- 1GB free.
- S3‑compatible.
**Not public.**
- Your Postgres database is **never** publicly accessible
- Your storage buckets can be:
    - **private** (recommended)
    - **public** (for images only, if you choose)

Supabase uses signed URLs, RLS policies, and JWTs to protect everything.
### **Cloudflare Stream / Vimeo / YouTube**
Videos (Cloudflare Stream / Vimeo / YouTube) → also don’t require a domain.
- Stores and streams videos.
- Handles transcoding, thumbnails, adaptive streaming.

**Why this layer exists:**  
It holds all your media — images in Supabase, videos in a proper streaming service.

**Public only if you want them to be.**
- YouTube → unlisted
- Vimeo → private links
- Cloudflare Stream → token‑protected

You control visibility.

---

# 5️⃣ **API Logic Layer — Your Custom Backend Logic**
→ `https://api.yourdomain.com` 
(or `https://payments.yourdomain.com`)
### **Cloudflare Workers (Free Tier)**

This is where your custom logic lives:

- Stripe checkout sessions
- Stripe webhook validation
- Reservation endpoints
- CRM integrations
- Email notifications
- Any custom business logic

**Why this layer exists:**  
Directus is a CMS, not a payment processor or logic engine.  
Workers handle the “smart” parts of your system.
**Private by design.**

Cloudflare Workers only expose the endpoints you create, such as:
- `/create-checkout-session`
- `/stripe-webhook`
- `/reserve`

These endpoints:
- Don’t show a UI
- Don’t expose secrets
- Only accept specific requests
- Can require authentication if needed

So the public can’t “browse” anything here.


# 6️⃣ **Automation Layer — Your System That Updates Itself**

### **Directus Webhooks**

- Trigger GitHub Actions when content is published.
- Trigger Workers when reservations happen.
- Trigger emails or CRM updates.

### **GitHub Actions**

- Rebuilds your React site automatically.
- Deploys to GitHub Pages.

**Why this layer exists:**  
Your site updates itself whenever you publish content — no manual rebuilds.

---

# 7️⃣ **Development Layer — Your Local Workflow**

### **VS Code**

- Your main development environment.

### **Docker Desktop (Free)**

- Runs Directus locally in the same environment as production.

### **GitHub**

- Version control.
- CI/CD.
- Collaboration.

**Why this layer exists:**  
It gives you a clean, stable, repeatable development workflow.

---

# ⭐ **THE COMPLETE ARCHITECTURE (FULL DETAIL)**

```
User
  |
  v
Cloudflare CDN (free)
  |
  +--> GitHub Pages (React frontend)
  |
  +--> Directus API (Docker on Heroku)
  |         |
  |         +--> Supabase Postgres (free)
  |         |
  |         +--> Supabase Storage (images)
  |         |
  |         +--> Cloudflare Stream / Vimeo / YouTube (videos)
  |
  +--> Cloudflare Workers (Stripe, reservations, CRM, emails)
        |
        +--> Stripe API
        |
        +--> Directus (update stock, create orders)
        |
        +--> Supabase (store order data)
```

This is your **full, real, production‑ready, scalable, free‑optimised stack**.

---

# perks of stack

- Free for a year
- Fast worldwide
- Stable CMS
- Cheap to scale
- Easy to deploy
- Easy to maintain
- Secure
- Modern
- Professional
- Future‑proof

This is the exact architecture used by indie studios, galleries, and small SaaS teams who want maximum power with minimum cost.

---

If you want, I can now break down **any layer** in even more detail — or generate:

- your Directus schema
- your Docker Compose
- your Supabase `.env`
- your Stripe flow
- your reservation flow
- your rails structure


root@upsetdotlive:/var/www/directus# cat docker0compose.yml
cat: docker0compose.yml: No such file or directory
root@upsetdotlive:/var/www/directus# cat docker-compose.yml
services:
  directus:
    image: directus/directus:latest
    ports:
      - "8055:8055"
    environment:
      PUBLIC_URL: "https://cms.upset.live"
      CORS_ENABLED: "true"
      CORS_ALLOWED_ORIGINS: "https://upset.live,http://localhost:5173"
      NODE_EXTRA_CA_CERTS: "/directus/certs/supabase-pooler-chain.pem"
      DB_CLIENT: "pg"
      DB_CONNECTION_STRING: "postgresql://postgres.tfnpfgekwoqflwodvdmp:Owamb3inthesky!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
     
      KEY: "sb_publishable_pSg9x4iQLl0Ac2MdZdAUvw_y4o-3hKx"
      STORAGE_LOCATIONS: "supabase"
      STORAGE_SUPABASE_DRIVER: "s3"
      STORAGE_SUPABASE_BUCKET: "Images"
      STORAGE_SUPABASE_ENDPOINT: "https://tfnpfgekwoqflwodvdmp.storage.supabase.co/storage/v1/s3"
      STORAGE_SUPABASE_REGION: "eu-central-1"
      STORAGE_SUPABASE_KEY: "738cf83a2b154bd5dd38a93893202498"
      STORAGE_SUPABASE_SECRET: "ee2f1d8b370910c7ab903e8673de7b317b8d4828e2aaf1b68f3a9ef6c13ad9b8"
    volumes:
      - ./uploads:/directus/uploads
      - ./certs/supabase-pooler-chain.pem:/directus/certs/supabase-pooler-chain.pem:ro

heroku config:set `
  PUBLIC_URL="https://upset-directus-cms-f2a4a03c796f.herokuapp.com" `
  CORS_ENABLED="true" `
  CORS_ALLOWED_ORIGINS="https://upset.live,http://localhost:5173" `
  DB_CLIENT="pg" `
  DB_CONNECTION_STRING="postgresql://postgres.tfnpfgekwoqflwodvdmp:Owamb3inthesky!@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require" `
  KEY="b_publishable_pSg9x4iQLl0Ac2MdZdAUvw_y4o-3hKx" `
  
  STORAGE_LOCATIONS="supabase" `
  STORAGE_SUPABASE_DRIVER="s3" `
  STORAGE_SUPABASE_BUCKET="Images" `
  STORAGE_SUPABASE_ENDPOINT="https://tfnpfgekwoqflwodvdmp.storage.supabase.co/storage/v1/s3" `
  STORAGE_SUPABASE_REGION="eu-central-1" `
  STORAGE_SUPABASE_KEY="738cf83a2b154bd5dd38a93893202498" `
  STORAGE_SUPABASE_SECRET="ee2f1d8b370910c7ab903e8673de7b317b8d4828e2aaf1b68f3a9ef6c13ad9b8" `
  --app $APP
  
New-Item -ItemType Directory -Force certs
scp root@178.128.165.157:/var/www/directus/certs/supabase-pooler-chain.pem .\certs\supabase-pooler-chain.pem


$APP = "upset-directus-cms"

heroku config:set `
  EMAIL_TRANSPORT="smtp" `
  EMAIL_FROM="updates@send.upset.live" `
  EMAIL_SMTP_HOST="smtp.resend.com" `
  EMAIL_SMTP_PORT="587" `
  EMAIL_SMTP_USER="resend" `
  EMAIL_SMTP_PASSWORD=re_7y1Db7E7_PyQAZqYMzRy862LZcULwYsr8" `
  EMAIL_SMTP_SECURE="false" `
  --app $APP 


heroku config:set EMAIL_TRANSPORT="smtp" EMAIL_FROM="updates@send.upset.live" EMAIL_SMTP_HOST="smtp.resend.com" EMAIL_SMTP_PORT="465" EMAIL_SMTP_USER="resend" EMAIL_SMTP_PASSWORD="YOUR_NEW_RESEND_API_KEY" EMAIL_SMTP_SECURE="true" --app upset-directus-cms

# Setup
Below is the complete setup path, in the correct order, with each step explained.

### 01

### Set Up Your Domain on Cloudflare [x]

Foundation

Cloudflare becomes the front door to your entire stack, giving you CDN, SSL, and protection.

Create a Cloudflare account → Add your domain → Change nameservers at your registrar

- Cloudflare will automatically detect your DNS records
    
- Enable **Proxy (orange cloud)** for your main domain
    
- This gives you global speed + free SSL instantly
    

### 02

### Create Your Supabase Project [x]

Free Tier

Supabase provides your Postgres database and image storage.

Go to Supabase → New Project
password Owamb3inthesky!
project id: tfnpfgekwoqflwodvdmp
host:db.tfnpfgekwoqflwodvdmp.supabase.co

port:5432

database:postgres

user:postgres
- Choose the free tier
    
- Copy your **Postgres connection string**
    postgresql://postgres:[Owamb3inthesky!]@db.tfnpfgekwoqflwodvdmp.supabase.co:5432/postgres
- Create a **storage bucket** for images
    
- Keep your API keys handy
    sb_publishable_pSg9x4iQLl0Ac2MdZdAUvw_y4o-3hKx
	

### 03

### Model Your Database in Directus Terms

[[Directus]]

    

### 04

### Set Up Your DigitalOcean Droplet

Paid by Credits

This is where Directus will live, paid for by your GitHub Education credits.

DigitalOcean → Create Droplet → Ubuntu → Smallest size

- Add SSH keys
	Your identification has been saved in C:\Users\shirl/.ssh/id_ed25519
Your public key has been saved in C:\Users\shirl/.ssh/id_ed25519.pub
    The key fingerprint is:
SHA256:qGD6e6ViHU4+OXOr7DsfGqADlNu/nCrsrY9uEAA+uyE shirl@Mopro
The key's randomart image is:
+--[ED25519 256]--+
|o                |
|o .              |
|.=               |
|o =    .         |
|E=+.  . S        |
|++oo+..          |
|*. =o*.          |
| *=.&o+.         |
|+**OB&o.         |
+----[SHA256]-----+
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDEYJ3MTE15dknYNFKvFp/7R7NvdZB4eDdSZnW6Mg4ar shirl@Mopro
- Choose the cheapest droplet (it’s enough)
    
- Your credits will cover ~40 months
    

### 05

### Install Docker + Docker Compose on the Droplet

Docker runs Directus in a clean, isolated environment.

SSH into droplet → install Docker → install Docker Compose

- No need to install Node or anything else
    
- Docker ensures your local and production match perfectly
    

### 06

### Create Your Directus Docker Compose File

Core Setup

This file defines how Directus runs and how it connects to Supabase.

- Set `DB_CONNECTION_STRING` to your Supabase Postgres URL
    
- Set storage to S3 mode using Supabase Storage
    
- Set your Directus `KEY` and `SECRET`
    
- Expose port 8055
    

### 07

### Run Directus in Docker

This boots your CMS for the first time.

docker compose up -d

- Visit `http://your-droplet-ip:8055`
    
- Create your admin user
    
- Directus is now live
    

### 08

### Connect Directus to Supabase Storage

This lets Directus upload images to your Supabase bucket.
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbnBmZ2Vrd29xZmx3b2R2ZG1wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQ4MDg0OCwiZXhwIjoyMDk1MDU2ODQ4fQ.EkPPgz62T6rOqchjcEmdclCY4CoIBHGB3BurC5yTBPc
- Add S3 credentials from Supabase
    access 738cf83a2b154bd5dd38a93893202498
	secret ee2f1d8b370910c7ab903e8673de7b317b8d4828e2aaf1b68f3a9ef6c13ad9b8
	end https://tfnpfgekwoqflwodvdmp.storage.supabase.co/storage/v1/s3
	https://tfnpfgekwoqflwodvdmp.storage.supabase.co/storage/v1/s3
	region eu-central-1
- Set bucket name
    
- Set region + endpoint
    
- Test an image upload
	EHH2TCg0bGR1tQBOa3kfuakWUP0UAAvQ
scp /path/to/local/image.jpg mo@178.128.165.157:/var/www/directus/

curl -X POST \
  -H "Authorization: Bearer EHH2TCg0bGR1tQBOa3kfuakWUP0UAAvQ"\
  -F "file=@pixeleye.jpg" \
  https://cms.upset.live/files

    

### 09

### Build Your Collections in Directus

Now you create the actual structure of your CMS.

- Artists
    
- Works
    
- Editions
    
- Rails
    
- Vault
    
- Reservations
    
- Add relationships + fields
    

### 10

### Set Up Your React Frontend on GitHub Pages

Your site is static, free, and globally cached.

Push your React app to GitHub → Enable Pages

- Use `gh-pages` branch or `/docs` folder
    
- Connect your custom domain via Cloudflare DNS
    

### 11

### Connect Frontend to Directus API

Your React app now fetches content from Directus.

- Use REST or GraphQL
    
- Fetch artists, works, editions, rails
    
- Render rails dynamically
    

### 12

### Add Cloudflare Workers for Logic (Optional but Recommended)

Logic Layer

Workers handle Stripe, reservations, emails, and webhooks.

- Create checkout sessions
    
- Validate Stripe webhooks
    
- Update Directus stock
    
- Send confirmation emails
    

### 13

### Set Up Directus Webhooks

This automates your system.

- Trigger GitHub Actions when content is published
    
- Trigger Workers for reservations
    
- Trigger emails or CRM updates
    

### 14

### Set Up GitHub Actions for Automatic Deploys

Your site rebuilds itself whenever content changes.

- On Directus publish → GitHub Action → Rebuild React → Deploy to Pages
    
- No manual deploys ever again
    

### 15

### Final Polish + Monitoring

Make sure everything is stable and production-ready.

- Add Cloudflare caching rules
    
- Add rate limiting to Workers
    
- Add Directus roles + permissions
    
- Add backups in Supabase