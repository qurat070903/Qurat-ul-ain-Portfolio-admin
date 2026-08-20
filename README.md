# Qurat Ul Ain — Portfolio

A personal portfolio site for a Software Engineering student and ML/AI intern, built with a live admin panel so content stays current without ever touching code.

**Live site:** https://qurat-ul-ain-portfolio.onrender.com
**Admin panel:** https://qurat-ul-ain-portfolio.onrender.com/admin.html

---

## ✨ Features

- **Editable everything, no code required** — Hero text, bio, stats, work experience, education, leadership roles, and contact info all update live from a password-protected admin panel
- **Certificate uploads** — drag in an image, fill in a title and issuer, done. No manual file management.
- **"Ongoing" toggle** — mark any role or degree as current with one checkbox; uncheck it and add an end date the moment it wraps up
- **Auto-generated CV** — the "Download CV" button builds a fresh, ATS-friendly PDF resume live from whatever's currently in the admin panel, so the CV is never out of sync with the site
- **Responsive, animated design** — dark hero with a glowing headline, scroll-reveal sections, mobile nav

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla HTML / CSS / JavaScript (no framework) |
| Backend | Node.js, Express |
| File uploads | Multer |
| PDF generation | PDFKit |
| Hosting | Render (Node web service + persistent disk) |

No database — content lives in a JSON file on a persistent disk; certificate images are stored alongside it.

## 📁 Project Structure

```
portfolio/
├── public/
│   ├── index.html            # Main site (renders dynamically from content.json)
│   ├── admin.html            # Password-protected content editor
│   ├── css/style.css         # All styling
│   ├── js/
│   │   ├── content.js        # Fetches content.json, renders the homepage
│   │   ├── admin.js          # Powers the admin panel
│   │   └── script.js         # Nav + scroll-reveal animations
│   └── images/
│       ├── profile-cutout.png
│       └── certificates/     # Uploaded certificate images
├── data/
│   └── content.json          # Default/seed content (copied to disk on first boot)
├── cv-generator.js           # Builds the CV PDF live from content.json
├── server.js                 # Express server + all API routes
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

```bash
git clone https://github.com/qurat070903/Qurat-ul-ain-Portfolio-admin.git
cd Qurat-ul-ain-Portfolio-admin
npm install
cp .env.example .env
```

Open `.env` and set a real admin password:
```
ADMIN_PASSWORD=your-own-password-here
```

```bash
npm start
```

- Site → http://localhost:3000
- Admin → http://localhost:3000/admin.html

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Defaults to `3000` |
| `ADMIN_PASSWORD` | **Yes** | Password to log into `/admin.html` |
| `DISK_PATH` | Production only | Mount path of Render's persistent disk (e.g. `/data`). Without it, data is stored locally and won't survive a server restart — fine for local dev, not for production. |

## ✍️ Using the Admin Panel

1. Go to `/admin.html` and log in
2. Edit any section — Hero, About, Career Journey, Academic Record, Leadership, Certificates, Contact
3. For roles/degrees still in progress, check **"This is ongoing / current"** — it shows a CURRENT badge and hides the end date until you're ready to fill one in
4. For certificates, use the file picker to upload an image directly — no manual folder management
5. Click **Save Changes**

Changes are live immediately — no redeploy needed.

## 📄 CV Generation

The "Download CV" button hits `/api/cv`, which builds a one-page, ATS-friendly PDF on the spot using whatever's currently in `content.json`. Update your experience in the admin panel, and the next CV download reflects it automatically — no separate resume file to maintain.

## ☁️ Deployment

Deployed on **Render** as a Node web service:

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** `ADMIN_PASSWORD`, `DISK_PATH`
- **Persistent disk:** required (Starter plan or higher) — mounted at `/data`, holds `content.json` and uploaded certificate images so they survive restarts and redeploys

To deploy your own copy: push this repo to GitHub, create a new Web Service on Render pointing at it, add a persistent disk, set the environment variables above, and deploy.

## 📌 Notes

- Services and Projects sections are intentionally static (edited directly in `index.html` / `cv-generator.js`) since they change far less often than experience or certificates
- All content defaults live in `data/content.json` and get copied onto the persistent disk on first boot — that file in the repo is a seed, not the live data source

---

© 2026 Qurat Ul Ain · Wah Cantt, Pakistan
