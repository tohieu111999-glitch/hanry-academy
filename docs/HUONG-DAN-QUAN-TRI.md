# Hướng dẫn quản trị Hanry Academy

Tài liệu dành cho chủ sở hữu và quản trị viên (admin). Đọc từ đầu đến cuối một lần trước khi đưa web lên mạng.

---

## 1. Web gồm những gì?

| Phần | Mô tả |
|---|---|
| **Trang chủ (bảng tin)** | Toàn bộ bài đăng của mọi người, giống bảng tin Facebook, lọc được theo môn học. Mỗi bài có nút Thích, Bình luận, Nghe đọc, Báo cáo. |
| **Ô tìm kiếm** (thay cho từ điển) | Gõ chữ Hán, tiếng Việt, tiếng Anh hoặc pinyin. Web **dịch nghĩa trước** (dịch máy và nghĩa từ điển hơn 120.000 từ), **sau đó gợi ý các bài viết có từ liên quan**. Bấm vào một từ để xem trang chi tiết (thứ tự nét, từ ghép, ví dụ). |
| **Bài viết** | Chạm hoặc rê chuột vào chữ bất kỳ sẽ hiện pinyin/zhuyin, âm Hán Việt, nghĩa của từ, **nghĩa cả câu** (bản dịch tác giả nhập sẵn, nếu không có thì web tự dịch máy) và nút lưu vào sổ tay. Dùng được cho tiếng Trung, Anh, Nhật, Hàn, Pháp, Đức. Bài lập trình hiển thị dạng code. |
| **Đăng bài** | Mọi người đã đăng nhập đều đăng được. Bắt buộc ghi tác giả và nguồn. Có nút "Tự dịch các câu". Phần từ vựng, ngữ pháp, câu hỏi là tuỳ chọn. Giáo viên (có key) đăng được thêm vào lớp hoặc ở chế độ cá nhân. |
| **Lộ trình học** | Phần 1 là **Học đọc phiên âm**, học viên tự chọn **Pinyin** hoặc **Zhuyin**. Gồm 6 bài: thanh điệu, thanh mẫu, vận mẫu, quy tắc, có luyện nghe. Phần 2 trở đi đang để "Đang cập nhật", chờ anh gửi bài. Các môn khác để "Sắp ra mắt". |
| **Sổ tay** | Từ đã lưu khi đọc bài. Có tab **Trò chơi ôn tập** gồm 8 trò: thẻ ghi nhớ, ghép cặp, 60 giây, luyện nghe, lật thẻ, mưa chữ, luyện viết, thanh điệu. |
| **Lớp học** | Giáo viên mở lớp và nhận mã 6 ký tự, học viên nhập mã để vào lớp. |
| **Sách bản quyền** | **Ẩn hoàn toàn** (không hiện trong menu, mở link thì báo 404) với mọi tài khoản chưa được cấp quyền. |
| **Pháp lý** | Điều khoản, Chính sách bảo mật, **Quyền lợi người dùng**, **Quy tắc cộng đồng**, Bản quyền & quy trình gỡ bài, Cookie. |

> Các bài đọc mẫu cũ (29 bài do Hanry soạn) đang hiện trên bảng tin với nhãn "Bài mẫu". Khi anh đã đăng đủ bài thật, mở `js/config.js` và đặt `showSamplePosts: false` để ẩn chúng.

---

## 1A. Dịch nghĩa câu: miễn phí hoặc dịch ý bằng AI

Trong `js/config.js`, mục `translate`:

- **`provider: 'mymemory'`** (mặc định): miễn phí, không cần cài đặt. Mỗi người dùng được khoảng 5.000 ký tự mỗi ngày. Chất lượng tạm được. Khi hết lượt, web hiện nghĩa từng từ thay thế.
- **`provider: 'ai'`**: dịch ý tự nhiên như AI, chất lượng tốt hơn nhiều. Cách bật:
  1. Tạo API key tại https://console.anthropic.com (trả phí theo lượng dùng).
  2. Tạo tài khoản Cloudflare miễn phí, rồi chạy trong thư mục `tools/translate-worker`:
     ```bash
     npm install
     npx wrangler login
     npx wrangler secret put ANTHROPIC_API_KEY     # dán key vào đây, KHÔNG dán vào code web
     npx wrangler deploy
     ```
  3. Sửa `ALLOWED_ORIGINS` trong `wrangler.toml` thành địa chỉ web của anh, rồi deploy lại.
  4. Trong `js/config.js` đặt `translate: { provider: 'ai', endpoint: 'https://hanry-translate.<tên>.workers.dev' }`.
  5. Nên bật **Rate limiting** trong bảng điều khiển Cloudflare (ví dụ 60 yêu cầu/phút cho mỗi IP) để tránh bị lạm dụng tốn tiền.

Bản dịch anh tự nhập khi đăng bài (sau dấu `|`) luôn được ưu tiên hơn dịch máy.

## 1B. Giọng đọc

Web dùng giọng đọc có sẵn trên máy người học, tự chọn giọng tự nhiên nhất (Natural/Neural/Online/Google), đọc theo từng cụm và ngắt nghỉ ở dấu câu. Giọng đẹp nhất hiện có:

- **Microsoft Edge** (Windows/Mac/Android): có sẵn miễn phí giọng tự nhiên *Xiaoxiao, Yunxi* (giản thể) và *HsiaoChen* (Đài Loan).
- **Chrome**: giọng "Google 普通话 / 國語(臺灣)".
- **iPhone/Mac**: vào Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung, tải giọng *Tingting/Meijia (Nâng cao)*.

Học viên chọn giọng ở ⚙️ Cài đặt → Giọng đọc, có nút "Nghe thử".

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

## 5A. Nhập bài đọc từ file PDF (theo mẫu của Hanry Academy)

Các bài đọc chính thức (ví dụ *錯誤 – Sai Lầm*, *青春 – Tuổi trẻ*…) được chuyển tự động từ PDF sang `data/posts/official.json`:

```bash
pip install pdfplumber
python3 tools/import-lesson.py duong-dan/bai-1.pdf duong-dan/bai-2.pdf ...
```

Công cụ đọc theo mẫu PDF của anh, gồm:
- 【Bài đọc】: tiêu đề Trung/Việt, `Cấp độ: A1 | TOCFL`. Đoạn thụt lề được hiểu là đoạn hội thoại.
- 【Câu hỏi】: các nhóm 認知題 / 應用題 / 進階題 / 陷阱題, bảng ✅ Đáp án kèm giải thích.
- 【Dịch bài đọc】 (nếu có).
- I. 【Từ Vựng】 (bảng). II. 【Ngữ Pháp】 kèm bài tập và đáp án mẫu. III. 【Bài tập bổ sung】 (điền từ, sắp xếp câu, viết đoạn văn, dịch 2 chiều).
- Thẻ câu kết ở cuối bài.

Nhập lại cùng một bài thì công cụ cập nhật bài cũ, không tạo bài trùng. Nếu PDF chưa có 【Dịch bài đọc】, bản dịch tiếng Việt do trợ lý AI soạn sẽ được giữ lại và hiện kèm ghi chú "chưa qua biên tập". Khi anh thêm 【Dịch bài đọc】 vào PDF rồi nhập lại, bản của anh sẽ thay thế bản AI.

Bài đã nhập xuất hiện trên **bảng tin** (nhãn "Chính thức") và trong **Lộ trình học → Phần 2: Bài đọc theo cấp độ** (A1, A2, B1…).

---

## 6. Đăng bài của anh

Cách nhanh nhất: đăng nhập bằng `hanryacademy@gmail.com` → bấm **✍️ Đăng bài** → chọn môn → dán bài, mỗi câu hoặc mỗi đoạn một dòng (hội thoại thì viết `Tên: câu`) → bấm **🌐 Tự dịch các câu** rồi sửa lại bản dịch → **Đăng bài**. Bài của admin có huy hiệu "Quản trị viên".

Khi anh gửi bài cho lộ trình, em sẽ soạn thành các phần của Lộ trình học (file `js/learn.js`).

---

## 7. Báo cáo, góp ý, gỡ nội dung

- Người dùng gửi qua trang **Góp ý & Báo cáo**, hoặc bấm nút 🚩 trên từng bài đăng và bình luận. Nội dung hiện ở **Quản trị → Báo cáo & góp ý**.
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

## 5B. Đề thi (`data/exams/exams.json`)

Gửi đề thi (PDF/ảnh) cho Claude: Claude nhập đề, **giải lại từng câu để kiểm tra đáp án**, ghi rõ câu nào đã sửa so với bản gốc, và **ước tính cấp độ/band** (TOCFL Band A = A1–A2, Band B = B1–B2, Band C = C1–C2).

Mỗi đề là một mục trong mảng JSON:

```json
{
  "id": "tocfl-a-01",
  "title": { "zh": "模擬試題一", "vi": "Đề luyện số 1" },
  "exam": "TOCFL", "band": "A", "level": "A2",
  "levelNote": "Lý do ước tính cấp độ (từ vựng, ngữ pháp, độ dài bài)",
  "duration": 60,
  "source": "Hanry Academy",
  "checked": { "by": "ai", "fixes": [{ "q": 5, "from": "B", "to": "C", "why": "..." }] },
  "sections": [
    { "title": "閱讀", "kind": "reading", "instructions": "...", "passage": "đoạn văn (tuỳ chọn)",
      "questions": [{ "q": "câu hỏi", "o": ["A", "B", "C", "D"], "a": 0, "why": "giải thích" }] },
    { "title": "聽力", "kind": "listening", "audio": "link mp3 (tuỳ chọn)", "script": "lời thoại để máy đọc nếu không có audio",
      "questions": [] }
  ]
}
```
`a` là vị trí đáp án đúng, đếm từ 0 (A = 0, B = 1, …).

### Gói đề & khoá gói
- Mỗi đề có trường `pack`: `hanry-band-a` (đề Hanry), `eduverse-trai-nghiem`, `eduverse-luyen-tap`, `eduverse-chuyen-sau`.
- Trang **Quản trị → Khoá gói đề thi**: bấm để khoá/mở từng gói. Gói bị khoá chỉ mở cho Gmail trong danh sách cấp quyền (cùng danh sách với Sách bản quyền). Lưu ý: đây là khoá trên giao diện; dữ liệu đề vẫn nằm trong file tĩnh `data/exams/exams.json`.
- Nhập đề: `tools/import-exam.py` (mẫu Hanry, cắt ảnh câu xem tranh) và `tools/import-exam-eduverse.py` (mẫu EduVerse), sau đó chạy `python3 tools/join-wrapped.py data/exams/exams.json` để ghép các dòng bị xuống dòng giữa câu.
