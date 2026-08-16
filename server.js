require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');
const CERT_DIR = path.join(__dirname, 'public', 'images', 'certificates');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, CERT_DIR),
  filename: (req, file, cb) => {
    const safeBase = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .slice(0, 60);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  }
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
  }
});

app.post('/api/upload-certificate', (req, res) => {
  const password = req.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  upload.single('certificate')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file received.' });
    }
    res.json({ ok: true, filename: req.file.filename });
  });
});

app.get('/api/content', async (req, res) => {
  try {
    const raw = await fs.readFile(CONTENT_PATH, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read content.json:', err);
    res.status(500).json({ error: 'Could not load site content.' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Incorrect password.' });
  }
});

app.post('/api/content', async (req, res) => {
  try {
    const password = req.get('X-Admin-Password');
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const newContent = req.body;
    if (!newContent || typeof newContent !== 'object') {
      return res.status(400).json({ error: 'Invalid content payload.' });
    }

    const requiredKeys = ['hero', 'about', 'experience', 'academics', 'leadership', 'contact', 'certificates'];
    for (const key of requiredKeys) {
      if (!(key in newContent)) {
        return res.status(400).json({ error: `Missing "${key}" section — nothing was saved.` });
      }
    }

    await fs.writeFile(CONTENT_PATH, JSON.stringify(newContent, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save content.json:', err);
    res.status(500).json({ error: 'Something went wrong saving. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin.html`);
});
