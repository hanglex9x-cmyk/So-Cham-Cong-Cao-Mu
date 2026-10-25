/*************************************************
 * WEB APP CHẤM CÔNG CẠO MỦ — Dự án Chị Hằng – Hiệp
 * Backend: Google Sheet + Apps Script (kiểu 1)
 * SHEET_ID là của RIÊNG dự án này — không dùng chung dự án khác.
 *************************************************/
const SHEET_ID = '1en9AfN4JWIglTDwAWGv7v8PsqCMp_ZNb9rccpxDbScs';
const TZ = 'Asia/Bangkok';

const TAB_DATA = 'DU_LIEU';
const TAB_CONF = 'CAU_HINH';
const TAB_ROLE = 'PHAN_QUYEN';
const TAB_LOG  = 'LICH_SU';
const TAB_WIDE = 'CHẤM CÔNG CẠO'; // tab gốc của khách — chỉ đọc khi import, không ghi đè

// Thứ tự cột tab DU_LIEU (1 dòng = 1 nhóm × 1 ngày)
const HEADERS = [
  'Ngay','Doi','Nhom','DinhBien','LoaiNgay','MaPhan','TongPhanPhien',
  'PhienThuong','CongThuong','PhienDup','CongDup','PhienChoang','CongChoang',
  'TB_ThietKe','TB_KiengChen','TB_ChanMua','TB_CheChen','TB_VayCheChen','TB_CaoXa','TB_Khac',
  'ThueCao','ThueBocMu',
  'PhanDungLo','Vang','DanhSachVang','LyDoVang','DanhSachThieu','CaoKhongHet','GhiChu',
  'CapNhatLuc','NguoiCapNhat'
];

const TRANG_BI_KEYS = ['TB_ThietKe','TB_KiengChen','TB_ChanMua','TB_CheChen','TB_VayCheChen','TB_CaoXa','TB_Khac'];

/* ================== KHỞI TẠO / MENU ================== */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Chấm công cạo mủ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🌴 App Chấm Công')
    .addItem('1. Cài đặt hệ thống (tạo tab + trigger backup)', 'setupHeThong')
    .addItem('2. Import dữ liệu T10/2026 từ tab CHẤM CÔNG CẠO', 'importDuLieuTuBangRong')
    .addToUi();
}

function ss_() { return SpreadsheetApp.openById(SHEET_ID); }

function getOrCreateSheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function setupHeThong() {
  getOrCreateSheet_(TAB_DATA, HEADERS);
  getOrCreateSheet_(TAB_LOG, ['ThoiGian','HanhDong','DoiTuong','NguoiThucHien','ChiTiet']);
  const role = getOrCreateSheet_(TAB_ROLE, ['Email','VaiTro']);
  if (role.getLastRow() < 2) role.getRange(2, 1, 1, 2).setValues([['', 'Admin (để trống dòng này = chưa bật kiểm quyền)']]);
  const conf = getOrCreateSheet_(TAB_CONF, ['Khoa','GiaTri']);
  if (conf.getLastRow() < 2) {
    conf.getRange(2, 1, 5, 2).setValues([
      ['TenUngDung', 'Chấm công cạo mủ'],
      ['TenDoi1', 'Đội 1'],
      ['TenDoi2', 'Đội 2'],
      ['SoNhomMoiDoi', '7'],
      ['MauChuDao', '#1B7A43']
    ]);
  }
  // Trigger backup 2h sáng mỗi ngày
  const has = ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'autoBackup');
  if (!has) ScriptApp.newTrigger('autoBackup').timeBased().everyDays(1).atHour(2).create();
  ghiLog_('SETUP', 'HeThong', 'Chạy setupHeThong');
  try { SpreadsheetApp.getUi().alert('✅ Đã tạo xong các tab DU_LIEU / CAU_HINH / PHAN_QUYEN / LICH_SU và trigger backup 2h sáng.'); } catch (e) {}
}

function autoBackup() {
  const ss = ss_();
  const folder = DriveApp.getRootFolder();
  const name = 'BACKUP ' + ss.getName() + ' ' + Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  ss.copy(name);
  ghiLog_('BACKUP', ss.getName(), 'Đã copy bản sao: ' + name);
}

/* ================== CẤU HÌNH / QUYỀN ================== */
function getConfig_() {
  const sh = ss_().getSheetByName(TAB_CONF);
  const cfg = { TenUngDung: 'Sổ Chấm Công Cạo Mủ', TenDoi1: 'Đội 1', TenDoi2: 'Đội 2', SoNhomMoiDoi: 7, MauChuDao: '#1B7A43' };
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(r => {
      if (r[0]) cfg[String(r[0])] = r[1];
    });
  }
  cfg.SoNhomMoiDoi = Number(cfg.SoNhomMoiDoi) || 7;
  return cfg;
}

function saveConfig(payload) {
  checkWrite_('Admin');
  const sh = getOrCreateSheet_(TAB_CONF, ['Khoa', 'GiaTri']);
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues() : [];
  Object.keys(payload || {}).forEach(k => {
    const idx = rows.findIndex(r => String(r[0]) === k);
    if (idx >= 0) { sh.getRange(idx + 2, 2).setValue(payload[k]); rows[idx][1] = payload[k]; }
    else { sh.appendRow([k, payload[k]]); rows.push([k, payload[k]]); }
  });
  ghiLog_('CAU_HINH', 'CaiDat', JSON.stringify(payload));
  return { ok: true, config: getConfig_() };
}

function currentEmail_() {
  try { return Session.getActiveUser().getEmail() || ''; } catch (e) { return ''; }
}

// Trả về vai trò: Admin | NhapLieu | Xem | '' (chưa bật kiểm quyền = được ghi)
function myRole_() {
  const sh = ss_().getSheetByName(TAB_ROLE);
  if (!sh || sh.getLastRow() < 2) return '';
  const email = currentEmail_();
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues()
    .filter(r => String(r[0]).trim() !== '');
  if (!rows.length) return '';
  const me = rows.find(r => String(r[0]).trim().toLowerCase() === email.toLowerCase());
  return me ? String(me[1]).trim() : 'KhongCoQuyen';
}

function checkWrite_(need) {
  const role = myRole_();
  if (role === 'KhongCoQuyen' || role === 'Xem') throw new Error('Tài khoản của bạn không có quyền ghi dữ liệu. Liên hệ Admin để được cấp quyền ở tab PHAN_QUYEN.');
  if (need === 'Admin' && role && role !== 'Admin') throw new Error('Chức năng này chỉ dành cho Admin.');
}

function ghiLog_(hanhDong, doiTuong, chiTiet) {
  try {
    const sh = getOrCreateSheet_(TAB_LOG, ['ThoiGian','HanhDong','DoiTuong','NguoiThucHien','ChiTiet']);
    sh.appendRow([Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss'), hanhDong, doiTuong, currentEmail_(), chiTiet || '']);
  } catch (e) {}
}

/* ================== ĐỌC / GHI DỮ LIỆU ================== */
function num_(v) {
  if (v === null || v === undefined || v === '' || v === '-') return 0;
  const n = Number(String(v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function readAll_() {
  const sh = ss_().getSheetByName(TAB_DATA);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  return vals.map(r => {
    const o = {};
    HEADERS.forEach((h, i) => { o[h] = (r[i] instanceof Date) ? Utilities.formatDate(r[i], TZ, 'yyyy-MM-dd HH:mm:ss') : r[i]; });
    if (o.Ngay instanceof Date) o.Ngay = Utilities.formatDate(o.Ngay, TZ, 'yyyy-MM-dd');
    o.Ngay = String(o.Ngay || '').slice(0, 10);
    o.Doi = num_(o.Doi); o.Nhom = num_(o.Nhom);
    return o;
  }).filter(o => o.Ngay);
}

function countList_(s) {
  if (!s) return 0;
  return String(s).split(',').map(x => x.trim()).filter(x => x !== '').length;
}

// Bổ sung các số tự tính cho 1 bản ghi (cần map bản ghi theo nhóm để lấy hôm trước)
function derive_(o, prev) {
  const d = Object.assign({}, o);
  d.CongTrangBi = TRANG_BI_KEYS.reduce((s, k) => s + num_(d[k]), 0);
  d.CongMuc1 = num_(d.CongThuong) + num_(d.CongDup) + num_(d.CongChoang);
  d.CongMuc3 = num_(d.ThueCao) + num_(d.ThueBocMu);
  d.DiLam = num_(d.PhanDungLo) > 0 ? num_(d.PhanDungLo) : num_(d.CongThuong);
  d.Vang = num_(d.Vang);
  d.CoMat = d.DiLam + d.Vang;
  d.ThieuLD = num_(d.DinhBien) - d.CoMat;
  d.SoPhanThieu = countList_(d.DanhSachThieu);
  d.SoPhanVang = d.Vang > 0 ? d.Vang : countList_(d.DanhSachVang);
  const prevCoMat = prev ? ( (num_(prev.PhanDungLo) > 0 ? num_(prev.PhanDungLo) : num_(prev.CongThuong)) + num_(prev.Vang) ) : null;
  d.CoMatHomQua = prevCoMat;
  d.TuyenMoi = prevCoMat === null ? 0 : Math.max(d.CoMat - prevCoMat, 0);
  d.NghiViec = prevCoMat === null ? 0 : Math.max(prevCoMat - d.CoMat, 0);
  // Chỉ số tham khảo theo cách diễn đạt ở yêu cầu 4 (để đối chiếu, không dùng tính Có mặt)
  d.ChenhDiLamVsCoMatHomQua = prevCoMat === null ? null : prevCoMat - d.DiLam;
  return d;
}

function prevMap_(all) {
  // key Doi-Nhom -> mảng bản ghi đã sắp theo ngày
  const map = {};
  all.slice().sort((a, b) => a.Ngay < b.Ngay ? -1 : 1).forEach(o => {
    const k = o.Doi + '-' + o.Nhom;
    (map[k] = map[k] || []).push(o);
  });
  return map;
}

function findPrev_(map, o) {
  const arr = map[o.Doi + '-' + o.Nhom] || [];
  let prev = null;
  for (const r of arr) { if (r.Ngay < o.Ngay) prev = r; else break; }
  return prev;
}

/* ================== API CHO GIAO DIỆN ================== */
function getBootstrap() {
  return { ok: true, config: getConfig_(), email: currentEmail_(), role: myRole_(),
           today: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd') };
}

function getDay(dateISO) {
  checkDay_(dateISO);
  const all = readAll_();
  const map = prevMap_(all);
  const cfg = getConfig_();
  const records = [];
  for (let doi = 1; doi <= 2; doi++) {
    for (let nhom = 1; nhom <= cfg.SoNhomMoiDoi; nhom++) {
      const found = all.find(o => o.Ngay === dateISO && o.Doi === doi && o.Nhom === nhom);
      const base = found || { Ngay: dateISO, Doi: doi, Nhom: nhom, LoaiNgay: 'Thuong' };
      records.push(derive_(base, findPrev_(map, base)));
    }
  }
  return { ok: true, date: dateISO, records };
}

/* Toàn bộ bản ghi đã tính của 1 tháng — phục vụ dải chọn ngày, thẻ nhóm và chi tiết theo ngày */
function getMonthDays(month) { // month = 'yyyy-MM'
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) throw new Error('Tháng không hợp lệ: ' + month);
  const all = readAll_();
  const map = prevMap_(all);
  const records = all.filter(o => o.Ngay.slice(0, 7) === month)
    .map(o => derive_(o, findPrev_(map, o)));
  return { ok: true, month, records };
}

function checkDay_(dateISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO || ''))) throw new Error('Ngày không hợp lệ: ' + dateISO);
}

function saveRecord(rec) {
  checkWrite_();
  checkDay_(rec.Ngay);
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const all = readAll_();
  const rowVals = HEADERS.map(h => {
    if (h === 'CapNhatLuc') return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
    if (h === 'NguoiCapNhat') return currentEmail_();
    const v = rec[h];
    return v === undefined || v === null ? '' : v;
  });
  const idx = all.findIndex(o => o.Ngay === rec.Ngay && o.Doi === num_(rec.Doi) && o.Nhom === num_(rec.Nhom));
  if (idx >= 0) sh.getRange(idx + 2, 1, 1, HEADERS.length).setValues([rowVals]);
  else sh.appendRow(rowVals);
  ghiLog_(idx >= 0 ? 'SUA' : 'THEM', 'Đội ' + rec.Doi + ' – Nhóm ' + rec.Nhom, 'Ngày ' + rec.Ngay);
  // trả lại bản ghi đã tính
  const all2 = readAll_();
  const map = prevMap_(all2);
  const saved = all2.find(o => o.Ngay === rec.Ngay && o.Doi === num_(rec.Doi) && o.Nhom === num_(rec.Nhom));
  return { ok: true, record: derive_(saved, findPrev_(map, saved)) };
}

function copyYesterday(dateISO) {
  checkWrite_();
  checkDay_(dateISO);
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const prevISO = Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
  const all = readAll_();
  const src = all.filter(o => o.Ngay === prevISO);
  if (!src.length) throw new Error('Ngày hôm qua (' + prevISO + ') chưa có dữ liệu để sao chép.');
  let count = 0;
  src.forEach(o => {
    const existed = all.find(x => x.Ngay === dateISO && x.Doi === o.Doi && x.Nhom === o.Nhom);
    if (existed) return; // không ghi đè ngày đã nhập
    const copy = Object.assign({}, o, { Ngay: dateISO });
    saveRecordSilent_(copy);
    count++;
  });
  ghiLog_('SAO_CHEP', 'Ngay ' + dateISO, 'Sao chép ' + count + ' nhóm từ ' + prevISO);
  return { ok: true, count, from: prevISO };
}

function saveRecordSilent_(rec) {
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const rowVals = HEADERS.map(h => {
    if (h === 'CapNhatLuc') return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
    if (h === 'NguoiCapNhat') return currentEmail_();
    const v = rec[h];
    return v === undefined || v === null ? '' : v;
  });
  sh.appendRow(rowVals);
}

/* ---- Báo cáo kỳ: 1–15 / 16–cuối / cả tháng (yêu cầu 7, 8, 9, 10) ---- */
function periodOf_(dateISO) {
  const day = Number(dateISO.slice(8, 10));
  return day <= 15 ? 'nua1' : 'nua2';
}

function emptyStat_() {
  return {
    ngay: { thuong: 0, dup: 0, choang: 0, trangBi: 0, thue: 0, mua: 0, le: 0 },
    cong: { thuong: 0, dup: 0, choang: 0, trangBi: 0, thue: 0, mua: 0, le: 0 },
    phaiCao: 0, soNgayDaNhap: 0, tuyenMoi: 0, nghiViec: 0, vang: 0
  };
}

function addToStat_(st, d) {
  const p = periodOf_(d.Ngay);
  const t = st[p], all = st.thang;
  [t, all].forEach(s => {
    s.soNgayDaNhap++;
    s.phaiCao += num_(d.DinhBien);
    if (d.LoaiNgay === 'Mua') { s.ngay.mua++; s.cong.mua += d.CongMuc1 + d.CongTrangBi + d.CongMuc3; }
    else if (d.LoaiNgay === 'Le') { s.ngay.le++; s.cong.le += d.CongMuc1 + d.CongTrangBi + d.CongMuc3; }
    else {
      if (num_(d.CongThuong) > 0) s.ngay.thuong++;
      if (num_(d.CongDup) > 0) s.ngay.dup++;
      if (num_(d.CongChoang) > 0) s.ngay.choang++;
      if (d.CongTrangBi > 0) s.ngay.trangBi++;
      if (d.CongMuc3 > 0) s.ngay.thue++;
    }
    s.cong.thuong += num_(d.CongThuong);
    s.cong.dup += num_(d.CongDup);
    s.cong.choang += num_(d.CongChoang);
    s.cong.trangBi += d.CongTrangBi;
    s.cong.thue += d.CongMuc3;
    s.tuyenMoi += d.TuyenMoi;
    s.nghiViec += d.NghiViec;
    s.vang += d.Vang;
  });
}

function finishStat_(st) {
  ['nua1', 'nua2', 'thang'].forEach(k => {
    const s = st[k];
    s.khongDuoc = s.phaiCao - (s.cong.thuong + s.cong.dup + s.cong.choang); // yêu cầu 9
  });
  return st;
}

function getReport(month) { // month = 'yyyy-MM'
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) throw new Error('Tháng không hợp lệ: ' + month);
  const cfg = getConfig_();
  const all = readAll_().filter(o => o.Ngay.slice(0, 7) === month);
  const map = prevMap_(readAll_());
  const groups = [];
  function newPeriods() { return { nua1: emptyStat_(), nua2: emptyStat_(), thang: emptyStat_() }; }
  const doiP = { 1: newPeriods(), 2: newPeriods() };
  const compP = newPeriods();
  for (let doi = 1; doi <= 2; doi++) {
    for (let nhom = 1; nhom <= cfg.SoNhomMoiDoi; nhom++) {
      const p = newPeriods();
      all.filter(o => o.Doi === doi && o.Nhom === nhom).forEach(o => {
        const d = derive_(o, findPrev_(map, o));
        addToStat_(p, d); addToStat_(doiP[doi], d); addToStat_(compP, d);
      });
      groups.push({ doi, nhom, periods: finishStat_(p) });
    }
  }
  return { ok: true, month, groups,
           doi: { 1: finishStat_(doiP[1]), 2: finishStat_(doiP[2]) },
           company: finishStat_(compP), config: cfg };
}

/* ---- Báo cáo ngày theo mẫu Zalo 6 mục (đội đang dùng) ---- */
function fmtDateVN_(iso) {
  const p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function getDailyReportText(dateISO) {
  checkDay_(dateISO);
  const cfg = getConfig_();
  const day = getDay(dateISO);
  const blocks = [];
  day.records.forEach(r => {
    const has = num_(r.CongThuong) || num_(r.DinhBien) || r.MaPhan;
    if (!has) return;
    const tenDoi = r.Doi === 1 ? cfg.TenDoi1 : cfg.TenDoi2;
    const lines = [];
    lines.push('Ngày: ' + fmtDateVN_(dateISO) + ' — ' + tenDoi);
    if (r.LoaiNgay === 'Mua') lines.push('🌧 NGÀY MƯA');
    if (r.LoaiNgay === 'Le') lines.push('🎉 NGÀY LỄ');
    lines.push('1. Nhóm ' + r.Nhom + ': Tổng Công cạo ' + r.CongMuc1 + ' Phần');
    if (r.MaPhan) lines.push('   ' + r.MaPhan + ' : ' + num_(r.CongThuong) + '/' + (num_(r.TongPhanPhien) || '') );
    lines.push('2. Phần đứng lô: ' + r.DiLam + ' Công nhân');
    lines.push('   + Công cạo: ' + num_(r.CongThuong) + ' phần');
    lines.push('3. Phần vắng: ' + r.SoPhanVang + ' phần : (' + (r.DanhSachVang || '') + ')');
    lines.push('   Lý do: ' + (r.LyDoVang || ''));
    lines.push('4. Thiếu: ' + r.SoPhanThieu + ' phần : (' + (r.DanhSachThieu || '') + ')');
    lines.push('5. Công nhân có mặt: ' + r.CoMat + ' Công nhân');
    lines.push('6. Cạo không hết cây: ' + (r.CaoKhongHet || ''));
    if (r.CongTrangBi > 0) lines.push('   Trang bị: ' + r.CongTrangBi + ' công | Thuê: ' + r.CongMuc3 + ' công');
    if (r.TuyenMoi > 0) lines.push('   Tuyển mới: ' + r.TuyenMoi + ' | Nghỉ việc: ' + r.NghiViec);
    blocks.push(lines.join('\n'));
  });
  return { ok: true, date: dateISO, text: blocks.join('\n\n') || 'Chưa có dữ liệu ngày này.' };
}

/* ================== IMPORT TỪ BẢNG NGANG GỐC (chạy 1 lần) ==================
 * Tab CHẤM CÔNG CẠO: dòng 5..35 = ngày 01..31 của tháng đang để trong tab.
 * Mỗi khối 24 cột: nhóm bắt đầu ở cột B(2), Z(26), AX(50)... khối TỔNG ở 338/362/386 (bỏ qua).
 * Trong khối: +0 Định biên, +2 Công Thường, +4 Công Đúp, +6 Công Choàng,
 *             +7..+13 Trang bị, +15 Thuê Cạo, +16 Bóc mủ, +18 Vắng, phiên ở +1/+3/+5.
 * LƯU Ý: chọn đúng tháng/năm của tab trước khi chạy (mặc định 2026-10 như file gốc).
 */
function importDuLieuTuBangRong(month) {
  checkWrite_('Admin');
  month = month || '2026-10';
  const sh = ss_().getSheetByName(TAB_WIDE);
  if (!sh) throw new Error('Không thấy tab ' + TAB_WIDE);
  const starts = [1, 25, 49, 73, 97, 121, 145, 169, 193, 217, 241, 265, 289, 313]; // index 0-based của cột bắt đầu khối (cột B = 1)
  const groupOf = i => ({ doi: i < 7 ? 1 : 2, nhom: (i % 7) + 1 });
  const lastRow = sh.getLastRow();
  const width = sh.getMaxColumns();
  const vals = sh.getRange(1, 1, Math.min(lastRow, 40), width).getValues();
  const existing = readAll_();
  let added = 0, skipped = 0;
  for (let r = 4; r < vals.length; r++) {
    const dateCell = vals[r][0];
    if (!dateCell) continue;
    let iso = '';
    if (dateCell instanceof Date) iso = Utilities.formatDate(dateCell, TZ, 'yyyy-MM-dd');
    else {
      const m = String(dateCell).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!m) continue;
      iso = m[3] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    }
    if (iso.slice(0, 7) !== month) continue;
    starts.forEach((start, i) => {
      const g = groupOf(i);
      const cell = off => vals[r][start + off];
      const rec = { Ngay: iso, Doi: g.doi, Nhom: g.nhom, LoaiNgay: 'Thuong',
        DinhBien: num_(cell(0)),
        PhienThuong: String(cell(1) || '').trim(), CongThuong: num_(cell(2)),
        PhienDup: String(cell(3) || '').trim(), CongDup: num_(cell(4)),
        PhienChoang: String(cell(5) || '').trim(), CongChoang: num_(cell(6)),
        TB_ThietKe: num_(cell(7)), TB_KiengChen: num_(cell(8)), TB_ChanMua: num_(cell(9)),
        TB_CheChen: num_(cell(10)), TB_VayCheChen: num_(cell(11)), TB_CaoXa: num_(cell(12)), TB_Khac: num_(cell(13)),
        ThueCao: num_(cell(15)), ThueBocMu: num_(cell(16)),
        PhanDungLo: num_(cell(2)), Vang: num_(cell(18)) };
      const hasData = rec.CongThuong || rec.CongDup || rec.CongChoang || rec.DinhBien;
      const dup = existing.find(o => o.Ngay === iso && o.Doi === g.doi && o.Nhom === g.nhom);
      if (!hasData || dup) { skipped++; return; }
      saveRecordSilent_(rec);
      existing.push(rec);
      added++;
    });
  }
  ghiLog_('IMPORT', TAB_WIDE, 'Tháng ' + month + ': thêm ' + added + ', bỏ qua ' + skipped);
  return { ok: true, added, skipped, month };
}
