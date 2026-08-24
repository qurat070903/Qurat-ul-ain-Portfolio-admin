const PDFDocument = require('pdfkit');

const INK = '#1C0A0D';
const MAROON = '#8C1F2F';
const GREY = '#5A5A5A';
const LINE = '#D8D8D8';

// Sections not yet wired into the admin panel (skills, projects) — kept here as a
// fallback so the CV still looks complete. Edit these directly if they change,
// or ask to have them added to content.json + admin.html like the rest.
const STATIC_SKILLS = [
  ['Programming Languages', 'Dart, PHP, Python, C++, JavaScript'],
  ['Frameworks & Tools', 'Flutter, Laravel, Firebase, REST APIs'],
  ['Databases', 'MySQL, SQLite, Firestore'],
  ['Web Technologies', 'HTML, CSS, JavaScript'],
  ['Design Tools', 'Figma, Adobe XD'],
  ['Dev Tools', 'Git, GitHub, VS Code, Android Studio'],
];

const STATIC_PROJECTS = [
  { title: 'AI Interior Design Studio', stack: 'Flutter, Firebase, Dart', desc: 'Developed an AI-powered mobile application generating personalised interior design suggestions from room images.' },
  { title: 'Restaurant Management System', stack: 'Laravel, Flutter, MySQL', desc: 'Built a restaurant management platform with menu management, order processing, and admin features.' },
  { title: 'PHP Bookstore Management System', stack: 'PHP, MySQL, HTML, CSS, Bootstrap', desc: 'Developed an online bookstore with product management and user authentication.' },
  { title: 'Python Banking System', stack: 'Python, SQLite', desc: 'Created a banking application with account management and transaction handling.' },
  { title: 'Online Shopping Management System', stack: 'Java, MySQL', desc: 'Built an online shopping system with product browsing, cart management, order processing, and user authentication.' },
];

const STATIC_SOFT_SKILLS = 'Communication, Teamwork, Problem Solving, Time Management, Leadership, Adaptability';
const STATIC_LOCATION = 'Wah Cantt, Pakistan';

function dateRange(item) {
  const start = item.dateStart || '';
  if (item.current) return `${start} – Present`;
  return item.dateEnd ? `${start} – ${item.dateEnd}` : start;
}

function sectionHeader(doc, title) {
  doc.moveDown(0.5);
  doc.fontSize(11.5).fillColor(MAROON).font('Helvetica-Bold').text(title.toUpperCase());
  doc.moveDown(0.15);
}

function generateCVBuffer(content) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 40, bottom: 34, left: 46, right: 46 },
      info: { Title: 'Qurat Ul Ain - CV', Author: 'Qurat Ul Ain' },
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.fontSize(20).fillColor(INK).font('Helvetica-Bold').text('Qurat Ul Ain');
    doc.moveDown(0.25);

    const c = content.contact || {};
    const contactLine = [
      STATIC_LOCATION,
      c.phone,
      c.email,
      c.linkedin ? `linkedin.com/in/${c.linkedin}` : null,
      c.github ? `github.com/${c.github}` : null,
    ].filter(Boolean).join('   |   ');

    doc.fontSize(9).fillColor(GREY).font('Helvetica').text(contactLine, { width: contentWidth });
    doc.moveDown(0.4);
    doc.strokeColor(LINE).lineWidth(0.75)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();

    const about = content.about || {};
    const summary = [about.paragraph1, about.paragraph2].filter(Boolean).join(' ');
    if (summary) {
      sectionHeader(doc, 'Professional Summary');
      doc.fontSize(9.5).fillColor(INK).font('Helvetica').text(summary, { width: contentWidth, lineGap: 1.5 });
    }

    const academics = content.academics || [];
    if (academics.length) {
      sectionHeader(doc, 'Education');
      academics.forEach((a) => {
        doc.fontSize(10).fillColor(INK).font('Helvetica-Bold').text(a.role || '');
        doc.fontSize(9.5).fillColor(GREY).font('Helvetica-Oblique')
          .text(`${a.org || ''}${a.org ? '   |   ' : ''}${dateRange(a)}`);
        doc.moveDown(0.15);
      });
    }

    sectionHeader(doc, 'Skills');
    STATIC_SKILLS.forEach(([label, value]) => {
      doc.fontSize(9.5).fillColor(INK).font('Helvetica-Bold').text(`${label}: `, { continued: true })
        .font('Helvetica').text(value);
    });

    const experience = content.experience || [];
    if (experience.length) {
      sectionHeader(doc, 'Experience');
      experience.forEach((e) => {
        doc.fontSize(10).fillColor(INK).font('Helvetica-Bold').text(e.role || '');
        doc.fontSize(9.5).fillColor(GREY).font('Helvetica-Oblique')
          .text(`${e.org || ''}${e.org ? '   |   ' : ''}${dateRange(e)}`);
        (e.bullets || []).forEach((b) => {
          doc.fontSize(9.3).fillColor(INK).font('Helvetica')
            .text(`-  ${b}`, { indent: 12, width: contentWidth - 12, lineGap: 0.5 });
        });
        doc.moveDown(0.2);
      });
    }

    sectionHeader(doc, 'Projects');
    STATIC_PROJECTS.forEach((p) => {
      doc.fontSize(10).fillColor(INK).font('Helvetica-Bold').text(`${p.title}  `, { continued: true })
        .fontSize(8.5).fillColor(GREY).font('Helvetica-Bold').text(`— ${p.stack}`);
      doc.fontSize(9.3).fillColor(INK).font('Helvetica')
        .text(`-  ${p.desc}`, { indent: 12, width: contentWidth - 12, lineGap: 0.5 });
      doc.moveDown(0.15);
    });

    const leadership = content.leadership || [];
    if (leadership.length) {
      sectionHeader(doc, 'Leadership & Activities');
      leadership.forEach((l) => {
        doc.fontSize(9.5).fillColor(INK).font('Helvetica-Bold').text(`${l.role}, `, { continued: true })
          .font('Helvetica').fillColor(INK).text(`${l.org}  `, { continued: true })
          .fillColor(GREY).text(`(${dateRange(l)})`);
      });
    }

    sectionHeader(doc, 'Soft Skills');
    doc.fontSize(9.5).fillColor(INK).font('Helvetica').text(STATIC_SOFT_SKILLS, { width: contentWidth });

    doc.end();
  });
}

module.exports = { generateCVBuffer };