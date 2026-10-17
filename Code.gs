// วิธีใช้: เปิด Google Sheet > ส่วนขยาย > Apps Script > วางโค้ดนี้ > Deploy > New deployment
// ประเภท Web app | Execute as: Me | Who has access: Anyone > คัดลอก URL ไปใส่ APPS_URL ใน app.js
const SS_ID = '1isRI-KkK8eo4NSMw-shFyWzy8aSzLeZDwT83eHZxXiE';
const COLS = {
  events: ['id','category','otherName','title','date','allDay','start','end','mode','place','recorder','createdAt'],
  meetings: ['id','title','logo','meetingDate','recordDate','agendas','detail','files','recorder','createdAt']
};
function sh(t) {
  const ss = SpreadsheetApp.openById(SS_ID); let s = ss.getSheetByName(t);
  if (!s) { s = ss.insertSheet(t); s.getRange(1,1,s.getMaxRows(),COLS[t].length).setNumberFormat('@'); s.appendRow(COLS[t]); }
  return s;
}
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
function doGet(e) {
  const s = sh(e.parameter.type), tz = s.getParent().getSpreadsheetTimeZone();
  const v = s.getDataRange().getValues(), h = v.shift();
  const F = { date: 'yyyy-MM-dd', meetingDate: 'yyyy-MM-dd', recordDate: 'yyyy-MM-dd', start: 'HH:mm', end: 'HH:mm' };
  return out({ rows: v.map(r => { const o = {}; h.forEach((k,i) => { let x = r[i]; if (x instanceof Date && F[k]) x = Utilities.formatDate(x, tz, F[k]); o[k] = x; }); return o; }) });
}
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const p = JSON.parse(e.postData.contents), type = p.type, d = p.data;
    if (type == 'meetings') {
      const it = DriveApp.getFoldersByName('CMU-Graphic-Files');
      const fo = it.hasNext() ? it.next() : DriveApp.createFolder('CMU-Graphic-Files');
      const up = x => {
        const f = fo.createFile(Utilities.newBlob(Utilities.base64Decode(x.data.split(',')[1]), x.type, x.name));
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        const url = x.type == 'application/pdf' ? 'https://drive.google.com/file/d/' + f.getId() + '/preview'
                  : 'https://drive.google.com/thumbnail?id=' + f.getId() + '&sz=w1600';
        return { name: x.name, type: x.type, url: url };
      };
      d.logo = up(d.logo).url; d.files = d.files.map(up);
    }
    d.id = Date.now(); d.createdAt = new Date().toISOString();
    sh(type).appendRow(COLS[type].map(k => typeof d[k] == 'object' ? JSON.stringify(d[k]) : String(d[k] ?? '')));
    return out({ ok: true });
  } catch (err) { return out({ ok: false, error: String(err) }); } finally { lock.releaseLock(); }
}
