# Deploy to www.medialinkers.pk (own server, port 3113)

## Quick way (Git + CloudPanel)

On the server, inside the project folder (root or site user both work):

```bash
cd /home/medialinkers/htdocs/www.medialinkers.pk
git pull
bash deploy.sh --first      # first time: install, create missing content, build, start on 3113
```

Every later update:

```bash
git pull && bash deploy.sh
```

`deploy.sh` checks `.env`, gives the files to the site user, runs `npm ci`, adds any new case studies and screenshots from `scripts/case-studies*.ts` (existing ones are never overwritten), builds, and starts or reloads PM2 (`medialinkers`, port 3113). In CloudPanel the site must be a **Node.js** site with **App Port 3113**; add SSL from *SSL/TLS → New Let's Encrypt Certificate*. To start the site after a server reboot, run `pm2 startup` as the site user once and paste the line it prints as root.

The sections below are the manual steps (database user, Nginx without CloudPanel, etc.).

Assumes Ubuntu/Debian with Nginx. The app runs with PM2 on `127.0.0.1:3113`; Nginx serves it on `https://www.medialinkers.pk`. MongoDB is already installed on the same server.

Replace `SERVER_USER@SERVER_IP` with your SSH login.

## 1. Upload (from your Windows PC, PowerShell)

```powershell
scp "C:\Users\xomoe\ecomm\media linkers\deploy-package\medialinkers-web.tar.gz" SERVER_USER@SERVER_IP:/tmp/
```

## 2. Node.js 22 + PM2 (on the server, skip what is already installed)

```bash
node -v            # needs v20.9 or newer (v22 recommended)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

## 3. Database and database user

Generate a password first (letters and numbers only, so it works in the connection string):

```bash
openssl rand -hex 24
```

Check whether MongoDB requires login:

```bash
grep -A2 "^security" /etc/mongod.conf
```

- If it shows `authorization: enabled`, log in as your Mongo admin: `mongosh -u ADMIN_USER -p --authenticationDatabase admin`
- Otherwise just run: `mongosh`

Then inside `mongosh`:

```javascript
use medialinkers
db.createUser({
  user: "medialinkers",
  pwd: "PASTE_THE_GENERATED_PASSWORD",
  roles: [{ role: "readWrite", db: "medialinkers" }]
})
exit
```

Test the login:

```bash
mongosh "mongodb://medialinkers:PASTE_THE_GENERATED_PASSWORD@127.0.0.1:27017/medialinkers?authSource=medialinkers" --eval "db.runCommand({ ping: 1 })"
```

> Turning on `authorization: enabled` in `/etc/mongod.conf` is recommended, but if other apps on this server connect to MongoDB without a password they will stop working — create users for them first.

## 4. Unpack and configure

```bash
sudo mkdir -p /var/www/medialinkers
sudo chown $USER:$USER /var/www/medialinkers
cd /var/www/medialinkers
tar -xzf /tmp/medialinkers-web.tar.gz
nano .env.local      # or .env — both work
```

Contents of `.env.local` (or `.env`):

```ini
MONGODB_URI=mongodb://medialinkers:PASTE_THE_GENERATED_PASSWORD@127.0.0.1:27017/medialinkers?authSource=medialinkers
AUTH_SECRET=PASTE_OUTPUT_OF__openssl_rand_-base64_48
NEXT_PUBLIC_SITE_URL=https://www.medialinkers.pk
ADMIN_NAME=Media Linkers Admin
ADMIN_EMAIL=admin@medialinkers.pk
ADMIN_PASSWORD=A_STRONG_ADMIN_PASSWORD
```

```bash
chmod 600 .env.local
```

## 5. Install, load content, build, start

```bash
npm ci
npx tsx scripts/import-content.ts deploy/content.json.gz   # all pages, services, blog, case studies, images, settings
npm run seed                                               # creates the admin user only (content already exists)
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup        # run the command it prints, so the site starts after a reboot
curl -I http://127.0.0.1:3113     # should print HTTP/1.1 200
```

## 6. Nginx + HTTPS

Back up the current (WordPress) site config before switching:

```bash
sudo cp -r /etc/nginx/sites-available ~/nginx-backup-$(date +%F)
sudo cp /var/www/medialinkers/deploy/nginx-medialinkers.conf /etc/nginx/sites-available/medialinkers
sudo ln -s /etc/nginx/sites-available/medialinkers /etc/nginx/sites-enabled/medialinkers
# disable the old site for medialinkers.pk if one exists, e.g.:
# sudo rm /etc/nginx/sites-enabled/OLD_SITE_FILE
sudo nginx -t && sudo systemctl reload nginx
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d www.medialinkers.pk -d medialinkers.pk --redirect
```

The domain's DNS A records (`medialinkers.pk` and `www`) must point to this server's IP.

## 7. After launch

- Log in at `https://www.medialinkers.pk/newlogin` and change the admin password (*My profile*).
- *Settings → Email alerts*: add SMTP so audit requests and leads reach your inbox.
- *Settings → Tracking*: GA4 / GTM / Meta Pixel. *SEO settings*: Google & Bing verification codes.
- Google Search Console: submit `https://www.medialinkers.pk/sitemap.xml`.

## Updating the site later

Upload the new package, then:

```bash
cd /var/www/medialinkers
tar -xzf /tmp/medialinkers-web.tar.gz      # keeps .env.local (it is not in the package)
npm ci
npm run build
pm2 reload medialinkers
```

Content edited in the admin panel lives in MongoDB and is never touched by updates.

## Useful commands

```bash
pm2 logs medialinkers        # live logs
pm2 status
mongodump --db medialinkers --username medialinkers --password 'PASSWORD' --authenticationDatabase medialinkers --archive=/root/medialinkers-$(date +%F).gz --gzip   # backup
```
