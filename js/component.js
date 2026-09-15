// components.js — shared CHEENO header + footer, no build step

/* ═══════════════════════════════════════════════════════════════
   STYLES (scoped so they never clash with page-specific CSS)
   ═══════════════════════════════════════════════════════════════ */
const STYLES = `
:root{
  --cheeno-cream:#FFF5E6; --cheeno-charcoal:#2D2D2D;
  --cheeno-orange:#E8600A; --cheeno-teal:#1B8A8F;
  --cheeno-red:#C0392B; --cheeno-yellow:#F5C518;
  --cheeno-pink:#E8738A; --cheeno-muted:#6B5B4E;

  /* light-mode logo tint — darker than --cheeno-yellow so it reads on white */
  --cheeno-amber:#C99A00;
}

/* ── HEADER ─────────────────────────────────────────────── */
.cheeno-nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2rem;height:56px;

  /* translucent white + blur */
  background:rgba(255,255,255,.82);
  -webkit-backdrop-filter:blur(14px) saturate(180%);
  backdrop-filter:blur(14px) saturate(180%);

  border-bottom:2px solid var(--cheeno-orange);
  font-family:'Space Mono',monospace;
}

/* Fallback for browsers without backdrop-filter */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .cheeno-nav{background:rgba(255,255,255,.96);}
}

.cheeno-logo{
  font-family:'Bebas Neue',sans-serif;font-size:1.6rem;
  letter-spacing:2px;display:flex;gap:2px;align-items:baseline;
  text-decoration:none;cursor:pointer;
}
/* on white: charcoal / orange / darkened amber */
.cheeno-logo .ch-ch{color:var(--cheeno-charcoal);}
.cheeno-logo .ch-ee{color:var(--cheeno-orange);}
.cheeno-logo .ch-no{color:var(--cheeno-amber);}

.cheeno-nav-links{display:flex;gap:1.8rem;}
.cheeno-nav-links a{
  color:var(--cheeno-muted);text-decoration:none;font-size:.63rem;letter-spacing:2px;
  text-transform:uppercase;transition:color .2s;cursor:pointer;
}
.cheeno-nav-links a:hover,
.cheeno-nav-links a.active{color:var(--cheeno-orange);}

.cheeno-nav-cta{
  background:var(--cheeno-orange);color:#fff;border:none;
  padding:.45rem 1.1rem;font-family:'Space Mono',monospace;
  font-size:.7rem;letter-spacing:1px;cursor:pointer;
  transition:background .2s;
}
.cheeno-nav-cta:hover{background:#c4510a;}

/* ── FOOTER ─────────────────────────────────────────────── */
.cheeno-footer{
  background:var(--cheeno-charcoal);
  border-top:4px solid var(--cheeno-orange);
  padding:3rem 3.5rem;
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:3rem;
  font-family:'Space Mono',monospace;
}
.cheeno-f-logo{
  font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:1px;
  display:flex;gap:2px;align-items:baseline;
}
.cheeno-f-logo .ch-ch{color:#fff;}
.cheeno-f-logo .ch-ee{color:var(--cheeno-orange);}
.cheeno-f-logo .ch-no{color:var(--cheeno-yellow);}

.cheeno-f-tagline{
  font-family:'DM Serif Display',serif;font-style:italic;
  color:#888;font-size:.88rem;margin:.5rem 0 .8rem;
}
.cheeno-f-url{font-size:.62rem;color:var(--cheeno-teal);letter-spacing:2px;}

.cheeno-f-col h4{
  font-size:.62rem;letter-spacing:3px;text-transform:uppercase;
  color:var(--cheeno-orange);margin-bottom:1rem;
}
.cheeno-f-col a{
  display:block;font-size:.72rem;color:#888;text-decoration:none;
  margin-bottom:.5rem;cursor:pointer;transition:color .2s;
}
.cheeno-f-col a:hover{color:#fff;}

.cheeno-f-built{font-size:.62rem;letter-spacing:1px;color:#555;line-height:2.2;}
.cheeno-f-built span{color:var(--cheeno-teal);}

/* ── Responsive ─────────────────────────────────────────── */
@media(max-width:900px){
  .cheeno-nav-links{display:none;}
  .cheeno-nav{padding:0 1rem;}
  .cheeno-footer{grid-template-columns:1fr;padding:2.5rem 1.5rem;gap:2rem;}
}
`;

/* ═══════════════════════════════════════════════════════════════
   MARKUP
   ═══════════════════════════════════════════════════════════════ */

const LOGO_HTML = `
  <span class="ch-ch">CH</span><span class="ch-ee">EE</span><span class="ch-no">NO</span>
`;

const HEADER_HTML = `
<header class="cheeno-nav">
  <a class="cheeno-logo" href="index.html" aria-label="CHEENO home">
    ${LOGO_HTML}
  </a>

  <nav class="cheeno-nav-links">
    <a href="index.html"        data-cheeno-nav="index.html">Home</a>
    <a href="digitalBoard.html" data-cheeno-nav="digitalBoard.html">Board</a>
    <a href="profile.html"      data-cheeno-nav="profile.html">My Profile</a>
  </nav>

  <button class="cheeno-nav-cta" onclick="window.openCompose ? openCompose() : (location.href='digitalBoard.html')">
    Pin a query →
  </button>
</header>
`;

const FOOTER_HTML = `
<footer class="cheeno-footer">
  <div>
    <div class="cheeno-f-logo">${LOGO_HTML}</div>
    <div class="cheeno-f-tagline">Your campus, pinned in one place.</div>
    <div class="cheeno-f-url">cheeno.app</div>
  </div>

  <div class="cheeno-f-col">
    <h4>Explore</h4>
    <a href="index.html">Home</a>
    <a href="digitalBoard.html">Query Board</a>
    <a href="profile.html">My Profile</a>
    <a href="index.html#rankings">Rankings</a>
    <a href="index.html#faculty">Faculty & Feedback</a>
  </div>

  <div class="cheeno-f-col cheeno-f-built">
    <h4>Built with</h4>
    <span>HTML · CSS · JS</span><br>
    <span>Firebase Authentication</span><br>
    <span>Cloud Firestore</span><br>
    <span>Firebase Hosting</span><br><br>
    <span style="color:#555">© CHEENO — Campus Platform</span>
  </div>
</footer>
`;

/* ═══════════════════════════════════════════════════════════════
   MOUNT
   ═══════════════════════════════════════════════════════════════ */
function injectStyles(){
  if (document.getElementById('cheeno-styles')) return;
  const s = document.createElement('style');
  s.id = 'cheeno-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

function mountHeader(){
  const el = document.querySelector('[data-cheeno-header]');
  if (el) el.outerHTML = HEADER_HTML;
}

function mountFooter(){
  const el = document.querySelector('[data-cheeno-footer]');
  if (el) el.outerHTML = FOOTER_HTML;
}

function highlightCurrent(){
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-cheeno-nav]').forEach(a => {
    if (a.dataset.cheenoNav === here) a.classList.add('active');
  });
}

function boot(){
  injectStyles();
  mountHeader();
  mountFooter();
  highlightCurrent();
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}