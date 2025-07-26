// 다국어 번역을 위한 공통 파일
import { Language } from '@/contexts/language-context';

// 공통 번역
export const commonTranslations = {
  ko: {
    // 공통 UI 요소
    appName: "끄레망",
    loading: "로딩 중...",
    notFound: "찾을 수 없습니다",
    error: "오류가 발생했습니다",
    
    // 네비게이션
    home: "홈",
    locations: "매장 찾기",
    myAccount: "내 계정",
    login: "로그인",
    logout: "로그아웃",
    profile: "프로필",
    contact: "고객센터",
    franchise: "가맹문의",
    gallery: "갤러리",
    
    // 버튼
    search: "검색",
    findNearby: "내 주변 찾기",
    viewAll: "모두 보기",
    order: "주문하기",
    
    // 홈페이지
    wineLabel: "끄레망 와인라벨",
    designLabel: "나만의 개성있는 와인라벨 디자인",
    searchingLocation: "위치 검색 중...",
    findNearbyShop: "내 주변 매장 찾기",
    viewAllShops: "모든 매장 보기",
    nearbyLocations: "주변 매장",
    popularDesigns: "인기 디자인",
    howToUse: "이용방법",
    designFeatures: "디자인 특징",
    noLocations: "등록된 매장이 없습니다.",
    noBottles: "사용 가능한 와인병이 없습니다.",
    
    // 위치 찾기
    selectLocation: "매장 선택하기",
    myLocation: "내 위치",
    searching: "검색 중...",
    locationTitle: "위치",
    priceInfo: "가격 정보",
    
    // 디자인 특징
    customLabel: "맞춤형 라벨",
    variousDesigns: "다양한 디자인",
    highQuality: "고품질 인쇄",
    quickDelivery: "빠른 배송",
    wineTasting: "와인 시음 서비스",
    personalizing: "개인 맞춤 서비스",
    
    // 이용 방법
    step1Title: "와인병 선택하기",
    step1Desc: "원하시는 와인병을 선택하세요.",
    step2Title: "라벨 디자인 하기",
    step2Desc: "원하는 디자인과 텍스트로 라벨을 꾸며보세요.",
    step3Title: "결제 및 배송",
    step3Desc: "간편한 온라인 결제로 바로 주문하세요.",
    
    // 주문 관련
    singleBottle: "단일병",
    threeBottles: "3병 세트",
    sixBottles: "6병 세트",
    customSet: "맞춤 세트",
    singlePrice: "개당 가격",
    setPrice: "세트 가격",
    totalPrice: "총 주문금액",
    quantity: "수량",
    selectBottles: "와인병 선택"
  },
  
  en: {
    // 공통 UI 요소
    appName: "Cremant",
    loading: "Loading...",
    notFound: "Not Found",
    error: "An error occurred",
    
    // 네비게이션
    home: "Home",
    locations: "Find Shops",
    myAccount: "My Account",
    login: "Login",
    logout: "Logout",
    profile: "Profile",
    contact: "Contact",
    franchise: "Franchise Inquiry",
    gallery: "Gallery",
    
    // 버튼
    search: "Search",
    findNearby: "Find Nearby",
    viewAll: "View All",
    order: "Order Now",
    
    // 홈페이지
    wineLabel: "Cremant Wine Label",
    designLabel: "Design Your Unique Wine Label",
    searchingLocation: "Searching location...",
    findNearbyShop: "Find Shops Near Me",
    viewAllShops: "View All Shops",
    nearbyLocations: "Nearby Shops",
    popularDesigns: "Popular Designs",
    howToUse: "How to Use",
    designFeatures: "Design Features",
    noLocations: "No shops available.",
    noBottles: "No wine bottles available.",
    
    // 위치 찾기
    selectLocation: "Select Shop",
    myLocation: "My Location",
    searching: "Searching...",
    locationTitle: "Location",
    priceInfo: "Price Information",
    
    // 디자인 특징
    customLabel: "Custom Labels",
    variousDesigns: "Various Designs",
    highQuality: "High-Quality Printing",
    quickDelivery: "Quick Delivery",
    wineTasting: "Wine Tasting Service",
    personalizing: "Personalization Service",
    
    // 이용 방법
    step1Title: "Select a Wine Bottle",
    step1Desc: "Choose your preferred wine bottle.",
    step2Title: "Design Your Label",
    step2Desc: "Design your label with custom text and graphics.",
    step3Title: "Payment and Delivery",
    step3Desc: "Order with easy online payment.",
    
    // 주문 관련
    singleBottle: "Single Bottle",
    threeBottles: "3-Bottle Set",
    sixBottles: "6-Bottle Set",
    customSet: "Custom Set",
    singlePrice: "Single Price",
    setPrice: "Set Price",
    totalPrice: "Total Price",
    quantity: "Quantity",
    selectBottles: "Select Bottles"
  },
  
  ja: {
    // 공통 UI 요소
    appName: "クレマン",
    loading: "読み込み中...",
    notFound: "見つかりません",
    error: "エラーが発生しました",
    
    // 네비게이션
    home: "ホーム",
    locations: "ショップ検索",
    myAccount: "マイアカウント",
    login: "ログイン",
    logout: "ログアウト",
    profile: "プロフィール",
    contact: "お問い合わせ",
    franchise: "加盟店問い合わせ",
    gallery: "ギャラリー",
    
    // 버튼
    search: "検索",
    findNearby: "近くを検索",
    viewAll: "すべて表示",
    order: "注文する",
    
    // 홈페이지
    wineLabel: "クレマンワインラベル",
    designLabel: "あなただけのワインラベルデザイン",
    searchingLocation: "位置検索中...",
    findNearbyShop: "近くのショップを検索",
    viewAllShops: "すべてのショップを表示",
    nearbyLocations: "近くのショップ",
    popularDesigns: "人気のデザイン",
    howToUse: "利用方法",
    designFeatures: "デザインの特徴",
    noLocations: "登録されたショップはありません。",
    noBottles: "利用可能なワインボトルがありません。",
    
    // 위치 찾기
    selectLocation: "ショップを選択",
    myLocation: "現在位置",
    searching: "検索中...",
    locationTitle: "位置",
    priceInfo: "料金情報",
    
    // 디자인 특징
    customLabel: "カスタムラベル",
    variousDesigns: "様々なデザイン",
    highQuality: "高品質な印刷",
    quickDelivery: "迅速な配送",
    wineTasting: "ワインテイスティングサービス",
    personalizing: "パーソナライズサービス",
    
    // 이용 방법
    step1Title: "ワインボトルを選択",
    step1Desc: "お好みのワインボトルを選んでください。",
    step2Title: "ラベルをデザイン",
    step2Desc: "カスタムテキストやグラフィックでラベルをデザインします。",
    step3Title: "決済と配送",
    step3Desc: "簡単なオンライン決済ですぐに注文できます。",
    
    // 주문 관련
    singleBottle: "単品ボトル",
    threeBottles: "3本セット",
    sixBottles: "6本セット",
    customSet: "カスタムセット",
    singlePrice: "単価",
    setPrice: "セット価格",
    totalPrice: "合計金額",
    quantity: "数量",
    selectBottles: "ボトル選択"
  },
  
  zh: {
    // 공통 UI 요소
    appName: "克雷芒",
    loading: "加载中...",
    notFound: "未找到",
    error: "发生错误",
    
    // 네비게이션
    home: "首页",
    locations: "查找店铺",
    myAccount: "我的账户",
    login: "登录",
    logout: "退出",
    profile: "个人资料",
    contact: "联系我们",
    franchise: "加盟咨询",
    gallery: "画廊",
    
    // 버튼
    search: "搜索",
    findNearby: "查找附近",
    viewAll: "查看全部",
    order: "立即订购",
    
    // 홈페이지
    wineLabel: "克雷芒葡萄酒标签",
    designLabel: "设计您独特的葡萄酒标签",
    searchingLocation: "正在搜索位置...",
    findNearbyShop: "查找附近店铺",
    viewAllShops: "查看所有店铺",
    nearbyLocations: "附近店铺",
    popularDesigns: "热门设计",
    howToUse: "使用方法",
    designFeatures: "设计特点",
    noLocations: "没有可用的店铺。",
    noBottles: "没有可用的葡萄酒瓶。",
    
    // 위치 찾기
    selectLocation: "选择店铺",
    myLocation: "我的位置",
    searching: "搜索中...",
    locationTitle: "位置",
    priceInfo: "价格信息",
    
    // 디자인 특징
    customLabel: "定制标签",
    variousDesigns: "多样化设计",
    highQuality: "高品质印刷",
    quickDelivery: "快速配送",
    wineTasting: "葡萄酒品鉴服务",
    personalizing: "个性化服务",
    
    // 이용 방법
    step1Title: "选择葡萄酒瓶",
    step1Desc: "选择您喜欢的葡萄酒瓶。",
    step2Title: "设计您的标签",
    step2Desc: "使用自定义文本和图形设计您的标签。",
    step3Title: "支付和配送",
    step3Desc: "通过简单的在线支付立即订购。",
    
    // 주문 관련
    singleBottle: "单瓶",
    threeBottles: "3瓶套装",
    sixBottles: "6瓶套装",
    customSet: "自定义套装",
    singlePrice: "单瓶价格",
    setPrice: "套装价格",
    totalPrice: "总价格",
    quantity: "数量",
    selectBottles: "选择葡萄酒瓶"
  }
};

// 와인라벨 상세 페이지 번역
export const wineDetailsTranslations = {
  ko: {
    title: "끄레망 와인라벨 서비스",
    subtitle: "나만의 특별한 와인라벨",
    description: "특별한 날을 위한 맞춤형 와인라벨 서비스입니다. 당신만의 독특한 디자인으로 특별한 순간을 기념하세요.",
    tags: ["#커스텀라벨", "#와인선물", "#기념일", "#생일선물", "#결혼선물", "#기업선물", "#이벤트", "#파티", "#기념품"],
    startOrder: "주문시작",
    designLabel: "라벨 디자인",
    selectBottle: "와인병 선택",
    quantity: "수량",
    singlePrice: "개당 가격",
    totalPrice: "총 금액",
    order: "주문하기",
    singleBottle: "단일병",
    threeBottles: "3병 세트",
    sixBottles: "6병 세트",
    customSet: "맞춤 세트",
    serviceInfo: "서비스 안내",
    locationTitle: "위치",
    noBottles: "사용 가능한 와인병이 없습니다.",
    priceInfo: "가격 정보"
  },
  en: {
    title: "Cremant Wine Label Service",
    subtitle: "Your Special Wine Label",
    description: "Custom wine label service for special occasions. Commemorate your special moments with your unique design.",
    tags: ["#customlabel", "#winegift", "#anniversary", "#birthdaygift", "#weddinggift", "#corporategift", "#event", "#party", "#souvenir"],
    startOrder: "Start Order",
    designLabel: "Design Label",
    selectBottle: "Select Wine Bottle",
    quantity: "Quantity",
    singlePrice: "Price Per Item",
    totalPrice: "Total Amount",
    order: "Place Order",
    singleBottle: "Single Bottle",
    threeBottles: "3-Bottle Set",
    sixBottles: "6-Bottle Set",
    customSet: "Custom Set",
    serviceInfo: "Service Information",
    locationTitle: "Location",
    noBottles: "No wine bottles available.",
    priceInfo: "Price Information"
  },
  ja: {
    title: "クレマンワインラベルサービス",
    subtitle: "あなただけの特別なワインラベル",
    description: "特別な日のためのカスタムワインラベルサービスです。あなただけのユニークなデザインで特別な瞬間を記念しましょう。",
    tags: ["#カスタムラベル", "#ワインギフト", "#記念日", "#誕生日プレゼント", "#結婚祝い", "#企業ギフト", "#イベント", "#パーティー", "#記念品"],
    startOrder: "注文開始",
    designLabel: "ラベルデザイン",
    selectBottle: "ワインボトル選択",
    quantity: "数量",
    singlePrice: "単価",
    totalPrice: "合計金額",
    order: "注文する",
    singleBottle: "単品ボトル",
    threeBottles: "3本セット",
    sixBottles: "6本セット",
    customSet: "カスタムセット",
    serviceInfo: "サービス案内",
    locationTitle: "位置",
    noBottles: "利用可能なワインボトルがありません。",
    priceInfo: "料金情報"
  },
  zh: {
    title: "克雷芒葡萄酒标签服务",
    subtitle: "您的专属葡萄酒标签",
    description: "为特殊场合提供定制葡萄酒标签服务。用您独特的设计来纪念特殊时刻。",
    tags: ["#定制标签", "#葡萄酒礼物", "#纪念日", "#生日礼物", "#结婚礼物", "#企业礼品", "#活动", "#派对", "#纪念品"],
    startOrder: "开始订购",
    designLabel: "设计标签",
    selectBottle: "选择葡萄酒瓶",
    quantity: "数量",
    singlePrice: "单价",
    totalPrice: "总金额",
    order: "下单",
    singleBottle: "单瓶",
    threeBottles: "3瓶套装",
    sixBottles: "6瓶套装",
    customSet: "自定义套装",
    serviceInfo: "服务信息",
    locationTitle: "位置",
    noBottles: "没有可用的葡萄酒瓶。",
    priceInfo: "价格信息"
  }
};

// 자주 묻는 질문 FAQ 번역
export const faqTranslations = {
  ko: {
    title: "자주 묻는 질문",
    questions: [
      {
        question: "와인라벨 디자인은 어떻게 진행되나요?",
        answer: "웹사이트에서 원하는 와인병을 선택한 후, 제공되는 디자인 도구를 이용해 텍스트, 이미지, 장식 등을 추가하여 나만의 라벨을 만들 수 있습니다."
      },
      {
        question: "주문 후 배송은 얼마나 걸리나요?",
        answer: "라벨 제작 완료 후 배송까지 약 3-5일 정도 소요됩니다. 주문량이 많거나 특별한 디자인의 경우 추가 시간이 필요할 수 있습니다."
      },
      {
        question: "디자인 템플릿은 몇 가지가 있나요?",
        answer: "20가지 이상의 기본 템플릿을 제공하고 있으며, 각 템플릿은 색상과 텍스트를 사용자화할 수 있습니다."
      },
      {
        question: "최소 주문 수량이 있나요?",
        answer: "1병부터 주문 가능합니다. 대량 주문 시 할인 혜택이 적용됩니다."
      },
      {
        question: "와인의 종류는 어떻게 되나요?",
        answer: "레드, 화이트, 로제, 스파클링 등 다양한 종류의 와인을 제공하고 있습니다. 각 와인에 대한 상세 정보는 와인 선택 페이지에서 확인하실 수 있습니다."
      },
      {
        question: "기업 단체 주문도 가능한가요?",
        answer: "네, 기업 행사나 단체 선물을 위한 대량 주문도 가능합니다. 별도의 견적 문의는 고객센터로 연락 주시기 바랍니다."
      },
      {
        question: "주문 취소나 환불은 어떻게 하나요?",
        answer: "라벨 제작 시작 전까지 주문 취소가 가능하며, 제작이 시작된 후에는 취소나 환불이 어렵습니다. 자세한 환불 정책은 고객센터에 문의해 주세요."
      }
    ]
  },
  en: {
    title: "Frequently Asked Questions",
    questions: [
      {
        question: "How do I design my wine label?",
        answer: "After selecting your preferred wine bottle on our website, you can create your own label using our design tool by adding text, images, and decorations."
      },
      {
        question: "How long does delivery take after ordering?",
        answer: "It takes approximately 3-5 days from label production to delivery. Additional time may be required for large orders or special designs."
      },
      {
        question: "How many design templates are available?",
        answer: "We offer more than 20 basic templates, and each template can be customized with colors and text."
      },
      {
        question: "Is there a minimum order quantity?",
        answer: "You can order as few as 1 bottle. Discounts apply for bulk orders."
      },
      {
        question: "What types of wine do you offer?",
        answer: "We offer various types of wine including red, white, rosé, and sparkling. Detailed information about each wine can be found on the wine selection page."
      },
      {
        question: "Can I place a corporate or group order?",
        answer: "Yes, bulk orders for corporate events or group gifts are available. For separate quote inquiries, please contact our customer service."
      },
      {
        question: "How do I cancel an order or get a refund?",
        answer: "Order cancellation is possible until label production begins. After production has started, cancellation or refund may be difficult. Please contact our customer service for detailed refund policies."
      }
    ]
  },
  ja: {
    title: "よくある質問",
    questions: [
      {
        question: "ワインラベルのデザインはどのように進めますか？",
        answer: "ウェブサイトで希望のワインボトルを選んだ後、提供されるデザインツールを使ってテキスト、画像、装飾などを追加し、オリジナルのラベルを作成できます。"
      },
      {
        question: "注文後の配送はどのくらい時間がかかりますか？",
        answer: "ラベル製作完了後、配送まで約3〜5日かかります。注文量が多い場合や特別なデザインの場合は追加時間が必要になることがあります。"
      },
      {
        question: "デザインテンプレートは何種類ありますか？",
        answer: "20種類以上の基本テンプレートを提供しており、各テンプレートは色とテキストをカスタマイズできます。"
      },
      {
        question: "最小注文数はありますか？",
        answer: "1本から注文可能です。大量注文の場合は割引特典が適用されます。"
      },
      {
        question: "ワインの種類はどのようになっていますか？",
        answer: "赤、白、ロゼ、スパークリングなど様々な種類のワインを提供しています。各ワインの詳細情報はワイン選択ページでご確認いただけます。"
      },
      {
        question: "企業団体注文も可能ですか？",
        answer: "はい、企業イベントや団体ギフト用の大量注文も可能です。別途見積もり問い合わせは、カスタマーセンターにご連絡ください。"
      },
      {
        question: "注文キャンセルや返金はどうすればいいですか？",
        answer: "ラベル製作開始前までは注文キャンセルが可能ですが、製作開始後はキャンセルや返金が難しくなります。詳細な返金ポリシーについては、カスタマーセンターにお問い合わせください。"
      }
    ]
  },
  zh: {
    title: "常见问题",
    questions: [
      {
        question: "如何设计我的葡萄酒标签？",
        answer: "在我们的网站上选择您喜欢的葡萄酒瓶后，您可以使用我们的设计工具添加文本、图像和装饰，创建您自己的标签。"
      },
      {
        question: "订购后多长时间送达？",
        answer: "从标签制作完成到送达大约需要3-5天。大订单或特殊设计可能需要额外时间。"
      },
      {
        question: "有多少种设计模板可用？",
        answer: "我们提供20多种基本模板，每个模板都可以自定义颜色和文本。"
      },
      {
        question: "是否有最低订购数量？",
        answer: "您可以订购少至1瓶。批量订购适用折扣。"
      },
      {
        question: "您提供哪些类型的葡萄酒？",
        answer: "我们提供各种类型的葡萄酒，包括红葡萄酒、白葡萄酒、桃红葡萄酒和气泡酒。有关每种葡萄酒的详细信息可在葡萄酒选择页面上找到。"
      },
      {
        question: "我可以进行企业或团体订购吗？",
        answer: "是的，我们提供企业活动或团体礼品的批量订购。如需单独报价咨询，请联系我们的客户服务。"
      },
      {
        question: "如何取消订单或获得退款？",
        answer: "在标签制作开始之前可以取消订单。制作开始后，取消或退款可能会有困难。请联系我们的客户服务了解详细的退款政策。"
      }
    ]
  }
};
