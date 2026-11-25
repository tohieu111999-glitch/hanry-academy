/* HSK 1 — Hanry Academy original lessons */
HA.L({
  id: '1-1', lv: 1, emoji: '👋', kind: 'd',
  t: '你好！|Xin chào!|Hello!',
  d: 'Chào hỏi, giới thiệu tên và nghề nghiệp|Greetings, names and occupations',
  text: `
王明|你好！|Xin chào!|Hello!
安娜|你好！你叫什么名字？|Xin chào! Bạn tên là gì?|Hello! What is your name?
王明|我叫王明。你呢？|Tôi tên là Vương Minh. Còn bạn?|My name is Wang Ming. And you?
安娜|我叫安娜。你是老师吗？|Tôi tên là Anna. Bạn là giáo viên phải không?|My name is Anna. Are you a teacher?
王明|不是，我是学生。你也是学生吗？|Không phải, tôi là học sinh. Bạn cũng là học sinh à?|No, I'm a student. Are you a student too?
安娜|是，我也是学生。认识你很高兴！|Đúng, tôi cũng là học sinh. Rất vui được làm quen với bạn!|Yes, I'm a student too. Nice to meet you!
王明|认识你，我也很高兴。再见！|Làm quen với bạn, tôi cũng rất vui. Tạm biệt!|I'm glad to meet you too. Goodbye!
安娜|再见！|Tạm biệt!|Goodbye!`,
  v: `
你好|nǐ hǎo|phr|xin chào|hello|nhĩ hảo|你好，我叫安娜。|Xin chào, tôi tên là Anna.|您好|再见
我|wǒ|pron|tôi, mình|I, me|ngã|我是学生。|Tôi là học sinh.||
你|nǐ|pron|bạn, cậu, anh, chị|you|nhĩ|你是老师吗？|Bạn là giáo viên phải không?|您|
叫|jiào|v|gọi, tên là|to be called|khiếu|我叫王明。|Tôi tên là Vương Minh.||
什么|shénme|pron|cái gì, gì|what|thập ma|你叫什么名字？|Bạn tên là gì?||
名字|míngzi|n|tên|name|danh tự|她的名字很好听。|Tên của cô ấy rất hay.||
是|shì|v|là|to be|thị|我是越南人。|Tôi là người Việt Nam.||
老师|lǎoshī|n|giáo viên, thầy cô|teacher|lão sư|王老师很好。|Thầy Vương rất tốt.|教师|学生
学生|xuésheng|n|học sinh, sinh viên|student|học sinh|我们都是学生。|Chúng tôi đều là học sinh.||老师
吗|ma|part|(trợ từ nghi vấn) …không?|question particle|ma|你好吗？|Bạn khỏe không?||
不|bù|adv|không|not, no|bất|我不是老师。|Tôi không phải giáo viên.|没|
也|yě|adv|cũng|also, too|dã|我也是学生。|Tôi cũng là học sinh.||
认识|rènshi|v|quen biết, làm quen|to know (a person), to meet|nhận thức|认识你很高兴。|Rất vui được làm quen với bạn.||
高兴|gāoxìng|adj|vui, vui mừng|happy, glad|cao hứng|今天我很高兴。|Hôm nay tôi rất vui.|快乐,开心|难过
再见|zàijiàn|phr|tạm biệt|goodbye|tái kiến|老师，再见！|Tạm biệt thầy!|拜拜|你好`,
  g: [
    ['Câu hỏi với 吗', 'Yes/no questions with 吗', 'Câu trần thuật + 吗？',
      'Thêm 吗 vào cuối câu trần thuật để tạo câu hỏi có/không. Trật tự từ không thay đổi.',
      'Add 吗 at the end of a statement to make a yes/no question. Word order does not change.',
      ['你是学生吗？', 'Bạn là học sinh phải không?', 'Are you a student?'],
      ['他是老师吗？', 'Anh ấy là giáo viên phải không?', 'Is he a teacher?']],
    ['Phủ định với 不', 'Negation with 不', 'Chủ ngữ + 不 + 是/động từ/tính từ',
      '不 đứng trước động từ hoặc tính từ để phủ định. Lưu ý: 不 đọc thành bú khi đứng trước thanh 4 (不是 bú shì).',
      '不 goes before a verb or adjective to negate it. Note: 不 becomes bú before a 4th tone (不是 bú shì).',
      ['我不是老师。', 'Tôi không phải giáo viên.', 'I am not a teacher.'],
      ['她不叫安娜。', 'Cô ấy không tên là Anna.', 'She is not called Anna.']],
    ['Câu hỏi tỉnh lược với 呢', 'Follow-up questions with 呢', 'Danh từ/Đại từ + 呢？',
      '呢 dùng để hỏi lại "còn … thì sao?" khi đã có ngữ cảnh trước đó.',
      '呢 asks "and what about …?" when the context is already clear.',
      ['我叫王明，你呢？', 'Tôi tên Vương Minh, còn bạn?', 'I\'m Wang Ming, and you?']]
  ],
  q: [
    ['王明是老师吗？', 'Vương Minh là giáo viên phải không?', '*不是，他是学生。', '是，他是老师。', '他是医生。', '我们不知道。'],
    ['安娜是什么人？', 'Anna là ai (làm gì)?', '老师', '*学生', '医生', '服务员'],
    ['T', '安娜也是学生。', 'Anna cũng là học sinh.'],
    ['F', '王明认识安娜不高兴。', 'Vương Minh làm quen với Anna không vui.'],
    ['他们最后说什么？', 'Cuối cùng họ nói gì?', '你好', '谢谢', '*再见', '对不起']
  ]
});

HA.L({
  id: '1-2', lv: 1, emoji: '🌏', kind: 'd',
  t: '你是哪国人？|Bạn là người nước nào?|Where are you from?',
  d: 'Hỏi về quốc tịch và giới thiệu bạn bè|Nationalities and introducing friends',
  text: `
李月|你好！我是李月。你是哪国人？|Xin chào! Tôi là Lý Nguyệt. Bạn là người nước nào?|Hi! I'm Li Yue. Where are you from?
阮明|我是越南人。你是中国人吗？|Tôi là người Việt Nam. Bạn là người Trung Quốc phải không?|I'm Vietnamese. Are you Chinese?
李月|对，我是中国人。他是谁？|Đúng, tôi là người Trung Quốc. Anh ấy là ai?|Yes, I'm Chinese. Who is he?
阮明|他是我的朋友，他叫大卫。|Anh ấy là bạn của tôi, anh ấy tên là David.|He's my friend, his name is David.
李月|大卫是美国人吗？|David là người Mỹ phải không?|Is David American?
阮明|不是，他是英国人。他会说汉语。|Không phải, anh ấy là người Anh. Anh ấy biết nói tiếng Trung.|No, he's British. He can speak Chinese.
李月|太好了！你们都是我的新朋友。|Tuyệt quá! Các bạn đều là bạn mới của tôi.|Great! You are all my new friends.`,
  v: `
哪|nǎ|pron|nào|which|na|你是哪国人？|Bạn là người nước nào?||
国|guó|n|nước, quốc gia|country|quốc|中国很大。|Trung Quốc rất rộng lớn.||
人|rén|n|người|person, people|nhân|他是越南人。|Anh ấy là người Việt Nam.||
中国|Zhōngguó|pn|Trung Quốc|China|trung quốc|我想去中国。|Tôi muốn đi Trung Quốc.||
越南|Yuènán|pn|Việt Nam|Vietnam|việt nam|越南的咖啡很好喝。|Cà phê Việt Nam rất ngon.||
美国|Měiguó|pn|nước Mỹ|USA|mỹ quốc|她是美国人。|Cô ấy là người Mỹ.||
谁|shéi|pron|ai|who|thùy|他是谁？|Anh ấy là ai?||
的|de|part|của (trợ từ sở hữu)|possessive particle|đích|这是我的书。|Đây là sách của tôi.||
朋友|péngyou|n|bạn bè|friend|bằng hữu|他是我的好朋友。|Anh ấy là bạn tốt của tôi.||敌人
他|tā|pron|anh ấy, ông ấy|he, him|tha|他是我哥哥。|Anh ấy là anh trai tôi.||
她|tā|pron|cô ấy, bà ấy|she, her|tha|她是老师。|Cô ấy là giáo viên.||
对|duì|adj|đúng|correct, right|đối|你说得对。|Bạn nói đúng.|正确|错
会|huì|v|biết (làm gì do học)|can, know how to|hội|我会说汉语。|Tôi biết nói tiếng Trung.||
说|shuō|v|nói|to speak, to say|thuyết|请你再说一次。|Mời bạn nói lại một lần nữa.|讲|
汉语|Hànyǔ|n|tiếng Hán, tiếng Trung|Chinese language|hán ngữ|汉语不太难。|Tiếng Trung không khó lắm.|中文|
都|dōu|adv|đều|all, both|đô|我们都是学生。|Chúng tôi đều là học sinh.||`,
  g: [
    ['Câu hỏi với 哪', 'Questions with 哪', 'Chủ ngữ + 是 + 哪 + 国 + 人？',
      '哪 nghĩa là "nào", thường đi với lượng từ hoặc danh từ: 哪国 (nước nào), 哪个 (cái nào).',
      '哪 means "which", used with a measure word or noun: 哪国 (which country), 哪个 (which one).',
      ['你是哪国人？', 'Bạn là người nước nào?', 'Which country are you from?'],
      ['你喜欢哪个？', 'Bạn thích cái nào?', 'Which one do you like?']],
    ['Trợ từ sở hữu 的', 'Possessive 的', 'Danh từ/Đại từ + 的 + Danh từ',
      '的 biểu thị quan hệ sở hữu, giống "của". Với người thân thiết có thể bỏ 的: 我妈妈.',
      '的 shows possession, like "\'s". It can be dropped for close relations: 我妈妈.',
      ['这是老师的书。', 'Đây là sách của giáo viên.', 'This is the teacher\'s book.'],
      ['他是我的朋友。', 'Anh ấy là bạn của tôi.', 'He is my friend.']],
    ['Phó từ 都 và 也', 'Adverbs 都 and 也', 'Chủ ngữ + 也/都 + Động từ',
      '也 (cũng) và 都 (đều) luôn đứng trước động từ. Khi dùng cả hai: 也都.',
      '也 (also) and 都 (all) always come before the verb. Together: 也都.',
      ['我们都是越南人。', 'Chúng tôi đều là người Việt Nam.', 'We are all Vietnamese.'],
      ['他们也都会说汉语。', 'Họ cũng đều biết nói tiếng Trung.', 'They can all speak Chinese too.']]
  ],
  q: [
    ['阮明是哪国人？', 'Nguyễn Minh là người nước nào?', '中国人', '*越南人', '美国人', '英国人'],
    ['大卫是谁？', 'David là ai?', '李月的老师', '*阮明的朋友', '阮明的哥哥', '李月的同学'],
    ['T', '大卫会说汉语。', 'David biết nói tiếng Trung.'],
    ['F', '大卫是美国人。', 'David là người Mỹ.'],
    ['李月是哪国人？', 'Lý Nguyệt là người nước nào?', '*中国人', '越南人', '日本人', '英国人']
  ]
});

HA.L({
  id: '1-3', lv: 1, emoji: '👨‍👩‍👧', kind: 'p',
  t: '我的家|Gia đình tôi|My family',
  d: 'Giới thiệu các thành viên trong gia đình|Introducing family members',
  text: `
|我叫林小红，今年十岁。|Tôi tên là Lâm Tiểu Hồng, năm nay mười tuổi.|My name is Lin Xiaohong. I'm ten years old.
|我家有五口人：爸爸、妈妈、哥哥、妹妹和我。|Nhà tôi có năm người: bố, mẹ, anh trai, em gái và tôi.|There are five people in my family: dad, mom, my older brother, my younger sister and me.
|我爸爸是医生，他工作很忙。|Bố tôi là bác sĩ, công việc của bố rất bận.|My dad is a doctor; his work is very busy.
|我妈妈是汉语老师，她很漂亮。|Mẹ tôi là giáo viên tiếng Trung, mẹ rất xinh đẹp.|My mom is a Chinese teacher; she is very pretty.
|哥哥是大学生，他喜欢打篮球。|Anh trai là sinh viên đại học, anh thích chơi bóng rổ.|My brother is a university student; he likes playing basketball.
|妹妹三岁，她很可爱。|Em gái ba tuổi, em rất đáng yêu.|My sister is three; she is very cute.
|我没有姐姐，也没有弟弟。|Tôi không có chị gái, cũng không có em trai.|I don't have an older sister or a younger brother.
|我爱我的家！|Tôi yêu gia đình của tôi!|I love my family!`,
  v: `
家|jiā|n|nhà, gia đình|home, family|gia|我家在河内。|Nhà tôi ở Hà Nội.||
有|yǒu|v|có|to have, there is|hữu|我有一个妹妹。|Tôi có một em gái.||没有
口|kǒu|mw|(lượng từ cho người trong gia đình)|measure word for family members|khẩu|你家有几口人？|Nhà bạn có mấy người?||
几|jǐ|pron|mấy (số nhỏ hơn 10)|how many (small number)|kỷ|你有几个朋友？|Bạn có mấy người bạn?|多少|
爸爸|bàba|n|bố, ba|dad|ba ba|我爸爸是医生。|Bố tôi là bác sĩ.|父亲|妈妈
妈妈|māma|n|mẹ, má|mom|ma ma|妈妈做的菜很好吃。|Món mẹ nấu rất ngon.|母亲|爸爸
哥哥|gēge|n|anh trai|older brother|ca ca|我哥哥很高。|Anh trai tôi rất cao.||弟弟
妹妹|mèimei|n|em gái|younger sister|muội muội|妹妹今年三岁。|Em gái năm nay ba tuổi.||姐姐
姐姐|jiějie|n|chị gái|older sister|thư thư|我姐姐是护士。|Chị gái tôi là y tá.||妹妹
弟弟|dìdi|n|em trai|younger brother|đệ đệ|弟弟喜欢玩游戏。|Em trai thích chơi game.||哥哥
没有|méiyǒu|v|không có|not have|một hữu|我没有车。|Tôi không có xe.||有
和|hé|conj|và, với|and, with|hòa|我和妈妈去商店。|Tôi và mẹ đi cửa hàng.|跟|
医生|yīshēng|n|bác sĩ|doctor|y sinh|医生说我没事。|Bác sĩ nói tôi không sao.|大夫|病人
岁|suì|mw|tuổi|year (of age)|tuế|你几岁？|Em mấy tuổi?||
喜欢|xǐhuan|v|thích|to like|hỉ hoan|我喜欢学汉语。|Tôi thích học tiếng Trung.|爱|讨厌
爱|ài|v|yêu|to love|ái|我爱我的家。|Tôi yêu gia đình tôi.|喜欢|恨`,
  g: [
    ['Câu chữ 有 và 没有', 'Sentences with 有 / 没有', 'Chủ ngữ + 有/没有 + Tân ngữ',
      '有 nghĩa là "có". Phủ định của 有 luôn là 没有, KHÔNG dùng 不有.',
      '有 means "to have". Its negative is always 没有, never 不有.',
      ['我有一个哥哥。', 'Tôi có một người anh trai.', 'I have an older brother.'],
      ['她没有妹妹。', 'Cô ấy không có em gái.', 'She doesn\'t have a younger sister.']],
    ['Hỏi số lượng với 几', 'Asking numbers with 几', '几 + Lượng từ + Danh từ？',
      '几 dùng hỏi số lượng nhỏ (thường dưới 10), phải có lượng từ đi kèm.',
      '几 asks about small quantities (usually under 10) and needs a measure word.',
      ['你家有几口人？', 'Nhà bạn có mấy người?', 'How many people are in your family?'],
      ['你妹妹几岁？', 'Em gái bạn mấy tuổi?', 'How old is your little sister?']]
  ],
  q: [
    ['小红家有几口人？', 'Nhà Tiểu Hồng có mấy người?', '四口', '*五口', '六口', '三口'],
    ['小红的爸爸做什么工作？', 'Bố của Tiểu Hồng làm nghề gì?', '老师', '*医生', '学生', '司机'],
    ['T', '小红的妈妈是汉语老师。', 'Mẹ của Tiểu Hồng là giáo viên tiếng Trung.'],
    ['F', '小红有一个姐姐。', 'Tiểu Hồng có một chị gái.'],
    ['谁喜欢打篮球？', 'Ai thích chơi bóng rổ?', '爸爸', '妹妹', '*哥哥', '小红']
  ]
});

HA.L({
  id: '1-4', lv: 1, emoji: '⏰', kind: 'd',
  t: '现在几点？|Bây giờ là mấy giờ?|What time is it?',
  d: 'Số đếm, ngày tháng, giờ giấc|Numbers, dates and time',
  text: `
小张|小李，今天几号？|Tiểu Lý ơi, hôm nay ngày mấy?|Xiao Li, what's the date today?
小李|今天五月八号，星期三。|Hôm nay ngày 8 tháng 5, thứ Tư.|Today is May 8th, Wednesday.
小张|明天是我的生日！|Ngày mai là sinh nhật của tôi!|Tomorrow is my birthday!
小李|真的吗？你今年多大？|Thật à? Năm nay bạn bao nhiêu tuổi?|Really? How old are you this year?
小张|我今年二十岁。现在几点？|Năm nay tôi hai mươi tuổi. Bây giờ là mấy giờ?|I'm twenty this year. What time is it now?
小李|现在下午三点十分。|Bây giờ là ba giờ mười phút chiều.|It's ten past three in the afternoon.
小张|我四点去学校，明天见！|Bốn giờ tôi đến trường, mai gặp nhé!|I'm going to school at four. See you tomorrow!`,
  v: `
今天|jīntiān|tw|hôm nay|today|kim thiên|今天天气很好。|Hôm nay thời tiết rất đẹp.||
明天|míngtiān|tw|ngày mai|tomorrow|minh thiên|明天见！|Mai gặp nhé!||昨天
昨天|zuótiān|tw|hôm qua|yesterday|tạc thiên|昨天我很忙。|Hôm qua tôi rất bận.||明天
号|hào|n|ngày (trong tháng), số|date, number|hiệu|今天几号？|Hôm nay ngày mấy?|日|
月|yuè|n|tháng, mặt trăng|month, moon|nguyệt|我五月去中国。|Tháng năm tôi đi Trung Quốc.||
星期|xīngqī|n|tuần, thứ|week|tinh kỳ|今天星期几？|Hôm nay thứ mấy?|周,礼拜|
生日|shēngrì|n|sinh nhật|birthday|sinh nhật|祝你生日快乐！|Chúc bạn sinh nhật vui vẻ!||
多大|duō dà|phr|bao nhiêu tuổi|how old|đa đại|你今年多大？|Năm nay bạn bao nhiêu tuổi?||
现在|xiànzài|tw|bây giờ, hiện tại|now|hiện tại|现在几点？|Bây giờ là mấy giờ?||以前
点|diǎn|mw|giờ (giờ đồng hồ)|o'clock|điểm|我七点起床。|Tôi dậy lúc bảy giờ.||
分|fēn|mw|phút|minute|phân|现在三点十分。|Bây giờ là ba giờ mười phút.||
下午|xiàwǔ|tw|buổi chiều|afternoon|hạ ngọ|下午我去学校。|Buổi chiều tôi đi học.||上午
上午|shàngwǔ|tw|buổi sáng|morning (before noon)|thượng ngọ|上午我有课。|Buổi sáng tôi có tiết học.||下午
去|qù|v|đi, đến|to go|khứ|我去学校。|Tôi đi đến trường.||来
学校|xuéxiào|n|trường học|school|học hiệu|我们的学校很大。|Trường của chúng tôi rất rộng.||
真的|zhēn de|adv|thật sự, thật|really, truly|chân đích|真的吗？|Thật không?||假的`,
  g: [
    ['Cách nói ngày tháng', 'Saying dates', 'Năm + 年 + Tháng + 月 + Ngày + 号 + 星期…',
      'Tiếng Trung nói từ lớn đến nhỏ: năm → tháng → ngày → thứ. 星期一 = thứ Hai, … 星期六 = thứ Bảy, 星期天 = Chủ nhật.',
      'Chinese goes from big to small: year → month → day → weekday. 星期一 = Monday … 星期天 = Sunday.',
      ['今天二〇二六年五月八号。', 'Hôm nay là ngày 8 tháng 5 năm 2026.', 'Today is May 8, 2026.'],
      ['明天星期四。', 'Ngày mai là thứ Năm.', 'Tomorrow is Thursday.']],
    ['Cách nói giờ', 'Telling time', 'Số + 点 + Số + 分',
      'Giờ: 点; phút: 分; 半 = rưỡi (30 phút); 刻 = 15 phút. Thời gian đứng trước động từ.',
      'Hours: 点; minutes: 分; 半 = half past; 刻 = quarter. Time words come before the verb.',
      ['现在八点半。', 'Bây giờ là tám giờ rưỡi.', 'It is half past eight.'],
      ['我四点去学校。', 'Bốn giờ tôi đến trường.', 'I go to school at four.']]
  ],
  q: [
    ['今天星期几？', 'Hôm nay thứ mấy?', '星期二', '*星期三', '星期四', '星期天'],
    ['小张的生日是几月几号？', 'Sinh nhật Tiểu Trương là ngày nào?', '五月八号', '*五月九号', '六月九号', '五月十号'],
    ['T', '小张今年二十岁。', 'Năm nay Tiểu Trương hai mươi tuổi.'],
    ['小张几点去学校？', 'Tiểu Trương đến trường lúc mấy giờ?', '三点', '三点十分', '*四点', '五点'],
    ['F', '现在是上午三点十分。', 'Bây giờ là ba giờ mười phút sáng.']
  ]
});

HA.L({
  id: '1-5', lv: 1, emoji: '🛍️', kind: 'd',
  t: '这个多少钱？|Cái này bao nhiêu tiền?|How much is this?',
  d: 'Mua sắm, hỏi giá và mặc cả|Shopping, prices and bargaining',
  text: `
顾客|你好，苹果多少钱一斤？|Chào chị, táo bao nhiêu tiền một cân?|Hello, how much is a jin of apples?
老板|十块钱一斤。|Mười tệ một cân.|Ten yuan per jin.
顾客|太贵了！八块，可以吗？|Đắt quá! Tám tệ được không?|Too expensive! Is eight okay?
老板|好吧，九块。你要几斤？|Thôi được, chín tệ. Anh lấy mấy cân?|Alright, nine. How many jin do you want?
顾客|我要两斤。那个杯子呢？|Tôi lấy hai cân. Còn cái cốc kia thì sao?|I'll take two. What about that cup?
老板|那个杯子二十五块。|Cái cốc đó hai mươi lăm tệ.|That cup is twenty-five yuan.
顾客|我想买一个。一共多少钱？|Tôi muốn mua một cái. Tổng cộng bao nhiêu tiền?|I'd like one. How much altogether?
老板|一共四十三块。谢谢！|Tổng cộng bốn mươi ba tệ. Cảm ơn anh!|Forty-three yuan in total. Thank you!`,
  v: `
多少|duōshao|pron|bao nhiêu|how many, how much|đa thiểu|这个多少钱？|Cái này bao nhiêu tiền?|几|
钱|qián|n|tiền|money|tiền|我没有钱了。|Tôi hết tiền rồi.||
块|kuài|mw|đồng, tệ (khẩu ngữ)|yuan (spoken)|khối|这本书三十块。|Quyển sách này ba mươi tệ.|元|
斤|jīn|mw|cân (=500g)|jin (=500g)|cân|我买两斤苹果。|Tôi mua hai cân táo.||
苹果|píngguǒ|n|quả táo|apple|bình quả|我每天吃一个苹果。|Mỗi ngày tôi ăn một quả táo.||
贵|guì|adj|đắt|expensive|quý|这件衣服太贵了。|Bộ quần áo này đắt quá.||便宜
便宜|piányi|adj|rẻ|cheap|tiện nghi|这里的水果很便宜。|Hoa quả ở đây rất rẻ.||贵
要|yào|v|muốn, cần, lấy|to want, to need|yếu|你要什么？|Bạn muốn gì?|想|
这|zhè|pron|này, đây|this|giá|这是我的手机。|Đây là điện thoại của tôi.||那
那|nà|pron|kia, đó|that|na|那是谁的书？|Kia là sách của ai?||这
个|gè|mw|cái, chiếc (lượng từ chung)|general measure word|cá|一个人|một người||
杯子|bēizi|n|cái cốc, cái ly|cup, glass|bôi tử|这个杯子很漂亮。|Cái cốc này rất đẹp.||
想|xiǎng|v|muốn, nhớ, nghĩ|to want, to miss, to think|tưởng|我想去中国。|Tôi muốn đi Trung Quốc.|要|
买|mǎi|v|mua|to buy|mãi|我想买一个杯子。|Tôi muốn mua một cái cốc.||卖
一共|yígòng|adv|tổng cộng|altogether|nhất cộng|一共多少钱？|Tổng cộng bao nhiêu tiền?|总共|
谢谢|xièxie|v|cảm ơn|thank you|tạ tạ|谢谢你的帮助。|Cảm ơn sự giúp đỡ của bạn.|感谢|`,
  g: [
    ['Cấu trúc 太…了', 'Pattern 太…了', '太 + Tính từ + 了',
      'Diễn tả mức độ quá cao, "… quá!". Thường dùng để cảm thán hoặc phàn nàn.',
      'Expresses an excessive degree: "too … / so …!". Used for exclamations or complaints.',
      ['太贵了！', 'Đắt quá!', 'Too expensive!'],
      ['今天太热了。', 'Hôm nay nóng quá.', 'It\'s so hot today.']],
    ['Số + Lượng từ + Danh từ', 'Number + measure word + noun', 'Số/这/那 + Lượng từ + Danh từ',
      'Trong tiếng Trung, giữa số (hoặc 这/那) và danh từ bắt buộc có lượng từ. 二 đổi thành 两 trước lượng từ.',
      'A measure word is required between a number (or 这/那) and a noun. 二 becomes 两 before measure words.',
      ['两个苹果', 'hai quả táo', 'two apples'],
      ['那个杯子', 'cái cốc kia', 'that cup']],
    ['Hỏi giá', 'Asking prices', 'Danh từ + 多少钱 (+ 一 + Lượng từ)？',
      'Dùng 多少钱 để hỏi giá. Có thể thêm đơn vị: 多少钱一斤 (bao nhiêu một cân).',
      'Use 多少钱 to ask the price, optionally with a unit: 多少钱一斤 (how much per jin).',
      ['苹果多少钱一斤？', 'Táo bao nhiêu tiền một cân?', 'How much are apples per jin?']]
  ],
  q: [
    ['苹果最后多少钱一斤？', 'Cuối cùng táo bao nhiêu tiền một cân?', '十块', '八块', '*九块', '二十五块'],
    ['顾客买了几斤苹果？', 'Khách mua mấy cân táo?', '一斤', '*两斤', '三斤', '五斤'],
    ['T', '顾客觉得十块钱一斤太贵了。', 'Khách thấy mười tệ một cân là quá đắt.'],
    ['杯子多少钱？', 'Cái cốc bao nhiêu tiền?', '九块', '十八块', '*二十五块', '四十三块'],
    ['F', '顾客一共花了五十块。', 'Khách tiêu tổng cộng năm mươi tệ.']
  ]
});

HA.L({
  id: '1-6', lv: 1, emoji: '🍜', kind: 'd',
  t: '你想吃什么？|Bạn muốn ăn gì?|What would you like to eat?',
  d: 'Ăn uống tại nhà hàng|Eating at a restaurant',
  text: `
服务员|你们好！请坐。你们想吃什么？|Chào các bạn! Mời ngồi. Các bạn muốn ăn gì?|Hello! Please sit down. What would you like to eat?
玛丽|我想吃米饭和鸡蛋汤。|Tôi muốn ăn cơm và canh trứng.|I'd like rice and egg soup.
小王|我要一个面条。你们这儿什么菜好吃？|Tôi lấy một bát mì. Ở đây món nào ngon?|I'll have noodles. What dishes are good here?
服务员|我们的饺子很好吃。|Sủi cảo của chúng tôi rất ngon.|Our dumplings are delicious.
小王|好，再来一盘饺子。|Được, thêm một đĩa sủi cảo nữa.|Okay, one more plate of dumplings.
服务员|你们喝什么？茶还是水？|Các bạn uống gì? Trà hay nước?|What would you like to drink? Tea or water?
玛丽|我喝茶，他喝一杯咖啡。|Tôi uống trà, anh ấy uống một ly cà phê.|I'll have tea; he'll have a coffee.
小王|这个饭馆的菜真好吃！|Món ăn của quán này ngon thật!|The food at this restaurant is really good!`,
  v: `
吃|chī|v|ăn|to eat|cật|你吃饭了吗？|Bạn ăn cơm chưa?||
喝|hē|v|uống|to drink|hát|我喜欢喝茶。|Tôi thích uống trà.||
请|qǐng|v|mời, xin vui lòng|please, to invite|thỉnh|请进！|Mời vào!||
坐|zuò|v|ngồi, đi (xe)|to sit, to take (transport)|tọa|请坐。|Mời ngồi.||站
米饭|mǐfàn|n|cơm|cooked rice|mễ phạn|我要一碗米饭。|Tôi lấy một bát cơm.||
面条|miàntiáo|n|mì sợi|noodles|miến điều|中国人喜欢吃面条。|Người Trung Quốc thích ăn mì.||
菜|cài|n|món ăn, rau|dish, vegetable|thái|这个菜很好吃。|Món này rất ngon.||
好吃|hǎochī|adj|ngon (đồ ăn)|delicious|hảo cật|妈妈做的饭很好吃。|Cơm mẹ nấu rất ngon.|美味|难吃
饺子|jiǎozi|n|sủi cảo, há cảo|dumpling|giáo tử|过年吃饺子。|Tết ăn sủi cảo.||
茶|chá|n|trà|tea|trà|中国茶很有名。|Trà Trung Quốc rất nổi tiếng.||
水|shuǐ|n|nước|water|thủy|我想喝水。|Tôi muốn uống nước.||
还是|háishi|conj|hay là (câu hỏi lựa chọn)|or (in questions)|hoàn thị|你喝茶还是咖啡？|Bạn uống trà hay cà phê?||
杯|bēi|mw|cốc, ly|cup (measure word)|bôi|一杯咖啡|một ly cà phê||
咖啡|kāfēi|n|cà phê|coffee|già phê|越南咖啡很香。|Cà phê Việt Nam rất thơm.||
饭馆|fànguǎn|n|quán ăn, nhà hàng|restaurant|phạn quán|这个饭馆很有名。|Nhà hàng này rất nổi tiếng.|餐厅|
服务员|fúwùyuán|n|nhân viên phục vụ|waiter|phục vụ viên|服务员，买单！|Phục vụ ơi, tính tiền!||顾客`,
  g: [
    ['Câu hỏi lựa chọn với 还是', 'Choice questions with 还是', 'A + 还是 + B？',
      '还是 dùng trong câu hỏi "A hay B?". Không thêm 吗 vào cuối câu.',
      '还是 is used in "A or B?" questions. Do not add 吗 at the end.',
      ['你喝茶还是喝咖啡？', 'Bạn uống trà hay cà phê?', 'Do you drink tea or coffee?'],
      ['他是老师还是学生？', 'Anh ấy là giáo viên hay học sinh?', 'Is he a teacher or a student?']],
    ['Câu cầu khiến với 请', 'Polite requests with 请', '请 + Động từ',
      '请 đứng đầu câu để mời hoặc yêu cầu lịch sự.',
      '请 at the start of a sentence makes a polite invitation or request.',
      ['请坐。', 'Mời ngồi.', 'Please sit down.'],
      ['请喝茶。', 'Mời uống trà.', 'Please have some tea.']]
  ],
  q: [
    ['玛丽想吃什么？', 'Mary muốn ăn gì?', '面条和饺子', '*米饭和鸡蛋汤', '饺子', '面条'],
    ['服务员说什么好吃？', 'Nhân viên phục vụ nói món nào ngon?', '米饭', '面条', '*饺子', '鸡蛋汤'],
    ['小王喝什么？', 'Tiểu Vương uống gì?', '茶', '水', '*咖啡', '果汁'],
    ['T', '小王觉得这个饭馆的菜很好吃。', 'Tiểu Vương thấy món ăn của quán này rất ngon.'],
    ['F', '玛丽喝咖啡。', 'Mary uống cà phê.']
  ]
});

HA.L({
  id: '1-7', lv: 1, emoji: '📍', kind: 'd',
  t: '你在哪儿？|Bạn ở đâu?|Where are you?',
  d: 'Hỏi và nói về vị trí, địa điểm|Locations and positions',
  text: `
妈妈|喂，小明，你在哪儿？|Alo, Tiểu Minh, con đang ở đâu?|Hello, Xiaoming, where are you?
小明|我在学校。妈妈，你在家吗？|Con đang ở trường. Mẹ ở nhà ạ?|I'm at school. Mom, are you at home?
妈妈|我不在家，我在医院。|Mẹ không ở nhà, mẹ đang ở bệnh viện.|I'm not at home, I'm at the hospital.
小明|医院？你身体不好吗？|Bệnh viện? Mẹ không khỏe à?|The hospital? Are you not well?
妈妈|不是，我来看你奶奶。|Không phải, mẹ đến thăm bà nội con.|No, I came to see your grandma.
小明|医院在哪儿？我想去看奶奶。|Bệnh viện ở đâu ạ? Con muốn đi thăm bà.|Where is the hospital? I want to visit grandma.
妈妈|医院在学校后面，很近。|Bệnh viện ở phía sau trường, rất gần.|The hospital is behind the school, very close.
小明|好，我下课就去。|Vâng, tan học con đi ngay.|Okay, I'll go right after class.`,
  v: `
喂|wéi|int|alo (nghe điện thoại)|hello (on the phone)|úy|喂，你好！|Alo, xin chào!||
在|zài|v|ở, tại|to be at, in|tại|我在家。|Tôi ở nhà.||
哪儿|nǎr|pron|ở đâu|where|na nhi|你去哪儿？|Bạn đi đâu?|哪里|
医院|yīyuàn|n|bệnh viện|hospital|y viện|医院在前面。|Bệnh viện ở phía trước.||
身体|shēntǐ|n|cơ thể, sức khỏe|body, health|thân thể|你身体好吗？|Bạn có khỏe không?||
来|lái|v|đến, tới|to come|lai|你来我家吧。|Bạn đến nhà tôi đi.||去
看|kàn|v|xem, nhìn, thăm|to look, to watch, to visit|khán|我去看朋友。|Tôi đi thăm bạn.|瞧|
奶奶|nǎinai|n|bà nội|grandma (paternal)|nãi nãi|奶奶七十岁了。|Bà nội bảy mươi tuổi rồi.||爷爷
后面|hòumian|n|phía sau|behind|hậu diện|学校后面有一个公园。|Phía sau trường có một công viên.||前面
前面|qiánmian|n|phía trước|in front|tiền diện|前面是我的学校。|Phía trước là trường của tôi.||后面
近|jìn|adj|gần|near|cận|我家离这儿很近。|Nhà tôi cách đây rất gần.||远
远|yuǎn|adj|xa|far|viễn|北京离这儿很远。|Bắc Kinh cách đây rất xa.||近
里|lǐ|n|trong|inside|lý|书在桌子里。|Sách ở trong bàn.||外
桌子|zhuōzi|n|cái bàn|table, desk|trác tử|手机在桌子上。|Điện thoại ở trên bàn.||
下课|xià kè|vo|tan học, hết giờ học|to finish class|hạ khóa|我们几点下课？|Mấy giờ chúng ta tan học?||上课
就|jiù|adv|liền, ngay|right away, then|tựu|我马上就来。|Tôi đến ngay.||`,
  g: [
    ['Động từ 在 chỉ vị trí', '在 for location', 'Chủ ngữ + 在 + Địa điểm',
      '在 nghĩa là "ở, tại". Phủ định: 不在. Hỏi: … 在哪儿？',
      '在 means "to be at". Negative: 不在. Question: … 在哪儿？',
      ['我在学校。', 'Tôi ở trường.', 'I\'m at school.'],
      ['妈妈不在家。', 'Mẹ không ở nhà.', 'Mom isn\'t home.']],
    ['Từ chỉ phương vị', 'Location words', 'Danh từ + 前面/后面/上/里…',
      'Phương vị từ đứng SAU danh từ (khác tiếng Việt): 桌子上 = trên bàn, 学校后面 = phía sau trường.',
      'Position words come AFTER the noun: 桌子上 = on the table, 学校后面 = behind the school.',
      ['书在桌子上。', 'Sách ở trên bàn.', 'The book is on the table.'],
      ['医院在学校后面。', 'Bệnh viện ở phía sau trường.', 'The hospital is behind the school.']]
  ],
  q: [
    ['小明在哪儿？', 'Tiểu Minh đang ở đâu?', '在家', '*在学校', '在医院', '在饭馆'],
    ['妈妈为什么在医院？', 'Vì sao mẹ ở bệnh viện?', '她身体不好', '*她来看奶奶', '她是医生', '她来工作'],
    ['医院在哪儿？', 'Bệnh viện ở đâu?', '学校前面', '*学校后面', '小明家里', '很远的地方'],
    ['T', '医院离学校很近。', 'Bệnh viện cách trường rất gần.'],
    ['F', '小明现在就去医院。', 'Tiểu Minh đi bệnh viện ngay bây giờ.']
  ]
});

HA.L({
  id: '1-8', lv: 1, emoji: '🌦️', kind: 'd',
  t: '明天天气怎么样？|Thời tiết ngày mai thế nào?|How is the weather tomorrow?',
  d: 'Nói về thời tiết và rủ bạn đi chơi|Weather and making plans with friends',
  text: `
大卫|今天天气太冷了！|Hôm nay trời lạnh quá!|It's so cold today!
小美|是啊。明天天气怎么样？|Đúng vậy. Thời tiết ngày mai thế nào?|Yes. How will the weather be tomorrow?
大卫|明天不冷，也不下雨。|Ngày mai không lạnh, cũng không mưa.|Tomorrow won't be cold, and it won't rain.
小美|太好了！我们一起去看电影，好吗？|Tốt quá! Chúng ta cùng đi xem phim nhé?|Great! Shall we go see a movie together?
大卫|好啊！几点去？|Được chứ! Mấy giờ đi?|Sure! What time?
小美|下午两点，我在电影院前面等你。|Hai giờ chiều, tôi đợi bạn ở trước rạp chiếu phim.|Two in the afternoon; I'll wait for you in front of the cinema.
大卫|我可以叫我的朋友一起去吗？|Tôi có thể rủ bạn tôi đi cùng không?|Can I invite my friend to come along?
小美|当然可以！明天见。|Tất nhiên là được! Mai gặp nhé.|Of course! See you tomorrow.`,
  v: `
天气|tiānqì|n|thời tiết|weather|thiên khí|今天天气很好。|Hôm nay thời tiết rất đẹp.||
冷|lěng|adj|lạnh|cold|lãnh|北京的冬天很冷。|Mùa đông ở Bắc Kinh rất lạnh.|凉|热
热|rè|adj|nóng|hot|nhiệt|夏天很热。|Mùa hè rất nóng.||冷
下雨|xià yǔ|vo|mưa|to rain|hạ vũ|外面下雨了。|Bên ngoài mưa rồi.||
怎么样|zěnmeyàng|pron|thế nào, ra sao|how about, how is|chẩm ma dạng|你觉得怎么样？|Bạn thấy thế nào?||
一起|yìqǐ|adv|cùng nhau|together|nhất khởi|我们一起去吧。|Chúng ta cùng đi nhé.||
电影|diànyǐng|n|phim (điện ảnh)|movie|điện ảnh|这个电影很好看。|Bộ phim này rất hay.||
电影院|diànyǐngyuàn|n|rạp chiếu phim|cinema|điện ảnh viện|电影院在商店旁边。|Rạp chiếu phim ở cạnh cửa hàng.||
好啊|hǎo a|phr|được thôi, ok|sure, okay|hảo a|好啊，我们走吧！|Được, chúng ta đi thôi!||
等|děng|v|đợi, chờ|to wait|đẳng|请等一下。|Xin đợi một chút.||
可以|kěyǐ|v|có thể, được phép|can, may|khả dĩ|我可以进来吗？|Tôi có thể vào không?|能|
当然|dāngrán|adv|tất nhiên|of course|đương nhiên|当然可以！|Tất nhiên là được!||
很|hěn|adv|rất|very|ngận|她很漂亮。|Cô ấy rất xinh.|非常|`,
  g: [
    ['Câu vị ngữ tính từ', 'Adjective predicates', 'Chủ ngữ + 很 + Tính từ',
      'Tính từ làm vị ngữ trực tiếp, KHÔNG dùng 是. Thường thêm 很 phía trước (ý nghĩa "rất" khá nhẹ).',
      'Adjectives act as predicates directly, without 是. 很 is usually added (its meaning is often weak).',
      ['今天很冷。', 'Hôm nay (rất) lạnh.', 'It\'s cold today.'],
      ['这个电影很好看。', 'Bộ phim này rất hay.', 'This movie is good.']],
    ['Đề nghị với …，好吗？', 'Suggestions with …，好吗？', 'Lời đề nghị + ，好吗？',
      'Thêm 好吗 sau một đề nghị để hỏi ý kiến người nghe một cách nhẹ nhàng.',
      'Add 好吗 after a suggestion to softly ask for agreement.',
      ['我们一起去，好吗？', 'Chúng ta cùng đi nhé?', 'Let\'s go together, okay?'],
      ['明天见，好吗？', 'Mai gặp nhé, được không?', 'See you tomorrow, okay?']]
  ],
  q: [
    ['今天天气怎么样？', 'Hôm nay thời tiết thế nào?', '很热', '*很冷', '下雨', '不冷'],
    ['他们明天去做什么？', 'Ngày mai họ đi làm gì?', '去学校', '*看电影', '买东西', '吃饭'],
    ['他们几点去？', 'Mấy giờ họ đi?', '上午十点', '*下午两点', '下午四点', '晚上七点'],
    ['T', '明天不下雨。', 'Ngày mai không mưa.'],
    ['F', '小美在学校前面等大卫。', 'Tiểu Mỹ đợi David ở trước trường.']
  ]
});
