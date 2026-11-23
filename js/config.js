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
