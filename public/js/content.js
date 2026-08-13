function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTimelineItems(list) {
  return list.map((item, i) => {
    const num = String(i + 1).padStart(2, '0');
    const isCurrent = !!item.current;
    const dateText = isCurrent
      ? `${escapeHtml(item.dateStart)} — PRESENT`
      : `${escapeHtml(item.dateStart)}${item.dateEnd ? ' — ' + escapeHtml(item.dateEnd) : ''}`;
    const bullets = Array.isArray(item.bullets) && item.bullets.length
      ? `<ul>${item.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
      : '';

    return `
      <div class="tl-item${isCurrent ? ' current' : ''}">
        <div class="tl-badge">${num}</div>
        <div class="tl-content">
          <div class="tl-role">${escapeHtml(item.role)}${isCurrent ? ' <span class="tl-badge-current">CURRENT</span>' : ''}</div>
          <div class="tl-org">${escapeHtml(item.org)}</div>
          <div class="tl-date">${dateText}</div>
          ${bullets}
        </div>
      </div>`;
  }).join('');
}

function renderContent(data) {
  // Hero
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle1 = document.getElementById('heroTitle1');
  const heroTitle2 = document.getElementById('heroTitle2');
  const heroSub = document.getElementById('heroSub');
  if (heroEyebrow) heroEyebrow.textContent = data.hero.eyebrow;
  if (heroTitle1) heroTitle1.textContent = data.hero.titleLine1;
  if (heroTitle2) heroTitle2.textContent = data.hero.titleLine2;
  if (heroSub) heroSub.textContent = data.hero.subtext;

  // About
  const aboutP1 = document.getElementById('aboutP1');
  const aboutP2 = document.getElementById('aboutP2');
  const aboutStats = document.getElementById('aboutStats');
  if (aboutP1) aboutP1.textContent = data.about.paragraph1;
  if (aboutP2) aboutP2.textContent = data.about.paragraph2;
  if (aboutStats) {
    aboutStats.innerHTML = data.about.stats.map(s => `
      <div>
        <div class="num">${escapeHtml(s.num)}</div>
        <div class="label">${escapeHtml(s.label)}</div>
      </div>
    `).join('');
  }

  // Experience
  const experienceList = document.getElementById('experienceList');
  if (experienceList) experienceList.innerHTML = renderTimelineItems(data.experience || []);

  // Academics
  const academicsList = document.getElementById('academicsList');
  if (academicsList) academicsList.innerHTML = renderTimelineItems(data.academics || []);

  // Leadership (simpler row layout, not the timeline)
  const leadershipList = document.getElementById('leadershipList');
  if (leadershipList) {
    leadershipList.innerHTML = (data.leadership || []).map(item => {
      const dateText = item.current
        ? `${escapeHtml(item.dateStart)} — PRESENT`
        : `${escapeHtml(item.dateStart)}${item.dateEnd ? ' — ' + escapeHtml(item.dateEnd) : ''}`;
      return `
        <div class="leadership-item">
          <div>
            <div class="leadership-role">${escapeHtml(item.role)}</div>
            <div class="leadership-org">${escapeHtml(item.org)}</div>
          </div>
          <div class="leadership-date">${dateText}</div>
        </div>`;
    }).join('');
  }

  // Contact
  const contactLinks = document.getElementById('contactLinks');
  if (contactLinks) {
    const c = data.contact;
    contactLinks.innerHTML = `
      <a class="contact-link" href="mailto:${escapeHtml(c.email)}">
        <div><span class="label">EMAIL</span><span class="value">${escapeHtml(c.email)}</span></div>
        <span class="arrow">→</span>
      </a>
      <a class="contact-link" href="tel:${escapeHtml(c.phone.replace(/\s+/g, ''))}">
        <div><span class="label">PHONE</span><span class="value">${escapeHtml(c.phone)}</span></div>
        <span class="arrow">→</span>
      </a>
      <a class="contact-link" href="https://linkedin.com/in/${escapeHtml(c.linkedin)}" target="_blank" rel="noopener">
        <div><span class="label">LINKEDIN</span><span class="value">${escapeHtml(c.linkedin)}</span></div>
        <span class="arrow">→</span>
      </a>
      <a class="contact-link" href="https://github.com/${escapeHtml(c.github)}" target="_blank" rel="noopener">
        <div><span class="label">GITHUB</span><span class="value">${escapeHtml(c.github)}</span></div>
        <span class="arrow">→</span>
      </a>
    `;
  }

  // Re-run scroll reveal for anything newly injected
  if (typeof window.initReveal === 'function') {
    window.initReveal();
  }
}

async function loadContent() {
  try {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('Failed to load content');
    const data = await res.json();
    renderContent(data);
  } catch (err) {
    console.error('Could not load site content:', err);
    const heroSub = document.getElementById('heroSub');
    if (heroSub) heroSub.textContent = 'Content failed to load — please refresh.';
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
