/* CariDefter — UI yardımcıları: ikonlar, biçimleyiciler, sheet/modal, toast */
const UI = (() => {
  // Inline SVG ikon seti (stroke tabanlı, tek renk)
  const ICONS = {
    grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
    users:'<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 11a4 4 0 0 0 0-8M22 21a7 7 0 0 0-5-6.7"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    gear:'<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 14H4.4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 6 7.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 12 4.5a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 19.4 9l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 .2 2.7z"/>',
    cart:'<circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2 3h2l2.6 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    fuel:'<path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17M2 22h13M13 9h3a2 2 0 0 1 2 2v6a2 2 0 0 0 4 0V8l-3-3"/>',
    chef:'<path d="M6 13a4 4 0 1 1 1-7.9 4 4 0 0 1 10 0A4 4 0 1 1 18 13zM7 13h10v6a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z"/>',
    home:'<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    bank:'<path d="M3 21h18M4 21V10M20 21V10M3 10l9-6 9 6M9 21v-6h6v6"/>',
    wallet:'<path d="M3 7a2 2 0 0 1 2-2h12v4M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7H6M17 13h.01"/>',
    cash:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    wa:'<path d="M3 21l1.6-4.5A8 8 0 1 1 12 20a8 8 0 0 1-4-1L3 21zM8.5 8.5c-.3 0-.6.1-.8.4-.3.4-.9 1-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.9 4.5 3.9 2.2.8 2.7.7 3.2.6.5-.1 1.5-.6 1.7-1.3.2-.6.2-1.1.1-1.3-.1-.1-.3-.2-.6-.4l-1.5-.7c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2-1.5-.2-.3 0-.5.1-.6l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.6-.4z"/>',
    edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash:'<path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/>',
    check:'<path d="M20 6L9 17l-5-5"/>',
    x:'<path d="M18 6L6 18M6 6l12 12"/>',
    chevR:'<path d="M9 6l6 6-6 6"/>',
    back:'<path d="M19 12H5M12 19l-7-7 7-7"/>',
    down:'<path d="M12 5v14M19 12l-7 7-7-7"/>',
    up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
    pdf:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    excel:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>',
    mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 6l10 7 10-7"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert:'<path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    tag:'<path d="M3 7v5l9 9 7-7-9-9H4a1 1 0 0 0-1 1z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    pin:'<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    note:'<path d="M4 4h16v12l-4 4H4z"/><path d="M16 20v-4h4"/>',
    back2:'<path d="M15 18l-6-6 6-6"/>',
    car:'<path d="M5 17a2 2 0 1 0 0-.01M19 17a2 2 0 1 0 0-.01M5 17H3v-5l2-5h11l3 5h2v5h-2M7 17h10M5 12h14"/>',
    food:'<path d="M5 3v8M8 3v8M5 11a3 3 0 0 0 6 0V3M8 11v10M17 3c-1.5 0-3 1.5-3 5s1.5 4 3 4M17 3v18"/>',
    bill:'<path d="M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4"/>',
    fridge:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 10h12M10 5v2M10 13v3"/>',
    lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
    star:'<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9z"/>',
  };

  function icon(name, size) {
    const p = ICONS[name] || ICONS.tag;
    const s = size || 22;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  }

  const fmt = (n) => '₺' + Math.round(n).toLocaleString('tr-TR');
  const fmtSigned = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + '₺' + Math.abs(Math.round(n)).toLocaleString('tr-TR');

  const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  function fmtDate(s) {
    const d = new Date(s);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function todayISO() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function initials(name) {
    return name.trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase();
  }
  // Renkten yumuşak arka plan üret
  function tint(hex, alpha) {
    const h = hex.replace('#','');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---- Sheet (alttan açılan modal)
  function sheet(title, innerHTML, onMount) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="sheet-backdrop"><div class="sheet" role="dialog" aria-modal="true">
      <div class="grip" title="Kapat"></div>
      <div class="sheet-head">
        <h3>${title || ''}</h3>
        <button class="sheet-x" aria-label="Kapat">${icon('x',20)}</button>
      </div>
      <div class="sheet-body">${innerHTML}</div>
    </div></div>`;
    const backdrop = root.querySelector('.sheet-backdrop');
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeSheet(); });
    root.querySelector('.sheet-x').addEventListener('click', closeSheet);
    root.querySelector('.grip').addEventListener('click', closeSheet);
    if (onMount) onMount(root.querySelector('.sheet-body'));
  }
  function closeSheet() { document.getElementById('modal-root').innerHTML = ''; }

  function toast(msg) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 2200);
  }

  function confirmSheet(text, onYes) {
    sheet('', `<p style="margin:6px 2px 16px">${text}</p>
      <button class="btn btn-danger" id="cy">Sil</button>
      <button class="btn btn-ghost" id="cn" style="margin-top:8px">Vazgeç</button>`, (b) => {
      b.querySelector('#cy').onclick = () => { closeSheet(); onYes(); };
      b.querySelector('#cn').onclick = closeSheet;
    });
  }

  // Renk paletleri (ana vurgu rengi) — --navy-* değişkenlerini değiştirir
  const ACCENTS = {
    navy:   { name:'Lacivert', 400:'#378ADD', 600:'#185FA5', 800:'#0C447C', 900:'#042C53' },
    teal:   { name:'Yeşil',    400:'#1D9E75', 600:'#0F8A63', 800:'#0A5A44', 900:'#063A2D' },
    purple: { name:'Mor',      400:'#7F77DD', 600:'#534AB7', 800:'#3C3489', 900:'#26215C' },
    coral:  { name:'Mercan',   400:'#F0785A', 600:'#D85A30', 800:'#9E3F1E', 900:'#6B2A13' },
    pink:   { name:'Pembe',    400:'#E06A93', 600:'#C53E6B', 800:'#8E2A4C', 900:'#5E1B33' },
    slate:  { name:'Antrasit', 400:'#64748B', 600:'#3E4A5E', 800:'#26303F', 900:'#161D27' },
  };
  function accents() { return ACCENTS; }
  function applyTheme() {
    const s = (typeof DB !== 'undefined' && DB.state.settings) || { theme:'auto', accent:'navy' };
    const root = document.documentElement;
    root.dataset.theme = s.theme || 'auto';
    const a = ACCENTS[s.accent] || ACCENTS.navy;
    root.style.setProperty('--navy-400', a[400]);
    root.style.setProperty('--navy-600', a[600]);
    root.style.setProperty('--navy-800', a[800]);
    root.style.setProperty('--navy-900', a[900]);
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', a[800]);
  }

  return { icon, fmt, fmtSigned, fmtDate, todayISO, initials, tint, MONTHS, sheet, closeSheet, toast, confirmSheet, applyTheme, accents };
})();
UI.applyTheme();
