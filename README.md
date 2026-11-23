# Hanry Academy

Nền tảng học ngoại ngữ (Trung, Anh, Nhật, Hàn, Pháp, Đức) và lập trình, xoay quanh các bài đọc do cộng đồng, giáo viên và Hanry Academy đăng tải. Web là trang tĩnh: chỉ cần HTML, CSS và JavaScript, không cần bước build, chạy được trên GitHub Pages.

## Tính năng
- **Trang chủ là bảng tin bài đăng** (giống Facebook): lọc theo môn, có thích, bình luận, nghe đọc, báo cáo.
- **Ô tìm kiếm**: dịch nghĩa trước (dịch máy và từ điển 120.000+ từ), sau đó gợi ý các bài có từ liên quan.
- **Rê chuột hoặc chạm vào chữ** để xem pinyin/zhuyin, âm Hán Việt, nghĩa của từ, nghĩa cả câu, và lưu vào sổ tay.
- **Lộ trình học**: phần 1 là học đọc Pinyin hoặc Zhuyin (theo lựa chọn của người học), các phần sau cập nhật dần.
- **Sổ tay** kèm 8 trò chơi ôn tập.
- **Giọng đọc tự nhiên**: tự chọn giọng tốt nhất trên máy, ngắt nghỉ theo dấu câu, người học chọn được giọng.
- **Lớp học** có key giáo viên và mã lớp. **Sách bản quyền** ẩn hoàn toàn nếu tài khoản chưa được cấp quyền.
- Giao diện 5 ngôn ngữ, chữ giản/phồn thể (chuẩn Đài Loan qua OpenCC).
- Pháp lý đầy đủ: Điều khoản, Bảo mật, Quyền lợi người dùng, Quy tắc cộng đồng, Bản quyền & gỡ bài, Cookie.
- Tuỳ chọn dịch ý bằng AI qua máy chủ riêng (`tools/translate-worker`, Cloudflare Worker gọi Claude API).

## Chạy thử trên máy
```bash
python3 -m http.server 8000
# mở http://localhost:8000
```

## Cấu hình và quản trị
Xem **[docs/HUONG-DAN-QUAN-TRI.md](docs/HUONG-DAN-QUAN-TRI.md)**. Tài liệu gồm: đưa web lên GitHub Pages, bật Firebase để đăng nhập Gmail thật, khoá sách bản quyền, tạo key giáo viên, thêm bài học.

## Cấu trúc thư mục
```
index.html            khung trang
css/style.css         giao diện (sáng/tối, responsive)
js/config.js          liên hệ, email admin, Firebase
js/i18n.js            bản dịch giao diện 5 ngôn ngữ
js/zh.js              xử lý chữ Hán: tách từ, pinyin, zhuyin, phồn thể, phát âm
js/store.js           dữ liệu người dùng, chế độ cục bộ và Firebase
js/app.js             khung trang, điều hướng, cài đặt, đăng nhập, hồ sơ
js/feed.js            bảng tin, tìm kiếm, trang bài viết, đăng bài, thích/bình luận
js/learn.js           lộ trình học (học đọc pinyin/zhuyin)
js/notebook.js        sổ tay và trò chơi ôn tập
js/translate.js       dịch máy (MyMemory hoặc máy chủ AI)
js/games.js           8 trò chơi
js/dictpage.js        trang chi tiết từ (mở từ tìm kiếm)
js/social.js          lớp học, sách, quản trị, góp ý, liên hệ
js/legal.js           điều khoản và chính sách
js/data/hsk*.js       các bài đọc mẫu
tools/translate-worker/ máy chủ dịch AI (tuỳ chọn)
data/*.tsv            dữ liệu từ điển (tạo bằng tools/build-dict.mjs)
firestore.rules       luật phân quyền phía máy chủ
```

## Giấy phép dữ liệu bên thứ ba
- CVDICT © Phong Phan và CC-CEDICT © MDBG: giấy phép CC BY-SA 4.0 (file `data/dict-vi.tsv`, `data/dict-en.tsv`, chia sẻ lại theo cùng giấy phép).
- Unicode Unihan: Unicode License (`data/hanviet.tsv`).
- pinyin-pro: MIT (`js/vendor/pinyin-pro.js`). opencc-js: MIT (`js/vendor/opencc-full.js`).
- Hanzi Writer và dữ liệu Make Me a Hanzi: tải từ jsDelivr khi chạy.

Nội dung bài học, giao diện và mã nguồn © Hanry Academy. Bảo lưu mọi quyền.
