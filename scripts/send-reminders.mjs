/* CariDefter — zamanlanmış WhatsApp hatırlatmaları (GitHub Actions tarafından çalıştırılır).
   Gizli bilgiler repo secrets'tan gelir: CMB_PHONE, CMB_APIKEY. */
import { readFileSync } from 'node:fs';

const phone = (process.env.CMB_PHONE || '').replace(/[^\d]/g, '');
const apikey = (process.env.CMB_APIKEY || '').trim();
const force = String(process.env.FORCE_TEST || '').toLowerCase() === 'true';

if (!phone || !apikey) {
  console.log('CMB_PHONE / CMB_APIKEY ayarlı değil — atlanıyor. (GitHub repo Secrets bölümüne ekle)');
  process.exit(0);
}

async function send(text) {
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
  try {
    const res = await fetch(url);
    console.log(`Gönderildi (${res.status}): ${text}`);
  } catch (e) {
    console.error('Gönderim hatası:', e.message);
  }
}

if (force) {
  await send('✅ CariDefter test: otomatik zamanlayıcı çalışıyor!');
  process.exit(0);
}

let cfg = { timezone: 'Europe/Istanbul', reminders: [] };
try { cfg = JSON.parse(readFileSync(new URL('../reminders.json', import.meta.url))); }
catch (e) { console.log('reminders.json okunamadı, varsayılan kullanılıyor.'); }

const tz = cfg.timezone || 'Europe/Istanbul';
const today = Number(new Intl.DateTimeFormat('en', { timeZone: tz, day: 'numeric' }).format(new Date()));

const due = (cfg.reminders || []).filter(r => Number(r.day) === today);
if (!due.length) {
  console.log(`Bugün (ayın ${today}. günü) için hatırlatma yok.`);
  process.exit(0);
}
for (const r of due) await send(r.text);
