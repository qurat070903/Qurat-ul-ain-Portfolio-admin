require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');

const { generateCVBuffer } = require('./src/utils/cv-generator');

const app = express();

const PORT = process.env.PORT || 3000;

const CONTENT_PATH = path.join(
  __dirname,
  'data',
  'content.json'
);

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'changeme';

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(express.json({ limit: '1mb' }));

// Serve static files from public
app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

// --------------------------------------------------
// Frontend pages
// --------------------------------------------------

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

// Keep /admin.html working too
app.get('/admin.html', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'views', 'admin.html')
  );
});

// --------------------------------------------------
// Certificate upload
// --------------------------------------------------

const certificateStorage = multer.diskStorage({
  destination: path.join(
    __dirname,
    'public',
    'images',
    'certificates'
  ),

  filename: (req, file, callback) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    callback(
      null,
      `certificate-${Date.now()}${extension}`
    );
  },
});

const upload = multer({
  storage: certificateStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(
        new Error('Only image files are allowed.')
      );
    }
  },
});

app.post(
  '/api/upload-certificate',
  (req, res) => {
    upload.single('certificate')(
      req,
      res,
      (err) => {
        if (err) {
          return res.status(400).json({
            error:
              err.message ||
              'Upload failed.',
          });
        }

        if (!req.file) {
          return res.status(400).json({
            error:
              'No file received.',
          });
        }

        res.json({
          ok: true,
          filename: req.file.filename,
        });
      }
    );
  }
);

// --------------------------------------------------
// Get portfolio content
// --------------------------------------------------

app.get(
  '/api/content',
  async (req, res) => {
    try {
      const raw =
        await fs.readFile(
          CONTENT_PATH,
          'utf-8'
        );

      res.json(
        JSON.parse(raw)
      );
    } catch (err) {
      console.error(
        'Failed to read content.json:',
        err
      );

      res.status(500).json({
        error:
          'Could not load site content.',
      });
    }
  }
);

// --------------------------------------------------
// Generate CV
// --------------------------------------------------

app.get(
  '/api/cv',
  async (req, res) => {
    try {
      const raw =
        await fs.readFile(
          CONTENT_PATH,
          'utf-8'
        );

      const content =
        JSON.parse(raw);

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

// --------------------------------------------------
// Admin login
// --------------------------------------------------

app.post(
  '/api/admin/login',
  (req, res) => {
    const { password } =
      req.body || {};

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

// --------------------------------------------------
// Update portfolio content
// --------------------------------------------------

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

      await fs.writeFile(
        CONTENT_PATH,
        JSON.stringify(
          newContent,
          null,
          2
        ),
        'utf-8'
      );

      res.json({
        ok: true,
      });

    } catch (err) {
      console.error(
        'Failed to save content.json:',
        err
      );

      res.status(500).json({
        error:
          'Something went wrong saving. Please try again.',
      });
    }
  }
);

// --------------------------------------------------
// Local development
// --------------------------------------------------

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

// Export Express app for Vercel
module.exports = app;