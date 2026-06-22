/* CariDefter — giriş / kilit ekranı (yerel PIN).
   Not: bu, cihazdaki veriyi başkalarından gizlemek için basit bir kilittir. */
const Auth = (() => {
  let buf = '';
  let mode = 'enter';   // 'enter' | 'setup' | 'confirm'
  let firstPin = '';

  function el() { return document.getElementById('lock'); }

  function open() {
    const hasPin = !!(DB.state.profile.pin);
    mode = hasPin ? 'enter' : 'setup';
    buf = ''; firstPin = '';
    let root = el();
    if (!root) { root = document.createElement('div'); root.id = 'lock'; document.body.appendChild(root); }
    paint();
  }

  function close() {
    const root = el(); if (root) root.remove();
  }

  function titleText() {
    if (mode === 'enter') return 'Şifreni gir';
    if (mode === 'setup') return 'Yeni şifre belirle';
    return 'Şifreyi tekrar gir';
  }
  function subText() {
    if (mode === 'enter') return 'Devam etmek için 4 haneli şifre';
    if (mode === 'setup') return '4 haneli bir şifre oluştur';
    return 'Aynı şifreyi tekrar gir';
  }

  function paint(error) {
    const name = DB.state.profile.name || 'Hoş geldin';
    const dots = [0,1,2,3].map(i => `<span class="dot ${i < buf.length ? 'f' : ''}"></span>`).join('');
    const keys = [1,2,3,4,5,6,7,8,9].map(n => `<button data-d="${n}">${n}</button>`).join('');
    el().innerHTML = `
      <div class="lock-inner">
        <div class="lock-logo">${UI.icon('lock',30)}</div>
        <div class="lock-app">CariDefter</div>
        <div class="lock-hi">${mode==='enter' ? 'Merhaba, '+name : name}</div>
        <div class="lock-title">${titleText()}</div>
        <div class="lock-sub ${error?'err':''}">${error || subText()}</div>
        <div class="dots ${error?'shake':''}">${dots}</div>
        <div class="lock-pad">
          ${keys}
          <button class="ghost" data-skip>${mode==='setup'?'Atla':''}</button>
          <button data-d="0">0</button>
          <button class="ghost" data-back>${UI.icon('back',22)}</button>
        </div>
      </div>`;
    el().querySelectorAll('[data-d]').forEach(b => b.onclick = () => press(b.dataset.d));
    const back = el().querySelector('[data-back]'); if (back) back.onclick = () => { buf = buf.slice(0,-1); paint(); };
    const skip = el().querySelector('[data-skip]'); if (skip) skip.onclick = () => { if (mode==='setup') unlock(); };
  }

  function press(d) {
    if (buf.length >= 4) return;
    buf += d;
    paint();
    if (buf.length === 4) setTimeout(submit, 120);
  }

  function submit() {
    if (mode === 'enter') {
      if (buf === DB.state.profile.pin) return unlock();
      buf = ''; return paint('Şifre yanlış, tekrar dene');
    }
    if (mode === 'setup') {
      firstPin = buf; buf = ''; mode = 'confirm'; return paint();
    }
    if (mode === 'confirm') {
      if (buf === firstPin) { DB.setProfile({ pin: firstPin }); return unlock(); }
      buf = ''; firstPin = ''; mode = 'setup'; return paint('Şifreler uyuşmadı, baştan');
    }
  }

  function unlock() {
    close();
    window.CariApp.start();
  }

  // Açılışta kilidi göster
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
  else open();

  return { open, lock: open };
})();
