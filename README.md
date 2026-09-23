# Anime & Toy Universe

A self-contained, production-ready e-commerce platform for Anime & Toy Universe, built to run entirely on a single
Hostinger VPS — Next.js app, MongoDB database, and uploaded media all on the same machine. No MongoDB Atlas, no
external database service, no separate accounts for you or the client to manage.

```
Internet → Domain → Nginx → Next.js (PM2) → MongoDB (local, systemd)
```

---

## 1. What's built vs. what's next (read this first)

This is a real, working full-stack application — not a mockup. The core commerce loop is fully wired end to end:
adding a product in Admin makes it appear on the storefront, placing an order deducts stock, cancelling an order
restores it, and inventory changes are all recorded as an audit trail.

**Fully working (storefront + admin + database, tested end to end):**

- Storefront: Home, Shop (filters/sort/pagination), Product Details, Cart, Checkout, Preorder listing, Wholesale
  application form, Contact form, Search, FAQ, Policies, Blog (list + post), About.
- Auth: Register, Login, Logout, JWT httpOnly-cookie sessions, guest cart that merges into your account on login.
- Account: Orders list/detail with cancel, Addresses, Wishlist.
- Admin panel (`/admin`, separately authenticated): Dashboard, Products (add/edit/duplicate/publish/unpublish/
  archive/delete, image upload), Categories, Brands, Inventory (stock/reserved/available, manual adjustments with
  full transaction history), Orders (status changes, tracking/courier, cancel-with-restock), Customers, Wholesale
  application review (approve/reject), Contact messages.
- Data layer: all 18 models from the spec (User, Product, Category, Brand, Order, Cart, Wishlist, Review, Coupon,
  InventoryTransaction, Preorder, WholesaleApplication, WholesalePrice, HomepageSection, Banner, ContactMessage,
  NewsletterSubscriber, BlogPost) with indexes.
- Security: bcrypt password hashing, httpOnly/secure/sameSite cookies, Zod input validation on every write endpoint,
  rate limiting on auth/contact/wholesale/newsletter/checkout, regex-injection-safe search filters, upload
  type/size validation, JSON-LD XSS-safe encoding, security headers.
- SEO: per-page metadata, OpenGraph tags, canonical URLs, Product/Organization/BreadcrumbList structured data,
  `sitemap.xml`, `robots.txt`.
- Deployment: MongoDB installer/hardener script, PM2 config, Nginx config, daily backup script with retention,
  `create-admin` and `seed` CLI scripts.

**Scaffolded (model + admin nav entry exist; UI is a "coming soon" placeholder) — the next development pass:**

- Coupons, Homepage CMS (section reordering/copy), Banner scheduling, Blog post editor (the public blog pages
  already render from the database — only the admin *editor* is pending), dedicated Preorder allocation/deposit
  management (today, preorder behavior is driven by the Product's `isPreorder`/`releaseDate`/`closingDate` fields,
  which is enough to sell preorders — the separate `Preorder` allocation model is scaffolded for when you need
  waitlists/limited allocations), Razorpay payment capture (the checkout flow, order model and env vars are ready;
  wiring the actual Razorpay checkout widget takes real API keys from the client, which the spec said not to
  require up front), settings screen, review moderation UI, order-confirmation emails (SMTP env vars are ready).

Every one of these has its database model already defined in `src/models/`, so adding the admin screen is additive
work, not a redesign.

---

## 2. Local development

```bash
npm install
cp .env.example .env        # then edit .env — see section 6 below for local values
npm run dev                 # http://localhost:3000
```

You'll need a local MongoDB for development too. Easiest options:
- Install MongoDB Community Server locally (same steps as `deploy/mongo-setup.sh`, or via Homebrew/Docker), or
- Run `docker run -d -p 27017:27017 --name atu-mongo mongo:7` and use `MONGODB_URI=mongodb://127.0.0.1:27017/anime_toy_universe` (no auth needed for local Docker dev).

Then:

```bash
npm run seed           # demo categories/brands/products
npm run create-admin   # creates your first admin login
```

---

## 3. Deploying to your Hostinger VPS

These steps assume a fresh Ubuntu VPS from Hostinger (22.04, 24.04, or a newer LTS such as 26.04 — `mongo-setup.sh`
below automatically handles the case where your Ubuntu release is newer than MongoDB's official apt repo has a
dedicated build for), and that you're comfortable copy-pasting commands over SSH. Follow them in order.

### 3.1 VPS preparation

```bash
ssh root@YOUR_SERVER_IP
apt-get update && apt-get upgrade -y
adduser deploy              # don't run everything as root day-to-day
usermod -aG sudo deploy
su - deploy
```

### 3.2 Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # should print v20.x
npm -v
sudo npm install -g pm2
```

### 3.3 Install MongoDB (directly on this VPS)

```bash
git clone <your-repo-url> /home/deploy/anime-toy-universe-src   # or scp the project up
cd /home/deploy/anime-toy-universe-src
sudo bash deploy/mongo-setup.sh
```

This script:
- Installs MongoDB Community Server 8.0 from the official MongoDB apt repo (with an automatic fallback to the
  closest MongoDB-supported Ubuntu codename if your VPS is running a newer Ubuntu release than MongoDB has published
  packages for yet — see the comments in the script).
- Registers and enables it as a **systemd service** (`mongod`) so it starts automatically after every reboot.
- Binds it to `127.0.0.1` only — **not reachable from the internet**.
- Creates the `anime_toy_universe` database and a dedicated `anime_app` user with `readWrite` on that database only
  (not an admin/root account).
- Enables authentication.
- Prints the `MONGODB_URI` connection string to paste into `.env`.

Verify it's running and will survive a reboot:

```bash
systemctl status mongod
sudo systemctl is-enabled mongod   # should print "enabled"
```

### 3.4 MongoDB security checklist

- ✅ `bindIp: 127.0.0.1` in `/etc/mongod.conf` — only processes on this VPS can connect.
- ✅ `security.authorization: enabled` — no anonymous access.
- ✅ Dedicated `anime_app` user scoped to one database — not the root/admin account.
- ✅ Port `27017` is **not** opened in the firewall (see 3.9) — even if bindIp were misconfigured, the firewall is a
  second layer of defense.

### 3.5 Application installation

```bash
sudo mkdir -p /var/www/anime-toy-universe
sudo chown deploy:deploy /var/www/anime-toy-universe
git clone <your-repo-url> /var/www/anime-toy-universe/app
cd /var/www/anime-toy-universe/app
npm install
```

### 3.6 Environment configuration

```bash
cp .env.example .env
nano .env
```

Set at minimum:
- `NODE_ENV=production`
- `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`
- `MONGODB_URI=` (from the mongo-setup.sh output)
- `AUTH_SECRET=` — generate with `openssl rand -hex 32`
- `MEDIA_ROOT=/var/www/anime-toy-universe-storage`

Leave `RAZORPAY_*` and `SMTP_*` blank until the client provides those — the site works fully with Cash on Delivery
without them.

Create the media storage directory (outside the app's public source, as required):

```bash
sudo mkdir -p /var/www/anime-toy-universe-storage/{products,categories,brands,banners,blog}
sudo chown -R deploy:deploy /var/www/anime-toy-universe-storage
```

### 3.7 Database setup

Nothing else to do here — `mongo-setup.sh` already created the database and user. Mongoose creates collections and
indexes automatically the first time each model is used (on `npm run seed` or first app request).

### 3.8 Admin creation

```bash
npm run create-admin
```

Follow the interactive prompts for name/email/password. This is the **only** supported way to create an admin
account — there is no hardcoded admin login anywhere in the codebase.

### 3.9 Seed data (optional, recommended for launch demo)

```bash
npm run seed
```

Creates 8 categories, 9 brands and ~30 demo products (all flagged `isDemo: true` in the database, and clearly
sourced from placeholder art) so the store isn't empty on first look. Safe to re-run. Remove or replace demo
products from `/admin/products` whenever you're ready to add the client's real catalog.

### 3.10 Production build

```bash
npm run build
```

### 3.11 Start with PM2

```bash
cd /var/www/anime-toy-universe/app
sudo mkdir -p /var/log/anime-toy-universe
sudo chown deploy:deploy /var/log/anime-toy-universe

pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup      # run the command it prints (as root/sudo) so PM2 survives reboots
```

Check it's up: `pm2 status`, `pm2 logs anime-toy-universe`, or `curl http://127.0.0.1:3000`.

### 3.12 Nginx

```bash
sudo apt-get install -y nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/anime-toy-universe
sudo nano /etc/nginx/sites-available/anime-toy-universe   # replace YOURDOMAIN.com, and the alias path if you changed MEDIA_ROOT
sudo ln -s /etc/nginx/sites-available/anime-toy-universe /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3.13 Domain

1. In Hostinger (or wherever the domain is registered), create an **A record** for `@` (and one for `www` if you
   want both) pointing to your VPS's public IP address.
2. DNS propagation can take a few minutes to a few hours.
3. Once `dig yourdomain.com` (or just visiting it in a browser) resolves to your VPS IP and shows the site over
   plain HTTP, move to SSL.

### 3.14 SSL / HTTPS (free, via Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot edits your Nginx config to add the HTTPS server block and, when asked, choose the option to **redirect**
HTTP to HTTPS automatically. It also installs a systemd timer that renews the certificate automatically — verify
with:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

Then update `.env`: `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`, and `pm2 restart anime-toy-universe`.

### 3.15 Firewall

```bash
sudo apt-get install -y ufw
sudo ufw allow OpenSSH     # or: sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Port `27017` (MongoDB) and port `3000` (Next.js) are deliberately **not** opened — MongoDB is only reachable from
`127.0.0.1`, and the app is only reachable through Nginx on 80/443.

### 3.16 Backups

```bash
crontab -e
```

Add a daily 3am backup:

```
0 3 * * * /var/www/anime-toy-universe/app/deploy/backup.sh >> /var/log/anime-toy-universe/backup.log 2>&1
```

`deploy/backup.sh`:
- Runs `mongodump` against your local MongoDB.
- Compresses the dump and stores it in `/var/backups/anime-toy-universe/` — **outside** both the live database
  directory and the Next.js app's public directory, as required.
- Automatically deletes backups older than 14 days (edit `RETENTION_DAYS` in the script to change this).

### 3.17 Restore procedure

```bash
cd /var/backups/anime-toy-universe
tar -xzf 2026-01-15_03-00-00.tar.gz          # pick the backup you want
mongorestore --uri="$MONGODB_URI" --drop 2026-01-15_03-00-00/
```

`--drop` replaces existing collections with the backup's data — omit it if you want to merge instead. Always test
a restore on a non-production database first if you're not sure.

### 3.18 Updating the application

```bash
cd /var/www/anime-toy-universe/app
git pull
npm install
npm run build
pm2 restart anime-toy-universe
```

The database is untouched by an app update — your products, orders and customers stay exactly as they were.

---

## 4. Testing checklist (run through this before calling it launched)

- [ ] Customer flow: register → browse shop → filter/sort → open a product → add to cart → checkout (COD) → see
      order in Account → cancel a cancellable order and confirm stock returns in Admin → Inventory.
- [ ] Admin flow: log in at `/admin/login` → add a product with images → confirm it appears on `/shop` once
      published → edit it → duplicate it → archive it → confirm archived products don't show on the storefront.
- [ ] Inventory: manually adjust stock (restock/damaged/manual) → confirm the transaction log records it → place an
      order that would oversell → confirm it's rejected.
- [ ] Orders: change status through the pipeline, add tracking/courier → confirm the customer sees it on their
      order page → cancel an order from Admin → confirm stock restores exactly once (not double-restored).
- [ ] Preorders: mark a product as preorder with a release date → confirm it shows the Preorder badge and doesn't
      deduct live stock when ordered.
- [ ] Wholesale: submit the `/wholesale` form → confirm it appears in `/admin/wholesale` → approve it.
- [ ] Authentication: register, log out, log in, confirm a non-admin cannot reach `/admin`, confirm `/account` and
      `/checkout` redirect to login when signed out.
- [ ] Mobile responsive: test at 390/393/430px — header collapses to hamburger + bottom nav, product grid goes to
      2 columns, forms stack.
- [ ] Desktop responsive: 1280px+ layout, hover states on product cards.
- [ ] Database connectivity: `systemctl status mongod` shows active.
- [ ] MongoDB restart persistence: `sudo reboot` the VPS, then confirm `systemctl status mongod` and `pm2 status`
      both come back up on their own (this is what `mongod` being `enabled` and `pm2 startup`/`pm2 save` guarantee).
- [ ] PM2 restart: `pm2 restart anime-toy-universe` — site comes back within a few seconds.
- [ ] Nginx: `sudo nginx -t` passes, `sudo systemctl reload nginx` applies cleanly.
- [ ] HTTPS: site loads on `https://yourdomain.com`, HTTP redirects to HTTPS.
- [ ] Backup: run `deploy/backup.sh` manually once, confirm a `.tar.gz` appears in `/var/backups/anime-toy-universe/`.
- [ ] Restore: practice a restore into a scratch database name before you ever need to do it for real.

---

## 5. Project structure

```
src/
  app/
    (store)/        storefront pages (home, shop, product, cart, checkout, account, auth, ...)
    admin/
      login/         admin login (outside the auth-gated layout)
      (dashboard)/    everything under /admin/* — protected by src/app/admin/(dashboard)/layout.tsx
    api/             all route handlers (REST-ish JSON API consumed by the pages above)
  components/        layout, product, admin and provider (client context) components
  lib/               db connection, auth, validation, inventory logic, media storage, rate limiting
  models/            every Mongoose schema
  middleware.ts      edge-runtime route protection for /admin, /account, /checkout, /wishlist
scripts/
  create-admin.ts    npm run create-admin
  seed.ts            npm run seed
deploy/
  mongo-setup.sh     installs & hardens MongoDB on the VPS
  backup.sh          daily mongodump + retention
  ecosystem.config.js PM2 process config
  nginx.conf         reverse proxy + static/media serving config
storage/             local media storage for development (production uses MEDIA_ROOT outside the app dir)
```

## 6. A few implementation notes worth knowing

- **No multi-document MongoDB transactions.** A standalone (non-replica-set) `mongod` — exactly what
  `mongo-setup.sh` installs, matching the "just `mongodb://127.0.0.1:27017/...`" requirement — can't run
  multi-document ACID transactions. Overselling is instead prevented with an atomic, conditional
  `findOneAndUpdate` per line item (`src/lib/inventory.ts`), with automatic compensating rollback if a later item
  in the same order turns out to be unavailable. This keeps the database simple to operate while still being safe
  under concurrent checkouts.
- **Rate limiting is in-memory**, scoped to a single Node process. This is fine for the single PM2 instance this
  README sets up. If you later switch PM2 to cluster mode across multiple instances, move `src/lib/rateLimit.ts` to
  a shared store (e.g. Redis) first.
- **CSRF**: session cookies are `SameSite=Lax` and the API isn't CORS-enabled for other origins, which is the
  standard baseline mitigation for a same-origin app like this one; there's no separate CSRF token system.
- **Checkout requires an account** (no guest checkout) so every order has a customer to attach to in Account →
  Orders. The cart itself works for guests (cookie-based) and merges into your account automatically on login.
- **Framework version**: pinned to Next.js 14.2.x (the stable LTS-style line), not the bleeding-edge 16.x that
  `create-next-app` installs by default today, for a codebase this size and a client who needs it to keep working
  reliably.
- **`.env` is only needed at runtime, not at build time.** `src/lib/db.ts` and `src/lib/auth.ts` validate
  `MONGODB_URI` / `AUTH_SECRET` lazily, inside the functions that use them, rather than the moment the file is
  imported. That means `npm run build` succeeds even before `.env` exists (handy for CI, or for building the app
  once and configuring secrets afterwards) — the clear "not set" errors still show up immediately the first time a
  real request tries to hit the database or sign a session, so misconfiguration is never silent. Regardless, step
  3.6 (Environment configuration) in this README comes before step 3.10 (Production build), so in the normal
  deployment order `.env` is already in place by the time you build.
