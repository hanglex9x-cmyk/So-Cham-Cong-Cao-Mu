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

## Phân quyền tài khoản trong app (26/10/2026 đợt 2)
- App deploy "Execute as Me" nên Google KHÔNG phân biệt được người dùng thật — hệ thống tài khoản/mật khẩu nằm trong tab **PHAN_QUYEN** là lớp khóa của riêng app: quyền được **chặn ở server** (API đọc tự lọc theo đội của tài khoản; lưu phiếu kiểm tra quyền Thêm/Sửa; Xóa và Nhập Excel và Cài đặt cần đúng quyền). Đây là mức khóa vận hành nội bộ, không thay thế bảo mật tài khoản Google của chủ Sheet.
- **Tài khoản bị ghim đội chỉ thấy dữ liệu đội mình** ở mọi màn hình (nhập công, báo cáo ngày, tổng quan, lưới đội) vì server lọc từ đầu — không phải chỉ ẩn giao diện.
- **Nguy cơ tự khóa:** nếu sửa Phân quyền mà không còn tài khoản nào có quyền Quản trị, server sẽ từ chối lưu. Nếu lỡ tay sửa trực tiếp trong Sheet làm mất hết quyền Quản trị, mở tab PHAN_QUYEN trong Sheet và sửa lại bằng tài khoản chủ Sheet (luôn sửa được Sheet).
- **Xóa trắng tab PHAN_QUYEN** = tắt hệ thống đăng nhập (chế độ mở, ai có link cũng toàn quyền) — chỉ làm khi thật sự muốn tắt phân quyền.
- Mật khẩu lưu dạng thường trong Sheet (chỉ chủ Sheet và Admin xem được tab đó) — dùng mật khẩu riêng cho app, đừng trùng mật khẩu quan trọng khác.

## Cập nhật nghiệp vụ 26/10/2026
- **Đi làm = Công thường** luôn (đã bỏ hẳn ô Phần đứng lô theo yêu cầu khách). Cột `PhanDungLo` cũ trong DU_LIEU vẫn giữ để tương thích dữ liệu cũ, app không còn dùng để tính.
- **Tuyển mới / Nghỉ việc:** ưu tiên số **nhập tay** theo báo cáo của đội (2 cột mới `TuyenMoiNhap`, `NghiViecNhap` ở cuối DU_LIEU); để trống mới tự tính theo chênh Có mặt. Dữ liệu cũ không nhập tay nên số liệu các tháng đã chốt không thay đổi.
- **Thêm cột `TB_MaiCheMua`** (Mái che mưa) và 2 cột nhập tay ở **cuối** bảng DU_LIEU — tuyệt đối không chèn cột vào giữa bảng, sẽ lệch dữ liệu cũ.
- **Nhập Excel** cập nhật theo khóa Ngày + Đội + Nhóm: kiểm tra kỹ file trước khi nhập vì dòng trùng sẽ bị ghi đè. Cần khôi phục thì dùng các bản **BACKUP** tự động lúc 2h sáng trong Drive.
- **Chế độ Chỉ nhập** là khóa ở giao diện app, không phải khóa bảo mật tuyệt đối: người biết đường vào Cài đặt vẫn tắt được. Muốn chặt hơn: bật Chỉ nhập + khai PHAN_QUYEN + file Sheet chỉ chia sẻ quyền **Xem** cho các đội (nhập liệu đi qua app, app ghi bằng tài khoản chủ nên vẫn ghi được).

## Khi nào nên nâng cấp
- Cần quản lý **từng công nhân theo tên** (hồ sơ, lương từng người) thay vì theo nhóm → cần thêm module nhân sự, cân nhắc Supabase.
- Cần app chạy **offline** ở lô không có mạng → cần app cài đặt riêng (PWA/native), kiểu Sheet không đáp ứng.
- Trên 50 người nhập đồng thời mỗi ngày hoặc trên 100.000 dòng dữ liệu.


---

## Bổ sung 26/10/2026 (đợt 3) — Chấm công từng công nhân

- Ngày nào nhóm **đã chấm công từng công nhân** thì **Vắng** và **Nghỉ việc** của ngày đó tính từ bảng chấm CN (Vắng = P+O+L+B, Nghỉ việc = NV), **không** còn tính theo chênh Có mặt và **ghi đè cả ô nhập tay** trên phiếu. Muốn số liệu đúng thì chấm CN phải đủ người: công nhân có mặt mà quên chấm X sẽ bị tính là chưa chấm (không vào Vắng, nhưng Có mặt trên phiếu = Đi làm + Vắng sẽ thấp hơn thực tế).
- Ký hiệu **NV (nghỉ việc)** chỉ nên chấm vào **ngày người đó nghỉ việc**; các ngày sau đó dùng nút **"Nghỉ hẳn"** để ẩn khỏi bảng, tránh mỗi ngày lại đếm thêm 1 người nghỉ việc.
- Danh sách CN + bảng chấm lưu ở 2 tab **DANH_SACH_CN** và **CHAM_CONG_CN** trong Sheet — đừng đổi tên 2 tab này và đừng chèn cột vào giữa bảng; thêm công nhân hãy làm trong app hoặc thêm dòng ở cuối bảng.
- Bản chấm CN hiện có là **chấm công** (đi làm/vắng) phục vụ đếm Vắng/Nghỉ việc; chưa phải hồ sơ nhân sự hay tính lương từng người — nhu cầu đó vẫn thuộc mục "Khi nào nên nâng cấp" ở trên.

## Bổ sung 26/10/2026 (đợt 4) — Chấm theo ngày, ký hiệu V, ghi chú nghỉ

- Từ đợt 4, **Vắng = V + P + O + L + B** (thêm ký hiệu **V = vắng mặt** so với đợt 3 nói Vắng = P+O+L+B). Dữ liệu chấm cũ không bị ảnh hưởng; công thức đếm Nghỉ việc (= số NV) không đổi.
- **Ghi chú nghỉ** (cột GhiChu của tab CHAM_CONG_CN, tối đa 200 ký tự) chỉ là chữ ghi kèm, không tham gia tính toán. Đổi ký hiệu ở lưới tháng **không** làm mất ghi chú; ghi chú chỉ mất khi xóa cả ô chấm của ngày đó hoặc xóa trắng ô ghi chú trong xem Theo ngày.
- Nút **Nghỉ hẳn** ở xem Theo ngày gồm 2 việc: chấm **NV** cho ngày đó + ẩn công nhân khỏi danh sách. Việc thứ hai cần quyền **Sửa** — nếu người chấm không có quyền Sửa, NV vẫn được chấm và đếm vào Nghỉ việc của ngày đó, nhưng công nhân vẫn hiện ở các ngày sau cho tới khi admin / người có quyền Sửa cho nghỉ hẳn.
