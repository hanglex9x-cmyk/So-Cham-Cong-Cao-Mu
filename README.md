# Web App Chấm Công Cạo Mủ — Dự án Chị Hằng – Hiệp

App chấm công cạo mủ hằng ngày cho 2 đội × 7 nhóm, chạy trên **Google Sheet + Apps Script** — miễn phí, không phí duy trì, dữ liệu nằm trong tài khoản Google của khách.

- **Sheet dữ liệu:** https://docs.google.com/spreadsheets/d/1en9AfN4JWIglTDwAWGv7v8PsqCMp_ZNb9rccpxDbScs
- **File trong gói này:** `Code.gs` (backend), `Index.html` (giao diện), `HuongDanSuDung.md`, `CanhBao.md`, `../THIET_KE.md` (thiết kế + cách tính đã kiểm chứng).

## Cấu trúc dữ liệu trong Sheet
| Tab | Vai trò |
|---|---|
| CHẤM CÔNG CẠO, Nhu cầu, Phiếu công cạo, SƠ ĐỒ BỘ MÁY | Tab gốc của khách — app KHÔNG ghi đè |
| DU_LIEU | App tự tạo: 1 dòng = 1 nhóm × 1 ngày (nguồn dữ liệu của app) |
| CAU_HINH | Tên đội, số nhóm, màu chủ đạo (Color Picker lưu vào đây) |
| PHAN_QUYEN | Email \| VaiTro (Admin / NhapLieu / Xem). Trống = chưa bật kiểm quyền |
| LICH_SU | Nhật ký mọi lần thêm/sửa/sao chép/cài đặt |

## Cách deploy (5–7 phút)
1. Mở Sheet → **Tiện ích mở rộng → Apps Script**.
2. Xóa code mẫu, dán toàn bộ `Code.gs` vào file `Code.gs`.
3. Tạo file HTML tên đúng **`Index`** (dấu + → HTML), dán toàn bộ `Index.html`.
4. Chạy hàm **`setupHeThong`** một lần (bấm ▶ Run, cấp quyền khi Google hỏi) — tạo các tab phụ + trigger backup 2h sáng.
5. (Muốn đưa dữ liệu T10/2026 cũ vào app) chạy **`importDuLieuTuBangRong('2026-10')`** một lần.
   Đối chiếu sau import: Đội 1 – Nhóm 1 tổng Công Thường = **687**, Công Đúp = **65** (khớp dòng TỔNG CỘNG trong tab gốc).
6. **Deploy → New deployment → Web app**: Execute as **Me**, Who has access **Anyone** → lấy link `/exec` để dùng.

## Tính năng chính
- Chấm công theo đội/nhóm/ngày; dòng cộng tự động cho mục 1 (Cạo), mục 2 (Trang bị), mục 3 (Thuê).
- Nút **Sao chép hôm qua** (từng nhóm + toàn ngày), không ghi đè nhóm đã nhập.
- Tự tính: Đi làm, Có mặt, Thiếu, Tuyển mới, Nghỉ việc (so với hôm qua), số phần thiếu từ danh sách.
- Loại ngày: Thường / Mưa / Lễ.
- Báo cáo ngày xuất đúng mẫu 6 mục đội đang gửi Zalo — bấm copy là gửi.
- Thống kê kỳ 1–15 / 16–cuối / cả tháng: số ngày + số công cho Thường, Đúp, Choàng, Trang bị, Thuê, Mưa, Lễ; Tổng công phải cạo và Công không được.
- Mở `Index.html` trực tiếp trên máy (không qua Apps Script) sẽ chạy **bản nháp với dữ liệu mẫu** để xem giao diện.
