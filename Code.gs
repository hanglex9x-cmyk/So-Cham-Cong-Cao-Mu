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
  'CapNhatLuc','NguoiCapNhat',
  // Cột thêm về sau — LUÔN thêm ở CUỐI để không xáo trộn vị trí cột cũ trong Sheet
  'TB_MaiCheMua','TuyenMoiNhap','NghiViecNhap','DanhSachNghiViec','LyDoNghiViec','DanhSachTuyenMoi'
];

const TRANG_BI_KEYS = ['TB_ThietKe','TB_KiengChen','TB_ChanMua','TB_MaiCheMua','TB_CheChen','TB_VayCheChen','TB_CaoXa','TB_Khac'];

/* ===== Chấm công từng công nhân (theo mẫu 2 tab ChamCongThuong/ChamCongDup của khách) =====
 * DANH_SACH_CN: danh sách công nhân theo đội/nhóm. CHAM_CONG_CN: 1 dòng = 1 công nhân × 1 ngày.
 * Ký hiệu (chú thích trên bảng của khách): X = đi làm, P = nghỉ phép, O = ốm đau,
 * L = lễ/tết, B = mưa bão, NV = nghỉ việc.
 * Tự đếm vào phiếu + báo cáo: Vắng = số CN chấm P/O/L/B trong ngày; Nghỉ việc = số CN chấm NV. */
const TAB_ROSTER = 'DANH_SACH_CN';
const TAB_MARK = 'CHAM_CONG_CN';
const ROSTER_HEADERS = ['MaCN','Doi','Nhom','STT','PhanCao','HoTen','TenKhmer','DangLam','NgayThem'];
const MARK_HEADERS = ['Ngay','Doi','Nhom','MaCN','KyHieu','CapNhatLuc','NguoiCapNhat','GhiChu'];
const MARKS = ['X','V','P','O','NV','L','B'];

/* ================== TÀI KHOẢN / PHÂN QUYỀN ==================
 * Tab PHAN_QUYEN — mỗi dòng 1 tài khoản đăng nhập TRONG APP (không phải email Google,
 * vì app deploy "Execute as Me" nên mọi người dùng chung 1 danh tính Google).
 * Cột: TaiKhoan | MatKhau | TenHienThi | Doi (0 = cả 2 đội, 1/2 = chỉ đội đó)
 *      | Xem | Them | Sua | Xoa | QuanTri (1 = có quyền, 0 = không)
 * Admin quản lý ngay trong app: Cài đặt → Phân quyền (bảng tích checkbox).
 */
const ACC_HEADERS = ['TaiKhoan','MatKhau','TenHienThi','Doi','Xem','Them','Sua','Xoa','QuanTri'];
const DEFAULT_ACCOUNTS = [
  { u:'admin', p:'1234@', name:'Quản trị viên', doi:0, xem:1, them:1, sua:1, xoa:1, qt:1 },
  { u:'doi1',  p:'1234@', name:'Đội 1',         doi:1, xem:1, them:1, sua:0, xoa:0, qt:0 },
  { u:'doi2',  p:'1234@', name:'Đội 2',         doi:2, xem:1, them:1, sua:0, xoa:0, qt:0 }
];

function getAccounts_() {
  const sh = ss_().getSheetByName(TAB_ROLE);
  if (!sh || sh.getLastRow() < 2) return [];
  const head = sh.getRange(1, 1, 1, sh.getMaxColumns()).getValues()[0].map(x => String(x || '').trim());
  const ci = n => head.indexOf(n);
  if (ci('TaiKhoan') < 0) return []; // tab còn định dạng cũ (Email/VaiTro) = chưa bật tài khoản
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getMaxColumns()).getValues();
  const f = v => (v === 1 || v === '1' || v === true || String(v).trim().toLowerCase() === 'x') ? 1 : 0;
  return rows.filter(r => String(r[ci('TaiKhoan')] || '').trim() !== '').map(r => ({
    u: String(r[ci('TaiKhoan')]).trim(),
    p: String(r[ci('MatKhau')] === null || r[ci('MatKhau')] === undefined ? '' : r[ci('MatKhau')]).trim(),
    name: String(r[ci('TenHienThi')] || '').trim(),
    doi: num_(r[ci('Doi')]),
    xem: f(r[ci('Xem')]), them: f(r[ci('Them')]), sua: f(r[ci('Sua')]), xoa: f(r[ci('Xoa')]), qt: f(r[ci('QuanTri')])
  }));
}

/* Xác thực 1 request {data, auth:{u,p}} -> phiên làm việc.
 * Chưa có tài khoản nào trong PHAN_QUYEN => chế độ MỞ (toàn quyền, như bản cũ). */
function auth_(req) {
  const accs = getAccounts_();
  if (!accs.length) return { u:'(che-do-mo)', name:'Quản trị (chế độ mở)', doi:0, xem:1, them:1, sua:1, xoa:1, qt:1, open:true };
  const a = (req && req.auth) || {};
  const me = accs.find(x => x.u.toLowerCase() === String(a.u || '').trim().toLowerCase() && x.p === String(a.p || ''));
  if (!me) throw new Error('NEED_LOGIN');
  return { u: me.u, name: me.name || me.u, doi: me.doi, xem: me.xem, them: me.them, sua: me.sua, xoa: me.xoa, qt: me.qt, open:false };
}

function publicSession_(s) {
  return { u: s.u, name: s.name, doi: s.doi, xem: s.xem, them: s.them, sua: s.sua, xoa: s.xoa, qt: s.qt, open: !!s.open };
}

function requirePerm_(s, key, label) {
  if (!s[key]) throw new Error('Tài khoản "' + s.u + '" không có quyền ' + label + '. Liên hệ Admin để được cấp quyền trong Cài đặt → Phân quyền.');
}

/* ================== KHỞI TẠO / MENU ================== */
function doGet(e) {
  const view = (e && e.parameter && e.parameter.view) || '';
  const file = view === 'mobile' ? 'Mobile' : 'Index';
  const tpl = HtmlService.createTemplateFromFile(file);
  tpl.baseUrl = ScriptApp.getService().getUrl();
  tpl.curView = view === 'mobile' ? 'mobile' : 'pc';
  return tpl.evaluate()
    .setTitle('Chấm công cạo mủ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('🌴 App Chấm Công')
    .addItem('1. Cài đặt hệ thống (tạo tab + trigger backup)', 'setupHeThong')
    .addItem('2. Import dữ liệu T10/2026 từ tab CHẤM CÔNG CẠO', 'importDuLieuTuBangRong')
    .addItem('3. Nhập danh sách + chấm CN T9/2026 từ tab ChamCongThuong (Nhóm 1 Đội 1)', 'importDanhSachVaChamTuTabKhach')
    .addToUi();
}

function ss_() { return SpreadsheetApp.openById(SHEET_ID); }

function getOrCreateSheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
      sh.setFrozenRows(1);
    }
  } else if (headers && headers.length) {
    // Bổ sung cột/tiêu đề mới thêm ở cuối (vd khi nâng cấp thêm hạng mục), không đụng dữ liệu cũ
    if (sh.getMaxColumns() < headers.length) sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
    const row1 = sh.getRange(1, 1, 1, headers.length).getValues()[0];
    headers.forEach((h, i) => { if (!row1[i]) sh.getRange(1, i + 1).setValue(h).setFontWeight('bold'); });
  }
  return sh;
}

function setupHeThong() {
  getOrCreateSheet_(TAB_DATA, HEADERS);
  getOrCreateSheet_(TAB_ROSTER, ROSTER_HEADERS);
  getOrCreateSheet_(TAB_MARK, MARK_HEADERS);
  // Ép định dạng TEXT cho cột mã CN ở cả 2 tab chấm CN — chống Sheets tự biến mã kiểu "1-1-2001" thành ngày
  const rsh0 = ss_().getSheetByName(TAB_ROSTER);
  if (rsh0) fmtTextCol_(rsh0, 2, 1, Math.max(rsh0.getMaxRows() - 1, 1));
  const msh0 = ss_().getSheetByName(TAB_MARK);
  if (msh0) fmtTextCol_(msh0, 2, 4, Math.max(msh0.getMaxRows() - 1, 1));
  getOrCreateSheet_(TAB_LOG, ['ThoiGian','HanhDong','DoiTuong','NguoiThucHien','ChiTiet']);
  const role = getOrCreateSheet_(TAB_ROLE, ACC_HEADERS);
  // Tab PHAN_QUYEN còn định dạng cũ (Email/VaiTro) hoặc chưa có tài khoản -> ghi lại theo định dạng mới + 3 tài khoản mặc định
  const head0 = String(role.getRange(1, 1).getValue() || '');
  if (head0 !== 'TaiKhoan' || !getAccounts_().length) {
    role.clear();
    role.getRange(1, 1, 1, ACC_HEADERS.length).setValues([ACC_HEADERS]).setFontWeight('bold');
    role.setFrozenRows(1);
    role.getRange(2, 1, DEFAULT_ACCOUNTS.length, ACC_HEADERS.length).setValues(
      DEFAULT_ACCOUNTS.map(a => [a.u, a.p, a.name, a.doi, a.xem, a.them, a.sua, a.xoa, a.qt]));
  }
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
  const cfg = { TenUngDung: 'Sổ Chấm Công Cạo Mủ', TenDoi1: 'Đội 1', TenDoi2: 'Đội 2', SoNhomMoiDoi: 7, MauChuDao: '#1B7A43', ChiNhap: '0' };
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(r => {
      if (r[0]) cfg[String(r[0])] = r[1];
    });
  }
  cfg.SoNhomMoiDoi = Number(cfg.SoNhomMoiDoi) || 7;
  return cfg;
}

function saveConfig(req) {
  const s = auth_(req);
  requirePerm_(s, 'qt', 'Quản trị (lưu cài đặt)');
  const payload = (req && req.data) || {};
  const sh = getOrCreateSheet_(TAB_CONF, ['Khoa', 'GiaTri']);
  const rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues() : [];
  Object.keys(payload || {}).forEach(k => {
    const idx = rows.findIndex(r => String(r[0]) === k);
    if (idx >= 0) { sh.getRange(idx + 2, 2).setValue(payload[k]); rows[idx][1] = payload[k]; }
    else { sh.appendRow([k, payload[k]]); rows.push([k, payload[k]]); }
  });
  ghiLog_('CAU_HINH', 'CaiDat', JSON.stringify(payload), s.u);
  return { ok: true, config: getConfig_() };
}

/* Admin đọc danh sách tài khoản cho bảng Phân quyền (kèm mật khẩu — chỉ tài khoản Quản trị mới gọi được) */
function getAccounts(req) {
  const s = auth_(req);
  requirePerm_(s, 'qt', 'Quản trị (xem phân quyền)');
  return { ok: true, accounts: getAccounts_() };
}

/* Admin lưu toàn bộ bảng Phân quyền từ giao diện Cài đặt */
function saveAccounts(req) {
  const s = auth_(req);
  requirePerm_(s, 'qt', 'Quản trị (lưu phân quyền)');
  const list = (req && req.data) || [];
  if (!Array.isArray(list) || !list.length) throw new Error('Danh sách tài khoản trống — phải giữ ít nhất 1 tài khoản Quản trị.');
  const clean = list.filter(a => a && String(a.u || '').trim() !== '').map(a => ({
    u: String(a.u).trim(),
    p: String(a.p === null || a.p === undefined ? '' : a.p).trim(),
    name: String(a.name || '').trim(),
    doi: [0, 1, 2].includes(num_(a.doi)) ? num_(a.doi) : 0,
    xem: a.xem ? 1 : 0, them: a.them ? 1 : 0, sua: a.sua ? 1 : 0, xoa: a.xoa ? 1 : 0, qt: a.qt ? 1 : 0
  }));
  if (!clean.length) throw new Error('Danh sách tài khoản không hợp lệ.');
  if (!clean.some(a => a.qt)) throw new Error('Phải có ít nhất 1 tài khoản có quyền Quản trị, nếu không sẽ không ai vào sửa được nữa.');
  const sh = getOrCreateSheet_(TAB_ROLE, ACC_HEADERS);
  sh.clear();
  sh.getRange(1, 1, 1, ACC_HEADERS.length).setValues([ACC_HEADERS]).setFontWeight('bold');
  sh.setFrozenRows(1);
  sh.getRange(2, 1, clean.length, ACC_HEADERS.length).setValues(
    clean.map(a => [a.u, a.p, a.name, a.doi, a.xem, a.them, a.sua, a.xoa, a.qt]));
  ghiLog_('PHAN_QUYEN', 'TaiKhoan', 'Cập nhật ' + clean.length + ' tài khoản: ' + clean.map(a => a.u).join(', '), s.u);
  return { ok: true, accounts: clean };
}

function currentEmail_() {
  try { return Session.getActiveUser().getEmail() || ''; } catch (e) { return ''; }
}

function ghiLog_(hanhDong, doiTuong, chiTiet, user) {
  try {
    const sh = getOrCreateSheet_(TAB_LOG, ['ThoiGian','HanhDong','DoiTuong','NguoiThucHien','ChiTiet']);
    sh.appendRow([Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss'), hanhDong, doiTuong, user || currentEmail_(), chiTiet || '']);
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
  const width = Math.min(HEADERS.length, sh.getMaxColumns());
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, width).getValues();
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

// Phiếu có SỐ LIỆU THỰC (đã nhập công/vắng/thuê/trang bị) — phiếu chỉ có định biên
// (dòng tạo sẵn cho ngày chưa nhập) KHÔNG tính, để chuỗi Tuyển/Nghỉ bắc cầu qua nó.
function hasData_(o) {
  if (!o) return false;
  let s = num_(o.CongThuong) + num_(o.CongDup) + num_(o.CongChoang) + num_(o.Vang) + num_(o.ThueCao) + num_(o.ThueBocMu);
  TRANG_BI_KEYS.forEach(k => { s += num_(o[k]); });
  return s > 0;
}

// Bổ sung các số tự tính cho 1 bản ghi. prev = bản ghi ĐÃ DERIVE gần nhất trước ngày này
// mà CÓ SỐ LIỆU THỰC (deriveChain_ bắc cầu qua các ngày chưa nhập) — hai phía phép trừ
// Tuyển/Nghỉ cùng dùng Có mặt ĐÃ derive, không còn hiện tượng ngày trống "nuốt" toàn bộ
// Có mặt hôm trước thành nghỉ việc giả (vụ +567 ngày 24/10/2026).
// mk = tổng hợp chấm CN của đúng ngày/đội/nhóm (nếu có): chỉ GHI ĐÈ sang phiếu khi ngày đó
// đã chấm ĐỦ PHỦ (số CN được chấm >= 80% CN đang làm của nhóm) — chấm lạc vài dòng
// (test/bấm nhầm) không phá số của phiếu.
function derive_(o, prev, mk) {
  const d = Object.assign({}, o);
  d.CongTrangBi = TRANG_BI_KEYS.reduce((s, k) => s + num_(d[k]), 0);
  d.CongMuc1 = num_(d.CongThuong) + num_(d.CongDup) + num_(d.CongChoang);
  d.CongMuc3 = num_(d.ThueCao) + num_(d.ThueBocMu);
  const mkOk = !!(mk && mk.can > 0 && mk.tong >= Math.ceil(mk.can * 0.8));
  d.ChamCN = mk ? { x: mk.x, vang: mk.vang, vangAll: mk.vangAll || 0, nghi: mk.nghi, them: mk.them || 0, tong: mk.tong, can: mk.can, apDung: mkOk } : null;
  d.LuuVang = num_(o.Vang); // số Vắng LƯU GỐC trong Sheet — giao diện đổ số này vào ô nhập, không đổ số đã derive
  // Từ bản 26/10: bỏ ô "Phần đứng lô" riêng — Công thường CHÍNH LÀ số công nhân đứng lô.
  // Ngày chấm CN đủ phủ -> Đi làm = số CN chấm X, Vắng/Nghỉ việc đếm từ bảng chấm CN (map thẳng, không ghi tay lại)
  d.DiLam = mkOk ? mk.x : num_(d.CongThuong);
  d.Vang = mkOk ? mk.vang : num_(d.Vang);
  // Đợt 7.3 (user chốt tối 26/10): ngày map chấm CN -> Có mặt = đúng số đi làm X;
  // Vắng (P/O/V) chỉ hiển thị riêng, Lễ/Mưa không tính vào Vắng. Ngày nhập tay giữ
  // công thức in trên phiếu: Có mặt = Đi làm + Vắng.
  d.CoMat = mkOk ? d.DiLam : d.DiLam + d.Vang;
  // Cơ số đối chiếu chuỗi Tuyển/Nghỉ: luôn = Đi làm + TỔNG vắng (gồm cả L/B ở ngày map)
  // để ngày map và ngày nhập tay so nhau không sinh chênh giả.
  d.CoMatChain = d.DiLam + (mkOk ? (mk.vangAll || 0) : num_(d.Vang));
  d.ThieuLD = num_(d.DinhBien) - d.CoMat;
  d.SoPhanThieu = countList_(d.DanhSachThieu);
  d.SoPhanVang = d.Vang > 0 ? d.Vang : countList_(d.DanhSachVang);
  const prevCoMat = prev ? ((prev.CoMatChain !== undefined && prev.CoMatChain !== null) ? prev.CoMatChain : (prev.CoMat !== undefined ? prev.CoMat : null)) : null;
  d.CoMatHomQua = prevCoMat;
  // Tuyển mới / Nghỉ việc: ưu tiên số NHẬP TAY theo báo cáo chấm công của đội (khách chốt 26/10);
  // để trống thì tự tính — NHƯNG chỉ khi phiếu này có số liệu thực
  // (hoặc chấm CN đủ phủ) và có phiếu trước có số liệu thực để đối chiếu.
  // Đợt 7.3: riêng Tuyển mới, nếu ngày đó có thêm người ở màn Chấm CN (NgayThem) thì
  // lấy đúng số người thêm đó, không tính theo chênh Có mặt nữa.
  const coSoLieu = hasData_(o) || mkOk;
  const autoTuyenChain = (prevCoMat === null || !coSoLieu) ? 0 : Math.max(d.CoMatChain - prevCoMat, 0);
  const autoNghi = (prevCoMat === null || !coSoLieu) ? 0 : Math.max(prevCoMat - d.CoMatChain, 0);
  const autoTuyen = (mk && mk.them > 0 && (coSoLieu || mk.tong > 0)) ? mk.them : autoTuyenChain;
  d.AutoTuyenMoi = autoTuyen;
  d.AutoNghiViec = autoNghi;
  d.TuyenMoi = (d.TuyenMoiNhap === '' || d.TuyenMoiNhap === null || d.TuyenMoiNhap === undefined) ? autoTuyen : num_(d.TuyenMoiNhap);
  // Ngày chấm CN đủ phủ -> Nghỉ việc = số CN chấm NV hôm đó (ghi đè cả nhập tay lẫn tự tính chênh)
  d.NghiViec = mkOk ? mk.nghi : ((d.NghiViecNhap === '' || d.NghiViecNhap === null || d.NghiViecNhap === undefined) ? autoNghi : num_(d.NghiViecNhap));
  // Chỉ số tham khảo theo cách diễn đạt ở yêu cầu 4 (để đối chiếu, không dùng tính Có mặt)
  d.ChenhDiLamVsCoMatHomQua = prevCoMat === null ? null : prevCoMat - d.DiLam;
  d._coSoLieu = coSoLieu ? 1 : 0;
  return d;
}

/* Derive TOÀN BỘ bản ghi theo chuỗi từng nhóm (1 lượt): prev của mỗi bản ghi là bản ghi
 * có số liệu thực gần nhất trước nó trong cùng nhóm. Trả {byKey, byGroup}. */
function deriveChain_(all, mkMap) {
  const groups = {};
  all.forEach(o => { const k = o.Doi + '-' + o.Nhom; (groups[k] = groups[k] || []).push(o); });
  const byKey = {}, byGroup = {};
  Object.keys(groups).forEach(k => {
    const arr = groups[k].slice().sort((a, b) => a.Ngay < b.Ngay ? -1 : 1);
    let prevD = null;
    byGroup[k] = arr.map(o => {
      const d = derive_(o, prevD, mkOf_(mkMap, o));
      byKey[o.Ngay + '|' + o.Doi + '|' + o.Nhom] = d;
      if (d._coSoLieu) prevD = d;
      return d;
    });
  });
  return { byKey, byGroup };
}

function prevDerived_(chain, doi, nhom, ngay) {
  const arr = chain.byGroup[doi + '-' + nhom] || [];
  let p = null;
  for (const d of arr) { if (d.Ngay < ngay) { if (d._coSoLieu) p = d; } else break; }
  return p;
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

/* Tổng hợp chấm CN theo khóa Ngay|Doi|Nhom: x = số X, vang = số V/P/O (đợt 7.3: L/B
 * KHÔNG tính vào Vắng của phiếu nữa), vangAll = số V/P/O/L/B (cơ số đối chiếu chuỗi),
 * nghi = số NV, them = số CN được THÊM vào danh sách đúng ngày đó (đợt 7.3: nguồn
 * Tuyển mới), tong = số CN PHÂN BIỆT được chấm, can = số CN đang làm của nhóm
 * (để derive_ xét độ phủ).
 * Hàng rào toàn vẹn: khử trùng theo (Ngày, MaCN) — dòng SAU thắng; MaCN không thuộc
 * danh sách CN thì bỏ qua (dòng rác/test không lọt vào số liệu). */
function marksMap_() {
  const sh = ss_().getSheetByName(TAB_MARK);
  const map = {};
  const valid = {}, canMap = {};
  const roster = roster_();
  roster.forEach(w => {
    valid[w.MaCN] = true;
    if (w.DangLam) { const k = w.Doi + '|' + w.Nhom; canMap[k] = (canMap[k] || 0) + 1; }
  });
  const newEntry = (doi, nhom) => ({ x: 0, vang: 0, vangAll: 0, nghi: 0, them: 0, tong: 0, can: canMap[doi + '|' + nhom] || 0 });
  if (sh && sh.getLastRow() >= 2) {
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, MARK_HEADERS.length).getValues();
  const lastByKey = {}; // 'Ngay|MaCN' -> {doi, nhom, kh}
  vals.forEach(r => {
    const ngay = (r[0] instanceof Date) ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd') : String(r[0] || '').slice(0, 10);
    const ma = maCNStr_(r[3]);
    if (!ngay || !ma || !valid[ma]) return;
    lastByKey[ngay + '|' + ma] = { doi: num_(r[1]), nhom: num_(r[2]), kh: String(r[4] || '').trim().toUpperCase() };
  });
  Object.keys(lastByKey).forEach(k => {
    const it = lastByKey[k];
    const gk = k.split('|')[0] + '|' + it.doi + '|' + it.nhom;
    const m = map[gk] || (map[gk] = newEntry(it.doi, it.nhom));
    m.tong++;
    if (it.kh === 'X') m.x++;
    else if (it.kh === 'NV') m.nghi++;
    else if (it.kh === 'V' || it.kh === 'P' || it.kh === 'O') { m.vang++; m.vangAll++; }
    else if (it.kh === 'L' || it.kh === 'B') m.vangAll++;
  });
  }
  // Đợt 7.3: Tuyển mới lấy theo số người được THÊM ở màn Chấm CN (cột NgayThem của danh sách CN)
  roster.forEach(w => {
    if (!w.NgayThem) return;
    const gk = w.NgayThem + '|' + w.Doi + '|' + w.Nhom;
    const m = map[gk] || (map[gk] = newEntry(w.Doi, w.Nhom));
    m.them++;
  });
  return map;
}

function mkOf_(map, o) { return map[o.Ngay + '|' + o.Doi + '|' + o.Nhom] || null; }

/* ================== API CHO GIAO DIỆN ==================
 * Mọi hàm đều nhận req = { data, auth:{u,p} } và trả dữ liệu đã LỌC theo quyền:
 * tài khoản gắn Đội (doi 1/2) chỉ thấy đúng đội của mình ở mọi API đọc. */
function getBootstrap(req) {
  const accs = getAccounts_();
  const today = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  if (accs.length && !(req && req.auth && req.auth.u)) {
    // Chưa đăng nhập: chỉ trả danh sách tài khoản (tên) để hiện màn hình đăng nhập
    return { ok: true, needLogin: true, accounts: accs.map(a => ({ u: a.u, name: a.name || a.u, doi: a.doi })),
             config: getConfig_(), today };
  }
  const s = auth_(req); // sai mật khẩu -> NEED_LOGIN
  return { ok: true, needLogin: false, config: getConfig_(), session: publicSession_(s), today };
}

function getDay(req) {
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  return { ok: true, date: req.data, records: getDayRecords_(req.data, s.doi) };
}

function getDayRecords_(dateISO, scopeDoi) {
  checkDay_(dateISO);
  const all = readAll_();
  const mkMap = marksMap_();
  const chain = deriveChain_(all, mkMap);
  const cfg = getConfig_();
  const dois = scopeDoi ? [scopeDoi] : [1, 2];
  const records = [];
  dois.forEach(doi => {
    for (let nhom = 1; nhom <= cfg.SoNhomMoiDoi; nhom++) {
      const derived = chain.byKey[dateISO + '|' + doi + '|' + nhom];
      if (derived) { records.push(derived); continue; }
      const base = { Ngay: dateISO, Doi: doi, Nhom: nhom, LoaiNgay: 'Thuong' };
      records.push(derive_(base, prevDerived_(chain, doi, nhom, dateISO), mkOf_(mkMap, base)));
    }
  });
  return records;
}

/* Toàn bộ bản ghi đã tính của 1 tháng — phục vụ dải chọn ngày, thẻ nhóm và chi tiết theo ngày */
function getMonthDays(req) { // data = 'yyyy-MM'
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  const month = req.data;
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) throw new Error('Tháng không hợp lệ: ' + month);
  const chain = deriveChain_(readAll_(), marksMap_());
  const records = Object.keys(chain.byKey).map(k => chain.byKey[k])
    .filter(d => d.Ngay.slice(0, 7) === month && (!s.doi || d.Doi === s.doi))
    .sort((a, b) => (a.Ngay < b.Ngay ? -1 : 1) || (a.Doi - b.Doi) || (a.Nhom - b.Nhom));
  return { ok: true, month, records };
}

function checkDay_(dateISO) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateISO || ''))) throw new Error('Ngày không hợp lệ: ' + dateISO);
}

function saveRecord(req) {
  const s = auth_(req);
  const rec = (req && req.data) || {};
  checkDay_(rec.Ngay);
  if (s.doi && num_(rec.Doi) !== s.doi) throw new Error('Tài khoản "' + s.u + '" chỉ được nhập dữ liệu của Đội ' + s.doi + '.');
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const all = readAll_();
  const idx = all.findIndex(o => o.Ngay === rec.Ngay && o.Doi === num_(rec.Doi) && o.Nhom === num_(rec.Nhom));
  const existed = idx >= 0 && (num_(all[idx].DinhBien) > 0 || num_(all[idx].CongThuong) > 0 || num_(all[idx].CongDup) > 0 || num_(all[idx].CongChoang) > 0);
  // Phiếu trống (dòng tạo sẵn) coi như chưa nhập; phiếu ĐÃ CÓ số liệu thì cần quyền Sửa
  if (idx >= 0 && existed) requirePerm_(s, 'sua', 'Sửa phiếu đã nhập');
  else requirePerm_(s, 'them', 'Thêm phiếu mới');
  // MERGE ở server: xuất phát từ bản ghi ĐÃ LƯU, chỉ phủ các trường client thực gửi —
  // client thiếu trường nào thì giữ nguyên giá trị cũ (chặn tận gốc vụ lưu phiếu làm
  // mất định biên/số liệu như sự cố 26/10).
  const existing = idx >= 0 ? all[idx] : null;
  const merged = {};
  HEADERS.forEach(h => { merged[h] = existing ? existing[h] : ''; });
  Object.keys(rec).forEach(k => { if (rec[k] !== undefined && HEADERS.indexOf(k) >= 0) merged[k] = rec[k]; });
  merged.Ngay = rec.Ngay; merged.Doi = num_(rec.Doi); merged.Nhom = num_(rec.Nhom);
  // Ngày đã chấm CN ĐỦ PHỦ: Vắng + Nghỉ việc lấy từ bảng chấm CN — KHÔNG ghi 2 ô này
  // (giao diện đang hiển thị số đã derive; ghi xuống là biến số tính thành dữ liệu gốc).
  const mkMap0 = marksMap_();
  const mk0 = mkOf_(mkMap0, merged);
  if (existing && mk0 && mk0.can > 0 && mk0.tong >= Math.ceil(mk0.can * 0.8)) {
    merged.Vang = existing.Vang;
    merged.NghiViecNhap = existing.NghiViecNhap;
  }
  const rowVals = HEADERS.map(h => {
    if (h === 'CapNhatLuc') return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
    if (h === 'NguoiCapNhat') return s.u;
    const v = merged[h];
    return v === undefined || v === null ? '' : v;
  });
  if (idx >= 0) sh.getRange(idx + 2, 1, 1, HEADERS.length).setValues([rowVals]);
  else sh.appendRow(rowVals);
  ghiLog_(idx >= 0 ? 'SUA' : 'THEM', 'Đội ' + rec.Doi + ' – Nhóm ' + rec.Nhom, 'Ngày ' + rec.Ngay, s.u);
  // trả lại bản ghi đã tính (theo chuỗi bắc cầu)
  const chain = deriveChain_(readAll_(), marksMap_());
  return { ok: true, record: chain.byKey[rec.Ngay + '|' + num_(rec.Doi) + '|' + num_(rec.Nhom)] };
}

/* Xóa hẳn 1 phiếu (chỉ tài khoản có quyền Xóa — mặc định chỉ Admin) */
function deleteRecord(req) {
  const s = auth_(req);
  requirePerm_(s, 'xoa', 'Xóa phiếu');
  const rec = (req && req.data) || {};
  checkDay_(rec.Ngay);
  if (s.doi && num_(rec.Doi) !== s.doi) throw new Error('Tài khoản "' + s.u + '" chỉ được thao tác dữ liệu của Đội ' + s.doi + '.');
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const all = readAll_();
  const idx = all.findIndex(o => o.Ngay === rec.Ngay && o.Doi === num_(rec.Doi) && o.Nhom === num_(rec.Nhom));
  if (idx < 0) throw new Error('Không thấy phiếu này trong dữ liệu.');
  sh.deleteRow(idx + 2);
  ghiLog_('XOA', 'Đội ' + rec.Doi + ' – Nhóm ' + rec.Nhom, 'Ngày ' + rec.Ngay, s.u);
  return { ok: true };
}

function copyYesterday(req) {
  const s = auth_(req);
  requirePerm_(s, 'them', 'Thêm (chép hôm qua)');
  const dateISO = req.data;
  checkDay_(dateISO);
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const prevISO = Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
  const all = readAll_();
  const src = all.filter(o => o.Ngay === prevISO && (!s.doi || o.Doi === s.doi));
  if (!src.length) throw new Error('Ngày hôm qua (' + prevISO + ') chưa có dữ liệu để sao chép.');
  let count = 0;
  src.forEach(o => {
    const existed = all.find(x => x.Ngay === dateISO && x.Doi === o.Doi && x.Nhom === o.Nhom);
    if (existed) return; // không ghi đè ngày đã nhập
    const copy = Object.assign({}, o, { Ngay: dateISO });
    saveRecordSilent_(copy, s.u);
    count++;
  });
  ghiLog_('SAO_CHEP', 'Ngay ' + dateISO, 'Sao chép ' + count + ' nhóm từ ' + prevISO, s.u);
  return { ok: true, count, from: prevISO };
}

function saveRecordSilent_(rec, user) {
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const rowVals = HEADERS.map(h => {
    if (h === 'CapNhatLuc') return Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
    if (h === 'NguoiCapNhat') return user || currentEmail_();
    const v = rec[h];
    return v === undefined || v === null ? '' : v;
  });
  sh.appendRow(rowVals);
}

/* ---- Nhập dữ liệu từ file Excel do giao diện gửi lên (khách yêu cầu 26/10) ----
 * Mỗi dòng trong list là 1 phiếu (Ngay yyyy-MM-dd, Doi, Nhom + các cột theo HEADERS).
 * Khóa trùng: Ngay + Doi + Nhom -> đã có thì cập nhật, chưa có thì thêm mới. */
function importRecords(req) {
  const s = auth_(req);
  requirePerm_(s, 'qt', 'Quản trị (nhập Excel)');
  const list = (req && req.data) || [];
  if (!Array.isArray(list) || !list.length) throw new Error('File Excel không có dòng dữ liệu nào.');
  const sh = getOrCreateSheet_(TAB_DATA, HEADERS);
  const all = readAll_();
  const idxMap = {};
  all.forEach((o, i) => { idxMap[o.Ngay + '|' + o.Doi + '|' + o.Nhom] = i; });
  const nowStr = Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
  const me = s.u;
  let added = 0, updated = 0, skipped = 0;
  const appends = [];
  const appendIdx = {};
  list.forEach(rec => {
    if (!rec || !/^\d{4}-\d{2}-\d{2}$/.test(String(rec.Ngay || '')) || !num_(rec.Doi) || !num_(rec.Nhom)) { skipped++; return; }
    const key = String(rec.Ngay) + '|' + num_(rec.Doi) + '|' + num_(rec.Nhom);
    const rowVals = HEADERS.map(h => {
      if (h === 'CapNhatLuc') return nowStr;
      if (h === 'NguoiCapNhat') return me;
      const v = rec[h];
      return v === undefined || v === null ? '' : v;
    });
    if (key in appendIdx) { appends[appendIdx[key]] = rowVals; return; }
    if (key in idxMap) { sh.getRange(idxMap[key] + 2, 1, 1, HEADERS.length).setValues([rowVals]); updated++; }
    else { appendIdx[key] = appends.length; appends.push(rowVals); added++; }
  });
  if (appends.length) sh.getRange(sh.getLastRow() + 1, 1, appends.length, HEADERS.length).setValues(appends);
  ghiLog_('IMPORT_EXCEL', TAB_DATA, 'Nhập Excel: thêm ' + added + ', cập nhật ' + updated + ', bỏ qua ' + skipped, s.u);
  return { ok: true, added, updated, skipped };
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

function getReport(req) { // data = 'yyyy-MM'
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  const month = req.data;
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) throw new Error('Tháng không hợp lệ: ' + month);
  const cfg = getConfig_();
  const dois = s.doi ? [s.doi] : [1, 2];
  const all = readAll_().filter(o => o.Ngay.slice(0, 7) === month && dois.includes(o.Doi));
  const chain = deriveChain_(readAll_(), marksMap_());
  const groups = [];
  function newPeriods() { return { nua1: emptyStat_(), nua2: emptyStat_(), thang: emptyStat_() }; }
  const doiP = { 1: newPeriods(), 2: newPeriods() };
  const compP = newPeriods();
  dois.forEach(doi => {
    for (let nhom = 1; nhom <= cfg.SoNhomMoiDoi; nhom++) {
      const p = newPeriods();
      all.filter(o => o.Doi === doi && o.Nhom === nhom).forEach(o => {
        const d = chain.byKey[o.Ngay + '|' + o.Doi + '|' + o.Nhom];
        addToStat_(p, d); addToStat_(doiP[doi], d); addToStat_(compP, d);
      });
      groups.push({ doi, nhom, periods: finishStat_(p) });
    }
  });
  return { ok: true, month, groups,
           doi: { 1: finishStat_(doiP[1]), 2: finishStat_(doiP[2]) },
           company: finishStat_(compP), config: cfg };
}

/* ---- Báo cáo ngày theo MẪU TIN ZALO nhóm thống nhất 26/10/2026 ----
 * Mẫu: "CAO MỦ NGÀY: ... NHÓM x - ĐỘI y / I. Tình hình cạo mủ / II. Biến động công nhân".
 * Tổng công cạo trong ngày = Thường + Choàng (đúp KHÔNG cộng vào tổng, theo đúng mẫu).
 * Số phần viết 2 chữ số (08, 05...); tỷ lệ có mặt = Có mặt / Định biên, 2 số thập phân. */
function fmtDateVN_(iso) {
  const p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

function pad2_(n) { return String(num_(n)).padStart(2, '0'); }

function getDailyReportText(req) {
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  const dateISO = req.data;
  checkDay_(dateISO);
  const records = getDayRecords_(dateISO, s.doi);
  const blocks = [];
  records.forEach(r => {
    const mapped = !!(r.ChamCN && r.ChamCN.apDung);
    const has = num_(r.CongThuong) || num_(r.DinhBien) || r.MaPhan || mapped; // nhóm chỉ chấm CN (chưa mở phiếu) vẫn có tin khi chấm đủ phủ
    if (!has) return;
    const congThuongHien = mapped ? r.DiLam : num_(r.CongThuong); // ngày map từ chấm CN: công thường = số CN chấm X
    const lines = [];
    lines.push('CAO MỦ NGÀY: ' + fmtDateVN_(dateISO) + ' NHÓM ' + r.Nhom + ' - ĐỘI ' + r.Doi);
    if (r.LoaiNgay === 'Mua') lines.push('🌧 NGÀY MƯA');
    if (r.LoaiNgay === 'Le') lines.push('🎉 NGÀY LỄ');
    lines.push('I. Tình hình cạo mủ:');
    lines.push('1. Cạo thường (đứng lô) : ' + pad2_(congThuongHien) + ' phần' + (r.PhienThuong ? ', phiên ' + r.PhienThuong : '') + '.');
    lines.push('2. Nhận thêm phần (choàng) : ' + pad2_(r.CongChoang) + ' phần.');
    lines.push('3. Cạo đúp : ' + pad2_(r.CongDup) + ' phần' + (r.PhienDup ? ', phiên ' + r.PhienDup : '') + '.');
    lines.push('➡️ Tổng công cạo trong ngày : ' + pad2_(congThuongHien + num_(r.CongChoang)) + ' phần. (thường và nhận thêm phần)');
    lines.push('II. Biến động công nhân');
    lines.push('1. Vắng : ' + pad2_(r.SoPhanVang) + ' phần' + (r.DanhSachVang ? ' (phần ' + r.DanhSachVang + ')' : '.'));
    if (r.LyDoVang) lines.push('Lý do: ' + String(r.LyDoVang).replace(/\.+$/, '') + '.');
    lines.push('2. Nghỉ việc : ' + pad2_(r.NghiViec) + ' phần' + (r.DanhSachNghiViec ? ' (ghi nhận phần ' + r.DanhSachNghiViec + ')' : '') + '.');
    if (r.LyDoNghiViec) lines.push('Lý do: ' + String(r.LyDoNghiViec).replace(/\.+$/, '') + '.');
    lines.push('3. Tuyển mới : ' + pad2_(r.TuyenMoi) + ' phần' + (r.DanhSachTuyenMoi ? ' (phần ' + r.DanhSachTuyenMoi + ')' : '') + '.');
    lines.push('4. Thiếu nhân công : ' + pad2_(r.SoPhanThieu) + ' phần.');
    const pct = num_(r.DinhBien) > 0 ? (num_(r.CoMat) / num_(r.DinhBien) * 100).toFixed(2).replace('.', ',') : '0,00';
    lines.push('👥 Tổng công nhân có mặt : ' + r.CoMat + '/' + num_(r.DinhBien) + ' người, đạt ' + pct + '%.');
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
  // Chạy tay từ editor/menu bởi chủ Sheet — không qua đăng nhập app
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

/* ================== CHẤM CÔNG TỪNG CÔNG NHÂN ==================
 * Màn "Chấm CN": 2 kiểu xem — THEO NGÀY (chọn ngày → từng công nhân chọn Đi làm X /
 * Vắng V / Nghỉ P / Nghỉ hẳn NV + ô ghi chú nghỉ) và THEO THÁNG (lưới CN × ngày, bấm ô
 * để vòng ký hiệu X/V/P/O/NV/L/B). Ghi chú lưu ở cột GhiChu của tab CHAM_CONG_CN.
 * Vắng + Nghỉ việc của phiếu/báo cáo tự đếm từ đây qua marksMap_() + derive_(). */
/* Mã CN đọc từ Sheet: mã dạng "1-1-2001" là date-like — nếu ô đã bị Sheets tự biến
 * thành Date thì dựng lại dạng "Doi-Nhom-STT" từ ngày/tháng/năm của Date đó.
 * Chống tái phát tận gốc: MỌI đường ghi mã CN đều ép định dạng text '@' trước khi ghi
 * (fmtTextCol_) — hàm này chỉ là lưới an toàn cho dữ liệu cũ. */
function maCNStr_(v) {
  if (v instanceof Date) return v.getDate() + '-' + (v.getMonth() + 1) + '-' + v.getFullYear();
  return String(v || '').trim();
}

function fmtTextCol_(sh, startRow, col, nRows) {
  if (sh && nRows > 0) sh.getRange(startRow, col, nRows, 1).setNumberFormat('@');
}

function roster_() {
  const sh = ss_().getSheetByName(TAB_ROSTER);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, ROSTER_HEADERS.length).getValues();
  return vals.map(r => ({
    MaCN: maCNStr_(r[0]), Doi: num_(r[1]), Nhom: num_(r[2]), STT: num_(r[3]),
    PhanCao: String(r[4] || ''), HoTen: String(r[5] || ''), TenKhmer: String(r[6] || ''),
    DangLam: (r[7] === 1 || r[7] === '1' || r[7] === true) ? 1 : 0,
    NgayThem: (r[8] instanceof Date) ? Utilities.formatDate(r[8], TZ, 'yyyy-MM-dd') : String(r[8] || '').slice(0, 10)
  })).filter(w => w.MaCN);
}

function scopeCheck_(s, doi) {
  if (s.doi && num_(doi) !== s.doi) throw new Error('Tài khoản "' + s.u + '" chỉ được thao tác dữ liệu của Đội ' + s.doi + '.');
}

function getWorkers(req) { // data = {doi, nhom}
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  const d = (req && req.data) || {};
  scopeCheck_(s, d.doi);
  const workers = roster_().filter(w => w.Doi === num_(d.doi) && w.Nhom === num_(d.nhom))
    .sort((a, b) => (b.DangLam - a.DangLam) || (a.STT - b.STT));
  return { ok: true, workers };
}

function saveWorker(req) { // thêm CN mới (quyền Thêm) hoặc sửa thông tin CN có sẵn (quyền Sửa)
  const s = auth_(req);
  const w = (req && req.data) || {};
  scopeCheck_(s, w.Doi);
  const sh = getOrCreateSheet_(TAB_ROSTER, ROSTER_HEADERS);
  const all = roster_();
  if (w.MaCN) {
    requirePerm_(s, 'sua', 'Sửa danh sách công nhân');
    const idx = all.findIndex(x => x.MaCN === w.MaCN);
    if (idx < 0) throw new Error('Không thấy công nhân ' + w.MaCN);
    fmtTextCol_(sh, idx + 2, 1, 1); // ép text TRƯỚC khi ghi mã CN (chống biến thành ngày)
    sh.getRange(idx + 2, 1, 1, ROSTER_HEADERS.length).setValues([[
      w.MaCN, num_(w.Doi), num_(w.Nhom), num_(w.STT) || all[idx].STT,
      String(w.PhanCao || ''), String(w.HoTen || ''), String(w.TenKhmer || ''), all[idx].DangLam, all[idx].NgayThem || ''
    ]]);
    ghiLog_('SUA_CN', w.MaCN, 'Sửa thông tin công nhân', s.u);
    return { ok: true, worker: roster_().find(x => x.MaCN === w.MaCN) };
  }
  requirePerm_(s, 'them', 'Thêm công nhân');
  if (!String(w.HoTen || '').trim()) throw new Error('Chưa nhập họ tên công nhân.');
  const sameGroup = all.filter(x => x.Doi === num_(w.Doi) && x.Nhom === num_(w.Nhom));
  const seq = sameGroup.reduce((m, x) => Math.max(m, num_(String(x.MaCN).split('-')[2]) || 0, x.STT || 0), 0) + 1;
  const ma = num_(w.Doi) + '-' + num_(w.Nhom) + '-' + String(seq).padStart(3, '0');
  const stt = num_(w.STT) || seq;
  const rowNum = sh.getLastRow() + 1;
  const ngayThem = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); // ngày thêm CN — phiếu của ngày này tự tính Tuyển mới theo số người thêm ở màn Chấm CN (đợt 7.3)
  fmtTextCol_(sh, rowNum, 1, 1); // ép text TRƯỚC khi ghi mã CN (chống biến thành ngày)
  sh.getRange(rowNum, 1, 1, ROSTER_HEADERS.length).setValues([[ma, num_(w.Doi), num_(w.Nhom), stt, String(w.PhanCao || ''), String(w.HoTen || '').trim(), String(w.TenKhmer || ''), 1, ngayThem]]);
  ghiLog_('THEM_CN', ma, 'Thêm công nhân ' + w.HoTen + ' (Đội ' + w.Doi + ' – Nhóm ' + w.Nhom + ')', s.u);
  return { ok: true, worker: { MaCN: ma, Doi: num_(w.Doi), Nhom: num_(w.Nhom), STT: stt, PhanCao: String(w.PhanCao || ''), HoTen: String(w.HoTen || '').trim(), TenKhmer: String(w.TenKhmer || ''), DangLam: 1, NgayThem: ngayThem } };
}

function setWorkerActive(req) { // data = {MaCN, active:1/0} — cho nghỉ hẳn / đi làm lại
  const s = auth_(req);
  requirePerm_(s, 'sua', 'Sửa danh sách công nhân');
  const d = (req && req.data) || {};
  const all = roster_();
  const idx = all.findIndex(x => x.MaCN === d.MaCN);
  if (idx < 0) throw new Error('Không thấy công nhân ' + d.MaCN);
  scopeCheck_(s, all[idx].Doi);
  const sh = getOrCreateSheet_(TAB_ROSTER, ROSTER_HEADERS);
  sh.getRange(idx + 2, 8).setValue(d.active ? 1 : 0);
  ghiLog_('CN_DANGLAM', d.MaCN, d.active ? 'Cho đi làm lại' : 'Cho nghỉ hẳn (ẩn khỏi bảng chấm)', s.u);
  return { ok: true };
}

function getWorkerMonth(req) { // data = {month:'yyyy-MM', doi, nhom}
  const s = auth_(req);
  requirePerm_(s, 'xem', 'Xem');
  const d = (req && req.data) || {};
  if (!/^\d{4}-\d{2}$/.test(String(d.month || ''))) throw new Error('Tháng không hợp lệ: ' + d.month);
  scopeCheck_(s, d.doi);
  const workers = roster_().filter(w => w.Doi === num_(d.doi) && w.Nhom === num_(d.nhom))
    .sort((a, b) => (b.DangLam - a.DangLam) || (a.STT - b.STT));
  const marks = {}; // MaCN -> { 'd' : 'X' }
  const notes = {}; // MaCN -> { 'd' : 'ghi chú nghỉ' }
  const sh = ss_().getSheetByName(TAB_MARK);
  if (sh && sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, MARK_HEADERS.length).getValues().forEach(r => {
      const ngay = (r[0] instanceof Date) ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd') : String(r[0] || '').slice(0, 10);
      if (ngay.slice(0, 7) !== d.month || num_(r[1]) !== num_(d.doi) || num_(r[2]) !== num_(d.nhom)) return;
      const ma = maCNStr_(r[3]);
      if (!ma) return;
      const day = String(Number(ngay.slice(8, 10)));
      const kh = String(r[4] || '').trim().toUpperCase();
      if (kh) (marks[ma] = marks[ma] || {})[day] = kh;
      const note = String(r[7] || '').trim();
      if (note) (notes[ma] = notes[ma] || {})[day] = note;
    });
  }
  return { ok: true, workers, marks, notes };
}

function markRowIndex_(sh, ngay, maCN) {
  if (!sh || sh.getLastRow() < 2) return -1;
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, MARK_HEADERS.length).getValues();
  for (let i = 0; i < vals.length; i++) {
    const n = (vals[i][0] instanceof Date) ? Utilities.formatDate(vals[i][0], TZ, 'yyyy-MM-dd') : String(vals[i][0] || '').slice(0, 10);
    if (n === ngay && maCNStr_(vals[i][3]) === maCN) return i;
  }
  return -1;
}

function saveWorkerMark(req) { // data = {Ngay, MaCN, KyHieu, GhiChu?} — KyHieu '' + không ghi chú = xóa chấm; không gửi GhiChu = giữ ghi chú cũ
  const s = auth_(req);
  const d = (req && req.data) || {};
  checkDay_(d.Ngay);
  const kh = String(d.KyHieu || '').trim().toUpperCase();
  if (kh && !MARKS.includes(kh)) throw new Error('Ký hiệu không hợp lệ: ' + kh + ' (chỉ dùng X, V, P, O, NV, L, B)');
  const w = roster_().find(x => x.MaCN === d.MaCN);
  if (!w) throw new Error('Không thấy công nhân ' + d.MaCN);
  scopeCheck_(s, w.Doi);
  const sh = getOrCreateSheet_(TAB_MARK, MARK_HEADERS);
  const idx = markRowIndex_(sh, d.Ngay, d.MaCN);
  if (idx >= 0) requirePerm_(s, 'sua', 'Sửa ô chấm công đã có');
  else requirePerm_(s, 'them', 'Chấm công');
  let oldNote = '';
  if (idx >= 0) oldNote = String(sh.getRange(idx + 2, 8).getValue() || '').trim();
  const note = (d.GhiChu === undefined || d.GhiChu === null) ? oldNote : String(d.GhiChu).trim().slice(0, 200);
  if (!kh && !note) {
    if (idx >= 0) sh.deleteRow(idx + 2);
    return { ok: true, cleared: true };
  }
  const nowStr = Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
  if (idx >= 0) {
    fmtTextCol_(sh, idx + 2, 4, 1); // ép text cột mã CN trước khi ghi
    sh.getRange(idx + 2, 1, 1, MARK_HEADERS.length).setValues([[d.Ngay, w.Doi, w.Nhom, w.MaCN, kh, nowStr, s.u, note]]);
  } else {
    const rowNum = sh.getLastRow() + 1;
    fmtTextCol_(sh, rowNum, 4, 1);
    sh.getRange(rowNum, 1, 1, MARK_HEADERS.length).setValues([[d.Ngay, w.Doi, w.Nhom, w.MaCN, kh, nowStr, s.u, note]]);
  }
  return { ok: true };
}

function saveMarksBatch(req) { // data = {items:[{Ngay, MaCN, KyHieu?, GhiChu?}]} — lưu LOẠT thay đổi chấm CN khi bấm nút Lưu (chấm xong chọn hết rồi mới ghi 1 lần)
  const s = auth_(req);
  const d = (req && req.data) || {};
  const items = Array.isArray(d.items) ? d.items : [];
  if (!items.length) throw new Error('Chưa có thay đổi nào để lưu.');
  if (items.length > 800) throw new Error('Một lần lưu tối đa 800 thay đổi, hiện có ' + items.length + ' — hãy lưu từng đợt.');
  const rosterAll = roster_();
  const wmap = {}, widx = {};
  rosterAll.forEach((w, i) => { wmap[w.MaCN] = w; widx[w.MaCN] = i; });
  const sh = getOrCreateSheet_(TAB_MARK, MARK_HEADERS);
  const exist = {}; // 'Ngay|MaCN' -> {idx (0-based trong vals), kh, note}
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, MARK_HEADERS.length).getValues().forEach((r, i) => {
      const ngay = (r[0] instanceof Date) ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd') : String(r[0] || '').slice(0, 10);
      const ma = maCNStr_(r[3]);
      if (ngay && ma) exist[ngay + '|' + ma] = { idx: i, kh: String(r[4] || '').trim().toUpperCase(), note: String(r[7] || '').trim() };
    });
  }
  // Kiểm tra hợp lệ + quyền TRƯỚC khi ghi bất cứ dòng nào (1 ô sai quyền = cả loạt không lưu, báo rõ)
  const prepared = items.map(it => {
    checkDay_(it.Ngay);
    const kh = (it.KyHieu === undefined || it.KyHieu === null) ? undefined : String(it.KyHieu).trim().toUpperCase();
    if (kh !== undefined && kh && !MARKS.includes(kh)) throw new Error('Ký hiệu không hợp lệ: ' + kh);
    const w = wmap[it.MaCN];
    if (!w) throw new Error('Không thấy công nhân ' + it.MaCN);
    scopeCheck_(s, w.Doi);
    const ex = exist[it.Ngay + '|' + it.MaCN] || null;
    if (ex) requirePerm_(s, 'sua', 'Sửa ô chấm công đã có');
    else requirePerm_(s, 'them', 'Chấm công');
    const note = (it.GhiChu === undefined || it.GhiChu === null) ? (ex ? ex.note : '') : String(it.GhiChu).trim().slice(0, 200);
    const finalKy = kh !== undefined ? kh : (ex ? ex.kh : '');
    return { it, w, ex, note, finalKy };
  });
  const nowStr = Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
  const appends = [], deleteIdx = [];
  prepared.forEach(p => {
    if (!p.finalKy && !p.note) { if (p.ex) deleteIdx.push(p.ex.idx); return; }
    const row = [p.it.Ngay, p.w.Doi, p.w.Nhom, p.it.MaCN, p.finalKy, nowStr, s.u, p.note];
    if (p.ex) { fmtTextCol_(sh, p.ex.idx + 2, 4, 1); sh.getRange(p.ex.idx + 2, 1, 1, MARK_HEADERS.length).setValues([row]); }
    else appends.push(row);
  });
  if (appends.length) {
    const startRow = sh.getLastRow() + 1;
    fmtTextCol_(sh, startRow, 4, appends.length); // ép text cột mã CN cho cả khối ghi mới
    sh.getRange(startRow, 1, appends.length, MARK_HEADERS.length).setValues(appends);
  }
  deleteIdx.sort((a, b) => b - a).forEach(i => sh.deleteRow(i + 2));
  // Chấm NV + tài khoản có quyền Sửa -> cho nghỉ hẳn luôn (ẩn khỏi danh sách), giống chấm từng ô trước đây
  const deactivated = [];
  if (s.sua) {
    const rsh = getOrCreateSheet_(TAB_ROSTER, ROSTER_HEADERS);
    prepared.forEach(p => {
      if (p.finalKy === 'NV' && num_(p.w.DangLam) !== 0) { rsh.getRange(widx[p.it.MaCN] + 2, 8).setValue(0); deactivated.push(p.it.MaCN); }
    });
  }
  ghiLog_('CHAM_LOAT', 'Chấm CN', 'Lưu ' + prepared.length + ' thay đổi' + (deactivated.length ? ' · cho nghỉ hẳn ' + deactivated.length + ' CN' : ''), s.u);
  return { ok: true, count: prepared.length, deactivated };
}

function setDayMarks(req) { // data = {Ngay, Doi, Nhom, mode:'fillX'|'clear'}
  const s = auth_(req);
  const d = (req && req.data) || {};
  checkDay_(d.Ngay);
  scopeCheck_(s, d.Doi);
  const sh = getOrCreateSheet_(TAB_MARK, MARK_HEADERS);
  const nowStr = Utilities.formatDate(new Date(), TZ, 'dd/MM/yyyy HH:mm:ss');
  let n = 0;
  if (d.mode === 'clear') {
    requirePerm_(s, 'sua', 'Xóa chấm công cả ngày');
    if (sh.getLastRow() > 1) {
      const vals = sh.getRange(2, 1, sh.getLastRow() - 1, MARK_HEADERS.length).getValues();
      for (let i = vals.length - 1; i >= 0; i--) {
        const ngay = (vals[i][0] instanceof Date) ? Utilities.formatDate(vals[i][0], TZ, 'yyyy-MM-dd') : String(vals[i][0] || '').slice(0, 10);
        if (ngay === d.Ngay && num_(vals[i][1]) === num_(d.Doi) && num_(vals[i][2]) === num_(d.Nhom)) { sh.deleteRow(i + 2); n++; }
      }
    }
    ghiLog_('XOA_CHAM_NGAY', 'Đội ' + d.Doi + ' – Nhóm ' + d.Nhom, 'Ngày ' + d.Ngay + ': xóa ' + n + ' ô chấm', s.u);
    return { ok: true, count: n };
  }
  // fillX: chấm X cho mọi công nhân đang làm CHƯA có ký hiệu ngày đó
  requirePerm_(s, 'them', 'Chấm công');
  const workers = roster_().filter(w => w.Doi === num_(d.Doi) && w.Nhom === num_(d.Nhom) && w.DangLam);
  const rows = [];
  workers.forEach(w => {
    if (markRowIndex_(sh, d.Ngay, w.MaCN) < 0) rows.push([d.Ngay, w.Doi, w.Nhom, w.MaCN, 'X', nowStr, s.u, '']);
  });
  if (rows.length) {
    const startRow = sh.getLastRow() + 1;
    fmtTextCol_(sh, startRow, 4, rows.length); // ép text cột mã CN cho cả khối ghi mới
    sh.getRange(startRow, 1, rows.length, MARK_HEADERS.length).setValues(rows);
  }
  ghiLog_('CHAM_X_NGAY', 'Đội ' + d.Doi + ' – Nhóm ' + d.Nhom, 'Ngày ' + d.Ngay + ': chấm X cho ' + rows.length + ' công nhân', s.u);
  return { ok: true, count: rows.length };
}

/* Nhập danh sách + dữ liệu chấm T9/2026 từ tab ChamCongThuong của khách (chạy 1 lần từ editor/menu).
 * Tab mẫu: dòng 12–61 = 50 công nhân Nhóm 1, Đội Srae Preah (= Đội 1); cột A STT, B Phần cạo,
 * C Họ tên, D tên Khmer, E→AI = ngày 1–31 chấm X/P/O/NV/L/B; tháng 9/2026 (dòng ký "Ngày 15 tháng 9 năm 2026"). */
function importDanhSachVaChamTuTabKhach() {
  const sh = ss_().getSheetByName('ChamCongThuong');
  if (!sh) throw new Error('Không thấy tab ChamCongThuong trong Sheet.');
  const maxRow = Math.min(sh.getLastRow(), 61);
  const vals = sh.getRange(1, 1, maxRow, 35).getValues();
  const rosterSh = getOrCreateSheet_(TAB_ROSTER, ROSTER_HEADERS);
  const markSh = getOrCreateSheet_(TAB_MARK, MARK_HEADERS);
  const existRoster = roster_();
  const existMarkKeys = {};
  if (markSh.getLastRow() > 1) {
    markSh.getRange(2, 1, markSh.getLastRow() - 1, MARK_HEADERS.length).getValues().forEach(r => {
      const ngay = (r[0] instanceof Date) ? Utilities.formatDate(r[0], TZ, 'yyyy-MM-dd') : String(r[0] || '').slice(0, 10);
      existMarkKeys[ngay + '|' + maCNStr_(r[3])] = true;
    });
  }
  let addedW = 0, addedM = 0;
  const markRows = [], rosterRows = [];
  for (let i = 11; i < vals.length; i++) { // dòng 12 trở đi (index 11)
    const stt = num_(vals[i][0]);
    const name = String(vals[i][2] || '').trim();
    if (!stt || !name) continue;
    const ma = '1-1-' + String(stt).padStart(3, '0'); // cột A của tab khách chứa 2001..1950 nên mã thật là 1-1-2001..1-1-1950
    if (!existRoster.find(w => w.MaCN === ma)) {
      rosterRows.push([ma, 1, 1, stt, String(vals[i][1] || '').trim(), name, String(vals[i][3] || '').trim(), 1]);
      existRoster.push({ MaCN: ma });
      addedW++;
    }
    for (let d = 1; d <= 31; d++) {
      const cell = String(vals[i][4 + (d - 1)] || '').trim().toUpperCase();
      if (!MARKS.includes(cell)) continue;
      const ngay = '2026-09-' + String(d).padStart(2, '0');
      if (existMarkKeys[ngay + '|' + ma]) continue;
      markRows.push([ngay, 1, 1, ma, cell, '', 'nhap-tu-tab-khach', '']);
      addedM++;
    }
  }
  if (rosterRows.length) {
    const startRow = rosterSh.getLastRow() + 1;
    fmtTextCol_(rosterSh, startRow, 1, rosterRows.length); // ép text cột mã CN cho cả khối ghi mới
    rosterSh.getRange(startRow, 1, rosterRows.length, ROSTER_HEADERS.length).setValues(rosterRows);
  }
  if (markRows.length) {
    const startRow = markSh.getLastRow() + 1;
    fmtTextCol_(markSh, startRow, 4, markRows.length); // ép text cột mã CN cho cả khối ghi mới
    markSh.getRange(startRow, 1, markRows.length, MARK_HEADERS.length).setValues(markRows);
  }
  ghiLog_('IMPORT_CN', 'ChamCongThuong', 'Thêm ' + addedW + ' công nhân, ' + addedM + ' ô chấm T9/2026 (Nhóm 1 Đội 1)');
  try { SpreadsheetApp.getUi().alert('✅ Đã nhập từ tab ChamCongThuong: thêm ' + addedW + ' công nhân, ' + addedM + ' ô chấm tháng 9/2026 cho Nhóm 1 – Đội 1.'); } catch (e) {}
  return { ok: true, addedWorkers: addedW, addedMarks: addedM };
}
