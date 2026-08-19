let content = null;
let adminPassword = null;

const loginBox = document.getElementById('loginBox');
const adminApp = document.getElementById('adminApp');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const saveBtn = document.getElementById('saveBtn');
const saveStatus = document.getElementById('saveStatus');

function escapeAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;');
}

// ---------- Login ----------
loginBtn.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });

async function attemptLogin() {
  const password = passwordInput.value;
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Checking…';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      adminPassword = password;
      sessionStorage.setItem('adminPassword', password);
      await loadAndShow();
    } else {
      loginError.textContent = 'Incorrect password.';
    }
  } catch (err) {
    console.error('Login/load error:', err);
    loginError.textContent = 'Something went wrong loading the admin panel. Check the browser console for details.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Unlock';
  }
}

async function loadAndShow() {
  const res = await fetch('/api/content');
  content = await res.json();

  // Safety net: make sure every expected section exists, even on older content.json files
  content.hero = content.hero || { eyebrow: '', titleLine1: '', titleLine2: '', subtext: '' };
  content.about = content.about || { paragraph1: '', paragraph2: '', stats: [] };
  content.about.stats = content.about.stats || [];
  content.experience = content.experience || [];
  content.academics = content.academics || [];
  content.leadership = content.leadership || [];
  content.certificates = content.certificates || [];
  content.contact = content.contact || { email: '', phone: '', linkedin: '', github: '' };

  populateForm();
  loginBox.style.display = 'none';
  adminApp.style.display = 'block';
}

// Auto-login if this tab already unlocked it this session
(async function tryAutoLogin() {
  const saved = sessionStorage.getItem('adminPassword');
  if (saved) {
    adminPassword = saved;
    try {
      await loadAndShow();
    } catch (err) {
      console.error('Auto-login failed:', err);
      sessionStorage.removeItem('adminPassword');
    }
  }
})();

// ---------- Populate simple fields ----------
function populateForm() {
  document.getElementById('f_heroEyebrow').value = content.hero.eyebrow || '';
  document.getElementById('f_heroTitle1').value = content.hero.titleLine1 || '';
  document.getElementById('f_heroTitle2').value = content.hero.titleLine2 || '';
  document.getElementById('f_heroSub').value = content.hero.subtext || '';

  document.getElementById('f_aboutP1').value = content.about.paragraph1 || '';
  document.getElementById('f_aboutP2').value = content.about.paragraph2 || '';

  document.getElementById('f_email').value = content.contact.email || '';
  document.getElementById('f_linkedin').value = content.contact.linkedin || '';
  document.getElementById('f_github').value = content.contact.github || '';

  renderStats();
  renderRepeatable('experience', 'experienceRepeat', true);
  renderRepeatable('academics', 'academicsRepeat', false);
  renderRepeatable('leadership', 'leadershipRepeat', false);
  renderCertificates();
}

// ---------- Stats (About section) ----------
function renderStats() {
  const el = document.getElementById('statsRepeat');
  el.innerHTML = content.about.stats.map((s, i) => `
    <div class="repeat-item" data-index="${i}">
      <button type="button" class="btn-small btn-remove" data-action="remove-stat" data-index="${i}">Remove</button>
      <div class="row-2">
        <div class="field">
          <label>Number</label>
          <input type="text" value="${escapeAttr(s.num)}" data-field="num" data-index="${i}">
        </div>
        <div class="field">
          <label>Label</label>
          <input type="text" value="${escapeAttr(s.label)}" data-field="label" data-index="${i}">
        </div>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', (e) => {
      const i = Number(e.target.dataset.index);
      const field = e.target.dataset.field;
      content.about.stats[i][field] = e.target.value;
    });
  });
  el.querySelectorAll('[data-action="remove-stat"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.target.dataset.index);
      content.about.stats.splice(i, 1);
      renderStats();
    });
  });
}

document.getElementById('addStat').addEventListener('click', () => {
  content.about.stats.push({ num: '0', label: 'NEW STAT' });
  renderStats();
});

// ---------- Generic repeatable list (experience / academics / leadership) ----------
function renderRepeatable(key, containerId, withBullets) {
  const el = document.getElementById(containerId);
  const items = content[key];

  el.innerHTML = items.map((item, i) => `
    <div class="repeat-item" data-index="${i}">
      <button type="button" class="btn-small btn-remove" data-action="remove-${key}" data-index="${i}">Remove</button>
      <div class="item-num">#${i + 1}</div>
      <div class="row-2">
        <div class="field">
          <label>Role / Title</label>
          <input type="text" value="${escapeAttr(item.role)}" data-key="${key}" data-field="role" data-index="${i}">
        </div>
        <div class="field">
          <label>Organization</label>
          <input type="text" value="${escapeAttr(item.org)}" data-key="${key}" data-field="org" data-index="${i}">
        </div>
      </div>
      <div class="row-2">
        <div class="field">
          <label>Start date</label>
          <input type="text" value="${escapeAttr(item.dateStart)}" data-key="${key}" data-field="dateStart" data-index="${i}">
        </div>
        <div class="field">
          <label>End date (leave blank if current)</label>
          <input type="text" value="${escapeAttr(item.dateEnd)}" data-key="${key}" data-field="dateEnd" data-index="${i}" ${item.current ? 'disabled' : ''}>
        </div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="current_${key}_${i}" data-key="${key}" data-field="current" data-index="${i}" ${item.current ? 'checked' : ''}>
        <label for="current_${key}_${i}">This is ongoing / current (shows a "CURRENT" badge and hides end date)</label>
      </div>
      ${withBullets ? `
        <div class="field">
          <label>Description (one point per line)</label>
          <textarea data-key="${key}" data-field="bullets" data-index="${i}">${escapeAttr((item.bullets || []).join('\n'))}</textarea>
        </div>
      ` : ''}
    </div>
  `).join('');

  el.querySelectorAll('input[type=text], textarea').forEach(input => {
    input.addEventListener('input', (e) => {
      const i = Number(e.target.dataset.index);
      const field = e.target.dataset.field;
      if (field === 'bullets') {
        content[key][i].bullets = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
      } else {
        content[key][i][field] = e.target.value;
      }
    });
  });

  el.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.index);
      content[key][i].current = e.target.checked;
      if (e.target.checked) content[key][i].dateEnd = '';
      renderRepeatable(key, containerId, withBullets);
    });
  });

  el.querySelectorAll(`[data-action="remove-${key}"]`).forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.target.dataset.index);
      content[key].splice(i, 1);
      renderRepeatable(key, containerId, withBullets);
    });
  });
}

document.getElementById('addExperience').addEventListener('click', () => {
  content.experience.unshift({ role: 'New Role', org: 'Organization', dateStart: '', dateEnd: '', current: true, bullets: [] });
  renderRepeatable('experience', 'experienceRepeat', true);
});
document.getElementById('addAcademic').addEventListener('click', () => {
  content.academics.push({ role: 'New Qualification', org: 'Institution', dateStart: '', dateEnd: '', current: false });
  renderRepeatable('academics', 'academicsRepeat', false);
});
document.getElementById('addLeadership').addEventListener('click', () => {
  content.leadership.unshift({ role: 'New Role', org: 'Organization', dateStart: '', dateEnd: '', current: false });
  renderRepeatable('leadership', 'leadershipRepeat', false);
});

// ---------- Certificates ----------
function renderCertificates() {
  const el = document.getElementById('certificatesRepeat');
  const certs = content.certificates || [];

  el.innerHTML = certs.map((c, i) => `
    <div class="repeat-item" data-index="${i}">
      <button type="button" class="btn-small btn-remove" data-action="remove-cert" data-index="${i}">Remove</button>
      <div class="item-num">#${i + 1}</div>
      ${c.image
        ? `<img class="cert-preview" src="images/certificates/${escapeAttr(c.image)}" alt="">`
        : `<div class="cert-preview-empty">No image uploaded yet</div>`
      }
      <div class="field">
        <label>Certificate image</label>
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-action="upload-cert" data-index="${i}">
        <div class="upload-status" data-status-index="${i}"></div>
      </div>
      <div class="row-2">
        <div class="field">
          <label>Certificate title</label>
          <input type="text" value="${escapeAttr(c.title)}" data-cert-field="title" data-index="${i}">
        </div>
        <div class="field">
          <label>Issuing organization</label>
          <input type="text" value="${escapeAttr(c.issuer)}" data-cert-field="issuer" data-index="${i}">
        </div>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('input[type=text]').forEach(input => {
    input.addEventListener('input', (e) => {
      const i = Number(e.target.dataset.index);
      const field = e.target.dataset.certField;
      content.certificates[i][field] = e.target.value;
    });
  });

  el.querySelectorAll('[data-action="remove-cert"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.target.dataset.index);
      content.certificates.splice(i, 1);
      renderCertificates();
    });
  });

  el.querySelectorAll('[data-action="upload-cert"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      const i = Number(e.target.dataset.index);
      const file = e.target.files[0];
      if (!file) return;

      const statusEl = el.querySelector(`[data-status-index="${i}"]`);
      statusEl.textContent = 'Uploading…';
      statusEl.className = 'upload-status';

      const formData = new FormData();
      formData.append('certificate', file);

      try {
        const res = await fetch('/api/upload-certificate', {
          method: 'POST',
          headers: { 'X-Admin-Password': adminPassword },
          body: formData
        });
        const data = await res.json();
        if (res.ok) {
          content.certificates[i].image = data.filename;
          statusEl.textContent = 'Uploaded ✓';
          statusEl.classList.add('success');
          renderCertificates();
        } else {
          statusEl.textContent = data.error || 'Upload failed.';
          statusEl.classList.add('error');
        }
      } catch (err) {
        statusEl.textContent = 'Network error during upload.';
        statusEl.classList.add('error');
      }
    });
  });
}

document.getElementById('addCertificate').addEventListener('click', () => {
  content.certificates.push({ image: '', title: 'New Certificate', issuer: 'Issuing Organization' });
  renderCertificates();
});

// ---------- Save ----------
saveBtn.addEventListener('click', async () => {
  content.hero.eyebrow = document.getElementById('f_heroEyebrow').value;
  content.hero.titleLine1 = document.getElementById('f_heroTitle1').value;
  content.hero.titleLine2 = document.getElementById('f_heroTitle2').value;
  content.hero.subtext = document.getElementById('f_heroSub').value;

  content.about.paragraph1 = document.getElementById('f_aboutP1').value;
  content.about.paragraph2 = document.getElementById('f_aboutP2').value;

  content.contact.email = document.getElementById('f_email').value;
  content.contact.linkedin = document.getElementById('f_linkedin').value;
  content.contact.github = document.getElementById('f_github').value;

  saveStatus.textContent = 'Saving…';
  saveStatus.className = 'save-status';
  saveBtn.disabled = true;

  try {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword
      },
      body: JSON.stringify(content)
    });
    const data = await res.json();
    if (res.ok) {
      saveStatus.textContent = 'Saved ✓';
      saveStatus.classList.add('success');
    } else {
      saveStatus.textContent = data.error || 'Save failed.';
      saveStatus.classList.add('error');
    }
  } catch (err) {
    saveStatus.textContent = 'Network error — not saved.';
    saveStatus.classList.add('error');
  } finally {
    saveBtn.disabled = false;
    setTimeout(() => { saveStatus.textContent = ''; saveStatus.className = 'save-status'; }, 4000);
  }
});
