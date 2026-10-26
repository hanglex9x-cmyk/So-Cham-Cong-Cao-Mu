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
- **Vắng và Nghỉ việc tự đếm từ bảng chấm này** (theo đúng yêu cầu của khách: "dựa vào cái chấm công của dưới đội"): trong 1 ngày của 1 nhóm, **Vắng = số công nhân chấm P + O + V** (nghỉ phép + ốm + vắng; chấm Lễ L và Mưa bão B KHÔNG tính vào Vắng), **Nghỉ việc = số công nhân chấm NV**. Hai số này tự chảy vào phiếu chấm công và mọi báo cáo, ghi đè cách tự tính cũ. Ngày nào nhóm chưa chấm công nhân thì app vẫn dùng cách cũ (ô nhập tay trên phiếu, trống thì tự tính theo chênh Có mặt).
- **Danh sách công nhân** lưu ở tab **DANH_SACH_CN**. Danh sách **Nhóm 1 – Đội 1 (50 người) đã được nhập sẵn** từ tab ChamCongThuong của khách, kèm luôn dữ liệu chấm **tháng 9/2026** của nhóm này.
- **Thêm công nhân mới** (khi có tuyển mới): ngay trong màn Chấm CN, điền Họ tên + Phần cạo (+ tên Khmer nếu có) → bấm Thêm (cần quyền Thêm; tài khoản đội có sẵn quyền này).
- **Công nhân nghỉ hẳn:** bấm nút **"Nghỉ hẳn"** cạnh tên (cần quyền Sửa) — người đó ẩn khỏi bảng chấm từ nay, nhưng toàn bộ số chấm cũ vẫn giữ nguyên để báo cáo các tháng trước không đổi.
- **Phân quyền trên bảng chấm:** tài khoản đội chỉ chấm được đội của mình. Ô **chưa có** ký hiệu thì quyền Thêm là chấm được; ô **đã có** ký hiệu muốn đổi phải có quyền Sửa — tức là đội chấm 1 lần, chấm sai thì báo admin sửa, giống quy tắc của phiếu.

## Cập nhật 26/10/2026 (đợt 4) — Chấm CN theo từng ngày + ghi chú nghỉ

- Màn **Chấm CN** có 2 kiểu xem: **Theo ngày** (mặc định khi mở) và **Theo tháng** (lưới như đợt 3), chuyển qua lại bằng 2 nút trên đầu bảng. Chọn ngày ở ô **Ngày chấm** — chọn ngày thuộc tháng khác, app tự nhảy đúng tháng.
- **Xem Theo ngày:** mỗi công nhân 1 dòng với 5 nút ký tự màu theo ký hiệu: **X** (đi làm, xanh lá), **P** (nghỉ phép, vàng), **O** (ốm, cam), **V** (vắng, xám), **NV** (nghỉ hẳn, đỏ) — nút đang chọn tô đậm màu đặc, di chuột/chạm giữ hiện nghĩa đầy đủ. Bấm để chấm, bấm lại nút đang chọn để bỏ chấm. Đầu bảng có tổng của ngày: đi làm / vắng / nghỉ hẳn / chưa chấm. Vẫn có nút "Chấm đi làm tất cả (ô trống)" và "Xóa chấm ngày này" như trước. Thêm 2 nút chấm nhanh cả nhóm cho ngày đang chọn: **"Cả đội nghỉ mưa"** (chấm B — mưa bão cho mọi công nhân đang làm của nhóm) và **"Cả đội nghỉ Lễ/tết"** (chấm L cho mọi công nhân đang làm của nhóm); hai nút này GHI ĐÈ các chấm hiện có của ngày đó (app hỏi xác nhận trước) và cũng phải bấm **💾 Lưu chấm công** mới ghi vào Sheet.
- **Ghi chú nghỉ:** khi công nhân được chấm Vắng / Nghỉ / Nghỉ hẳn (hoặc đã có ghi chú từ trước) thì ô **"Ghi chú nghỉ…"** mở ra để gõ lý do (ốm, việc nhà, về quê…); gõ xong bấm ra ngoài là tự lưu. Ghi chú lưu ở cột **GhiChu** của tab CHAM_CONG_CN. Trong xem Theo tháng, ô có ghi chú có **vạch vàng ở chân ô** — rê chuột vào ô để đọc (bản điện thoại: chuyển sang xem Theo ngày để đọc).
- **Nghỉ hẳn trong xem Theo ngày:** bấm nút **Nghỉ hẳn** sẽ chấm NV cho ngày đó; nếu tài khoản đang đăng nhập có quyền **Sửa** thì app đồng thời cho công nhân nghỉ hẳn (ẩn khỏi danh sách từ các ngày sau). Tài khoản đội (chỉ có quyền Thêm) chấm được NV, nhưng bước ẩn khỏi danh sách phải nhờ tài khoản có quyền Sửa hoặc admin.
- **Ký hiệu V (Vắng)** là ký hiệu mới của đợt 4: đếm vào **Vắng** giống P/O/L/B, tức từ nay **Vắng = V + P + O + L + B**. Trong xem Theo tháng, bấm ô sẽ vòng qua V ngay sau X: trống → X → V → P → O → NV → L → B → trống.

## Cập nhật 26/10/2026 (đợt 5) — Mẫu tin Zalo mới + ô nghỉ việc / tuyển mới

- **Tin "Gửi Zalo" đổi theo mẫu nhóm đã thống nhất trên Zalo ngày 26/10/2026:** tiêu đề "CAO MỦ NGÀY: ... NHÓM x - ĐỘI y", mục **I. Tình hình cạo mủ** (Thường / Choàng / Đúp + dòng tổng), mục **II. Biến động công nhân** (Vắng + lý do / Nghỉ việc + lý do / Tuyển mới / Thiếu nhân công), dòng cuối "Tổng công nhân có mặt : X/Y người, đạt ...%". Áp dụng cho nút Zalo nhóm, Zalo cả đội và màn Báo cáo ngày — cả bản PC lẫn Mobile.
- **Tổng công cạo trong ngày theo mẫu = Thường + Choàng** (không cộng Đúp) — khác với số "Cạo được" ở Báo cáo tổng quan (vẫn = Thường + Đúp + Choàng như cũ, không đổi).
- **Số phần trong tin viết 2 chữ số** (08, 05...); tỷ lệ có mặt = Có mặt ÷ Định biên, lấy 2 số thập phân (ví dụ 46,00%).
- **Mục 6 Ghi chú trên phiếu có thêm 3 ô:** *Danh sách phần nghỉ việc*, *Lý do nghỉ việc*, *Danh sách phần tuyển mới* — điền vào thì tin Zalo hiện "(ghi nhận phần ...)" và dòng "Lý do:" cho mục nghỉ việc giống mẫu; để trống thì tin tự rút gọn, không hiện dấu ngoặc rỗng.
- Ngày mưa / lễ vẫn có dòng 🌧 NGÀY MƯA / 🎉 NGÀY LỄ ngay dưới tiêu đề tin. Tin Zalo không còn dòng Trang bị / Thuê như mẫu 6 mục cũ (số liệu vẫn có đầy đủ trong app và các báo cáo).
- **Chấm CN map thẳng sang phiếu Nhập công, không ghi tay lại:** ngày nào nhóm đã chấm công từng công nhân thì mục 5 của phiếu tự lấy — **Đi làm = số công nhân chấm X**, **Vắng = số chấm P/O/V**, **Có mặt = số chấm X** (không cộng thêm Vắng), **Thiếu = Định biên − Có mặt**, **Nghỉ việc = số chấm NV**; **Tuyển mới = số người được THÊM ở màn Chấm CN đúng ngày đó** (app tự ghi ngày thêm khi bấm Thêm công nhân). Trong ngày đó, 2 ô **Vắng** và **Nghỉ việc** trên phiếu bị khóa (muốn sửa thì sửa ở màn Chấm CN, phiếu tự cập nhật theo). Tuyển mới: ô nhập tay trên phiếu vẫn được ưu tiên nếu có điền. Ngày nào nhóm chưa chấm CN thì phiếu nhập tay bình thường như trước.
- **Chấm CN chọn xong bấm nút 💾 Lưu chấm công mới ghi:** ở màn Chấm CN, bấm chọn trạng thái / gõ ghi chú / bấm "Chấm đi làm tất cả" / "Xóa chấm ngày này" đều mới chỉ là CHỌN TRƯỚC — nút **💾 Lưu chấm công** (có đếm số thay đổi chưa lưu) sáng lên, bấm vào mới ghi tất cả vào Sheet một lần. Chưa bấm Lưu thì đổi ý cứ bấm lại để sửa, số "thay đổi chưa lưu" tự giảm khi chọn lại đúng như cũ. Chọn **Nghỉ hẳn (NV)** rồi Lưu: tài khoản có quyền Sửa thì app cũng cho công nhân đó nghỉ hẳn luôn như trước.
- **Thứ tự ký hiệu khi bấm ô trong lưới Theo tháng:** trống → **X → P → O → B → L → NV** → trống (đúng thứ tự bảng của đội; riêng nút **Vắng (V)** chỉ có ở kiểu xem Theo ngày).
- **Chú thích ký hiệu song ngữ Khmer – Việt** hiện ngay dưới phần chọn ngày ở kiểu xem Theo ngày: X ថ្ងៃធ្វើការ Ngày công làm việc · P ឈប់សម្រាក Nghỉ phép · O ឈឺស្កាត់ Ốm đau · B ខ្យល់កន្រ្តាក់ Mưa bão · L បុណ្យ Lễ, tết · NV ឈប់ពីការងារ Nghỉ việc · V អវត្តមាន Vắng.
- **Bảng "Tổng hợp chấm công theo tháng"** (ngay dưới bảng chấm, theo đúng Đội/Nhóm/Tháng đang chọn): mỗi công nhân 1 dòng — Đi làm (X), Vắng (V), Nghỉ phép (P), Ốm (O), Lễ (L), Mưa bão (B), Nghỉ việc (NV), Tổng vắng, Tổng ngày đã chấm — kèm dòng TỔNG CỘNG và nút **⬇ Xuất Excel bảng tổng hợp**. Bảng đã tính cả những thay đổi chưa bấm Lưu (có dòng ghi chú nhắc khi đang có thay đổi chờ lưu).
- Bảng chấm công **không còn hiện "· phần …"** cạnh tên công nhân nữa cho gọn (số phần vẫn còn trong danh sách công nhân và trong tin Zalo khi cần).

## Cập nhật 26/10/2026 (đợt 6) — Hàng rào chấm CN + sửa chuỗi Tuyển/Nghỉ

- **Chấm CN chỉ tự map sang phiếu khi chấm ĐỦ người:** ngày của nhóm phải có số công nhân được chấm đạt **ít nhất 80% số công nhân đang làm** của nhóm thì Đi làm / Vắng / Nghỉ việc mới lấy từ bảng chấm CN. Mới chấm dang dở (vài người) thì phiếu vẫn tính theo số nhập tay như bình thường, và phiếu hiện dòng thông báo "mới chấm X/Y công nhân — chưa đủ 80%". Chấm bổ sung đủ rồi mở lại phiếu là app tự map.
- **Ngày chưa nhập không còn sinh số Tuyển/Nghỉ giả:** trước đây, ngày chỉ mới có định biên (chưa nhập công) bị tính như "toàn bộ công nhân nghỉ việc". Từ đợt 6, ngày chưa có số liệu bị bỏ qua trong chuỗi tính: phiếu hôm nay đối chiếu với **phiếu gần nhất TRƯỚC đó có số liệu thật** (kể cả cách vài ngày). Đội quên nhập 1–2 ngày rồi nhập bù sẽ không làm báo cáo biến động nhân sự phình lên nữa.
- **Ô Vắng trên phiếu luôn là số đội nhập:** kể cả ngày đã map từ chấm CN (ô bị khóa), con số gốc đội nhập vẫn được giữ trong Sheet — app không ghi số đã tính đè lên số nhập nữa. Khi lưu phiếu, trường nào không gửi lên thì server giữ nguyên giá trị cũ, không xóa trắng (định biên và các số khác không còn bị mất khi lưu).
- **Mã công nhân được bảo vệ hai lớp:** mọi lần ghi mã CN (thêm công nhân, chấm công, lưu loạt) app đều ép định dạng chữ (text) trước khi ghi để Google Sheets không tự biến mã kiểu "1-1-2001" thành ngày tháng; khi đọc, nếu gặp ô đã lỡ thành ngày thì app tự dựng lại mã. Bảng chấm cũng tự khử dòng trùng (cùng 1 công nhân chấm 2 lần trong 1 ngày chỉ tính dòng sau cùng) và bỏ qua mã không có trong danh sách công nhân.
