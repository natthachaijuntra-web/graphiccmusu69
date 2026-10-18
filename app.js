// ===== ตั้งค่า: วาง URL ของ Google Apps Script Web App ที่นี่ (ดูวิธีใน Code.gs) =====
const APPS_URL = 'https://script.google.com/macros/s/AKfycbzw1Sa__KPrdm5ML2TKDadODgX5_AowymeAoSDfKpOpjgqr0oGy1_zXr50XIQrb0vtG/exec' || localStorage.getItem('cmu_apps_url') || '';
const MEMBERS = ['เอม - ธงไชย ศิริโสภา','โบนัส - ณัฏฐภัทร รินทร์แก้ว','อองซาน - ธนพร แสนสะอาด','ต้นกล้า - ณัฏฐชัย จันทรา','เกื้อ - ไชยะพร พรหมมา'];
const CATS = ['กิจกรรม','ประชุม','นัดทำงาน','อื่นๆ'];
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const thDate = (s, o = { day: 'numeric', month: 'long', year: 'numeric' }) => { const d = new Date(s + 'T00:00'); return isNaN(d) ? '-' : d.toLocaleDateString('th-TH', o); };
// แปลงค่าวันที่จาก Sheet (เช่น 2026-10-17T17:00:00.000Z) ให้เป็น YYYY-MM-DD ตามเวลาท้องถิ่น
// แปลงเวลาจาก Sheet (14:30:00 หรือ ISO) ให้เป็น HH:mm
const hm = v => { v = String(v ?? '').trim(); if (/^\d{4}-\d{2}-\d{2}T/.test(v)) { const d = new Date(v); return isNaN(d) ? '' : pad(d.getHours()) + ':' + pad(d.getMinutes()); } const m = v.match(/(\d{1,2}):(\d{2})/); return m ? pad(+m[1]) + ':' + m[2] : ''; };
const fixRow = r => { ['date', 'meetingDate', 'recordDate'].forEach(k => { const v = String(r[k] ?? '').trim(); if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) { const d = new Date(v); if (!isNaN(d)) r[k] = ymd(d); } }); ['start', 'end'].forEach(k => r[k] = hm(r[k])); return r; };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const parse = v => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; } };
const ICON={
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
mon:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
check:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
x:'<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
alert:'<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3"/><path d="M12 9v4M12 17h.01"/>',
left:'<path d="m15 18-6-6 6-6"/>',right:'<path d="m9 18 6-6-6-6"/>',plus:'<path d="M5 12h14M12 5v14"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
doc:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h8M8 17h8"/>',
ext:'<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
sync:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
copy:'<circle cx="12" cy="12" r="10"/><path d="M15 9.5a4 4 0 1 0 0 5"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;
const PAGES={'index.html':['ตารางกิจกรรม','ปฏิทินกิจกรรมรวมของทีมกราฟิก ฝ่ายประชาสัมพันธ์และสารสนเทศ ส.มช.69','cal','หน้าหลัก','home'],
'record.html':['บันทึกข้อมูล','กรอกข้อมูลให้ครบทุกช่องก่อนกดบันทึก','pen','บันทึกข้อมูล','pen'],
'meetingrc.html':['รายงานการประชุม','เลือกกิจกรรมเพื่อดูรายงานการประชุมที่บันทึกไว้','doc','รายงานการประชุม','doc']};
function layout(active) {
  const nav=Object.entries(PAGES).map(([h,p])=>`<a href="${h}" class="${h==active?'on':''}">${ic(p[4])}<span>${p[3]}</span></a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<header><div class="nav"><a class="brand" href="index.html"><img src="logo.png" alt="logo"><span>ทีมกราฟิก ฝ่ายประชาสัมพันธ์และสารสนเทศ<small>สโมสรนักศึกษา มหาวิทยาลัยเชียงใหม่ ประจำปี 2569</small></span></a><nav>${nav}</nav><button id="st" class="st" title="คลิกเพื่อตั้งค่าการเชื่อมต่อ Google Sheet"></button></div></header>`);
  $('#st').onclick=()=>{const u=prompt('วาง URL ของ Apps Script Web App (เว้นว่างเพื่อใช้โหมดทดลอง)',APPS_URL);if(u===null)return;u.trim()?localStorage.setItem('cmu_apps_url',u.trim()):localStorage.removeItem('cmu_apps_url');location.reload()};
  const p=PAGES[active];
  $('header').insertAdjacentHTML('afterend', `<section class="hero"><div class="in"><span class="hi">${ic(p[2])}</span><div><h1>${p[0]}</h1><p>${p[1]}</p></div></div></section>`);
  document.body.insertAdjacentHTML('beforeend', `<footer>${ic('copy')}<span>ntcjt.tk - graphic / PR CMUSU 2026</span></footer>`);
  document.querySelectorAll('[data-i]').forEach(e=>e.innerHTML=ic(e.dataset.i));
}
const API = {
  async list(type) {
    if (!APPS_URL) return JSON.parse(localStorage.getItem('cmu_' + type) || '[]');
    const r = await fetch(APPS_URL + '?type=' + type + '&t=' + Date.now()); return (await r.json()).rows.map(fixRow);
  },
  async save(type, data) {
    if (!APPS_URL) {
      const d = { ...data, id: Date.now() };
      if (type == 'meetings') { d.logo = data.logo.data; d.files = data.files.map(f => ({ name: f.name, type: f.type, url: f.data })); }
      const a = JSON.parse(localStorage.getItem('cmu_' + type) || '[]'); a.push(d);
      try { localStorage.setItem('cmu_' + type, JSON.stringify(a)); } catch { throw new Error('พื้นที่จัดเก็บในเบราว์เซอร์เต็ม (โหมดทดลอง) กรุณาตั้งค่า APPS_URL'); }
      return;
    }
    const r = await fetch(APPS_URL, { method: 'POST', body: JSON.stringify({ type, data }) });
    const j = await r.json(); if (!j.ok) throw new Error(j.error);
  }
};

// ดึงข้อมูลจาก Google Sheet ต่อเนื่อง (ทุก 10 วินาที และเมื่อกลับมาที่แท็บ) อัปเดตหน้าจอเฉพาะเมื่อข้อมูลเปลี่ยน
function watch(type, cb, ms = 10000) {
  let last = null;
  const set = (c, t) => { const s = $('#st'); if (s) { s.className = 'st ' + c; s.innerHTML = ic(c == 'ok' ? 'sync' : c == 'err' ? 'x' : 'db') + '<span>' + t + '</span>'; } };
  const run = async () => {
    if (document.hidden) return;
    try {
      const l = await API.list(type), s = JSON.stringify(l);
      if (s !== last) { last = s; cb(l); }
      set(APPS_URL ? 'ok' : 'demo', APPS_URL ? 'ซิงก์กับ Google Sheet · ' + new Date().toLocaleTimeString('th-TH') : 'โหมดทดลอง (ยังไม่เชื่อม Sheet)');
    } catch (e) { if (last === null) { last = ''; cb([]); } set('err', 'เชื่อมต่อ Sheet ไม่ได้ กำลังลองใหม่'); }
  };
  run(); setInterval(run, ms); document.addEventListener('visibilitychange', run); addEventListener('focus', run);
}
