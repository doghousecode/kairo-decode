export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rogues Gallery · Session 1</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
      min-height: 100vh;
      color: #e5e5e7;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1rem 3rem;
      overflow-x: hidden;
    }
    .page { width: 100%; max-width: 820px; }

    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 9.5pt;
      font-weight: 600;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }
    h1 {
      font-size: 30pt;
      font-weight: 700;
      color: #fff;
      letter-spacing: -0.03em;
      margin-bottom: 0.4rem;
    }
    .subtitle { font-size: 11pt; color: #71717a; margin-bottom: 2rem; }

    /* Upload form */
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      margin-bottom: 2.5rem;
    }
    .name-input {
      width: 280px;
      padding: 0.5rem 0.85rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      color: #e5e5e7;
      font-size: 10pt;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s;
    }
    .name-input::placeholder { color: #52525b; }
    .name-input:focus { border-color: rgba(99,102,241,0.5); }
    .upload-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.25rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 10pt;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
      user-select: none;
    }
    .upload-btn:hover { opacity: 0.85; }
    .upload-btn.uploading { opacity: 0.6; cursor: default; pointer-events: none; }
    .upload-hint { font-size: 9.5pt; color: #52525b; }
    .upload-status {
      font-size: 9.5pt;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      display: none;
    }
    .upload-status.success { background: rgba(34,197,94,0.12); color: #4ade80; display: inline-block; }
    .upload-status.error { background: rgba(239,68,68,0.12); color: #f87171; display: inline-block; }

    /* Gallery */
    .stage {
      perspective: 1100px;
      perspective-origin: 50% 50%;
      position: relative;
      height: 430px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0;
      overflow: hidden;
    }
    .card {
      position: absolute;
      width: 290px;
      height: 400px;
      border-radius: 14px;
      overflow: hidden;
      background: #1a1a24;
      box-shadow: 0 24px 64px rgba(0,0,0,0.55);
      transition: transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  opacity 0.38s ease;
      cursor: pointer;
      will-change: transform, opacity;
      user-select: none;
      -webkit-user-select: none;
    }
    .card.center {
      cursor: zoom-in;
      box-shadow: 0 32px 80px rgba(99,102,241,0.25), 0 24px 64px rgba(0,0,0,0.6);
    }
    .card img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
      background: #111118;
      -webkit-touch-callout: none;
      user-select: none;
      -webkit-user-select: none;
      pointer-events: none;
    }

    /* Context menu */
    .ctx-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 200;
    }
    .ctx-backdrop.open { display: block; }
    .ctx-menu {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: #1e1e2e;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 0.4rem;
      min-width: 220px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.6);
      z-index: 201;
    }
    .ctx-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      border-radius: 10px;
      color: #e5e5e7;
      font-size: 11pt;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      text-align: left;
    }
    .ctx-item:hover { background: rgba(255,255,255,0.07); }
    .ctx-item.danger { color: #f87171; }
    .ctx-divider { height: 1px; background: rgba(255,255,255,0.08); margin: 0.25rem 0; }
    .card .card-name {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.25rem 0.75rem 0.65rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.72));
      color: #e5e5e7;
      font-size: 9pt;
      font-weight: 500;
      text-align: center;
      pointer-events: none;
    }

    /* Nav */
    .nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-top: 1.25rem;
    }
    .nav-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: #e5e5e7;
      font-size: 20pt;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-btn:hover { background: rgba(255,255,255,0.14); transform: scale(1.08); }
    .nav-btn:disabled { opacity: 0.3; cursor: default; transform: none; }
    .counter { font-size: 10pt; color: #52525b; min-width: 3rem; text-align: center; }

    .loading, .empty {
      text-align: center;
      padding: 4rem 0;
      color: #52525b;
      font-size: 10.5pt;
    }
    .empty strong { display: block; font-size: 13pt; color: #71717a; margin-bottom: 0.4rem; }
    .api-error {
      font-size: 9.5pt;
      color: #f87171;
      background: rgba(239,68,68,0.08);
      border-radius: 8px;
      padding: 0.5rem 0.85rem;
      margin-top: 0.75rem;
      display: none;
    }

    /* Lightbox */
    .lightbox {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      z-index: 100;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(6px);
      cursor: zoom-out;
    }
    .lightbox.open { display: flex; }
    .lightbox img {
      max-width: 92vw;
      max-height: 90vh;
      border-radius: 12px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.7);
      cursor: default;
    }
    .lightbox-close {
      position: fixed;
      top: 1.25rem;
      right: 1.5rem;
      color: #a1a1aa;
      font-size: 22pt;
      cursor: pointer;
      background: none;
      border: none;
      line-height: 1;
    }
    .lightbox-close:hover { color: #fff; }

    footer {
      margin-top: 3rem;
      font-size: 9.5pt;
      color: #3f3f46;
      text-align: center;
    }

    @media (min-width: 640px) {
      .stage { height: 620px; }
      .card { width: 420px; height: 580px; }
    }

    @media (max-width: 500px) {
      .stage { height: 340px; }
      .card { width: 220px; height: 310px; }
      .name-input { width: 100%; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="badge">Session 1 · Rogues Gallery</div>
  <h1>What everyone built</h1>
  <p class="subtitle">AI Jargon Busters from the workshop — upload yours!</p>

  <div class="upload-form">
    <input type="text" id="name-input" class="name-input" placeholder="Your name (optional)" maxlength="80">
    <div class="upload-row">
      <label class="upload-btn" id="upload-label">
        📸 Share yours
        <input type="file" id="file-input" accept="image/*" hidden>
      </label>
      <span class="upload-status" id="upload-status"></span>
    </div>
  </div>

  <div class="loading" id="loading">Loading gallery...</div>
  <div class="api-error" id="api-error"></div>

  <div class="stage" id="stage" style="display:none;"></div>
  <div class="nav" id="nav" style="display:none;">
    <button class="nav-btn" id="prev-btn" onclick="prev()">&#8249;</button>
    <span class="counter" id="counter"></span>
    <button class="nav-btn" id="next-btn" onclick="next()">&#8250;</button>
  </div>
  <div class="empty" id="empty" style="display:none;">
    <strong>No uploads yet</strong>
    Be the first to share your Jargon Buster!
  </div>

  <footer>Decode &middot; ASO Ops AI Workshop &middot; Session 1</footer>
</div>

<!-- Lightbox -->
<div class="lightbox" id="lightbox" onclick="closeLightbox()">
  <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
  <img id="lightbox-img" src="" alt="" onclick="event.stopPropagation()">
</div>

<!-- Context menu -->
<div class="ctx-backdrop" id="ctx-backdrop" onclick="closeCtx()"></div>
<div class="ctx-menu" id="ctx-menu" style="display:none;">
  <button class="ctx-item" onclick="ctxOpen()">🔍 Open full size</button>
  <div class="ctx-divider" id="ctx-divider" style="display:none;"></div>
  <button class="ctx-item danger" id="ctx-delete" style="display:none;" onclick="ctxDelete()">🗑 Delete image</button>
</div>

<script>
  let images = [];
  let active = 0;
  let touchStartX = 0, touchStartY = 0;
  let longPressTimer = null;
  let didLongPress = false;
  let ctxFilename = null, ctxUrl = null;

  const isST = (localStorage.getItem('kairo-initials') || '').toUpperCase() === 'ST';

  const TX    = [0,   62,  105, 138];
  const SCALE = [1, 0.80, 0.64, 0.52];
  const RY    = [0,   22,   38,  48];
  const OPAC  = [1, 0.82, 0.58, 0.32];

  function applyStyle(card, offset) {
    const abs = Math.abs(offset);
    if (abs > 3) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.3)';
      card.style.zIndex = '0';
      card.style.pointerEvents = 'none';
      return;
    }
    const dir = offset >= 0 ? 1 : -1;
    card.style.transform =
      'translateX(' + (dir * TX[abs]) + '%) ' +
      'scale(' + SCALE[abs] + ') ' +
      'rotateY(' + (-dir * RY[abs]) + 'deg)';
    card.style.opacity  = String(OPAC[abs]);
    card.style.zIndex   = String(10 - abs);
    card.style.pointerEvents = 'auto';
    card.classList.toggle('center', abs === 0);
  }

  function render() {
    const stage = document.getElementById('stage');
    stage.innerHTML = '';
    images.forEach((img, i) => {
      const card = document.createElement('div');
      card.className = 'card';

      const el = document.createElement('img');
      el.src = img.url;
      el.alt = img.display_name || ('Jargon Buster ' + (i + 1));
      el.loading = 'lazy';
      card.appendChild(el);

      if (img.display_name) {
        const nameEl = document.createElement('div');
        nameEl.className = 'card-name';
        nameEl.textContent = img.display_name;
        card.appendChild(nameEl);
      }

      applyStyle(card, i - active);

      // Click: navigate or open lightbox
      card.addEventListener('click', () => {
        if (didLongPress) return;
        if (i !== active) navigate(i);
        else openLightbox(img.url);
      });

      // Long press
      card.addEventListener('contextmenu', e => e.preventDefault());
      card.addEventListener('touchstart', e => {
        didLongPress = false;
        longPressTimer = setTimeout(() => {
          didLongPress = true;
          openCtx(img.filename, img.url);
        }, 500);
      }, { passive: true });
      card.addEventListener('touchmove', e => {
        clearTimeout(longPressTimer);
      }, { passive: true });
      card.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
        // reset didLongPress after a tick so the click handler can check it
        setTimeout(() => { didLongPress = false; }, 100);
      });

      stage.appendChild(card);
    });
    updateNav();
  }

  function updateNav() {
    document.getElementById('counter').textContent = (active + 1) + ' / ' + images.length;
    document.getElementById('prev-btn').disabled = active === 0;
    document.getElementById('next-btn').disabled = active === images.length - 1;
  }

  function navigate(i) {
    active = Math.max(0, Math.min(images.length - 1, i));
    document.querySelectorAll('.card').forEach((card, idx) => applyStyle(card, idx - active));
    updateNav();
  }

  function prev() { navigate(active - 1); }
  function next() { navigate(active + 1); }

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     { closeLightbox(); closeCtx(); }
  });

  // Stage swipe (horizontal only)
  const stage = document.getElementById('stage');
  stage.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchmove', e => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy) e.preventDefault();
  }, { passive: false });
  stage.addEventListener('touchend', e => {
    if (didLongPress) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
  });

  function openLightbox(url) {
    document.getElementById('lightbox-img').src = url;
    document.getElementById('lightbox').classList.add('open');
  }
  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
  }

  // Context menu
  function openCtx(filename, url) {
    ctxFilename = filename;
    ctxUrl = url;
    const menu = document.getElementById('ctx-menu');
    const backdrop = document.getElementById('ctx-backdrop');
    const deleteBtn = document.getElementById('ctx-delete');
    const divider = document.getElementById('ctx-divider');
    deleteBtn.style.display = isST ? 'flex' : 'none';
    divider.style.display = isST ? 'block' : 'none';
    menu.style.display = 'block';
    backdrop.classList.add('open');
  }
  function closeCtx() {
    document.getElementById('ctx-menu').style.display = 'none';
    document.getElementById('ctx-backdrop').classList.remove('open');
  }
  function ctxOpen() {
    closeCtx();
    window.open(ctxUrl, '_blank');
  }
  async function ctxDelete() {
    if (!ctxFilename) return;
    if (!confirm('Delete this image?')) return;
    closeCtx();
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: ctxFilename }),
      });
      if (!res.ok) throw new Error('Failed');
      await load(false);
    } catch {
      alert('Delete failed — are you logged in?');
    }
  }

  async function load(jumpToFirst) {
    const errEl = document.getElementById('api-error');
    try {
      const res = await fetch('/api/gallery');
      const body = await res.json();
      if (body.error) throw new Error(body.error);
      images = body.images || [];
      errEl.style.display = 'none';
    } catch (e) {
      images = [];
      errEl.textContent = 'Could not load gallery: ' + e.message;
      errEl.style.display = 'block';
    }

    document.getElementById('loading').style.display = 'none';

    if (images.length === 0) {
      document.getElementById('empty').style.display = 'block';
      document.getElementById('stage').style.display = 'none';
      document.getElementById('nav').style.display = 'none';
      return;
    }

    document.getElementById('empty').style.display = 'none';
    if (jumpToFirst) active = 0;
    document.getElementById('stage').style.display = 'flex';
    document.getElementById('nav').style.display = images.length > 1 ? 'flex' : 'none';
    render();
  }

  document.getElementById('file-input').addEventListener('change', async function () {
    const file = this.files[0];
    if (!file) return;

    const label      = document.getElementById('upload-label');
    const status     = document.getElementById('upload-status');
    const nameInput  = document.getElementById('name-input');

    label.classList.add('uploading');
    label.childNodes[0].textContent = '⏳ Uploading…';
    status.className = 'upload-status';
    status.style.display = 'none';

    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('display_name', nameInput.value.trim());

      const res  = await fetch('/api/gallery', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'Upload failed');

      status.textContent = '✓ Uploaded!';
      status.className = 'upload-status success';

      await load(true);
    } catch (e) {
      status.textContent = '✗ ' + (e.message || 'Upload failed');
      status.className = 'upload-status error';
    } finally {
      label.classList.remove('uploading');
      label.childNodes[0].textContent = '📸 Share yours';
      this.value = '';
    }
  });

  load(false);
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
