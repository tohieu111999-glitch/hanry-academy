# Hướng dẫn quản trị Hanry Academy

Tài liệu dành cho chủ sở hữu và quản trị viên (admin). Đọc từ đầu đến cuối một lần trước khi đưa web lên mạng.

---

## 1. Web gồm những gì?

| Phần | Mô tả |
|---|---|
| Lộ trình học | 29 bài, chia theo HSK 1 → HSK 6. Mỗi bài có 5 phần: **Bài đọc** (hội thoại/bài văn) → **Từ vựng** → **Ngữ pháp** → **Câu hỏi bài đọc** (bài đọc tách riêng với câu hỏi) → **Luyện tập** kiểu Duolingo (tim, XP, nhiều dạng bài) |
| Chạm để tra | Chạm hoặc di chuột vào bất kỳ chữ nào (trong bài đọc, từ vựng, ngữ pháp, câu hỏi, bài tập) để xem pinyin/chú âm, âm Hán Việt, nghĩa, cách dùng, ví dụ, từ đồng nghĩa/trái nghĩa và nút **Thêm vào sổ tay** |
| Sổ tay | Lưu từ chưa nhớ, ôn bằng thẻ ghi nhớ theo phương pháp lặp lại ngắt quãng (SRS), xuất/nhập file CSV |
| Trò chơi | 8 trò: Thẻ ghi nhớ, Ghép cặp tốc độ, Thử thách 60 giây, Luyện nghe, Lật thẻ trí nhớ, Mưa chữ, Luyện viết chữ (từng nét), Đoán thanh điệu |
| Từ điển | Hơn 120.000 mục từ (CVDICT tiếng Việt + CC-CEDICT tiếng Anh). Tra bằng chữ Hán, pinyin (có hoặc không dấu), tiếng Việt hoặc tiếng Anh. Có thứ tự nét, từ ghép, câu ví dụ trong bài học |
| Ngôn ngữ | Giao diện: Tiếng Việt / English / 简体中文 / 繁體中文 / 日本語. Chữ: Giản thể hoặc Phồn thể. Phiên âm: Pinyin hoặc Zhuyin (chú âm) |
| Cộng đồng | Ai đăng nhập cũng soạn được bài và phải ghi rõ **tác giả** và **nguồn** (tự viết / sưu tầm / trích nguồn). Bài của giáo viên và admin hiện ở mục riêng |
| Lớp học | Giáo viên (đã có key) mở lớp và nhận **mã lớp 6 ký tự**. Học viên nhập mã để vào lớp. Bài đăng có 3 chế độ: Công khai / Trong lớp / Cá nhân |
| Sách bản quyền | Chỉ hiện với Gmail được admin cấp quyền |
| Quản trị | Cấp quyền xem sách theo Gmail, tạo key giáo viên, quản lý sách, đọc báo cáo/góp ý, gỡ bài vi phạm |
| Pháp lý | Điều khoản sử dụng, Chính sách bảo mật, Chính sách Bản quyền & Nội dung (có quy trình khiếu nại và gỡ bỏ), Chính sách Cookie |

---

## 2. Đưa web lên mạng miễn phí (GitHub Pages)

1. Vào repository trên GitHub → **Settings** → **Pages**.
2. Mục **Source** chọn `Deploy from a branch`, chọn nhánh chứa code (ví dụ `main`), thư mục `/ (root)` → **Save**.
3. Sau 1–2 phút web có địa chỉ dạng `https://<tên-tài-khoản>.github.io/hanry-academy/`.
4. (Tuỳ chọn) Gắn tên miền riêng, ví dụ `hanryacademy.com`, ở mục **Custom domain**.

> Web là trang tĩnh, không cần máy chủ riêng. Bộ từ điển (khoảng 10 MB mỗi file) được GitHub Pages nén lại, người dùng chỉ tải khoảng 4 MB ở lần đầu.

---

## 3. BẮT BUỘC trước khi đưa sách bản quyền lên: cấu hình Firebase

Nếu chưa cấu hình Firebase, web chạy ở **chế độ cục bộ**:
- Tài khoản chỉ lưu trên trình duyệt của từng người, không có đăng nhập Gmail thật;
- Lớp học và key giáo viên chỉ dùng được trên cùng một máy;
- Phân quyền **không bảo mật**: ai cũng có thể gõ một Gmail bất kỳ.

Vì vậy chế độ cục bộ chỉ dùng để thử. Để có **đăng nhập Gmail thật**, **lớp học dùng chung** và **khoá sách an toàn trên máy chủ**, làm các bước sau (gói miễn phí Spark là đủ):

1. Vào https://console.firebase.google.com → **Add project** → đặt tên `hanry-academy`.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable**. Chọn email hỗ trợ là `hanryacademy@gmail.com`.
3. Vẫn trong Authentication → **Settings → Authorized domains** → thêm tên miền web, ví dụ `<tên-tài-khoản>.github.io` hoặc tên miền riêng.
4. **Build → Firestore Database → Create database** → chọn vị trí `asia-southeast1` (Singapore) → chế độ **Production**.
5. Mở tab **Rules** → xoá hết nội dung cũ → dán toàn bộ nội dung file `firestore.rules` trong repo → **Publish**.
6. Tạo chỉ mục (index): mở trang **Cộng đồng** và **Lớp học** trên web. Nếu bảng Console (F12) báo lỗi kèm đường link "create index", bấm vào link đó rồi chọn **Create**.
7. **Project settings** (biểu tượng bánh răng) → **Your apps** → chọn biểu tượng Web `</>` → đăng ký app → sao chép các giá trị `apiKey`, `authDomain`, `projectId`, `appId`.
8. Mở file `js/config.js` và điền các giá trị vừa sao chép vào mục `firebase`:
   ```js
   firebase: {
     apiKey: 'AIza...',
     authDomain: 'hanry-academy.firebaseapp.com',
     projectId: 'hanry-academy',
     appId: '1:123:web:abc'
   }
   ```
   > `apiKey` của Firebase không phải mật khẩu, có thể để công khai. Lớp bảo vệ thật sự nằm ở `firestore.rules`.
9. Commit và push. Web sẽ tự chuyển sang đăng nhập Google thật.

### Đổi hoặc thêm email admin
Phải sửa **cả hai nơi** và sửa giống nhau:
- `js/config.js` → `adminEmails: ['hanryacademy@gmail.com', 'email-khac@gmail.com']`
- `firestore.rules` → dòng `email() in ['hanryacademy@gmail.com', 'email-khac@gmail.com']` → **Publish** lại rules.

---

## 4. Sách bản quyền: chỉ Gmail được cấp mới xem được

### Vì sao anh không thêm được file sách nặng?
GitHub chặn file trên 100 MB và không nên chứa sách bản quyền (repo công khai thì ai cũng tải được). **Không đưa file sách vào repo.**

### Cách làm đúng (an toàn hai lớp)
1. Tải file PDF sách lên **Google Drive** của `hanryacademy@gmail.com`. Drive cho phép tới 15 GB miễn phí.
2. Chuột phải vào file → **Chia sẻ** → mục *Quyền truy cập chung* chọn **Bị hạn chế** (Restricted).
3. Thêm từng Gmail học viên được phép xem, quyền **Người xem**. Vào **Cài đặt** (biểu tượng bánh răng trong hộp chia sẻ) → **bỏ tick** "Người xem và người nhận xét có thể thấy tuỳ chọn tải xuống, in và sao chép".
4. Sao chép đường link của file.
5. Trên web, vào **Quản trị → Quản lý sách** → nhập tên sách, tác giả/NXB, dán link Drive → **Lưu**.
6. Vào **Quản trị → Cấp quyền xem sách bản quyền** → thêm cùng các Gmail đó.

Kết quả:
- Lớp 1: chỉ Gmail có trong danh sách mới thấy mục sách trên web. Firestore rules kiểm tra việc này trên máy chủ.
- Lớp 2: dù ai đó có được link, Google Drive vẫn chặn những người không được chia sẻ.

Khi thu hồi quyền, phải xoá Gmail ở **cả web** và **Google Drive**.

> Lưu ý pháp lý: chỉ đưa lên những sách anh là chủ sở hữu hoặc đã được tác giả/NXB cho phép bằng văn bản. Hãy lưu lại giấy phép đó.

---

## 5. Key giáo viên

1. **Quản trị → Key giáo viên** → nhập ghi chú (ví dụ "Cô Lan – THPT A") → **Tạo key mới**. Key có dạng `HT-ABCD-EFGH`.
2. Bấm 📋 để sao chép, rồi gửi key riêng cho giáo viên.
3. Giáo viên đăng nhập → **Lớp học → Khu vực giáo viên** → nhập key → **Mở khoá**.
4. Mỗi key chỉ dùng được **một lần**. Trong danh sách key, admin xem được key nào đã dùng và ai đã dùng.

Sau khi mở khoá, giáo viên có thể: mở lớp (nhận mã lớp), đăng bài **Trong lớp**, đăng bài **Cá nhân** (chỉ mình xem) và đăng bài **Công khai** có huy hiệu Giáo viên.

---

## 6. Thêm hoặc sửa bài học chính thức (trong code)

Các bài nằm trong `js/data/hsk1.js` … `hsk6.js`. Mỗi bài có cấu trúc:

```js
HA.L({
  id: '1-9', lv: 1, emoji: '🎒', kind: 'd',            // kind: 'd' = hội thoại, 'p' = bài văn
  t: '中文标题|Tiêu đề tiếng Việt|English title',
  d: 'Mô tả ngắn|Short description',
  text: `
Tên người nói|中文句子。|Câu dịch tiếng Việt.|English translation.`,   // bài văn: để trống tên người nói
  v: `
từ|pīnyīn|loại từ|nghĩa Việt|English|âm Hán Việt|Câu ví dụ.|Dịch ví dụ.|đồng nghĩa1,đồng nghĩa2|trái nghĩa`,
  g: [['Tên ngữ pháp (VI)', 'Grammar name (EN)', 'Cấu trúc', 'Giải thích VI', 'Explanation EN',
       ['例句。', 'Dịch Việt', 'English']]],
  q: [['问题？', 'Câu hỏi dịch', '*đáp án đúng', 'sai', 'sai', 'sai'],   // trắc nghiệm, dấu * là đáp án đúng
      ['T', '判断句。', 'Câu nhận định']]                               // đúng/sai: 'T' = đúng, 'F' = sai
});
```
Loại từ: `n` danh từ, `v` động từ, `adj` tính từ, `adv` phó từ, `pron` đại từ, `num` số từ, `mw` lượng từ, `part` trợ từ, `prep` giới từ, `conj` liên từ, `phr` cụm từ, `int` thán từ, `tw` từ chỉ thời gian, `pn` danh từ riêng, `idiom` thành ngữ, `vo` động tân.

Pinyin của câu văn, chữ phồn thể, chú âm, bài tập và trò chơi đều được **tạo tự động**.

Cách nhanh hơn, không cần sửa code: đăng nhập bằng `hanryacademy@gmail.com` → **Cộng đồng → Soạn bài mới**. Bài của admin hiện ở mục "Bài đăng của giáo viên & admin".

---

## 7. Báo cáo, góp ý, gỡ nội dung

- Người dùng gửi qua trang **Góp ý & Báo cáo** hoặc bấm nút 🚩 trên từng bài đăng. Nội dung hiện ở **Quản trị → Báo cáo & góp ý**.
- Trong **Quản trị → Quản lý bài đăng**, bấm 🗑 để gỡ bài vi phạm.
- Khiếu nại bản quyền: xác nhận đã nhận trong 24 giờ, tạm ẩn bài vi phạm rõ ràng trong 24–72 giờ, cho người đăng 7 ngày để phản hồi (xem trang `#/legal/copyright`).
- Nên tạo bộ lọc Gmail cho thư có tiêu đề bắt đầu bằng `[Hanry Academy]`.

---

## 8. Về Điều khoản & Chính sách

Các văn bản pháp lý (`js/legal.js`) đã được soạn theo khung pháp luật Việt Nam: Bộ luật Dân sự 2015, Luật Sở hữu trí tuệ, Luật An ninh mạng 2018, Luật Bảo vệ dữ liệu cá nhân, Nghị định 13/2023/NĐ-CP, Nghị định 147/2024/NĐ-CP, Luật Bảo vệ quyền lợi người tiêu dùng 2023. Văn bản cũng có tham chiếu luật Đài Loan và GDPR.

**Khuyến nghị:** nhờ luật sư rà soát trước khi kinh doanh hoặc thu phí, nhất là nếu sau này web thu tiền, chạy quảng cáo hoặc có nhiều người dùng dưới 16 tuổi. Mỗi lần sửa văn bản pháp lý, cập nhật `legalUpdated` trong `js/config.js`.

---

## 9. Cập nhật từ điển (tuỳ chọn)

```bash
# tải CVDICT.u8, cedict.txt (giải nén từ cedict_1_0_ts_utf-8_mdbg.txt.gz) và Unihan_Readings.txt vào một thư mục
node tools/build-dict.mjs <thư-mục-nguồn> data
```

Nguồn: CVDICT (https://github.com/ph0ngp/CVDICT), CC-CEDICT (https://www.mdbg.net), Unicode Unihan. Dùng các dữ liệu này phải ghi công, phần ghi công đã có sẵn ở chân trang và trang từ điển.

---

## 10. Liên hệ hiển thị trên web

Sửa trong `js/config.js` → `contact`: email `hanryacademy@gmail.com`, điện thoại `(+84) 367 120 674` và `(+886) 938 482 468`.
