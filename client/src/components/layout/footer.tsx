import { MapPin, Phone, Mail, Clock, Printer } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="relative px-4 py-8 mt-8 mb-20 border-t border-gray-200 bg-white/60 backdrop-blur-md overflow-hidden">
      {/* background image with translucency */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <img src="/images/home/package.png" alt="푸터 배경" className="w-full h-full object-cover" />
      </div>
      {/* light scrim to ensure text readability */}
      <div className="pointer-events-none absolute inset-0 bg-white/80" />
      <div className="relative max-w-3xl mx-auto">

        {/* 4단락 구성 */}
        <div className="flex overflow-x-auto gap-8 text-sm pb-2 md:grid md:grid-cols-4">
          {/* 1. 회사 정보 */}
          <div className="min-w-[250px] md:min-w-0">
            <div className="flex items-center mb-2">
              <img src="/images/decomsoft-logo.jpg" alt="디컴소프트 로고" className="h-8 w-auto rounded" />
              <span className="text-xl font-bold text-gray-900 ml-2">디컴소프트</span>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>상호 : 주식회사 디컴소프트 대표자 : 김영철</p>
              <p>사업자등록번호: 257-88-03450</p>
              <p>통신판매업 : 2025-경남진주-0718</p>
              <p>개인정보보호책임자 : 김영철</p>
            </div>
          </div>

          {/* 2. 고객센터 */}
          <div className="min-w-[200px] md:min-w-0">
            <h3 className="font-semibold text-gray-900 mb-3">고객센터</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>055-762-9703</span>
              </div>
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>FAX: 050-8907-9703</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>decom2soft@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>평일 09:00 ~ 18:00</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>경상남도 진주시 동진로 55</p>
                  <p>경상국립대학교 산학협력관 324호</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 서비스 */}
          <div className="min-w-[180px] md:min-w-0">
            <h3 className="font-semibold text-gray-900 mb-3">서비스</h3>
            <div className="space-y-2">
              <Link href="/package-selector" className="block text-gray-700 hover:text-gray-900 transition-colors">
                패키지 선택
              </Link>
              <Link href="/gallery" className="block text-gray-700 hover:text-gray-900 transition-colors">
                디자인 갤러리
              </Link>
              <Link href="/contact" className="block text-gray-700 hover:text-gray-900 transition-colors">
                문의하기
              </Link>
            </div>
          </div>

          {/* 4. 정책 */}
          <div className="min-w-[180px] md:min-w-0">
            <h3 className="font-semibold text-gray-900 mb-3">정책 및 약관</h3>
            <div className="space-y-2">
              <Link href="/privacy-policy" className="block text-gray-700 hover:text-gray-900 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/terms-of-service" className="block text-gray-700 hover:text-gray-900 transition-colors">
                이용약관
              </Link>
              <Link href="/cookie-policy" className="block text-gray-700 hover:text-gray-900 transition-colors">
                쿠키정책
              </Link>
              <p className="text-sm text-gray-500">
                © 2023 DECOMSOFT. All rights reserved.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
