# Qurat Ul Ain — Portfolio

A personal portfolio site with an admin panel for editing content and uploading certificates — no code editing required for day-to-day updates.

## Setup

```bash
npm install
cp .env.example .env
```
Edit `.env` and set `ADMIN_PASSWORD` to something only you know.

## Run

```bash
npm start
```
Site: http://localhost:3000
Admin: http://localhost:3000/admin.html

## Adding your photo

Place your photo at `public/images/profile-cutout.png` (a transparent-background cutout works best with the current hero styling).

## Editing content

Log into `/admin.html` to edit Hero text, About bio/stats, Career Journey, Academic Record, Leadership, Certificates (with image upload), and Contact info. Click **Save Changes** when done.

## Deploying

Push to GitHub, then connect the repo to a Node-friendly host like Render (Build: `npm install`, Start: `npm start`, and set `ADMIN_PASSWORD` as an environment variable in the host's dashboard).
