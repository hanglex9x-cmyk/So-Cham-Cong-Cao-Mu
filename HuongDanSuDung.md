# Hướng Dẫn Sử Dụng — App Chấm Công Cạo Mủ

## 1. Chấm công mỗi ngày (người nhập liệu)
1. Mở link app → tab **📝 Chấm công**.
2. Chọn **Ngày** → chọn **Đội** → chọn **Nhóm**.
3. Nếu hôm nay mưa hoặc lễ/tết: chọn **🌧 Mưa** hoặc **🎉 Lễ** ở mục Loại ngày.
4. Nhập **Định biên** của ngày hôm nay (định biên thay đổi từng ngày nên nhập tay), **Mã phần** (VD A2) và **Tổng phần phiên** (VD 38) nếu có.
5. Nhập công theo 3 mục — app tự cộng từng mục ở góc phải:
   - **Mục 1 Cạo:** Thường / Đúp / Choàng (Phiên + Công).
   - **Mục 2 Trang bị:** 7 khoản (Thiết kế, Kiềng chén, Máng chắn mưa, Che chén, Váy che chén, Cạo xả, Khác).
   - **Mục 3 Thuê:** Cạo, Bóc mủ.
6. Mục **Lao động:** Phần đứng lô, Số vắng, Danh sách phần vắng + Lý do, Danh sách phần thiếu (gõ cách nhau dấu phẩy, VD `4, 10, 14`), Cạo không hết cây (VD `phần 9, 17 cạo 70%`).
   → Ô xám dưới cùng tự hiện: Đi làm, Có mặt, Thiếu, Tuyển mới, Nghỉ việc. **Không cần tính tay.**
7. Bấm **💾 Lưu chấm công**. Lần lượt làm hết các nhóm.

### Mẹo nhập nhanh
- Nhóm nào số liệu giống hôm qua: bấm **⧉ Chép hôm qua (nhóm này)** → kiểm tra lại → Lưu.
- Cả ngày giống hôm qua: ra tab **🏠 Tổng quan** → **Sao chép hôm qua** (chép tất cả nhóm, nhóm đã nhập không bị ghi đè).

## 2. Gửi báo cáo ngày lên Zalo
Tab **💬 Báo cáo** → chọn ngày → app tự soạn báo cáo đúng mẫu 6 mục của đội → bấm **Sao chép để gửi Zalo** → dán vào nhóm Zalo.

## 3. Xem thống kê tháng
Tab **📊 Thống kê** → chọn tháng → chọn kỳ **15 ngày đầu / 15 ngày cuối / Cả tháng**:
- Bảng **Số công**: Phải cạo, Thường, Đúp, Choàng, Trang bị, Thuê, Không được, Tuyển mới, Nghỉ việc — từng nhóm, từng đội và toàn công ty.
- Bảng **Số ngày**: số ngày phát sinh của từng hạng mục, gồm ngày Mưa và ngày Lễ.

## 4. Cài đặt (Admin)
Tab **⚙️ Cài đặt**: đổi tên ứng dụng, tên 2 đội, số nhóm mỗi đội, **màu chủ đạo** (bấm ô màu hoặc chọn màu có sẵn) → Lưu. Màu được lưu vào Sheet nên máy nào mở cũng thấy giống nhau.

## 5. Việc của Admin trong Sheet
- **Cấp quyền:** mở tab PHAN_QUYEN, nhập Email + VaiTro (Admin = mọi quyền, NhapLieu = nhập/sửa, Xem = chỉ xem). Để trống = ai có link cũng nhập được.
- **Xem ai đã sửa gì:** tab LICH_SU.
- **Sửa số liệu gấp:** sửa trực tiếp ở tab DU_LIEU (giữ nguyên tên cột dòng 1), app sẽ đọc lại số mới.
- **Đổi logo/tên hiển thị:** hiện app dùng biểu tượng 🌴 và tên ở Cài đặt; muốn logo riêng thì thay emoji trong mục Cài đặt → Tên ứng dụng.

## 6. In / xuất báo cáo
Cần bản in: mở Sheet → tab DU_LIEU → lọc theo tháng → in, hoặc copy bảng Thống kê trong app dán vào Word/Excel.

## 8. Cập nhật 26/10/2026 (đợt 2) — 2 phiên bản + phân quyền + chấm công theo đội
- **2 phiên bản dùng chung 1 dữ liệu:** bản **PC** mở link app bình thường trên máy tính; bản **Mobile** mở link app thêm `?view=mobile` ở cuối (trong app có sẵn nút chuyển qua lại ở đầu trang). Nhập ở bản nào cũng vào cùng 1 Sheet.
- **Đăng nhập bằng tài khoản trong app:** mở app → chọn tài khoản → nhập mật khẩu. Tài khoản mặc định lúc mới bật: **admin** (toàn quyền), **doi1**, **doi2** — mật khẩu mặc định do người bàn giao cung cấp, Admin nên đổi ngay trong Phân quyền.
- **Phân quyền (Admin):** vào **Cài đặt → Phân quyền**: bảng tích quyền **Xem / Thêm / Sửa / Xóa / Quản trị / Toàn bộ** cho từng tài khoản, ghim tài khoản vào **1 đội** hoặc **cả 2 đội**, thêm/xóa tài khoản, đổi mật khẩu — bấm **Lưu phân quyền** là áp dụng ngay.
  - Đội 1 / Đội 2 (mặc định): chỉ **Xem + Thêm** và bị ghim vào đội của mình → chỉ thấy dữ liệu đội mình, chỉ nhập phiếu mới **1 lần**, phiếu đã nhập bị khóa không sửa được, không có nút Xóa, không vào được Cài đặt.
  - Muốn cho đội trưởng sửa được phiếu của đội mình: tích thêm ô **Sửa** cho tài khoản đó.
- **Xóa phiếu:** chỉ tài khoản có quyền **Xóa** mới thấy nút "🗑 Xóa phiếu này" trong phiếu (mặc định chỉ Admin). Xóa xong vẫn tra lại được ở tab LICH_SU.
- **Chấm công theo đội (check theo ngày):** tab **Chấm công đội** → chọn Đội + Tháng để xem lưới Nhóm × Ngày cả tháng (ô = công thường, màu theo loại ngày), cuối trang có mục **Kiểm tra theo ngày**: chọn 1 ngày để thấy ngay đội nào/nhóm nào đã nhập, nhóm nào chưa. Bấm vào 1 ô trong lưới là nhảy sang phiếu nhập của nhóm/ngày đó.

## 7. Cập nhật 26/10/2026 — bản PC + phản hồi khách
- **Giao diện PC dạng phiếu** (tab Nhập công): dải chọn ngày 1–31, thẻ chọn nhóm bên trái, phiếu 6 mục bên phải, bảng Tổng hợp ngày ở dưới.
- **Mục 1 Cạo:** cột nhập phiên tên là **Phiên / Lát cạo**. Gợi ý nhập: **Thường = công nhân đứng lô**, **Đúp = cạo thêm phiên**, **Choàng = nhận thêm phần**.
- **Mục 2 Trang bị — 8 khoản:** Thiết kế · Kiềng, chén, máng dẫn mủ · Máng chắn mưa · **Mái che mưa** · **Túp che chén** · Váy che chén · Cạo xả · Khác.
- **Mục 5 Lao động:** đã **bỏ ô Phần đứng lô** — Công thường chính là số công nhân đứng lô. Hai ô **Tuyển mới / Nghỉ việc**: nhập theo báo cáo chấm công của đội; **để trống thì app tự tính** theo chênh Có mặt với phiếu trước.
- **Nhập / Xuất Excel** (ở màn Nhập công): **Xuất Excel tháng này** để tải dữ liệu tháng đang chọn về máy; **Tải file mẫu Excel** lấy mẫu cột chuẩn; **Nhập từ Excel** để nạp file đã điền — dòng nào trùng Ngày + Đội + Nhóm thì cập nhật, chưa có thì thêm mới.
- **Chế độ Chỉ nhập (khóa sửa):** vào **Cài đặt** → tích **"Chỉ nhập — khóa sửa phiếu đã lưu"** → Lưu cài đặt. Từ đó phiếu đã nhập sẽ bị khóa, mở ra chỉ xem, không sửa được; quản trị vào Cài đặt bỏ tích mới sửa được. App **không có nút xóa** phiếu. Khi chia sẻ link cho các nhóm, bật chế độ này lên.


---

## Cập nhật 26/10/2026 (đợt 3) — Chấm công từng công nhân

- **Màn "Chấm CN"** (cả bản PC lẫn Mobile): chọn Đội → Nhóm → Tháng để mở bảng chấm từng công nhân, giống mẫu 2 tab **ChamCongThuong / ChamCongDup** trong Sheet của khách.
- **Cách chấm:** bấm vào 1 ô, ký hiệu đổi vòng tròn: trống → **X** (đi làm) → **P** (nghỉ phép) → **O** (ốm) → **NV** (nghỉ việc) → **L** (lễ) → **B** (mưa bão) → trống. Mỗi lần bấm là lưu ngay lên Sheet (tab **CHAM_CONG_CN**).
- **Chấm nhanh cả ngày:** bấm số ngày ở hàng trên cùng để chọn ngày, rồi bấm **"Chấm X tất cả (ô trống)"** — mọi công nhân chưa chấm sẽ được X, sau đó chỉ sửa lại vài người vắng. Nút **"Xóa chấm ngày"** xóa toàn bộ chấm của ngày đã chọn (cần quyền Sửa).
- **Vắng và Nghỉ việc tự đếm từ bảng chấm này** (theo đúng yêu cầu của khách: "dựa vào cái chấm công của dưới đội"): trong 1 ngày của 1 nhóm, **Vắng = số công nhân chấm P + O + L + B**, **Nghỉ việc = số công nhân chấm NV**. Hai số này tự chảy vào phiếu chấm công và mọi báo cáo, ghi đè cách tự tính cũ. Ngày nào nhóm chưa chấm công nhân thì app vẫn dùng cách cũ (ô nhập tay trên phiếu, trống thì tự tính theo chênh Có mặt).
- **Danh sách công nhân** lưu ở tab **DANH_SACH_CN**. Danh sách **Nhóm 1 – Đội 1 (50 người) đã được nhập sẵn** từ tab ChamCongThuong của khách, kèm luôn dữ liệu chấm **tháng 9/2026** của nhóm này.
- **Thêm công nhân mới** (khi có tuyển mới): ngay trong màn Chấm CN, điền Họ tên + Phần cạo (+ tên Khmer nếu có) → bấm Thêm (cần quyền Thêm; tài khoản đội có sẵn quyền này).
- **Công nhân nghỉ hẳn:** bấm nút **"Nghỉ hẳn"** cạnh tên (cần quyền Sửa) — người đó ẩn khỏi bảng chấm từ nay, nhưng toàn bộ số chấm cũ vẫn giữ nguyên để báo cáo các tháng trước không đổi.
- **Phân quyền trên bảng chấm:** tài khoản đội chỉ chấm được đội của mình. Ô **chưa có** ký hiệu thì quyền Thêm là chấm được; ô **đã có** ký hiệu muốn đổi phải có quyền Sửa — tức là đội chấm 1 lần, chấm sai thì báo admin sửa, giống quy tắc của phiếu.

## Cập nhật 26/10/2026 (đợt 4) — Chấm CN theo từng ngày + ghi chú nghỉ

- Màn **Chấm CN** có 2 kiểu xem: **Theo ngày** (mặc định khi mở) và **Theo tháng** (lưới như đợt 3), chuyển qua lại bằng 2 nút trên đầu bảng. Chọn ngày ở ô **Ngày chấm** — chọn ngày thuộc tháng khác, app tự nhảy đúng tháng.
- **Xem Theo ngày:** mỗi công nhân 1 dòng với 4 nút trạng thái: **Đi làm** (X), **Vắng** (V), **Nghỉ** (P — nghỉ phép / có lý do), **Nghỉ hẳn** (NV). Bấm để chấm, bấm lại nút đang chọn để bỏ chấm. Đầu bảng có tổng của ngày: đi làm / vắng / nghỉ hẳn / chưa chấm. Vẫn có nút "Chấm đi làm tất cả (ô trống)" và "Xóa chấm ngày này" như trước.
- **Ghi chú nghỉ:** khi công nhân được chấm Vắng / Nghỉ / Nghỉ hẳn (hoặc đã có ghi chú từ trước) thì ô **"Ghi chú nghỉ…"** mở ra để gõ lý do (ốm, việc nhà, về quê…); gõ xong bấm ra ngoài là tự lưu. Ghi chú lưu ở cột **GhiChu** của tab CHAM_CONG_CN. Trong xem Theo tháng, ô có ghi chú có **vạch vàng ở chân ô** — rê chuột vào ô để đọc (bản điện thoại: chuyển sang xem Theo ngày để đọc).
- **Nghỉ hẳn trong xem Theo ngày:** bấm nút **Nghỉ hẳn** sẽ chấm NV cho ngày đó; nếu tài khoản đang đăng nhập có quyền **Sửa** thì app đồng thời cho công nhân nghỉ hẳn (ẩn khỏi danh sách từ các ngày sau). Tài khoản đội (chỉ có quyền Thêm) chấm được NV, nhưng bước ẩn khỏi danh sách phải nhờ tài khoản có quyền Sửa hoặc admin.
- **Ký hiệu V (Vắng)** là ký hiệu mới của đợt 4: đếm vào **Vắng** giống P/O/L/B, tức từ nay **Vắng = V + P + O + L + B**. Trong xem Theo tháng, bấm ô sẽ vòng qua V ngay sau X: trống → X → V → P → O → NV → L → B → trống.
