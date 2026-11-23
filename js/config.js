/* =========================================================
 * HANRY ACADEMY — CẤU HÌNH TRANG WEB
 * Chỉ sửa file này để thay đổi thông tin liên hệ, admin, Firebase.
 * ========================================================= */
window.HA = window.HA || {};
HA.config = {
  siteName: 'Hanry Academy',
  contact: {
    email: 'hanryacademy@gmail.com',
    phones: [
      { label: 'Việt Nam', value: '(+84) 367 120 674', tel: '+84367120674' },
      { label: 'Taiwan', value: '(+886) 938 482 468', tel: '+886938482468' }
    ]
  },

  // Email quản trị viên (admin). Chỉ những Gmail này có quyền vào trang Quản trị,
  // cấp quyền xem sách bản quyền, tạo key giáo viên, xem báo cáo.
  // LƯU Ý: phải khớp với danh sách trong file firestore.rules.
  adminEmails: ['hanryacademy@gmail.com'],

  // Ngày hiệu lực của Điều khoản & Chính sách (cập nhật khi sửa nội dung pháp lý)
  legalUpdated: '23/11/2026',

  // Các môn học (thêm/bớt tuỳ ý). lang = ngôn ngữ của nội dung, dùng cho phát âm, tra từ, dịch.
  subjects: [
    { id: 'zh', name: 'Tiếng Trung', en: 'Chinese', lang: 'zh', icon: '🇨🇳' },
    { id: 'en', name: 'Tiếng Anh', en: 'English', lang: 'en', icon: '🇬🇧' },
    { id: 'ja', name: 'Tiếng Nhật', en: 'Japanese', lang: 'ja', icon: '🇯🇵' },
    { id: 'ko', name: 'Tiếng Hàn', en: 'Korean', lang: 'ko', icon: '🇰🇷' },
    { id: 'fr', name: 'Tiếng Pháp', en: 'French', lang: 'fr', icon: '🇫🇷' },
    { id: 'de', name: 'Tiếng Đức', en: 'German', lang: 'de', icon: '🇩🇪' },
    { id: 'code', name: 'Lập trình', en: 'Programming', lang: 'code', icon: '💻' },
    { id: 'other', name: 'Khác', en: 'Other', lang: 'vi', icon: '📚' }
  ],

  // Bài đọc chính thức của Hanry Academy nằm trong data/posts/official.json (nhập từ PDF bằng tools/import-lesson.py).
  // Bộ 29 bài mẫu cũ do trợ lý soạn: đặt true nếu muốn hiện lại trên bảng tin.
  showSamplePosts: false,

  // DỊCH MÁY khi rê chuột vào câu / tìm kiếm.
  //  provider 'mymemory': miễn phí, không cần cài đặt, giới hạn ~5.000 ký tự/ngày cho mỗi người dùng.
  //  provider 'ai': dịch ý bằng AI qua máy chủ riêng (xem tools/translate-worker/ và docs). Điền endpoint.
  translate: {
    provider: 'mymemory',
    endpoint: ''
  },

  // ---------------------------------------------------------
  // FIREBASE (khuyến nghị để có ĐĂNG NHẬP GMAIL THẬT, lớp học dùng chung,
  // khoá sách bản quyền an toàn trên máy chủ).
  // Để trống apiKey => web chạy "chế độ cục bộ" (dữ liệu chỉ lưu trên trình duyệt,
  // KHÔNG bảo mật — chỉ dùng để thử nghiệm). Xem hướng dẫn trong docs/HUONG-DAN-QUAN-TRI.md
  // ---------------------------------------------------------
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: ''
  }
};
