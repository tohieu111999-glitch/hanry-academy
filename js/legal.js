/* Terms of Service, Privacy Policy, Copyright & Content Policy, Cookies */
(function () {
  const C = HA.config.contact;
  const MAIL = '<a href="mailto:' + C.email + '">' + C.email + '</a>';
  const PH = C.phones.map((p) => p.value).join(' / ');
  const DATE = HA.config.legalUpdated;

  const DOCS = {
    terms: {
      vi: `
<h1>Điều khoản sử dụng</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<p>Chào mừng bạn đến với <b>Hanry Academy</b> ("Hanry Academy", "chúng tôi", "Trang web") — nền tảng học tập trực tuyến (ngoại ngữ như tiếng Trung, Anh, Nhật, Hàn, Pháp, Đức, lập trình và các môn khác). Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ chức năng nào của Trang web, bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi Điều khoản sử dụng này ("Điều khoản"), <a href="#/legal/privacy">Chính sách bảo mật</a>, <a href="#/legal/copyright">Chính sách Bản quyền &amp; Nội dung</a> và <a href="#/legal/cookies">Chính sách Cookie &amp; Lưu trữ</a>. Nếu không đồng ý, vui lòng ngừng sử dụng Trang web.</p>

<h2>1. Định nghĩa</h2>
<ul>
<li><b>Người dùng</b>: bất kỳ cá nhân nào truy cập Trang web, có hoặc không có tài khoản.</li>
<li><b>Học viên</b>: Người dùng có tài khoản với vai trò mặc định.</li>
<li><b>Giáo viên</b>: Người dùng đã được Quản trị viên cấp và kích hoạt "Key giáo viên" hợp lệ.</li>
<li><b>Quản trị viên</b>: chủ sở hữu hoặc người được chủ sở hữu Hanry Academy chỉ định quản lý Trang web.</li>
<li><b>Nội dung Hanry</b>: giáo trình, bài học, bài đọc, hội thoại, bài tập, giao diện, mã nguồn, logo, thương hiệu do Hanry Academy tạo ra hoặc được cấp phép.</li>
<li><b>Nội dung người dùng</b>: bài học, văn bản, câu hỏi, bình luận, báo cáo hoặc bất kỳ tài liệu nào do Người dùng đăng tải.</li>
<li><b>Tài liệu bản quyền hạn chế</b>: sách, giáo trình hoặc tài liệu thuộc quyền sở hữu của bên thứ ba hoặc của Hanry Academy, chỉ hiển thị cho tài khoản Gmail được Quản trị viên cấp quyền.</li>
</ul>

<h2>2. Điều kiện sử dụng và độ tuổi</h2>
<p>2.1. Bạn phải có đầy đủ năng lực hành vi dân sự theo pháp luật Việt Nam hoặc pháp luật nơi bạn cư trú. Người dưới 16 tuổi chỉ được tạo tài khoản và sử dụng khi có sự đồng ý và giám sát của cha, mẹ hoặc người giám hộ hợp pháp; việc xử lý dữ liệu cá nhân của trẻ em tuân thủ quy định pháp luật về bảo vệ dữ liệu cá nhân.</p>
<p>2.2. Bạn cam kết sử dụng Trang web cho mục đích học tập, giảng dạy hợp pháp và tuân thủ pháp luật Việt Nam, bao gồm nhưng không giới hạn: Bộ luật Dân sự 2015, Luật Sở hữu trí tuệ, Luật An ninh mạng 2018, Luật Bảo vệ dữ liệu cá nhân, Nghị định 13/2023/NĐ-CP, Nghị định 147/2024/NĐ-CP về quản lý, cung cấp, sử dụng dịch vụ Internet và thông tin trên mạng, cùng các văn bản sửa đổi, bổ sung, thay thế.</p>

<h2>3. Tài khoản</h2>
<p>3.1. Trang web sử dụng đăng nhập bằng tài khoản Google (Gmail). Bạn chịu trách nhiệm bảo mật tài khoản Google của mình và mọi hoạt động diễn ra dưới tài khoản đó.</p>
<p>3.2. Mỗi tài khoản chỉ dành cho một cá nhân. <b>Nghiêm cấm chia sẻ, cho mượn, cho thuê, mua bán tài khoản</b>, đặc biệt là tài khoản đã được cấp quyền xem Tài liệu bản quyền hạn chế hoặc tài khoản Giáo viên.</p>
<p>3.3. Bạn phải thông báo ngay cho chúng tôi qua ${MAIL} nếu phát hiện tài khoản bị truy cập trái phép.</p>
<p>3.4. Bạn có thể xoá tài khoản bất kỳ lúc nào tại trang Hồ sơ. Việc xoá tài khoản sẽ xoá dữ liệu hồ sơ và các bài học bạn đã đăng, trừ trường hợp pháp luật yêu cầu lưu giữ.</p>

<h2>4. Vai trò Giáo viên và Key giáo viên</h2>
<p>4.1. Chức năng Giáo viên (mở lớp, đăng bài cho lớp, đăng bài cá nhân) chỉ được mở khi nhập Key giáo viên do Quản trị viên cấp. Key là <b>cá nhân, chỉ dùng một lần, không được chuyển nhượng</b>.</p>
<p>4.2. Giáo viên chịu trách nhiệm về nội dung đăng trong lớp học của mình, về việc quản lý mã lớp và chỉ chia sẻ mã lớp cho học viên của mình.</p>
<p>4.3. Hanry Academy có quyền thu hồi vai trò Giáo viên bất kỳ lúc nào nếu phát hiện vi phạm Điều khoản, mà không cần báo trước.</p>

<h2>5. Nội dung người dùng</h2>
<p>5.1. Khi đăng Nội dung người dùng, bạn <b>bắt buộc ghi rõ tác giả</b> và <b>nguồn gốc</b> (tự biên soạn, sưu tầm, hoặc trích nguồn cụ thể). Bạn cam đoan và bảo đảm rằng: (a) bạn là tác giả hoặc có đầy đủ quyền/giấy phép hợp pháp để đăng; (b) nội dung không xâm phạm quyền tác giả, quyền liên quan, nhãn hiệu, bí mật kinh doanh, quyền nhân thân, quyền riêng tư của bất kỳ ai; (c) nội dung không vi phạm pháp luật và các quy định tại Điều 6.</p>
<p>5.2. Bạn giữ quyền sở hữu đối với Nội dung người dùng của mình. Bằng việc đăng tải, bạn cấp cho Hanry Academy một giấy phép <b>không độc quyền, miễn phí bản quyền, có hiệu lực trên toàn thế giới</b> để lưu trữ, sao chép kỹ thuật, hiển thị, định dạng, tạo phiên âm/bản dịch tự động và phân phối nội dung trên Trang web trong phạm vi hiển thị bạn đã chọn (công khai / lớp học / cá nhân), cho đến khi bạn xoá nội dung hoặc tài khoản.</p>
<p>5.3. Bạn tự chịu hoàn toàn trách nhiệm pháp lý (dân sự, hành chính, hình sự) về Nội dung người dùng của mình. Hanry Academy là nền tảng trung gian, không có nghĩa vụ kiểm duyệt trước nhưng có quyền (không phải nghĩa vụ) xem xét, chỉnh sửa định dạng, ẩn hoặc gỡ bỏ bất kỳ nội dung nào mà không cần báo trước nếu có dấu hiệu vi phạm.</p>
<p>5.4. Việc trích dẫn tác phẩm của người khác chỉ được thực hiện trong giới hạn cho phép của pháp luật (ví dụ: trích dẫn hợp lý nhằm giảng dạy theo Điều 25 Luật Sở hữu trí tuệ), phải ghi rõ tên tác giả, nguồn gốc và không làm ảnh hưởng đến việc khai thác bình thường của tác phẩm.</p>

<h2>6. Hành vi bị nghiêm cấm</h2>
<p>Người dùng không được:</p>
<ol>
<li>Đăng tải, chia sẻ nội dung xâm phạm quyền sở hữu trí tuệ, bao gồm sao chép nguyên văn sách, giáo trình, đề thi có bản quyền khi chưa được phép.</li>
<li>Sao chép, chụp màn hình, ghi hình, tải xuống, trích xuất, phát tán, bán lại hoặc chia sẻ công khai Tài liệu bản quyền hạn chế dưới bất kỳ hình thức nào.</li>
<li>Đăng nội dung chống phá Nhà nước, xuyên tạc lịch sử, kích động bạo lực, thù hận, phân biệt đối xử; nội dung khiêu dâm, đồi trụy; nội dung xúc phạm danh dự, nhân phẩm, uy tín của tổ chức, cá nhân; thông tin sai sự thật; các nội dung bị cấm theo Điều 8 Luật An ninh mạng và pháp luật liên quan.</li>
<li>Thu thập, công khai dữ liệu cá nhân của người khác khi không có sự đồng ý.</li>
<li>Giả mạo Hanry Academy, Quản trị viên, Giáo viên hoặc người khác; mạo danh tác giả.</li>
<li>Quảng cáo, spam, lừa đảo, đa cấp, đánh bạc hoặc kinh doanh trái phép.</li>
<li>Tấn công, dò quét lỗ hổng, can thiệp, vượt qua cơ chế phân quyền/bảo mật, phát tán mã độc, sử dụng bot hoặc công cụ tự động để thu thập dữ liệu (scraping) từ Trang web.</li>
<li>Sử dụng Trang web để vi phạm pháp luật Việt Nam, pháp luật nơi bạn cư trú hoặc quyền, lợi ích hợp pháp của người khác.</li>
</ol>

<h2>7. Tài liệu bản quyền hạn chế</h2>
<p>7.1. Quyền truy cập Tài liệu bản quyền hạn chế được cấp theo từng địa chỉ Gmail, mang tính <b>cá nhân, có thời hạn, có thể thu hồi, không độc quyền và không thể chuyển nhượng</b>, chỉ cho mục đích học tập cá nhân.</p>
<p>7.2. Mọi quyền đối với các tài liệu này thuộc về tác giả, nhà xuất bản hoặc chủ sở hữu hợp pháp. Việc được cấp quyền xem không chuyển giao bất kỳ quyền sở hữu trí tuệ nào cho bạn.</p>
<p>7.3. Khi phát hiện vi phạm Điều 6.2 hoặc chia sẻ tài khoản, Hanry Academy sẽ thu hồi quyền truy cập ngay lập tức, khoá tài khoản và có quyền yêu cầu bồi thường thiệt hại, đồng thời chuyển thông tin cho cơ quan có thẩm quyền và/hoặc chủ sở hữu quyền.</p>

<h2>8. Quyền sở hữu trí tuệ của Hanry Academy</h2>
<p>Nội dung Hanry được bảo hộ bởi pháp luật về sở hữu trí tuệ. Bạn được phép sử dụng cho mục đích học tập cá nhân, phi thương mại. Nghiêm cấm sao chép, tái bản, phân phối, chỉnh sửa, khai thác thương mại Nội dung Hanry khi chưa có sự chấp thuận bằng văn bản của Hanry Academy.</p>

<h2>9. Dữ liệu và phần mềm của bên thứ ba</h2>
<p>9.1. Trang web sử dụng dữ liệu từ điển CVDICT và CC-CEDICT (giấy phép Creative Commons Attribution-ShareAlike 4.0), dữ liệu Unicode Unihan (Unicode License), thư viện pinyin-pro (MIT), Hanzi Writer và dữ liệu Make Me a Hanzi (theo giấy phép tương ứng), dịch vụ Google Firebase, Google Fonts. Các dữ liệu này thuộc quyền của chủ sở hữu tương ứng và được sử dụng theo điều kiện giấy phép của họ. Nghĩa từ điển được dịch tự động có thể chứa sai sót.</p>
<p>9.2. <b>Dịch máy và AI.</b> Khi bạn rê chuột vào câu, bấm "Dịch cả bài", "Tự dịch các câu" hoặc tìm kiếm, đoạn văn bản liên quan được gửi tới dịch vụ dịch máy (mặc định: MyMemory của Translated S.r.l., Ý; hoặc máy chủ dịch AI do Hanry Academy vận hành có sử dụng mô hình AI của bên thứ ba nếu được bật). Kết quả dịch chỉ mang tính tham khảo, có thể sai hoặc không sát nghĩa, không thay thế bản dịch chuyên nghiệp, và không được dùng làm căn cứ cho các quyết định pháp lý, y tế, tài chính. Không nhập thông tin cá nhân, bí mật vào ô tìm kiếm hay nội dung cần dịch.</p>
<p>9.3. <b>Giọng đọc.</b> Phát âm dùng công nghệ tổng hợp giọng nói của trình duyệt/hệ điều hành; chất lượng, giọng và ngữ điệu phụ thuộc thiết bị của bạn.</p>

<h2>10. Dịch vụ, thay đổi và gián đoạn</h2>
<p>Trang web được cung cấp miễn phí. Chúng tôi có quyền thay đổi, tạm ngừng hoặc chấm dứt toàn bộ hay một phần Trang web, chức năng hoặc nội dung bất kỳ lúc nào. Dữ liệu học tập (tiến độ, sổ tay) được lưu trên trình duyệt của bạn; bạn tự chịu trách nhiệm sao lưu (chức năng "Xuất file").</p>

<h2>11. Miễn trừ bảo đảm</h2>
<p>Trang web và nội dung được cung cấp trên cơ sở <b>"nguyên trạng" và "sẵn có"</b>. Trong phạm vi tối đa pháp luật cho phép, Hanry Academy không bảo đảm Trang web luôn hoạt động liên tục, không lỗi, không có mã độc; không bảo đảm tính chính xác tuyệt đối của nghĩa từ, phiên âm, phát âm tự động hay kết quả thi cử của bạn. Phát âm sử dụng công nghệ đọc văn bản của trình duyệt/hệ điều hành.</p>

<h2>12. Giới hạn trách nhiệm</h2>
<p>Trong phạm vi tối đa pháp luật cho phép, Hanry Academy, chủ sở hữu, cộng tác viên không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả, mất dữ liệu, mất lợi nhuận phát sinh từ việc sử dụng hoặc không thể sử dụng Trang web, từ Nội dung người dùng hoặc hành vi của Người dùng khác. Không điều khoản nào loại trừ trách nhiệm mà pháp luật không cho phép loại trừ.</p>

<h2>13. Bồi hoàn</h2>
<p>Bạn đồng ý bồi hoàn và bảo vệ Hanry Academy, chủ sở hữu và cộng tác viên khỏi mọi khiếu nại, yêu cầu, thiệt hại, chi phí (bao gồm chi phí luật sư hợp lý) phát sinh từ: Nội dung người dùng của bạn; việc bạn vi phạm Điều khoản; hoặc việc bạn xâm phạm quyền của bên thứ ba.</p>

<h2>13A. Bình luận, lượt thích và tương tác</h2>
<p>Bình luận là Nội dung người dùng và phải tuân thủ <a href="#/legal/community">Quy tắc cộng đồng</a>. Tác giả bài viết và Quản trị viên có thể ẩn hoặc xoá bình luận vi phạm. Lượt thích và bình luận công khai có thể hiển thị tên hiển thị của bạn.</p>

<h2>14. Xử lý vi phạm</h2>
<p>Tuỳ mức độ, Hanry Academy có quyền: nhắc nhở; gỡ nội dung; hạn chế chức năng; thu hồi quyền Giáo viên hoặc quyền xem Tài liệu bản quyền hạn chế; khoá tạm thời hoặc vĩnh viễn tài khoản; cung cấp thông tin cho cơ quan nhà nước có thẩm quyền theo yêu cầu hợp pháp; yêu cầu bồi thường thiệt hại.</p>

<h2>15. Báo cáo vi phạm và khiếu nại</h2>
<p>Mọi báo cáo nội dung vi phạm, khiếu nại bản quyền xin gửi qua trang <a href="#/feedback">Góp ý &amp; Báo cáo</a> hoặc email ${MAIL}. Quy trình chi tiết tại <a href="#/legal/copyright">Chính sách Bản quyền &amp; Nội dung</a>. Quyền và cam kết đối với người dùng được nêu tại <a href="#/legal/rights">Quyền lợi người dùng</a>.</p>

<h2>16. Luật áp dụng và giải quyết tranh chấp</h2>
<p>Điều khoản được điều chỉnh bởi pháp luật nước Cộng hoà xã hội chủ nghĩa Việt Nam. Tranh chấp trước hết được giải quyết bằng thương lượng, hoà giải trong vòng 30 ngày kể từ ngày một bên gửi thông báo bằng văn bản. Nếu không thành, tranh chấp được đưa ra Toà án nhân dân có thẩm quyền tại Việt Nam. Quyền lợi của người tiêu dùng theo Luật Bảo vệ quyền lợi người tiêu dùng 2023 không bị hạn chế bởi Điều khoản này.</p>

<h2>17. Sửa đổi Điều khoản</h2>
<p>Chúng tôi có thể cập nhật Điều khoản. Thay đổi quan trọng sẽ được thông báo trên Trang web ít nhất 07 ngày trước khi có hiệu lực (trừ trường hợp do yêu cầu pháp luật). Việc bạn tiếp tục sử dụng sau ngày hiệu lực đồng nghĩa với việc chấp nhận Điều khoản sửa đổi.</p>

<h2>18. Điều khoản chung</h2>
<p>Nếu bất kỳ điều khoản nào bị vô hiệu, các điều khoản còn lại vẫn giữ nguyên hiệu lực. Việc chúng tôi không thực thi một quyền không có nghĩa là từ bỏ quyền đó. Bạn không được chuyển nhượng quyền, nghĩa vụ theo Điều khoản khi chưa có sự đồng ý của chúng tôi. Bản tiếng Việt có giá trị ưu tiên khi có khác biệt giữa các bản ngôn ngữ.</p>

<h2>19. Liên hệ</h2>
<p>Hanry Academy — Email: ${MAIL} — Điện thoại: ${PH}</p>`,
      en: `
<h1>Terms of Service</h1>
<p class="muted">Effective ${DATE}</p>
<p>Welcome to <b>Hanry Academy</b> ("we", "the Site"), an online learning platform (languages such as Chinese, English, Japanese, Korean, French, German, programming and other subjects). By accessing the Site, creating an account or using any feature, you confirm that you have read, understood and agree to these Terms, our <a href="#/legal/privacy">Privacy Policy</a>, <a href="#/legal/copyright">Copyright &amp; Content Policy</a> and <a href="#/legal/cookies">Cookie &amp; Storage Policy</a>. If you do not agree, please stop using the Site.</p>
<h2>1. Definitions</h2><p>"User" means anyone accessing the Site. "Student" is a User with a default account. "Teacher" is a User who activated a valid Teacher Key issued by an Administrator. "Administrator" means the owner of Hanry Academy or persons designated by the owner. "Hanry Content" means curriculum, lessons, exercises, design, code and brand created or licensed by Hanry Academy. "User Content" means anything Users upload. "Restricted Licensed Material" means books or materials visible only to Gmail accounts authorized by an Administrator.</p>
<h2>2. Eligibility</h2><p>You must have full legal capacity under the laws of Vietnam or your place of residence. Users under 16 may only use the Site with the consent and supervision of a parent or legal guardian. You agree to use the Site lawfully for learning and teaching and to comply with applicable laws, including Vietnamese laws on civil matters, intellectual property, cybersecurity and personal data protection.</p>
<h2>3. Accounts</h2><p>Sign-in uses Google (Gmail). You are responsible for securing your Google account and all activity under it. Each account is for one individual only; <b>sharing, lending, renting or selling accounts is strictly prohibited</b>, especially accounts with access to Restricted Licensed Material or Teacher rights. Notify us immediately at ${MAIL} of any unauthorized access. You may delete your account at any time from your Profile.</p>
<h2>4. Teachers and Teacher Keys</h2><p>Teacher features require a Teacher Key issued by an Administrator. Keys are personal, single-use and non-transferable. Teachers are responsible for content posted in their classes and for sharing class codes only with their own students. We may revoke Teacher rights at any time for violations.</p>
<h2>5. User Content</h2><p>When posting, you <b>must state the author and the source</b> (original, collected, or a specific cited source). You warrant that you own or have all necessary rights, and that the content does not infringe copyright, trademarks, privacy or other rights, nor violate any law or Section 6. You retain ownership and grant Hanry Academy a non-exclusive, royalty-free, worldwide license to store, technically reproduce, display, format, generate automatic phonetics/translations and distribute the content on the Site within the visibility you choose (public / class / private) until you delete it or your account. You are solely legally responsible for your User Content. We are an intermediary platform with no obligation to pre-screen, but we may review, hide or remove any content without notice. Quotations of others' works must stay within legal limits (e.g. fair quotation for teaching), credit the author and source, and not harm normal exploitation of the work.</p>
<h2>6. Prohibited conduct</h2><ol><li>Posting content that infringes intellectual property, including copying copyrighted books, textbooks or exams without permission.</li><li>Copying, screenshotting, recording, downloading, extracting, distributing, reselling or publicly sharing Restricted Licensed Material in any form.</li><li>Posting unlawful content: content against the State, violent, hateful, discriminatory, pornographic, defamatory or false information, and content prohibited by Vietnamese cybersecurity law and other applicable laws.</li><li>Collecting or disclosing others' personal data without consent.</li><li>Impersonating Hanry Academy, Administrators, Teachers, authors or other persons.</li><li>Advertising, spam, fraud, pyramid schemes, gambling or illegal business.</li><li>Attacking, probing, bypassing access controls, distributing malware, or scraping the Site with bots.</li><li>Any use that violates the law or the rights of others.</li></ol>
<h2>7. Restricted Licensed Material</h2><p>Access is granted per Gmail address and is personal, time-limited, revocable, non-exclusive and non-transferable, for personal study only. All rights remain with the authors, publishers or rights holders. Upon violation of Section 6.2 or account sharing, we will immediately revoke access, suspend the account, may claim damages and may provide information to competent authorities and/or rights holders.</p>
<h2>8. Hanry Academy intellectual property</h2><p>Hanry Content is protected by intellectual property law. You may use it for personal, non-commercial study. Copying, republishing, distributing, modifying or commercially exploiting Hanry Content without our written consent is prohibited.</p>
<h2>9. Third-party data and software</h2><p>The Site uses CVDICT and CC-CEDICT dictionary data (CC BY-SA 4.0), Unicode Unihan data (Unicode License), pinyin-pro (MIT), Hanzi Writer and Make Me a Hanzi data (under their licenses), Google Firebase and Google Fonts. These belong to their respective owners and are used under their license terms. Machine-translated definitions may contain errors. <b>Machine/AI translation:</b> when you hover a sentence, translate a post or search, the relevant text is sent to a translation service (by default MyMemory by Translated S.r.l., Italy, or an AI translation server operated by Hanry Academy using a third-party AI model if enabled). Translations are for reference only, may be inaccurate, and must not be relied on for legal, medical or financial decisions. Do not enter personal or confidential information. <b>Speech</b> uses your browser/OS voices; quality depends on your device.</p>
<h2>10. Service changes</h2><p>The Site is free. We may change, suspend or discontinue any part at any time. Learning data (progress, notebook) is stored in your browser; you are responsible for backups (Export feature).</p>
<h2>11. Disclaimer</h2><p>The Site is provided "as is" and "as available". To the maximum extent permitted by law, we do not warrant uninterrupted or error-free operation, nor the absolute accuracy of definitions, phonetics, synthetic speech or your exam results.</p>
<h2>12. Limitation of liability</h2><p>To the maximum extent permitted by law, Hanry Academy, its owner and contributors are not liable for indirect, incidental, special or consequential damages, data loss or lost profits arising from use of the Site, User Content or other Users' conduct. Nothing excludes liability that cannot be excluded by law.</p>
<h2>13. Indemnity</h2><p>You agree to indemnify and hold harmless Hanry Academy, its owner and contributors from any claims, damages and costs (including reasonable attorney fees) arising from your User Content, your breach of these Terms or your infringement of third-party rights.</p>
<h2>13A. Comments and likes</h2><p>Comments are User Content and must follow the <a href="#/legal/community">Community rules</a>. Post authors and Administrators may hide or remove violating comments. Your display name may be shown with your likes and comments.</p>
<h2>14. Enforcement</h2><p>We may warn, remove content, restrict features, revoke Teacher or licensed-material access, suspend or terminate accounts, cooperate with lawful requests from authorities, and claim damages.</p>
<h2>15. Reports and complaints</h2><p>Send reports via <a href="#/feedback">Feedback &amp; Report</a> or ${MAIL}. See the <a href="#/legal/copyright">Copyright &amp; Content Policy</a> for the procedure.</p>
<h2>16. Governing law and disputes</h2><p>These Terms are governed by the laws of the Socialist Republic of Vietnam. Disputes shall first be resolved by negotiation within 30 days of written notice; failing that, by the competent People's Court in Vietnam. Mandatory consumer protection rights are not limited.</p>
<h2>17. Changes</h2><p>We may update these Terms. Material changes will be announced on the Site at least 7 days before taking effect (unless required by law). Continued use means acceptance.</p>
<h2>18. General</h2><p>If any provision is invalid, the rest remain in force. Failure to enforce is not a waiver. You may not assign your rights without our consent. The Vietnamese version prevails in case of discrepancy.</p>
<h2>19. Contact</h2><p>Hanry Academy — Email: ${MAIL} — Phone: ${PH}</p>`
    },
    privacy: {
      vi: `
<h1>Chính sách bảo mật</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<p>Hanry Academy tôn trọng và cam kết bảo vệ dữ liệu cá nhân của bạn theo Luật Bảo vệ dữ liệu cá nhân, Nghị định 13/2023/NĐ-CP, Luật An ninh mạng 2018 và các quy định liên quan của Việt Nam; đồng thời tôn trọng các nguyên tắc tương ứng của Luật Bảo vệ dữ liệu cá nhân Đài Loan (個人資料保護法) và GDPR (EU) đối với người dùng tại các khu vực đó.</p>

<h2>1. Bên kiểm soát và xử lý dữ liệu</h2>
<p>Hanry Academy (liên hệ: ${MAIL}; ${PH}) là bên kiểm soát và xử lý dữ liệu cá nhân thu thập qua Trang web.</p>

<h2>2. Dữ liệu chúng tôi thu thập</h2>
<table class="tbl"><tr><th>Loại dữ liệu</th><th>Ví dụ</th><th>Nơi lưu</th></tr>
<tr><td>Dữ liệu tài khoản</td><td>Địa chỉ Gmail, tên hiển thị, ảnh đại diện Google, mã định danh người dùng, vai trò (học viên/giáo viên)</td><td>Google Firebase (máy chủ của Google)</td></tr>
<tr><td>Nội dung bạn tạo</td><td>Bài viết, bình luận, lượt thích, lớp học, mã lớp, danh sách thành viên lớp, báo cáo/góp ý</td><td>Google Firebase</td></tr>
<tr><td>Văn bản cần dịch</td><td>Câu bạn rê chuột, nội dung bạn bấm dịch, từ khoá tìm kiếm</td><td>Gửi tới dịch vụ dịch máy (MyMemory – Translated S.r.l., Ý; hoặc máy chủ dịch AI của Hanry Academy nếu bật) chỉ để trả kết quả dịch; kết quả được lưu đệm trên trình duyệt của bạn</td></tr>
<tr><td>Quyền truy cập</td><td>Gmail được cấp quyền xem tài liệu bản quyền, key giáo viên đã dùng</td><td>Google Firebase</td></tr>
<tr><td>Dữ liệu học tập</td><td>Bài đã đọc, tiến độ lộ trình, sổ tay từ vựng, lịch sử tra từ, cài đặt (ngôn ngữ, giọng đọc)</td><td><b>Chỉ trên trình duyệt của bạn</b> (localStorage)</td></tr>
<tr><td>Dữ liệu kỹ thuật</td><td>Địa chỉ IP, loại trình duyệt, nhật ký truy cập</td><td>Do nhà cung cấp hạ tầng (GitHub Pages, Google, jsDelivr) tự động ghi nhận</td></tr>
</table>
<p>Chúng tôi <b>không</b> thu thập dữ liệu cá nhân nhạy cảm, không thu thập thông tin thanh toán, không dùng cookie quảng cáo hay công cụ theo dõi quảng cáo.</p>

<h2>3. Mục đích xử lý</h2>
<ul><li>Tạo và quản lý tài khoản, xác thực đăng nhập;</li><li>Cung cấp chức năng học tập, lớp học, đăng bài, phân quyền giáo viên và tài liệu bản quyền;</li><li>Hiển thị tên tác giả cho bài đăng theo đúng yêu cầu ghi nguồn;</li><li>Tiếp nhận, xử lý báo cáo, khiếu nại, góp ý;</li><li>Bảo đảm an ninh, phòng chống gian lận, vi phạm bản quyền và tuân thủ nghĩa vụ pháp lý.</li></ul>
<p>Cơ sở xử lý: sự đồng ý của bạn (khi đăng nhập và tích chọn đồng ý), việc thực hiện dịch vụ bạn yêu cầu, và nghĩa vụ pháp lý. Chúng tôi không sử dụng dữ liệu của bạn cho quảng cáo và <b>không bán dữ liệu cá nhân</b>.</p>

<h2>4. Chia sẻ dữ liệu</h2>
<p>Dữ liệu chỉ được chia sẻ với: (a) nhà cung cấp dịch vụ kỹ thuật cần thiết để vận hành (Google LLC – Firebase Authentication/Firestore; GitHub – lưu trữ trang; jsDelivr – phân phối thư viện; Google Fonts – phông chữ; dịch vụ dịch máy MyMemory hoặc nhà cung cấp mô hình AI dùng cho máy chủ dịch nếu được bật), theo điều khoản bảo mật của họ; (b) Giáo viên của lớp bạn tham gia (thấy bạn là thành viên lớp); (c) cơ quan nhà nước có thẩm quyền khi có yêu cầu hợp pháp. Tên tác giả bạn nhập khi đăng bài công khai sẽ hiển thị công khai.</p>

<h2>5. Chuyển dữ liệu ra nước ngoài</h2>
<p>Máy chủ của Google Firebase và các nhà cung cấp hạ tầng có thể đặt ngoài lãnh thổ Việt Nam. Bằng việc sử dụng Trang web, bạn được thông báo và đồng ý với việc dữ liệu được chuyển và lưu trữ ở nước ngoài; chúng tôi thực hiện các thủ tục, hồ sơ đánh giá tác động theo quy định pháp luật Việt Nam khi thuộc trường hợp phải thực hiện.</p>

<h2>6. Thời gian lưu trữ</h2>
<p>Dữ liệu tài khoản và nội dung được lưu đến khi bạn xoá hoặc yêu cầu xoá tài khoản; báo cáo/khiếu nại được lưu tối đa 24 tháng để giải quyết tranh chấp; dữ liệu trên trình duyệt tồn tại đến khi bạn xoá (nút "Xoá dữ liệu học tập" hoặc xoá dữ liệu trình duyệt).</p>

<h2>7. Quyền của bạn</h2>
<p>Bạn có quyền: được biết; đồng ý hoặc không đồng ý; truy cập; chỉnh sửa; rút lại sự đồng ý; xoá dữ liệu; hạn chế xử lý; yêu cầu cung cấp dữ liệu; phản đối xử lý; khiếu nại, tố cáo, khởi kiện; yêu cầu bồi thường thiệt hại theo quy định. Bạn có thể tự xoá tài khoản tại trang Hồ sơ, hoặc gửi yêu cầu tới ${MAIL}. Chúng tôi phản hồi trong vòng tối đa 72 giờ và xử lý trong thời hạn luật định.</p>

<h2>8. Trẻ em</h2>
<p>Trang web không chủ đích thu thập dữ liệu của trẻ em dưới 16 tuổi khi không có sự đồng ý của cha mẹ/người giám hộ. Đối với trẻ em từ đủ 07 tuổi, việc xử lý cần có sự đồng ý của cả trẻ và cha mẹ/người giám hộ theo quy định. Nếu phát hiện dữ liệu được cung cấp trái quy định, vui lòng liên hệ để chúng tôi xoá.</p>

<h2>9. Bảo mật</h2>
<p>Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp: kết nối mã hoá HTTPS; xác thực qua Google; phân quyền truy cập trên máy chủ (Firestore Security Rules); nguyên tắc tối thiểu hoá dữ liệu. Tuy nhiên không có hệ thống nào an toàn tuyệt đối; bạn cũng cần bảo vệ thiết bị và tài khoản Google của mình.</p>

<h2>10. Sự cố dữ liệu</h2>
<p>Khi xảy ra vi phạm dữ liệu cá nhân, chúng tôi sẽ thông báo cho cơ quan có thẩm quyền và người dùng bị ảnh hưởng trong thời hạn luật định (không quá 72 giờ kể từ khi phát hiện, nếu pháp luật yêu cầu).</p>

<h2>11. Phát âm và dịch vụ trình duyệt</h2>
<p>Chức năng phát âm sử dụng công nghệ tổng hợp giọng nói có sẵn trong trình duyệt/hệ điều hành của bạn; văn bản tiếng Trung có thể được trình duyệt xử lý theo chính sách của nhà cung cấp trình duyệt. Thứ tự nét chữ được tải từ jsDelivr. Chúng tôi không ghi âm giọng nói của bạn.</p>

<h2>12. Thay đổi chính sách</h2>
<p>Chính sách có thể được cập nhật; ngày hiệu lực được ghi ở đầu trang. Thay đổi quan trọng sẽ được thông báo trên Trang web.</p>

<h2>13. Liên hệ</h2>
<p>Mọi yêu cầu về dữ liệu cá nhân: ${MAIL} — ${PH}</p>`,
      en: `
<h1>Privacy Policy</h1>
<p class="muted">Effective ${DATE}</p>
<p>Hanry Academy respects your privacy and processes personal data in accordance with Vietnam's Personal Data Protection Law, Decree 13/2023/ND-CP and the Cybersecurity Law, and respects corresponding principles of Taiwan's Personal Data Protection Act and the EU GDPR for users in those regions.</p>
<h2>1. Controller</h2><p>Hanry Academy (${MAIL}; ${PH}).</p>
<h2>2. Data we collect</h2><ul><li><b>Account data</b>: Gmail address, display name, Google profile photo, user ID, role — stored in Google Firebase.</li><li><b>Content you create</b>: lessons, classes, class codes, class membership, reports — Google Firebase.</li><li><b>Access data</b>: Gmail addresses authorized for licensed material, used teacher keys — Google Firebase.</li><li><b>Text to translate</b>: sentences you hover, content you translate and search terms are sent to the translation service (MyMemory by Translated S.r.l., Italy, or Hanry Academy's AI translation server if enabled) only to return a translation; results are cached in your browser.</li><li><b>Interactions</b>: comments and likes — Google Firebase.</li><li><b>Learning data</b>: posts read, course progress, notebook, search history, settings — <b>only in your browser</b> (localStorage).</li><li><b>Technical data</b>: IP address, browser type, access logs automatically recorded by infrastructure providers (GitHub Pages, Google, jsDelivr).</li></ul><p>We do not collect sensitive data or payment information and use no advertising cookies or trackers.</p>
<h2>3. Purposes and legal basis</h2><p>Account management and authentication; providing learning, class, posting, teacher and licensed-material features; displaying author names; handling reports and complaints; security, fraud and copyright-infringement prevention; legal compliance. Legal bases: your consent, performance of the service you request, and legal obligations. <b>We never sell personal data</b> or use it for advertising.</p>
<h2>4. Sharing</h2><p>Only with: (a) technical providers needed to operate the Site (Google Firebase, GitHub, jsDelivr, Google Fonts, the MyMemory translation service or the AI model provider behind our translation server if enabled) under their privacy terms; (b) the teacher of a class you join; (c) competent authorities upon lawful request. Author names on public posts are public.</p>
<h2>5. International transfers</h2><p>Provider servers may be located outside Vietnam. By using the Site you are informed of and consent to such transfers; we carry out any impact-assessment filings required by Vietnamese law.</p>
<h2>6. Retention</h2><p>Account data and content until you delete your account; reports up to 24 months; browser data until you clear it.</p>
<h2>7. Your rights</h2><p>You have the rights to be informed, consent or refuse, access, rectify, withdraw consent, erase, restrict processing, obtain your data, object, complain, sue and claim compensation as provided by law. Delete your account from your Profile or email ${MAIL}. We respond within 72 hours.</p>
<h2>8. Children</h2><p>We do not knowingly collect data from children under 16 without parental/guardian consent. Contact us to remove such data.</p>
<h2>9. Security</h2><p>HTTPS encryption, Google authentication, server-side access rules (Firestore Security Rules), and data minimization. No system is perfectly secure; please protect your devices and Google account.</p>
<h2>10. Data breaches</h2><p>We will notify authorities and affected users within legal deadlines (no later than 72 hours where required).</p>
<h2>11. Browser speech</h2><p>Pronunciation uses your browser/OS speech synthesis; stroke data is loaded from jsDelivr.</p>
<h2>12. Changes</h2><p>We may update this policy; the effective date appears above.</p>
<h2>13. Contact</h2><p>${MAIL} — ${PH}</p>`
    },
    copyright: {
      vi: `
<h1>Chính sách Bản quyền &amp; Nội dung</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<h2>1. Cam kết tôn trọng bản quyền</h2>
<p>Hanry Academy tôn trọng quyền tác giả và quyền sở hữu trí tuệ theo Luật Sở hữu trí tuệ Việt Nam, Công ước Berne và các điều ước quốc tế mà Việt Nam là thành viên. Các bài đọc mẫu và khoá học phát âm có sẵn trên Trang web do Hanry Academy tự biên soạn. Dữ liệu từ điển được sử dụng theo giấy phép mở và ghi công đầy đủ: CVDICT (Phong Phan), CC-CEDICT (MDBG) – CC BY-SA 4.0; Unicode Unihan – Unicode License.</p>

<h2>2. Quy tắc đăng nội dung</h2>
<ul>
<li><b>Bắt buộc</b> ghi tên tác giả thật hoặc bút danh của người biên soạn.</li>
<li><b>Bắt buộc</b> chọn đúng nguồn gốc: <i>Tự biên soạn</i> (bạn là tác giả), <i>Sưu tầm</i> (có ghi rõ nơi sưu tầm và bảo đảm đã được phép hoặc thuộc phạm vi được sử dụng tự do), <i>Trích nguồn</i> (ghi cụ thể sách, trang, website, tác giả gốc).</li>
<li>Không đăng nguyên văn hoặc phần lớn nội dung sách, giáo trình, đề thi, bài báo có bản quyền khi chưa có văn bản cho phép của chủ sở hữu quyền.</li>
<li>Trích dẫn để giảng dạy phải hợp lý, không làm sai ý tác giả, không thay thế việc mua/sử dụng tác phẩm gốc, ghi rõ nguồn.</li>
<li>Không đăng hình ảnh, âm thanh, video của người khác khi chưa được phép; không đăng dữ liệu cá nhân của người khác.</li>
<li>Nội dung phải phù hợp thuần phong mỹ tục, không vi phạm pháp luật và <a href="#/legal/terms">Điều khoản sử dụng</a>.</li>
</ul>

<h2>3. Tài liệu bản quyền hạn chế (khu vực sách)</h2>
<p>Khu vực "Sách bản quyền" chỉ hiển thị cho tài khoản Gmail được Quản trị viên cấp quyền, với điều kiện chủ sở hữu quyền đã cho phép hoặc Hanry Academy có quyền hợp pháp. Tệp sách lớn được lưu trên Google Drive với chế độ chia sẻ hạn chế theo từng Gmail. Người được cấp quyền <b>không được</b> sao chép, tải xuống, chụp/quay màn hình, in ấn để phân phối, chia sẻ đường dẫn hoặc tài khoản. Mọi vi phạm sẽ bị thu hồi quyền ngay lập tức và có thể bị xử lý theo pháp luật.</p>

<h2>4. Quy trình thông báo và gỡ bỏ (khiếu nại bản quyền)</h2>
<p>Nếu bạn là chủ sở hữu quyền (hoặc người được uỷ quyền) và cho rằng nội dung trên Trang web xâm phạm quyền của bạn, vui lòng gửi thông báo tới ${MAIL} hoặc qua <a href="#/feedback/copyright">biểu mẫu khiếu nại bản quyền</a>, bao gồm:</p>
<ol>
<li>Họ tên, địa chỉ, email, số điện thoại của người khiếu nại;</li>
<li>Mô tả tác phẩm bị xâm phạm và tài liệu chứng minh quyền (giấy chứng nhận đăng ký quyền tác giả, hợp đồng, bản gốc… nếu có);</li>
<li>Đường dẫn chính xác tới nội dung bị cho là vi phạm;</li>
<li>Cam đoan rằng thông tin là chính xác và bạn là chủ sở hữu quyền hoặc được uỷ quyền hợp pháp;</li>
<li>Chữ ký (có thể là chữ ký điện tử hoặc họ tên đầy đủ).</li>
</ol>
<p><b>Xử lý:</b> Chúng tôi xác nhận đã nhận trong vòng 24 giờ, tạm ẩn nội dung có dấu hiệu vi phạm rõ ràng trong vòng 24–72 giờ, thông báo cho người đăng. Người đăng có quyền gửi phản hồi kèm bằng chứng trong 07 ngày. Chúng tôi quyết định khôi phục hoặc gỡ bỏ vĩnh viễn dựa trên chứng cứ, hoặc theo quyết định của cơ quan có thẩm quyền.</p>
<p><b>Vi phạm nhiều lần:</b> tài khoản vi phạm bản quyền từ 02 lần trở lên có thể bị khoá vĩnh viễn.</p>
<p>Khiếu nại sai sự thật, nhằm mục đích cạnh tranh không lành mạnh hoặc quấy rối có thể phải chịu trách nhiệm pháp lý.</p>

<h2>5. Báo cáo nội dung vi phạm khác</h2>
<p>Bấm nút 🚩 trên mỗi bài đăng hoặc gửi qua trang <a href="#/feedback/content">Góp ý &amp; Báo cáo</a>. Nội dung vi phạm pháp luật nghiêm trọng sẽ được gỡ bỏ ngay khi phát hiện và có thể được cung cấp cho cơ quan chức năng theo quy định.</p>

<h2>6. Thương hiệu</h2>
<p>Tên "Hanry Academy", logo và nhận diện là tài sản của Hanry Academy. Không sử dụng khi chưa được phép. Tên các kỳ thi, giáo trình, thương hiệu của bên thứ ba (nếu được nhắc đến) thuộc về chủ sở hữu tương ứng.</p>`,
      en: `
<h1>Copyright &amp; Content Policy</h1>
<p class="muted">Effective ${DATE}</p>
<h2>1. Respect for copyright</h2><p>Hanry Academy respects copyright under Vietnamese IP law, the Berne Convention and international treaties. The built-in sample readings and phonetics course are written by Hanry Academy. Dictionary data is used under open licenses with attribution: CVDICT (Phong Phan), CC-CEDICT (MDBG) – CC BY-SA 4.0; Unicode Unihan – Unicode License.</p>
<h2>2. Posting rules</h2><ul><li>You <b>must</b> state the real name or pen name of the author.</li><li>You <b>must</b> choose the correct origin: <i>Original</i>, <i>Collected</i> (state where, and ensure permission or free-use status), or <i>Cited source</i> (book, page, website, original author).</li><li>Do not post all or most of copyrighted books, textbooks, exams or articles without written permission.</li><li>Teaching quotations must be reasonable, faithful, credited and must not substitute for the original work.</li><li>Do not post others' images, audio, video or personal data without permission.</li><li>Content must comply with the law and our <a href="#/legal/terms">Terms</a>.</li></ul>
<h2>3. Restricted licensed material</h2><p>The "Licensed books" area is shown only to Gmail accounts authorized by an Administrator, where the rights holder has permitted it or Hanry Academy holds lawful rights. Large files are hosted on Google Drive with restricted, per-Gmail sharing. Authorized users must <b>not</b> copy, download, screenshot/record, print for distribution, or share links or accounts. Violations result in immediate revocation and possible legal action.</p>
<h2>4. Notice and takedown</h2><p>Rights holders (or authorized agents) may send a notice to ${MAIL} or via the <a href="#/feedback/copyright">copyright complaint form</a> including: (1) name, address, email, phone; (2) description of the work and proof of rights; (3) exact URL of the allegedly infringing content; (4) a statement that the information is accurate and you are the rights holder or authorized; (5) signature (electronic signature or full name). We acknowledge within 24 hours, disable clearly infringing content within 24–72 hours and notify the poster, who may respond with evidence within 7 days. We then restore or permanently remove the content based on evidence or decisions of competent authorities. Repeat infringers (2+ violations) may be permanently banned. False or abusive notices may carry legal liability.</p>
<h2>5. Other reports</h2><p>Use the 🚩 button on any post or the <a href="#/feedback/content">Feedback &amp; Report</a> page.</p>
<h2>6. Trademarks</h2><p>"Hanry Academy", its logo and branding belong to Hanry Academy. Third-party exam names, textbooks and brands mentioned belong to their owners.</p>`
    },
    cookies: {
      vi: `
<h1>Chính sách Cookie &amp; Lưu trữ</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<p>Trang web <b>không sử dụng cookie quảng cáo hay cookie theo dõi của bên thứ ba</b>. Chúng tôi dùng bộ nhớ trình duyệt (localStorage) để Trang web hoạt động:</p>
<table class="tbl"><tr><th>Khoá</th><th>Mục đích</th></tr>
<tr><td>ha_settings</td><td>Ngôn ngữ, giản/phồn thể, pinyin/zhuyin, chế độ tối, tốc độ đọc</td></tr>
<tr><td>ha_data_*</td><td>Bài đã đọc, tiến độ lộ trình, sổ tay từ vựng, lịch sử tra từ</td></tr>
<tr><td>ha_mt_cache</td><td>Lưu đệm kết quả dịch máy để không phải dịch lại</td></tr>
<tr><td>ha_consent</td><td>Ghi nhận việc bạn đồng ý Điều khoản</td></tr>
<tr><td>ha_session, ha_db</td><td>Chỉ ở chế độ cục bộ (thử nghiệm): phiên đăng nhập và dữ liệu demo</td></tr>
</table>
<p>Khi đăng nhập Google, Google Firebase có thể lưu dữ liệu phiên (IndexedDB/cookie bắt buộc) để duy trì đăng nhập. Phông chữ Google Fonts và thư viện jsDelivr có thể ghi nhận địa chỉ IP theo chính sách của họ.</p>
<p>Bạn có thể xoá toàn bộ dữ liệu này bất kỳ lúc nào trong cài đặt trình duyệt hoặc nút "Xoá dữ liệu học tập" trong trang Hồ sơ.</p>`,
      en: `
<h1>Cookie &amp; Storage Policy</h1>
<p class="muted">Effective ${DATE}</p>
<p>We use <b>no advertising or third-party tracking cookies</b>. Browser storage (localStorage) is used for: <b>ha_settings</b> (language, script, phonetics, dark mode, speech rate); <b>ha_data_*</b> (posts read, course progress, notebook, history); <b>ha_mt_cache</b> (cached machine translations); <b>ha_consent</b> (terms acceptance); <b>ha_session, ha_db</b> (local demo mode only). Google Firebase may store essential session data to keep you signed in. Google Fonts and jsDelivr may log IP addresses under their own policies. You can clear this data anytime in your browser settings or with "Clear local learning data" on your Profile.</p>`
    }
  };

  DOCS.rights = { vi: `
<h1>Quyền lợi người dùng</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<p>Trang này tóm tắt những gì bạn <b>được hưởng</b> khi dùng Hanry Academy và những gì Hanry Academy <b>cam kết</b> với bạn. Trang này là một phần của <a href="#/legal/terms">Điều khoản sử dụng</a> và <a href="#/legal/privacy">Chính sách bảo mật</a>; nếu có điểm nào có lợi hơn cho bạn thì áp dụng điểm có lợi hơn.</p>

<h2>1. Quyền sử dụng dịch vụ</h2>
<ul><li>Đọc bài, tra từ, dịch câu, lưu sổ tay, luyện tập và tham gia lớp học <b>miễn phí</b>.</li>
<li>Nếu sau này có chức năng thu phí, chúng tôi sẽ thông báo rõ giá, phạm vi <b>trước ít nhất 30 ngày</b>; không tự động trừ tiền khi bạn chưa đồng ý; các chức năng miễn phí bạn đang dùng không bị thu hồi mà không báo trước.</li>
<li>Được thông báo trước ít nhất 07 ngày khi Điều khoản thay đổi quan trọng; nếu không đồng ý, bạn có quyền ngừng sử dụng và xoá tài khoản.</li></ul>

<h2>2. Quyền đối với nội dung của bạn</h2>
<ul><li>Bạn <b>giữ quyền tác giả</b> với bài viết, bình luận của mình. Hanry Academy chỉ được hiển thị trong phạm vi bạn chọn (công khai / lớp học / cá nhân).</li>
<li>Được sửa, đổi phạm vi hiển thị hoặc xoá nội dung của mình bất kỳ lúc nào.</li>
<li>Khi nội dung bị ẩn/gỡ, bạn được thông báo lý do (trừ khi pháp luật cấm), được gửi giải trình kèm bằng chứng trong <b>07 ngày</b> và được xem xét lại.</li></ul>

<h2>3. Quyền đối với dữ liệu cá nhân</h2>
<p>Theo Luật Bảo vệ dữ liệu cá nhân và Nghị định 13/2023/NĐ-CP, bạn có quyền:</p>
<ol><li>Được biết dữ liệu nào được thu thập, vì sao và lưu ở đâu;</li><li>Đồng ý hoặc không đồng ý; <b>rút lại sự đồng ý</b> bất kỳ lúc nào;</li><li>Truy cập, xem và <b>tải về</b> dữ liệu của mình (nút "Tải dữ liệu của tôi" ở trang Hồ sơ);</li><li>Yêu cầu chỉnh sửa dữ liệu sai;</li><li><b>Xoá</b> dữ liệu và tài khoản (nút "Xoá tài khoản" ở trang Hồ sơ);</li><li>Yêu cầu hạn chế xử lý hoặc phản đối xử lý;</li><li>Khiếu nại, tố cáo, khởi kiện và yêu cầu bồi thường thiệt hại theo quy định pháp luật;</li><li>Tự bảo vệ theo quy định của pháp luật.</li></ol>
<p>Cách thực hiện: dùng các nút ở trang Hồ sơ, hoặc gửi email tới ${MAIL} (tiêu đề "[Dữ liệu cá nhân]"). Chúng tôi xác nhận đã nhận trong <b>72 giờ</b> và giải quyết trong thời hạn pháp luật quy định. Chúng tôi có thể đề nghị xác minh bạn là chủ tài khoản trước khi xử lý.</p>

<h2>4. Cam kết của Hanry Academy</h2>
<ul><li><b>Không bán</b> dữ liệu cá nhân; không dùng dữ liệu của bạn cho quảng cáo nhắm mục tiêu; không dùng cookie theo dõi quảng cáo.</li>
<li>Chỉ thu thập dữ liệu tối thiểu cần cho chức năng bạn dùng; dữ liệu học tập (sổ tay, tiến độ) mặc định chỉ lưu trên thiết bị của bạn.</li>
<li>Bảo mật bằng HTTPS, đăng nhập Google, phân quyền trên máy chủ; thông báo sự cố lộ lọt dữ liệu cho bạn và cơ quan có thẩm quyền trong thời hạn luật định (không quá 72 giờ khi pháp luật yêu cầu).</li>
<li>Minh bạch về dịch máy/AI: luôn ghi rõ nội dung nào do máy dịch, không trình bày bản dịch máy như bản dịch chuyên gia.</li>
<li>Ghi công tác giả và nguồn cho mọi bài đăng; xử lý khiếu nại bản quyền theo quy trình công khai.</li>
<li>Đối xử bình đẳng, không phân biệt người dùng theo dân tộc, giới tính, tôn giáo, quốc tịch, khuyết tật.</li></ul>

<h2>5. Quyền được an toàn</h2>
<ul><li>Được báo cáo (nút 🚩) bài viết, bình luận quấy rối, xúc phạm, lừa đảo, vi phạm bản quyền; báo cáo được xem xét ưu tiên trong 24–72 giờ.</li>
<li>Thông tin người báo cáo được giữ kín với người bị báo cáo, trừ khi pháp luật yêu cầu.</li>
<li>Trẻ em dưới 16 tuổi được bảo vệ đặc biệt: cha mẹ/người giám hộ có quyền yêu cầu xem, sửa, xoá dữ liệu của trẻ.</li></ul>

<h2>6. Quyền của học viên và giáo viên trong lớp học</h2>
<ul><li>Học viên được rời lớp bất kỳ lúc nào; giáo viên chỉ thấy tên hiển thị và việc bạn là thành viên lớp, không thấy email hay dữ liệu học tập riêng của bạn.</li>
<li>Giáo viên giữ quyền tác giả với bài đăng trong lớp và tự quyết định phạm vi chia sẻ.</li></ul>

<h2>7. Quyền đối với tài liệu bản quyền được cấp phép</h2>
<p>Người được cấp quyền được đọc tài liệu cho mục đích học tập cá nhân trong thời gian được cấp. Khi quyền bị thu hồi, chúng tôi sẽ thông báo qua email (trừ trường hợp vi phạm nghiêm trọng).</p>

<h2>8. Giải quyết khiếu nại</h2>
<p>Mọi khiếu nại gửi qua <a href="#/feedback">Góp ý &amp; Báo cáo</a> hoặc ${MAIL}, ${PH}. Chúng tôi phản hồi trong 1–3 ngày làm việc. Nếu không đồng ý với kết quả, bạn có quyền yêu cầu cơ quan nhà nước có thẩm quyền giải quyết theo pháp luật Việt Nam, bao gồm Luật Bảo vệ quyền lợi người tiêu dùng 2023.</p>`, en: `
<h1>User rights</h1>
<p class="muted">Effective ${DATE}</p>
<p>This page summarizes what you are entitled to and what Hanry Academy commits to. It is part of the <a href="#/legal/terms">Terms</a> and <a href="#/legal/privacy">Privacy Policy</a>; where it is more favorable to you, it prevails.</p>
<h2>1. Using the service</h2><ul><li>Reading, word lookup, sentence translation, notebook, practice and classes are <b>free</b>.</li><li>Any future paid feature will be announced with price and scope <b>at least 30 days</b> in advance; you will never be charged without consent.</li><li>Material changes to the Terms are announced at least 7 days ahead; you may stop using the Site and delete your account.</li></ul>
<h2>2. Your content</h2><ul><li>You <b>keep authorship</b> of your posts and comments; we display them only within the visibility you choose.</li><li>You may edit, change visibility or delete your content at any time.</li><li>If content is hidden or removed, you are told why (unless the law forbids it), may respond with evidence within <b>7 days</b>, and get a review.</li></ul>
<h2>3. Your personal data</h2><p>You may: be informed; consent or refuse and <b>withdraw consent</b> at any time; access and <b>download</b> your data (Profile → Download my data); correct it; <b>delete</b> it and your account (Profile → Delete account); restrict or object to processing; complain, sue and claim compensation under the law. Email ${MAIL} with subject "[Personal data]". We acknowledge within <b>72 hours</b> and resolve within legal deadlines.</p>
<h2>4. Our commitments</h2><ul><li>We <b>never sell</b> personal data and do not use it for targeted advertising or tracking cookies.</li><li>We collect the minimum data needed; learning data stays on your device by default.</li><li>HTTPS, Google sign-in, server-side access rules; breach notification within legal deadlines (72 hours where required).</li><li>Machine/AI translations are always labeled and never presented as professional translations.</li><li>Authors and sources are credited on every post; copyright complaints follow a public procedure.</li><li>Equal treatment of all users.</li></ul>
<h2>5. Safety</h2><ul><li>Report harassment, abuse, fraud or infringement with 🚩; reports are prioritized within 24–72 hours.</li><li>Reporter identities are kept confidential unless the law requires otherwise.</li><li>Children under 16 receive extra protection; parents/guardians may view, correct or delete their data.</li></ul>
<h2>6. Classes</h2><ul><li>Students may leave a class at any time; teachers see only your display name and membership, not your email or private learning data.</li><li>Teachers keep authorship of class posts.</li></ul>
<h2>7. Licensed material</h2><p>Authorized users may read licensed material for personal study during the granted period; revocation is notified by email except for serious violations.</p>
<h2>8. Complaints</h2><p>Use <a href="#/feedback">Feedback &amp; Report</a> or ${MAIL}, ${PH}. We reply within 1–3 business days. You may also refer disputes to competent Vietnamese authorities, including under the 2023 Consumer Protection Law.</p>` };
  DOCS.community = { vi: `
<h1>Quy tắc cộng đồng</h1>
<p class="muted">Có hiệu lực từ ngày ${DATE}</p>
<p>Hanry Academy là nơi mọi người cùng chia sẻ bài đọc, bài học và giúp nhau học tốt hơn. Để cộng đồng an toàn và hữu ích, mọi bài viết và bình luận cần tuân thủ các quy tắc sau.</p>
<h2>1. Nên làm</h2>
<ul><li>Chia sẻ bài đọc, hội thoại, bài giảng có giá trị học tập; ghi đúng tác giả và nguồn.</li><li>Chọn đúng môn học, trình độ; kiểm tra lại bản dịch máy trước khi đăng.</li><li>Góp ý lịch sự, mang tính xây dựng; tôn trọng người mới học.</li></ul>
<h2>2. Không được đăng</h2>
<ol><li>Nội dung vi phạm bản quyền: chép nguyên sách, giáo trình, đề thi, bài báo khi chưa được phép; chia sẻ link tải lậu.</li>
<li>Nội dung vi phạm pháp luật Việt Nam, trong đó có các nội dung bị cấm theo Điều 8 Luật An ninh mạng 2018: chống Nhà nước, xuyên tạc lịch sử, kích động bạo lực, khủng bố, chia rẽ dân tộc, tôn giáo.</li>
<li>Khiêu dâm, đồi trụy, nội dung bóc lột hoặc gây hại trẻ em (sẽ được báo cho cơ quan chức năng).</li>
<li>Xúc phạm, bắt nạt, quấy rối, đe doạ, phân biệt đối xử; tiết lộ thông tin cá nhân của người khác.</li>
<li>Tin giả, lừa đảo, mạo danh người khác hoặc mạo danh Hanry Academy.</li>
<li>Quảng cáo, spam, đường link độc hại, kinh doanh đa cấp, cờ bạc.</li>
<li>Mã độc, hướng dẫn tấn công hệ thống (bài lập trình chỉ được chia sẻ cho mục đích học tập hợp pháp).</li></ol>
<h2>3. Xử lý vi phạm</h2>
<p>Tuỳ mức độ: (1) nhắc nhở; (2) ẩn hoặc gỡ nội dung; (3) tạm khoá chức năng đăng/bình luận 7–30 ngày; (4) khoá tài khoản vĩnh viễn; (5) chuyển thông tin cho cơ quan có thẩm quyền khi có dấu hiệu vi phạm pháp luật. Vi phạm nghiêm trọng (nội dung bị cấm ở mục 2.2, 2.3) bị gỡ ngay và có thể khoá tài khoản ngay.</p>
<h2>4. Khiếu nại quyết định</h2>
<p>Nếu cho rằng nội dung của bạn bị gỡ nhầm, gửi giải trình qua <a href="#/feedback">Góp ý &amp; Báo cáo</a> trong vòng 07 ngày. Chúng tôi xem xét lại và trả lời trong 1–3 ngày làm việc.</p>
<h2>5. Báo cáo</h2>
<p>Bấm 🚩 trên bài viết hoặc bình luận. Người báo cáo được giữ kín danh tính.</p>`, en: `
<h1>Community rules</h1>
<p class="muted">Effective ${DATE}</p>
<p>Hanry Academy is a place to share readings and lessons and help each other learn. All posts and comments must follow these rules.</p>
<h2>1. Do</h2><ul><li>Share content with learning value; credit the author and source.</li><li>Pick the right subject and level; check machine translations before posting.</li><li>Give polite, constructive feedback; respect beginners.</li></ul>
<h2>2. Do not post</h2><ol><li>Copyright-infringing material (whole books, textbooks, exams, articles without permission; pirated download links).</li><li>Content illegal under Vietnamese law, including content prohibited by Article 8 of the 2018 Cybersecurity Law.</li><li>Pornography or anything exploiting or harming children (reported to authorities).</li><li>Insults, bullying, harassment, threats, discrimination; doxxing.</li><li>Misinformation, scams, impersonation of others or of Hanry Academy.</li><li>Advertising, spam, malicious links, pyramid schemes, gambling.</li><li>Malware or attack instructions (programming posts must serve lawful learning).</li></ol>
<h2>3. Enforcement</h2><p>Warning; hiding/removal; 7–30 day posting/commenting suspension; permanent ban; referral to authorities where the law is broken. Severe violations (2.2, 2.3) are removed immediately.</p>
<h2>4. Appeals</h2><p>Appeal within 7 days via <a href="#/feedback">Feedback &amp; Report</a>; we review and reply within 1–3 business days.</p>
<h2>5. Reporting</h2><p>Use 🚩 on posts or comments. Reporters stay anonymous.</p>` };

  HA.route(/^\/legal\/(\w+)$/, function (doc) {
    const d = DOCS[doc];
    if (!d) { location.hash = '#/legal/terms'; return; }
    const lang = HA.state.settings.lang;
    const body = lang === 'vi' ? d.vi : '<p class="note">' + HA.t('legalNotice') + ' <a href="#" id="showVi">Tiếng Việt</a></p>' + d.en;
    const tabs = [['terms', 'navTerms'], ['privacy', 'navPrivacy'], ['rights', 'navRights'], ['community', 'navCommunityRules'], ['copyright', 'navCopyright'], ['cookies', 'navCookies']];
    document.getElementById('view').innerHTML = '<div class="tabs small">' + tabs.map(([k, n]) => '<a href="#/legal/' + k + '" class="' + (k === doc ? 'on' : '') + '">' + HA.t(n) + '</a>').join('') + '</div><article class="card legal">' + body + '</article>';
    const sv = document.getElementById('showVi');
    if (sv) sv.onclick = (e) => { e.preventDefault(); document.querySelector('.legal').innerHTML = d.vi; };
  });
})();
