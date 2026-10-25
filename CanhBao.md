# Cảnh Báo & Giới Hạn — Kiểu Google Sheet + Apps Script

## Giới hạn của kiểu này (đã thống nhất khi chọn kiểu 1)
- **Quy mô phù hợp:** dưới ~1.000 bản ghi hiển thị/lọc mỗi lần xem vẫn mượt; dữ liệu chấm công 14 nhóm × 365 ngày ≈ 5.100 dòng/năm — dùng tốt nhiều năm. Khi DU_LIEU vượt ~50.000 dòng, nên tách mỗi năm 1 Sheet hoặc nâng cấp Supabase.
- **Tốc độ:** mỗi lần mở app đọc dữ liệu ngày/tháng, thường 1–3 giây. Mạng yếu ở nông trường có thể chậm hơn — nhập xong 1 nhóm hãy bấm Lưu ngay, đừng để dồn.
- **Đồng thời:** nhiều người nhập cùng lúc được, nhưng 2 người sửa **cùng 1 nhóm trong cùng 1 ngày** thì bản lưu sau sẽ thắng. Nên phân công mỗi người phụ trách nhóm riêng.
- **Quyền truy cập:** deploy dạng Anyone có link là mở được app. Muốn khóa chặt phải khai PHAN_QUYEN và/hoặc đổi quyền deploy sang "Anyone within organization" (cần Google Workspace).
- **Apps Script có hạn mức của Google:** ~20.000 lần gọi/ngày với tài khoản Gmail thường — chấm công 14 nhóm/ngày dùng không tới 1% hạn mức.

## Những điểm nghiệp vụ cần nhớ
- ⚠️ **Yêu cầu 4 trong file Nhu cầu** ghi "Vắng = Có mặt hôm qua − Đi làm hôm nay" mâu thuẫn với yêu cầu 3, 5 và cách tính trong Sheet gốc. App giữ cách tính của Sheet gốc (Có mặt = Đi làm + Vắng trong ngày; Tuyển/Nghỉ = chênh Có mặt so với hôm qua) và hiển thị thêm chỉ số chênh lệch của yêu cầu 4 để đối chiếu. Nếu khách muốn đổi hẳn sang cách của yêu cầu 4, báo lại để sửa — chỉ sửa 1 chỗ trong hàm `derive_`.
- **Đi làm = Công cạo Thường** theo dữ kiện Sheet gốc (khớp 434/434 ô). Nếu nhóm có nhập "Phần đứng lô" thì app lấy số đứng lô làm Đi làm.
- **Tổng công phải cạo** tính bằng tổng định biên các ngày **đã nhập** trong kỳ. Ngày nào chưa nhập định biên thì kỳ đó thiếu tương ứng — xem cột "số ngày đã nhập" ngầm qua bảng nhóm để biết kỳ đã đủ ngày chưa.
- **Import dữ liệu cũ** chỉ đọc tab CHẤM CÔNG CẠO đúng bố cục hiện tại (khối 24 cột/nhóm, dòng 5 = ngày 01). Nếu khách đổi bố cục tab gốc, phải báo trước khi import tháng khác.
- **Không xóa/đổi tên** các tab DU_LIEU, CAU_HINH, PHAN_QUYEN, LICH_SU và không sửa dòng tiêu đề của chúng.

## Khi nào nên nâng cấp
- Cần quản lý **từng công nhân theo tên** (hồ sơ, lương từng người) thay vì theo nhóm → cần thêm module nhân sự, cân nhắc Supabase.
- Cần app chạy **offline** ở lô không có mạng → cần app cài đặt riêng (PWA/native), kiểu Sheet không đáp ứng.
- Trên 50 người nhập đồng thời mỗi ngày hoặc trên 100.000 dòng dữ liệu.
