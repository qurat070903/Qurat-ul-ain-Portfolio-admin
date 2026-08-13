require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_PATH = path.join(__dirname, 'data', 'content.json');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Public: read the current content (used by the homepage to render itself)
app.get('/api/content', async (req, res) => {
  try {
    const raw = await fs.readFile(CONTENT_PATH, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read content.json:', err);
    res.status(500).json({ error: 'Could not load site content.' });
  }
});

// Admin: check password without saving anything (used by the admin page to "log in")
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Incorrect password.' });
  }
});

// Protected: overwrite the content file
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

    // Basic shape check so a malformed save can't wipe the site
    const requiredKeys = ['hero', 'about', 'experience', 'academics', 'leadership', 'contact'];
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

// Protected: upload a certificate image, returns its public path
const certStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'images', 'certificates'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `cert-${Date.now()}${ext}`);
  }
});
const certUpload = multer({
  storage: certStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, or WEBP images are allowed.'));
  }
});

app.post('/api/admin/upload-certificate', certUpload.single('image'), (req, res) => {
  const password = req.get('X-Admin-Password');
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded.' });
  }
  res.json({ path: `images/certificates/${req.file.filename}` });
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
  console.log(`Admin panel at http://localhost:${PORT}/admin.html`);
});
