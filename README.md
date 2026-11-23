# Hanry Academy 汉

Nền tảng học tiếng Trung từ HSK 1 đến HSK 6, thiết kế theo kiểu chơi game như Duolingo. Web là trang tĩnh: chỉ cần HTML, CSS và JavaScript, không cần bước build, chạy được trên GitHub Pages.

## Tính năng
- **29 bài học**, chia thành 6 cấp độ (HSK 1 → 6). Mỗi bài có: Bài đọc/Hội thoại → Từ vựng → Ngữ pháp → Câu hỏi bài đọc → Luyện tập kiểu Duolingo (tim, XP, chuỗi ngày).
- **Chạm hoặc di chuột vào bất kỳ chữ nào** để xem pinyin/chú âm, âm Hán Việt, nghĩa, ví dụ, từ đồng nghĩa/trái nghĩa và nút thêm vào **sổ tay**.
- **Sổ tay từ vựng** ôn theo phương pháp lặp lại ngắt quãng (SRS), xuất/nhập file CSV.
- **8 trò chơi**: thẻ ghi nhớ, ghép cặp tốc độ, thử thách 60 giây, luyện nghe, lật thẻ, mưa chữ, luyện viết chữ (Hanzi Writer), đoán thanh điệu.
- **Từ điển 120.000+ mục từ** giống Hanzii: tra bằng chữ Hán, pinyin, tiếng Việt, tiếng Anh; có thứ tự nét, từ ghép, câu ví dụ.
- **5 ngôn ngữ giao diện**: Việt, Anh, Trung giản thể, Trung phồn thể, Nhật. Chọn được chữ **giản/phồn thể** và phiên âm **pinyin/zhuyin**.
- **Cộng đồng**: soạn bài có ghi tác giả và nguồn. **Lớp học**: giáo viên mở lớp bằng key do admin cấp, học viên vào lớp bằng mã lớp. **Sách bản quyền**: chỉ Gmail được cấp quyền mới xem được.
- Trang **Điều khoản**, **Chính sách bảo mật**, **Bản quyền & Nội dung**, **Cookie**, **Góp ý/Báo cáo**, **Liên hệ**.

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
js/app.js             điều hướng, trang chủ, lộ trình, bài học, sổ tay, hồ sơ
js/practice.js        luyện tập kiểu Duolingo
js/games.js           8 trò chơi
js/dictpage.js        từ điển
js/social.js          cộng đồng, soạn bài, lớp học, sách, quản trị, góp ý, liên hệ
js/legal.js           điều khoản và chính sách
js/data/hsk*.js       nội dung bài học
data/*.tsv            dữ liệu từ điển (tạo bằng tools/build-dict.mjs)
firestore.rules       luật phân quyền phía máy chủ
```

## Giấy phép dữ liệu bên thứ ba
- CVDICT © Phong Phan và CC-CEDICT © MDBG: giấy phép CC BY-SA 4.0 (file `data/dict-vi.tsv`, `data/dict-en.tsv`, chia sẻ lại theo cùng giấy phép).
- Unicode Unihan: Unicode License (`data/hanviet.tsv`).
- pinyin-pro: MIT (`js/vendor/pinyin-pro.js`).
- Hanzi Writer và dữ liệu Make Me a Hanzi: tải từ jsDelivr khi chạy.

Nội dung bài học, giao diện và mã nguồn © Hanry Academy. Bảo lưu mọi quyền.
