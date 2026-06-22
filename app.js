/* CariDefter — uygulama mantığı ve ekranlar */
(() => {
  const view = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');
  const { icon, fmt, fmtSigned, fmtDate, todayISO, initials, tint, MONTHS } = UI;

  const DIRS = {
    expense: { label: 'Harcama', sign: -1, color: '#E24B4A' },
    income:  { label: 'Tahsilat', sign: +1, color: '#1D9E75' },
    debt:    { label: 'Borç',    sign: -1, color: '#EF9F27' },
    payment: { label: 'Ödeme',   sign: -1, color: '#185FA5' },
  };
  const ACCT_ICON = { card: 'bank', cash: 'cash', bank: 'wallet' };

  // Türkiye bankaları — marka renkleriyle hazır seçim
  const BANKS = [
    ['Garanti BBVA','#00A94F'], ['Ziraat Bankası','#E2001A'], ['Akbank','#D5121C'],
    ['Halkbank','#005BAA'], ['VakıfBank','#F4B223'], ['İş Bankası','#1C3F94'],
    ['Yapı Kredi','#00477B'], ['QNB Finansbank','#5C2D91'], ['Denizbank','#00A0DF'],
    ['TEB','#006B3F'], ['ING','#FF6200'], ['Şekerbank','#E30613'],
    ['Enpara','#8DC63F'], ['Kuveyt Türk','#00543C'], ['Türkiye Finans','#1A4D2E'],
    ['Albaraka','#00857C'], ['HSBC','#DB0011'], ['Papara','#6C5CE7'],
    [' On (Albaraka)','#E94E1B'], ['Fibabanka','#003B71'], ['Odeabank','#7A1F2B'],
  ];

  let route = 'home';
  let repMonth = new Date().getMonth();
  let repYear = new Date().getFullYear();

  // Tuş takımı ikonları enjekte et
  function paintTabbar() {
    [...tabbar.querySelectorAll('.tab')].forEach(b => {
      const r = b.dataset.route;
      const ico = b.querySelector('.ic');
      const map = { home:'grid', people:'users', add:'plus', reports:'chart', settings:'gear' };
      ico.innerHTML = icon(map[r]);
      b.classList.toggle('active', r === route && r !== 'add');
    });
  }
  tabbar.addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    const r = b.dataset.route;
    if (r === 'add') return openAddSheet();
    go(r);
  });
  function go(r) { route = r; render(); }

  function render() {
    paintTabbar();
    if (route === 'home') renderHome();
    else if (route === 'people') renderPeople();
    else if (route === 'reports') renderReports();
    else if (route === 'settings') renderSettings();
    view.scrollTop = 0; window.scrollTo(0, 0);
  }

  // ---------------- ANA ÖZET ----------------
  function renderHome() {
    const now = new Date();
    const { exp, inc } = DB.monthTotals(now.getFullYear(), now.getMonth());
    const net = inc - exp;
    const p = DB.state.profile;
    const txns = DB.transactions().slice(0, 8);

    const acctCards = DB.accounts().map(a => {
      const bal = DB.accountBalance(a.id);
      const pct = a.limit > 0 ? Math.min(100, Math.round(bal / a.limit * 100)) : 0;
      const warn = a.limit > 0 && pct >= (DB.state.rules.limitPct || 90);
      const badge = a.limit > 0
        ? `<span class="badge" style="background:${warn?'var(--amber-bg)':'var(--green-bg)'};color:${warn?'var(--amber)':'var(--green)'}">%${pct}</span>`
        : `<span class="badge" style="background:var(--surface-2);color:var(--text-2)">hesap</span>`;
      return `<div class="acct" data-acct="${a.id}">
        <div class="top">
          <span class="acct-icon" style="background:${tint(a.color,0.14)};color:${a.color}">${icon(ACCT_ICON[a.type]||'bank',20)}</span>
          ${badge}
        </div>
        <div class="nm">${a.name}</div>
        <div class="amt">${fmt(bal)}</div>
        ${a.limit>0?`<div class="bar"><span style="width:${pct}%;background:${warn?'var(--amber)':a.color}"></span></div>`:''}
      </div>`;
    }).join('');

    view.innerHTML = `
      <div class="appbar"><div><h1>CariDefter</h1></div>
        <span class="acct-icon" style="background:var(--surface);border:0.5px solid var(--line);color:var(--text-2)">${icon('bell',20)}</span>
      </div>
      <div class="hero">
        <div class="row">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${initials(p.name||'A')}</div>
            <div><div style="font-size:12px;opacity:.85">Merhaba</div><div style="font-weight:600">${p.name||'Hoş geldin'}</div></div>
          </div>
        </div>
        <div class="label">Bu ay net durum · ${MONTHS[now.getMonth()]}</div>
        <div class="net">${fmtSigned(net)}</div>
        <div class="legs">
          <span>${icon('down',14)} Tahsilat <b>${fmt(inc)}</b></span>
          <span>${icon('up',14)} Harcama <b>${fmt(exp)}</b></span>
        </div>
      </div>

      <div class="sec-head"><h2>Hesaplarım</h2><a data-go="settings">Yönet ${icon('chevR',14)}</a></div>
      <div class="accts">${acctCards || ''}<div class="acct dash-add" data-add-acct style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:90px;border-style:dashed;color:var(--text-2)">${icon('plus',22)}<span style="font-size:12px;margin-top:6px">Banka</span></div></div>

      <div class="sec-head"><h2>Son işlemler</h2></div>
      ${txns.length ? `<div class="card">${txns.map(txnRow).join('')}</div>`
        : `<div class="empty"><div class="big">${icon('note',28)}</div><p>Henüz kayıt yok.</p><p class="muted" style="font-size:13px">Alttaki <b>+</b> ile ilk işlemini ekle.</p></div>`}
    `;

    view.querySelectorAll('[data-go]').forEach(el => el.onclick = () => go(el.dataset.go));
    view.querySelector('[data-add-acct]').onclick = () => openAccountSheet();
    view.querySelectorAll('[data-acct]').forEach(el => el.onclick = () => openAccountSheet(el.dataset.acct));
    view.querySelectorAll('[data-txn]').forEach(el => el.onclick = () => openTxnSheet(el.dataset.txn));
  }

  function txnRow(t) {
    const cat = DB.category(t.categoryId);
    const acct = DB.account(t.accountId);
    const person = t.personId ? DB.person(t.personId) : null;
    const d = DIRS[t.dir];
    const c = cat ? cat.color : d.color;
    const for_ = [acct&&acct.name, person&&person.name, t.description].filter(Boolean).join(' · ');
    return `<div class="txn" data-txn="${t.id}">
      <span class="ico" style="background:${tint(c,0.14)};color:${c}">${icon(cat?cat.icon:'tag',20)}</span>
      <div class="mid"><div class="t">${cat?cat.name:d.label}</div><div class="s">${fmtDate(t.date)} · ${for_||d.label}</div></div>
      <div class="amt ${d.sign>0?'pos':'neg'}">${d.sign>0?'+':'−'}${fmt(t.amount)}</div>
    </div>`;
  }

  // ---------------- HIZLI GİRİŞ ----------------
  let entry = null;
  function openAddSheet() {
    entry = { dir: 'expense', amount: 0, accountId: DB.accounts()[0]?.id, categoryId: DB.categories()[0]?.id, personId: '', date: todayISO(), description: '', docNo: '' };
    UI.sheet('Yeni kayıt', addSheetHTML(), mountAddSheet);
  }
  function addSheetHTML() {
    return `
      <div class="seg" id="seg-dir">
        ${Object.entries(DIRS).map(([k,v])=>`<button data-dir="${k}" class="${entry.dir===k?'on':''}">${v.label}</button>`).join('')}
      </div>

      <div class="amount-display"><span class="cur">₺ </span><span class="v" id="amt">0</span></div>

      <div class="chips" id="catchips" style="margin-bottom:6px"></div>

      <div class="keypad" id="keypad" style="margin-top:12px">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-k="${n}">${n}</button>`).join('')}
        <button data-k="000">000</button><button data-k="0">0</button><button data-k="back">⌫</button>
      </div>

      <div class="row-grid" style="margin-top:14px">
        <div class="field" style="margin:0"><label>Hesap / kart</label><select id="f-acct"></select></div>
        <div class="field" style="margin:0"><label>Tarih</label><input type="date" id="f-date" value="${entry.date}"></div>
      </div>
      <div class="field"><label>Kişi / cari (opsiyonel)</label><select id="f-person"></select></div>
      <div class="field"><label>Açıklama (ne alındı/satıldı, fiş no...)</label><input id="f-desc" placeholder="Örn. un çuvalı, fiş #1234"></div>

      <button class="btn btn-primary" id="save-btn" style="margin-top:6px">${icon('check',20)} Kaydet</button>
    `;
  }
  function mountAddSheet(b) {
    const amtEl = b.querySelector('#amt');
    const paintAmt = () => amtEl.textContent = Math.round(entry.amount).toLocaleString('tr-TR');

    // segment
    b.querySelector('#seg-dir').addEventListener('click', e => {
      const btn = e.target.closest('[data-dir]'); if (!btn) return;
      entry.dir = btn.dataset.dir;
      b.querySelectorAll('#seg-dir button').forEach(x => x.classList.toggle('on', x.dataset.dir===entry.dir));
    });

    // kategori çipleri
    const chips = b.querySelector('#catchips');
    const paintChips = () => {
      chips.innerHTML = DB.categories().map(c =>
        `<span class="chip tag ${entry.categoryId===c.id?'sel':''}" data-cat="${c.id}" style="background:${tint(c.color,0.14)};color:${c.color}">${icon(c.icon,16)} ${c.name}</span>`
      ).join('') + `<span class="chip tag dash" data-newcat>${icon('plus',16)} Ekle</span>`;
      chips.querySelectorAll('[data-cat]').forEach(el => el.onclick = () => { entry.categoryId = el.dataset.cat; paintChips(); });
      chips.querySelector('[data-newcat]').onclick = () => openCategorySheet(null, () => paintChips());
    };
    paintChips();

    // tuş takımı
    b.querySelector('#keypad').addEventListener('click', e => {
      const k = e.target.closest('[data-k]'); if (!k) return;
      const key = k.dataset.k;
      let s = String(Math.round(entry.amount));
      if (key === 'back') s = s.length > 1 ? s.slice(0,-1) : '0';
      else s = (s === '0' ? '' : s) + key;
      if (s.length > 12) return;
      entry.amount = parseInt(s || '0', 10);
      paintAmt();
    });

    // hesap & kişi selectleri
    const accSel = b.querySelector('#f-acct');
    accSel.innerHTML = DB.accounts().map(a => `<option value="${a.id}" ${a.id===entry.accountId?'selected':''}>${a.name}</option>`).join('');
    accSel.onchange = () => entry.accountId = accSel.value;

    const perSel = b.querySelector('#f-person');
    perSel.innerHTML = `<option value="">— yok —</option>` + DB.people().map(p => `<option value="${p.id}">${p.name}</option>`).join('') + `<option value="__new">+ Yeni kişi ekle...</option>`;
    perSel.onchange = () => {
      if (perSel.value === '__new') { perSel.value = ''; openPersonSheet(null, (np) => { entry.personId = np.id; perSel.innerHTML = `<option value="">— yok —</option>` + DB.people().map(p => `<option value="${p.id}" ${p.id===np.id?'selected':''}>${p.name}</option>`).join('') + `<option value="__new">+ Yeni kişi ekle...</option>`; }); }
      else entry.personId = perSel.value;
    };

    b.querySelector('#f-date').onchange = (e) => entry.date = e.target.value;
    b.querySelector('#f-desc').oninput = (e) => entry.description = e.target.value;

    b.querySelector('#save-btn').onclick = () => {
      if (!entry.amount || entry.amount <= 0) { UI.toast('Tutar gir'); return; }
      DB.addTransaction({ dir: entry.dir, amount: entry.amount, accountId: entry.accountId, categoryId: entry.categoryId, personId: entry.personId || null, date: entry.date, description: entry.description.trim(), docNo: '' });
      checkLimit(entry.accountId);
      UI.closeSheet();
      UI.toast('Kaydedildi ✓');
      route = 'home'; render();
    };
  }

  // limit kontrol → bildirim / WhatsApp önerisi
  function checkLimit(acctId) {
    const a = DB.account(acctId); if (!a || a.limit <= 0) return;
    const bal = DB.accountBalance(acctId);
    const pct = Math.round(bal / a.limit * 100);
    if (pct >= (DB.state.rules.limitPct || 90)) {
      setTimeout(() => {
        UI.toast(`⚠ ${a.name} limitin %${pct}'ine ulaştı`);
        if (DB.state.rules.limitWhatsapp) {
          const msg = `⚠ CariDefter uyarı: ${a.name} kartında ${fmt(bal)} harcama (limit ${fmt(a.limit)}, %${pct}). ${DB.state.profile.name||''}`;
          if (sendWhatsAppAuto(msg)) UI.toast('WhatsApp uyarısı gönderildi');
        }
      }, 600);
    }
  }

  // ---------------- KİŞİLER / CARİ ----------------
  function renderPeople() {
    const people = DB.people();
    view.innerHTML = `
      <div class="appbar"><h1>Cari / Kişiler</h1>
        <button class="btn btn-sm btn-ghost" id="add-p">${icon('plus',16)} Kişi</button></div>
      ${people.length ? `<div class="card">${people.map(personRow).join('')}</div>`
        : `<div class="empty"><div class="big">${icon('users',28)}</div><p>Henüz kişi yok.</p><p class="muted" style="font-size:13px">Borçlu/alacaklı kişileri ekle, işlemlerde seç.</p></div>`}
    `;
    view.querySelector('#add-p').onclick = () => openPersonSheet();
    view.querySelectorAll('[data-person]').forEach(el => el.onclick = () => openPersonSheet(el.dataset.person));
    view.querySelectorAll('[data-wa]').forEach(el => el.onclick = (e) => { e.stopPropagation(); openWhatsApp(el.dataset.wa); });
  }
  function personRow(p) {
    const bal = DB.personBalance(p.id);
    const sub = [p.city, p.phone].filter(Boolean).join(' · ') || (p.note||'');
    const col = bal > 0 ? '#1D9E75' : bal < 0 ? '#E24B4A' : '#5C6B82';
    return `<div class="person" data-person="${p.id}">
      <div class="av" style="background:${tint(col,0.14)};color:${col}">${initials(p.name)}</div>
      <div class="mid"><div class="n">${p.name}</div><div class="d">${sub||'—'}</div></div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <span style="font-weight:600;font-size:14px;color:${col}">${fmtSigned(bal)}</span>
        ${p.phone?`<span class="wa" data-wa="${p.id}">${icon('wa',18)}</span>`:''}
      </div>
    </div>`;
  }

  // ---------------- RAPORLAR ----------------
  function renderReports() {
    const { exp, inc } = DB.monthTotals(repYear, repMonth);
    const cats = DB.categoryTotals(repYear, repMonth);
    const entries = Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    const max = entries.length ? entries[0][1] : 1;

    view.innerHTML = `
      <div class="appbar"><h1>Raporlar</h1>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-ghost" id="exp-pdf">${icon('pdf',16)} PDF</button>
          <button class="btn btn-sm btn-ghost" id="exp-xls">${icon('excel',16)} Excel</button>
        </div></div>

      <div class="seg" style="margin-bottom:14px">
        <button id="m-prev">${icon('back2',16)}</button>
        <button class="on" style="flex:2">${MONTHS[repMonth]} ${repYear}</button>
        <button id="m-next">${icon('chevR',16)}</button>
      </div>

      <div class="row-grid">
        <div class="card" style="padding:14px"><div class="muted" style="font-size:12px">Harcama</div><div style="font-size:22px;font-weight:600;color:var(--red)">${fmt(exp)}</div></div>
        <div class="card" style="padding:14px"><div class="muted" style="font-size:12px">Tahsilat</div><div style="font-size:22px;font-weight:600;color:var(--green)">${fmt(inc)}</div></div>
      </div>

      <div class="sec-head"><h2>Kategoriye göre harcama</h2></div>
      ${entries.length ? entries.map(([cid,val]) => {
        const c = DB.category(cid) || { name:'Diğer', color:'#5C6B82' };
        return `<div class="repbar"><div class="top"><span>${c.name}</span><b>${fmt(val)}</b></div>
          <div class="track"><span style="width:${Math.round(val/max*100)}%;background:${c.color}"></span></div></div>`;
      }).join('') : `<div class="empty"><p>Bu ay harcama kaydı yok.</p></div>`}
    `;
    view.querySelector('#m-prev').onclick = () => { repMonth--; if(repMonth<0){repMonth=11;repYear--;} render(); };
    view.querySelector('#m-next').onclick = () => { repMonth++; if(repMonth>11){repMonth=0;repYear++;} render(); };
    view.querySelector('#exp-xls').onclick = exportExcel;
    view.querySelector('#exp-pdf').onclick = exportPDF;
  }

  // ---------------- YÖNETİM ----------------
  function renderSettings() {
    const r = DB.state.rules;
    const p = DB.state.profile;
    view.innerHTML = `
      <div class="appbar"><h1>Yönetim</h1></div>

      <div class="sec-head"><h2>Profil & bildirim adresleri</h2></div>
      <div class="card" style="padding:6px 14px 14px">
        <div class="field"><label>İşletme / ad</label><input id="p-name" value="${p.name||''}"></div>
        <div class="field"><label>E-posta (raporlar için)</label><input id="p-email" type="email" value="${p.email||''}" placeholder="mail@ornek.com"></div>
        <div class="field"><label>WhatsApp no (CallMeBot için)</label><input id="p-wa" value="${p.whatsapp||''}" placeholder="+90 5xx xxx xx xx"></div>
        <div class="field" style="margin-bottom:8px"><label>CallMeBot API anahtarı</label><input id="p-cmb" value="${p.callmebotKey||''}" placeholder="örn. 123456"></div>
        <button class="btn btn-ghost btn-sm" id="wa-test" style="width:100%;color:var(--green)">${icon('wa',16)} Test WhatsApp mesajı gönder</button>
        <p class="muted" style="font-size:11.5px;margin:8px 2px 0">Ücretsiz otomatik WhatsApp için: WhatsApp'tan <b>+34 644 51 95 23</b> numarasına <b>"I allow callmebot to send me messages"</b> yaz, gelen API anahtarını yukarı gir.</p>
      </div>

      <div class="sec-head"><h2>Bankalar / Kartlar</h2><a data-add="acct">${icon('plus',14)} Banka ekle</a></div>
      <div class="card">${DB.accounts().map(a=>`
        <div class="set-row" data-edit-acct="${a.id}">
          <span class="lab"><span class="acct-icon" style="background:${tint(a.color,0.14)};color:${a.color};width:30px;height:30px">${icon(ACCT_ICON[a.type]||'bank',18)}</span>${a.name}${a.limit>0?` <span class="muted" style="font-size:12px">· limit ${fmt(a.limit)}</span>`:''}</span>
          ${icon('chevR',16)}
        </div>`).join('')}</div>

      <div class="sec-head"><h2>Kategoriler</h2><a data-add="cat">${icon('plus',14)} Kategori ekle</a></div>
      <div class="chips" style="margin:0 2px">
        ${DB.categories().map(c=>`<span class="chip tag" data-edit-cat="${c.id}" style="background:${tint(c.color,0.14)};color:${c.color}">${icon(c.icon,16)} ${c.name}</span>`).join('')}
        <span class="chip tag dash" data-add="cat2">${icon('plus',16)} Yeni</span>
      </div>

      <div class="sec-head"><h2>Bildirim & limit kuralları</h2></div>
      <div class="card">
        <div class="set-row"><span class="lab">${icon('wa',18)} Kart limiti %${r.limitPct} → WhatsApp uyarısı</span><span class="sw ${r.limitWhatsapp?'on':''}" data-rule="limitWhatsapp"><i></i></span></div>
        <div class="set-row"><span class="lab">${icon('mail',18)} Aylık özet → e-posta</span><span class="sw ${r.monthlyEmail?'on':''}" data-rule="monthlyEmail"><i></i></span></div>
        <div class="set-row"><span class="lab">${icon('clock',18)} Ödeme günü hatırlatması</span><span class="sw ${r.dueReminder?'on':''}" data-rule="dueReminder"><i></i></span></div>
        <div class="set-row"><span class="lab">${icon('alert',18)} Limit uyarı eşiği</span>
          <select id="limit-pct" style="width:90px;padding:8px;border-radius:8px;border:0.5px solid var(--line-2);background:var(--surface);color:var(--text)">
            ${[70,80,90,95,100].map(v=>`<option ${r.limitPct===v?'selected':''}>${v}</option>`).join('')}
          </select></div>
      </div>

      <div class="sec-head"><h2>Güvenlik</h2></div>
      <div class="card">
        <div class="set-row"><span class="lab">${icon('lock',18)} Giriş şifresi</span>
          <span class="muted" style="font-size:13px">${DB.state.profile.pin ? 'Açık' : 'Kapalı'}</span></div>
        <div class="set-row" id="sec-change"><span class="lab muted">${DB.state.profile.pin?'Şifreyi değiştir':'Şifre oluştur'}</span>${icon('chevR',16)}</div>
        ${DB.state.profile.pin?`<div class="set-row" id="sec-remove"><span class="lab" style="color:var(--red)">${icon('trash',16)} Şifreyi kaldır</span></div>`:''}
        <div class="set-row" id="sec-lock"><span class="lab">${icon('lock',16)} Şimdi kilitle</span>${icon('chevR',16)}</div>
      </div>

      <div class="sec-head"><h2>Veri</h2></div>
      <div class="card" style="padding:10px">
        <button class="btn btn-ghost btn-sm" id="exp-json" style="width:100%;margin-bottom:8px">${icon('down',16)} Yedek al (dosya indir)</button>
        <button class="btn btn-ghost btn-sm" id="imp-json" style="width:100%">${icon('up',16)} Yedekten geri yükle</button>
        <input type="file" id="imp-file" accept="application/json" hidden>
      </div>
      <p class="muted" style="text-align:center;font-size:12px;margin:18px 0 0">CariDefter · v1 · veriler bu cihazda saklanır</p>
    `;

    const p_name = view.querySelector('#p-name');
    p_name.onblur = () => DB.setProfile({ name: p_name.value.trim() });
    view.querySelector('#p-email').onblur = (e) => DB.setProfile({ email: e.target.value.trim() });
    view.querySelector('#p-wa').onblur = (e) => DB.setProfile({ whatsapp: e.target.value.trim() });
    view.querySelector('#p-cmb').onblur = (e) => DB.setProfile({ callmebotKey: e.target.value.trim() });
    view.querySelector('#wa-test').onclick = () => {
      DB.setProfile({ whatsapp: view.querySelector('#p-wa').value.trim(), callmebotKey: view.querySelector('#p-cmb').value.trim() });
      if (!DB.state.profile.whatsapp || !DB.state.profile.callmebotKey) return UI.toast('Önce WhatsApp no ve API anahtarı gir');
      sendWhatsAppAuto(`✅ CariDefter test mesajı — kurulum çalışıyor! ${DB.state.profile.name||''}`);
      UI.toast('Test gönderildi, WhatsApp\'ını kontrol et');
    };

    view.querySelectorAll('[data-add]').forEach(el => el.onclick = () => {
      if (el.dataset.add.startsWith('cat')) openCategorySheet(null, render); else openAccountSheet(null);
    });
    view.querySelectorAll('[data-edit-acct]').forEach(el => el.onclick = () => openAccountSheet(el.dataset.editAcct));
    view.querySelectorAll('[data-edit-cat]').forEach(el => el.onclick = () => openCategorySheet(el.dataset.editCat, render));

    view.querySelectorAll('[data-rule]').forEach(el => el.onclick = () => {
      const k = el.dataset.rule; const v = !DB.state.rules[k];
      DB.setRule(k, v); el.classList.toggle('on', v);
    });
    view.querySelector('#limit-pct').onchange = (e) => DB.setRule('limitPct', parseInt(e.target.value));

    view.querySelector('#exp-json').onclick = exportBackup;
    view.querySelector('#imp-json').onclick = () => view.querySelector('#imp-file').click();
    view.querySelector('#imp-file').onchange = importBackup;

    view.querySelector('#sec-change').onclick = () => { DB.setProfile({ pin: '' }); Auth.open(); };
    view.querySelector('#sec-lock').onclick = () => Auth.lock();
    const rem = view.querySelector('#sec-remove');
    if (rem) rem.onclick = () => UI.confirmSheet('Giriş şifresi kaldırılsın mı?', () => { DB.setProfile({ pin: '' }); UI.toast('Şifre kaldırıldı'); render(); });
  }

  // ---------------- HESAP SHEET ----------------
  function openAccountSheet(id) {
    const a = id ? {...DB.account(id)} : { name:'', type:'card', color:'#185FA5', limit:0, dueDay:1 };
    const colors = ['#185FA5','#D85A30','#1D9E75','#7F77DD','#D4537E','#EF9F27','#16243A'];
    const presetHTML = id ? '' : `
      <div class="field"><label>Hazır banka seç (dokun)</label>
        <div class="chips" id="a-preset" style="max-height:160px;overflow-y:auto">
          ${BANKS.map(([n,c])=>`<span class="chip tag" data-bn="${n}" data-bc="${c}" style="background:${tint(c,0.14)};color:${c}">${icon('bank',15)} ${n.trim()}</span>`).join('')}
        </div>
        <div style="text-align:center;color:var(--text-3);font-size:12px;margin:10px 0 2px">— veya elle gir —</div>
      </div>`;
    UI.sheet(id?'Hesabı düzenle':'Yeni banka / kart', `
      ${presetHTML}
      <div class="field"><label>Ad (örn. Garanti Bonus)</label><input id="a-name" value="${a.name}"></div>
      <div class="field"><label>Tür</label>
        <div class="seg" id="a-type">
          ${[['card','Kredi kartı'],['bank','Banka hesabı'],['cash','Nakit']].map(([k,l])=>`<button data-t="${k}" class="${a.type===k?'on':''}">${l}</button>`).join('')}
        </div></div>
      <div class="field"><label>Renk</label><div class="chips" id="a-color">
        ${colors.map(c=>`<span data-c="${c}" style="width:30px;height:30px;border-radius:50%;background:${c};${a.color===c?'outline:2px solid var(--text);outline-offset:2px':''}"></span>`).join('')}
      </div></div>
      <div class="field" id="limit-field"><label>Kart limiti (₺) — 0 ise takip edilmez</label><input id="a-limit" type="number" inputmode="numeric" value="${a.limit||''}" placeholder="0"></div>
      <button class="btn btn-primary" id="a-save">${icon('check',20)} Kaydet</button>
      ${id?`<button class="btn btn-danger" id="a-del" style="margin-top:8px">${icon('trash',18)} Sil</button>`:''}
    `, (b) => {
      const preset = b.querySelector('#a-preset');
      if (preset) preset.onclick = (e) => {
        const c = e.target.closest('[data-bn]'); if(!c) return;
        a.color = c.dataset.bc; a.type = 'card';
        b.querySelector('#a-name').value = c.dataset.bn.trim();
        b.querySelectorAll('#a-color [data-c]').forEach(x=>x.style.outline='none');
        b.querySelectorAll('#a-preset .chip').forEach(x=>x.classList.remove('sel'));
        c.classList.add('sel');
      };
      b.querySelector('#a-type').onclick = (e) => { const t=e.target.closest('[data-t]'); if(!t)return; a.type=t.dataset.t; b.querySelectorAll('#a-type button').forEach(x=>x.classList.toggle('on',x.dataset.t===a.type)); };
      b.querySelector('#a-color').onclick = (e) => { const c=e.target.closest('[data-c]'); if(!c)return; a.color=c.dataset.c; b.querySelectorAll('#a-color [data-c]').forEach(x=>x.style.outline = x.dataset.c===a.color?'2px solid var(--text)':'none'); };
      b.querySelector('#a-save').onclick = () => {
        const name = b.querySelector('#a-name').value.trim(); if(!name){UI.toast('Ad gir');return;}
        const limit = parseInt(b.querySelector('#a-limit').value)||0;
        if (id) DB.updateAccount(id, { name, type:a.type, color:a.color, limit });
        else DB.addAccount({ name, type:a.type, color:a.color, limit, dueDay:1 });
        UI.closeSheet(); UI.toast('Kaydedildi ✓'); render();
      };
      if (id) b.querySelector('#a-del').onclick = () => UI.confirmSheet(`"${a.name}" silinsin mi? İşlemleri kalır.`, () => { DB.removeAccount(id); UI.closeSheet(); render(); });
    });
  }

  // ---------------- KATEGORİ SHEET ----------------
  function openCategorySheet(id, after) {
    const c = id ? {...DB.category(id)} : { name:'', color:'#1D9E75', icon:'tag' };
    const colors = ['#1D9E75','#EF9F27','#185FA5','#D4537E','#7F77DD','#D85A30','#E24B4A','#16243A'];
    const icons = ['tag','cart','fuel','chef','home','users','wallet','bell','clock'];
    UI.sheet(id?'Kategoriyi düzenle':'Yeni kategori', `
      <div class="field"><label>Ad</label><input id="c-name" value="${c.name}"></div>
      <div class="field"><label>İkon</label><div class="chips" id="c-icon">
        ${icons.map(i=>`<span data-i="${i}" class="chip" style="${c.icon===i?'outline:2px solid var(--navy-600)':''}">${icon(i,20)}</span>`).join('')}
      </div></div>
      <div class="field"><label>Renk</label><div class="chips" id="c-color">
        ${colors.map(col=>`<span data-c="${col}" style="width:30px;height:30px;border-radius:50%;background:${col};${c.color===col?'outline:2px solid var(--text);outline-offset:2px':''}"></span>`).join('')}
      </div></div>
      <button class="btn btn-primary" id="c-save">${icon('check',20)} Kaydet</button>
      ${id?`<button class="btn btn-danger" id="c-del" style="margin-top:8px">${icon('trash',18)} Sil</button>`:''}
    `, (b) => {
      b.querySelector('#c-icon').onclick = (e) => { const i=e.target.closest('[data-i]'); if(!i)return; c.icon=i.dataset.i; b.querySelectorAll('#c-icon [data-i]').forEach(x=>x.style.outline = x.dataset.i===c.icon?'2px solid var(--navy-600)':'none'); };
      b.querySelector('#c-color').onclick = (e) => { const col=e.target.closest('[data-c]'); if(!col)return; c.color=col.dataset.c; b.querySelectorAll('#c-color [data-c]').forEach(x=>x.style.outline = x.dataset.c===c.color?'2px solid var(--text)':'none'); };
      b.querySelector('#c-save').onclick = () => {
        const name = b.querySelector('#c-name').value.trim(); if(!name){UI.toast('Ad gir');return;}
        if (id) DB.updateCategory(id, { name, color:c.color, icon:c.icon });
        else DB.addCategory({ name, color:c.color, icon:c.icon });
        UI.closeSheet(); UI.toast('Kaydedildi ✓'); if(after) after();
      };
      if (id) b.querySelector('#c-del').onclick = () => UI.confirmSheet(`"${c.name}" silinsin mi?`, () => { DB.removeCategory(id); UI.closeSheet(); if(after) after(); });
    });
  }

  // ---------------- KİŞİ SHEET ----------------
  function openPersonSheet(id, after) {
    const p = id ? {...DB.person(id)} : { name:'', phone:'', city:'', note:'' };
    UI.sheet(id?'Kişiyi düzenle':'Yeni kişi / cari', `
      <div class="field"><label>Ad soyad / firma</label><input id="pp-name" value="${p.name}"></div>
      <div class="row-grid">
        <div class="field"><label>Telefon</label><input id="pp-phone" inputmode="tel" value="${p.phone||''}" placeholder="+90 5xx..."></div>
        <div class="field"><label>Şehir</label><input id="pp-city" value="${p.city||''}"></div>
      </div>
      <div class="field"><label>Not (vergi no, ne aldı/sattı...)</label><textarea id="pp-note">${p.note||''}</textarea></div>
      ${id?`<div class="card" style="padding:12px;margin-bottom:12px"><div class="muted" style="font-size:12px">Güncel bakiye</div><div style="font-size:20px;font-weight:600;color:${DB.personBalance(id)>=0?'var(--green)':'var(--red)'}">${fmtSigned(DB.personBalance(id))}</div><div class="muted" style="font-size:11px">+ size borçlu · − siz borçlusunuz</div></div>`:''}
      <button class="btn btn-primary" id="pp-save">${icon('check',20)} Kaydet</button>
      ${id&&p.phone?`<button class="btn btn-ghost" id="pp-wa" style="margin-top:8px;color:var(--green)">${icon('wa',18)} WhatsApp ile mesaj</button>`:''}
      ${id?`<button class="btn btn-danger" id="pp-del" style="margin-top:8px">${icon('trash',18)} Sil</button>`:''}
    `, (b) => {
      b.querySelector('#pp-save').onclick = () => {
        const name = b.querySelector('#pp-name').value.trim(); if(!name){UI.toast('Ad gir');return;}
        const patch = { name, phone:b.querySelector('#pp-phone').value.trim(), city:b.querySelector('#pp-city').value.trim(), note:b.querySelector('#pp-note').value.trim() };
        let np;
        if (id) { DB.updatePerson(id, patch); np = DB.person(id); }
        else np = DB.addPerson(patch);
        UI.closeSheet(); UI.toast('Kaydedildi ✓');
        if (after) after(np); else if (route==='people') render();
      };
      if (id && p.phone) b.querySelector('#pp-wa').onclick = () => openWhatsApp(id);
      if (id) b.querySelector('#pp-del').onclick = () => UI.confirmSheet(`"${p.name}" silinsin mi?`, () => { DB.removePerson(id); UI.closeSheet(); render(); });
    });
  }

  // ---------------- İŞLEM DETAY ----------------
  function openTxnSheet(id) {
    const t = DB.transactions().find(x => x.id === id); if (!t) return;
    const cat = DB.category(t.categoryId); const acct = DB.account(t.accountId); const per = t.personId?DB.person(t.personId):null;
    const d = DIRS[t.dir];
    UI.sheet('İşlem detayı', `
      <div style="text-align:center;padding:6px 0 14px"><div style="font-size:30px;font-weight:600;color:${d.sign>0?'var(--green)':'var(--red)'}">${d.sign>0?'+':'−'}${fmt(t.amount)}</div><div class="muted" style="font-size:13px">${d.label} · ${fmtDate(t.date)}</div></div>
      <div class="card">
        ${detRow('tag','Kategori', cat?cat.name:'—')}
        ${detRow('bank','Hesap', acct?acct.name:'—')}
        ${per?detRow('user','Kişi', per.name):''}
        ${t.description?detRow('note','Açıklama', t.description):''}
      </div>
      <button class="btn btn-danger" id="t-del" style="margin-top:12px">${icon('trash',18)} İşlemi sil</button>
    `, (b) => {
      b.querySelector('#t-del').onclick = () => UI.confirmSheet('Bu işlem silinsin mi?', () => { DB.removeTransaction(id); UI.closeSheet(); render(); });
    });
  }
  function detRow(ic, label, val) {
    return `<div class="set-row"><span class="lab muted">${icon(ic,16)} ${label}</span><span style="font-weight:500;text-align:right">${val}</span></div>`;
  }

  // ---------------- WHATSAPP (CallMeBot ile otomatik) ----------------
  // Kendi WhatsApp numarana ücretsiz otomatik mesaj. CORS olmadan Image beacon ile tetiklenir.
  function sendWhatsAppAuto(text) {
    const p = DB.state.profile;
    const phone = (p.whatsapp || '').replace(/[^\d]/g, '');
    const key = (p.callmebotKey || '').trim();
    if (!phone || !key) return false;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
    const img = new Image();
    img.src = url; // fire-and-forget
    return true;
  }

  function openWhatsApp(personId) {
    const p = DB.person(personId); if (!p) return;
    const bal = DB.personBalance(personId);
    let msg;
    if (bal > 0) msg = `Merhaba ${p.name}, güncel bakiyenize göre tarafıma ${fmt(bal)} borcunuz görünmektedir. Bilginize.`;
    else if (bal < 0) msg = `Merhaba ${p.name}, size ${fmt(-bal)} borcum bulunmaktadır.`;
    else msg = `Merhaba ${p.name},`;
    const phone = (p.phone||'').replace(/[^\d]/g,'');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  // ---------------- DIŞA AKTARMA ----------------
  function txnExportRows() {
    return DB.transactions().map(t => ({
      Tarih: t.date,
      Tür: DIRS[t.dir].label,
      Tutar: t.amount,
      Hesap: (DB.account(t.accountId)||{}).name || '',
      Kategori: (DB.category(t.categoryId)||{}).name || '',
      Kişi: t.personId ? ((DB.person(t.personId)||{}).name||'') : '',
      Açıklama: t.description || '',
    }));
  }
  function exportExcel() {
    const rows = txnExportRows();
    if (!rows.length) return UI.toast('Kayıt yok');
    const headers = Object.keys(rows[0]);
    const esc = (v) => `"${String(v).replace(/"/g,'""')}"`;
    const csv = '﻿' + [headers.join(';'), ...rows.map(r => headers.map(h => esc(r[h])).join(';'))].join('\n');
    download(new Blob([csv], {type:'text/csv;charset=utf-8'}), `caridefter-${todayISO()}.csv`);
    UI.toast('Excel (CSV) indirildi');
  }
  function exportPDF() {
    const { exp, inc } = DB.monthTotals(repYear, repMonth);
    const cats = DB.categoryTotals(repYear, repMonth);
    const rows = Object.entries(cats).sort((a,b)=>b[1]-a[1])
      .map(([cid,v])=>`<tr><td>${(DB.category(cid)||{name:'Diğer'}).name}</td><td style="text-align:right">${fmt(v)}</td></tr>`).join('');
    const html = `<html><head><meta charset="utf-8"><title>Rapor</title>
      <style>body{font-family:sans-serif;padding:30px;color:#16243A}h1{color:#0C447C}table{width:100%;border-collapse:collapse;margin-top:14px}td,th{padding:8px;border-bottom:1px solid #ddd}.big{font-size:22px;font-weight:bold}</style></head>
      <body><h1>CariDefter — ${MONTHS[repMonth]} ${repYear}</h1>
      <p>${DB.state.profile.name||''}</p>
      <p>Harcama: <span class="big" style="color:#E24B4A">${fmt(exp)}</span> &nbsp; Tahsilat: <span class="big" style="color:#1D9E75">${fmt(inc)}</span></p>
      <h3>Kategoriye göre harcama</h3>
      <table><tr><th style="text-align:left">Kategori</th><th style="text-align:right">Tutar</th></tr>${rows||'<tr><td colspan=2>Kayıt yok</td></tr>'}</table>
      <p style="margin-top:30px;color:#888;font-size:12px">CariDefter ile oluşturuldu</p>
      <script>window.onload=()=>window.print()<\/script></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
    else UI.toast('PDF için açılır pencereye izin verin');
  }
  function exportBackup() {
    download(new Blob([JSON.stringify(DB.state)], {type:'application/json'}), `caridefter-yedek-${todayISO()}.json`);
    UI.toast('Yedek indirildi');
  }
  function importBackup(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { const obj = JSON.parse(reader.result); DB.replaceAll(obj); UI.toast('Geri yüklendi ✓'); render(); }
      catch (err) { UI.toast('Dosya okunamadı'); }
    };
    reader.readAsText(file);
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---- Başlat (giriş ekranından sonra Auth tarafından çağrılır)
  window.CariApp = { start() { route = 'home'; render(); } };

  // Service worker (offline)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
})();
