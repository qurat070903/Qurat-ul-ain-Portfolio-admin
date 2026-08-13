# Qurat Ul Ain — Portfolio

A personal portfolio site with an **admin panel** — update your content (mark an internship as finished, edit your bio, add/remove roles) from the browser, no code editing required.

```
portfolio/
├── public/
│   ├── index.html         ← page structure (rarely needs editing now)
│   ├── admin.html         ← password-protected content editor
│   ├── css/style.css      ← all styling
│   ├── js/content.js      ← fetches content.json and renders the homepage
│   ├── js/admin.js        ← powers the admin panel
│   ├── js/script.js       ← menu + scroll animations
│   └── images/            ← your photo + certificate images go here
├── data/content.json      ← all your editable text lives here
├── server.js              ← Express server + content API
├── package.json
├── .env.example             ← copy to .env and set your admin password
└── README.md
```

## 1. Install

```bash
cd portfolio
npm install
```

## 2. Set your admin password

```bash
cp .env.example .env
```
Open `.env` and change `ADMIN_PASSWORD=changeme` to a real password only you know. This is what protects `/admin.html` — **do not skip this step**, especially if you deploy the site publicly.

## 3. Run it

```bash
npm start
```
Open **http://localhost:3000** for the site, and **http://localhost:3000/admin.html** for the editor.

## 4. Using the admin panel

Go to `/admin.html`, enter your password, and you can edit:
- **Hero** — eyebrow text, title, subtext
- **Who's This** — both bio paragraphs and the stat numbers (5+, 3, etc.)
- **Career Journey** — add, remove, or edit any experience entry. Check **"This is ongoing / current"** to show the CURRENT badge and hide the end date; uncheck it and fill in an end date once something finishes (this is exactly for the case where your POF internship ends — just uncheck the box, type the end month, hit Save)
- **Academic Record** — same idea, for your education timeline
- **Leadership** — same idea, for your ACM roles
- **Contact Info** — email, phone, LinkedIn/GitHub usernames

Click **Save Changes** at the bottom — it writes directly to `data/content.json` and your live site updates immediately (just refresh the homepage tab).

**Note:** Services and Certificates sections are still edited directly in `index.html` — they change far less often, so they weren't worth wiring into the admin panel. Ask if you'd like those added too.

## Adding your photo

Put your photo at `public/images/profile-cutout.png` (a transparent-background cutout works best with the current hero styling — see below). The path is already wired into `index.html`.

## Adding certificates

1. Put certificate images in `public/images/certificates/`
2. In `public/index.html`, find the `<!-- CERTIFICATES -->` section and follow the pattern of the existing `.cert-card` blocks — swap the placeholder `<svg>` for an `<img src="images/certificates/yourfile.jpg">` and fill in the title/issuer.

## Customizing the styling

Everything visual lives in `public/css/style.css`. The color variables at the top of the file control the whole palette:
```css
--ink:#1C0A0D;      /* text color */
--maroon:#8C1F2F;    /* primary accent */
--gold:#D9A441;      /* secondary accent */
```

## Deploying

This is a Node app (needed for the admin panel's save functionality), so it needs a host that runs Node — GitHub Pages alone won't support saving changes. Good free options:

- **[Render](https://render.com)** — connect your GitHub repo, start command `npm start`, add `ADMIN_PASSWORD` as an environment variable in their dashboard (don't commit your real `.env` file).
- **[Railway](https://railway.app)** — similar flow.

**Important:** if you deploy this publicly, make sure `ADMIN_PASSWORD` is set to something strong in your hosting provider's environment variables — anyone who knows your admin password can edit your live site content.

## Notes

- `data/content.json` is what actually gets edited when you save from `/admin.html`. You can also open and edit this file by hand if you're ever comfortable doing so — same effect as using the form.
- The admin login is intentionally simple (one shared password, no user accounts) — appropriate for a personal single-owner site, not for anything with multiple editors.
