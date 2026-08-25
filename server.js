require('dotenv').config();
require('dotenv').config({ path: '.env.local', override: true });

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const { put, get } = require('@vercel/blob');

const { generateCVBuffer } = require('./src/utils/cv-generator');

const app = express();

const PORT = process.env.PORT || 3000;

const CONTENT_PATH = path.join(
  __dirname,
  'data',
  'content.json'
);

const CONTENT_BLOB_PATH = 'portfolio/content.json';

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'changeme';


// ==================================================
// Middleware
// ==================================================

app.use(express.json({ limit: '1mb' }));

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);


// ==================================================
// Frontend Pages
// ==================================================

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'index.html')
  );
});

app.get('/admin', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'admin.html')
  );
});

app.get('/admin.html', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'admin.html')
  );
});


// ==================================================
// Load Portfolio Content
// ==================================================

async function loadContent() {
  try {
    // Try Vercel Blob first
    const result = await get(
      CONTENT_BLOB_PATH,
      {
        access: 'public',
        useCache: false,
      }
    );

    if (result && result.statusCode === 200 && result.stream) {
      const text = await new Response(
        result.stream
      ).text();

      return JSON.parse(text);
    }
  } catch (blobError) {
    console.log(
      'Blob content not found yet. Using local content.json.'
    );
  }

  // First deployment / local development fallback
  const raw = await fs.readFile(
    CONTENT_PATH,
    'utf-8'
  );

  return JSON.parse(raw);
}


// ==================================================
// Save Portfolio Content to Blob
// ==================================================

async function saveContent(content) {
  const blob = await put(
    CONTENT_BLOB_PATH,
    JSON.stringify(content, null, 2),
    {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    }
  );

  return blob;
}


// ==================================================
// Certificate Upload
// ==================================================

const certificateUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Only image files are allowed.'
        )
      );
    }
  },
});


app.post(
  '/api/upload-certificate',
  (req, res) => {

    certificateUpload.single('certificate')(
      req,
      res,
      async (err) => {

        try {

          if (err) {
            return res.status(400).json({
              error:
                err.message ||
                'Upload failed.',
            });
          }

          // Check admin password
          const password =
            req.get(
              'X-Admin-Password'
            );

          if (
            password !==
            ADMIN_PASSWORD
          ) {
            return res.status(401).json({
              error:
                'Incorrect password.',
            });
          }

          if (!req.file) {
            return res.status(400).json({
              error:
                'No file received.',
            });
          }

          const extension =
            path.extname(
              req.file.originalname
            ).toLowerCase();

          const filename =
            `certificate-${Date.now()}${extension}`;

          const blob = await put(
            `certificates/${filename}`,
            req.file.buffer,
            {
              access: 'public',
              contentType:
                req.file.mimetype,
              addRandomSuffix: false,
            }
          );

          res.json({
            ok: true,

            // Full Blob URL
            url: blob.url,

            // Keep filename for compatibility
            filename: blob.url,
          });

        } catch (uploadError) {

          console.error(
            'Certificate upload failed:',
            uploadError
          );

          res.status(500).json({
            error:
              'Could not upload certificate.',
          });
        }
      }
    );
  }
);


// ==================================================
// Get Portfolio Content
// ==================================================

app.get(
  '/api/content',
  async (req, res) => {

    try {

      const content =
        await loadContent();

      res.json(content);

    } catch (err) {

      console.error(
        'Failed to load content:',
        err
      );

      res.status(500).json({
        error:
          'Could not load site content.',
      });
    }
  }
);


// ==================================================
// Generate CV
// ==================================================

app.get(
  '/api/cv',
  async (req, res) => {

    try {

      const content =
        await loadContent();

      const pdfBuffer =
        await generateCVBuffer(
          content
        );

      res.setHeader(
        'Content-Type',
        'application/pdf'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename="Qurat_Ul_Ain_CV.pdf"'
      );

      res.send(pdfBuffer);

    } catch (err) {

      console.error(
        'Failed to generate CV:',
        err
      );

      res.status(500).json({
        error:
          'Could not generate CV right now. Please try again.',
      });
    }
  }
);


// ==================================================
// Admin Login
// ==================================================

app.post(
  '/api/admin/login',
  (req, res) => {

    const {
      password
    } = req.body || {};

    if (
      password ===
      ADMIN_PASSWORD
    ) {

      return res.json({
        ok: true,
      });
    }

    res.status(401).json({
      error:
        'Incorrect password.',
    });
  }
);


// ==================================================
// Save Portfolio Content
// ==================================================

app.post(
  '/api/content',
  async (req, res) => {

    try {

      const password =
        req.get(
          'X-Admin-Password'
        );

      if (
        password !==
        ADMIN_PASSWORD
      ) {

        return res.status(401).json({
          error:
            'Incorrect password.',
        });
      }

      const newContent =
        req.body;

      if (
        !newContent ||
        typeof newContent !==
          'object'
      ) {

        return res.status(400).json({
          error:
            'Invalid content payload.',
        });
      }

      const requiredKeys = [
        'hero',
        'about',
        'experience',
        'academics',
        'leadership',
        'contact',
        'certificates',
      ];

      for (
        const key of requiredKeys
      ) {

        if (!(key in newContent)) {

          return res.status(400).json({
            error:
              `Missing "${key}" section — nothing was saved.`,
          });
        }
      }

      // Save to Vercel Blob
      const blob =
        await saveContent(
          newContent
        );

      console.log(
        'Content saved to Blob:',
        blob.url
      );

      res.json({
        ok: true,
      });

    } catch (err) {

      console.error(
        'Failed to save content:',
        err
      );

      res.status(500).json({
        error:
          'Something went wrong saving. Please try again.',
      });
    }
  }
);


// ==================================================
// Local Development
// ==================================================

if (require.main === module) {

  app.listen(
    PORT,
    () => {

      console.log(
        `Portfolio server running at http://localhost:${PORT}`
      );

      console.log(
        `Admin panel at http://localhost:${PORT}/admin`
      );
    }
  );
}


// Export for Vercel
module.exports = app;