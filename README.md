# 🏪 ShopEasy POS

A Telugu-first cloud POS + Khata management web app for retail shops in Vijayawada.

## Quick Start (Run Locally)

```bash
# 1. Install Node.js (v18+) from https://nodejs.org

# 2. Open terminal in this folder and run:
npm install

# 3. Start the development server:
npm run dev

# 4. Open browser at http://localhost:5173
```

---

## Deploy to Live Website (3 Methods)

### Method 1: Vercel (Recommended — FREE, Easiest)

**Step 1:** Create accounts
- GitHub account: https://github.com (if you don't have one)
- Vercel account: https://vercel.com (sign in with GitHub)

**Step 2:** Push code to GitHub
```bash
# In terminal, inside the shopeasy-pos folder:
git init
git add .
git commit -m "ShopEasy POS - initial release"

# Create a new repo on GitHub (https://github.com/new) named "shopeasy-pos"
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/shopeasy-pos.git
git branch -M main
git push -u origin main
```

**Step 3:** Deploy on Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `shopeasy-pos` repo
4. Vercel auto-detects Vite — click "Deploy"
5. Wait 30 seconds — your site is LIVE! 🎉

**Your URL will be:** `https://shopeasy-pos.vercel.app`

**Custom domain:** In Vercel dashboard → Settings → Domains → add your domain (e.g., shopeasypos.in)

> Every time you `git push`, Vercel auto-deploys the new version.

---

### Method 2: Netlify (Also FREE)

**Step 1:** Create account at https://netlify.com

**Step 2:** Build the project locally
```bash
npm run build
```

**Step 3:** Deploy
- Go to https://app.netlify.com/drop
- Drag and drop the `dist` folder
- Your site is live instantly!

**Or connect GitHub** (same as Vercel — auto-deploys on push).

---

### Method 3: Railway (FREE, includes backend later)

Use this when you add a Node.js backend server later.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

---

## Custom Domain Setup

1. Buy a domain from GoDaddy / Namecheap / Google Domains
   - Suggestion: `shopeasypos.in` (~₹600/year)

2. In Vercel/Netlify dashboard:
   - Go to Settings → Domains
   - Add your domain
   - Update DNS records as instructed (usually add a CNAME record)

3. HTTPS is automatic — no extra setup needed.

---

## Project Structure

```
shopeasy-pos/
├── index.html          ← Entry HTML file
├── package.json        ← Dependencies & scripts
├── vite.config.js      ← Vite build config
├── src/
│   ├── main.jsx        ← React entry point
│   └── App.jsx         ← Complete POS application
└── dist/               ← Built files (after npm run build)
```

## Features

- 🧾 **Billing** — product search, cart, GST calculation, cash/credit payment
- 📦 **Inventory** — stock tracking, low-stock alerts, add/edit products
- 📒 **Khata** — credit tracking per customer, payment recording, WhatsApp reminders
- 📊 **Reports** — daily sales summary, top products, bill history
- 🌐 **Telugu + English** — toggle anytime, full Telugu UI
- 💾 **Offline data** — all data stored in browser, works without internet
- 📱 **Mobile-ready** — works on any phone browser

## Next Steps (After MVP)

1. Add a Node.js + PostgreSQL backend for cloud sync
2. Add phone OTP login for multi-device access
3. Add ONDC seller integration
4. Add thermal printer support
5. Convert to PWA (installable on phone)
6. Add barcode scanner via phone camera

---

Built for Vijayawada's retail shops 🇮🇳
