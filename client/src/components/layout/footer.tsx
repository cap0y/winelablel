import { Instagram, MessageCircle, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 px-4 py-8 mt-8 mb-20">
      <div className="max-w-6xl mx-auto">
        {/* 4단락 구성 */}
        <div className="flex overflow-x-auto gap-8 text-sm pb-2 md:grid md:grid-cols-4">
          {/* 1. 회사 정보 */}
          <div className="min-w-[250px] md:min-w-0">
            <div className="flex items-center mb-2">
              <img
                src="/images/CCLEMANG_Logo_v.png"
                alt="끄레망 로고"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white ml-2">끄레망</span>
            </div>
            <div className="space-y-2 text-gray-300">
              <p>상호 : (주)끄레망 대표자 : 김윤미</p>
              <p>사업자등록번호: 602-81-55426</p>
              <p>통신판매업 : 124124-124124</p>
              <p>개인정보보호책임자 : 김윤미</p>
            </div>
          </div>

          {/* 2. 고객센터 */}
          <div className="min-w-[200px] md:min-w-0">
            <h3 className="font-semibold text-white mb-3">고객센터</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>051.245.2983</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@cclemang.com</span>
              </div>
              <p>평일 09:00 ~ 18:00</p>
              <p className="text-xs">(주말, 공휴일 휴무)</p>
              <p>부산시 서구 흑교로 109번길 6, 5층</p>
            </div>
          </div>

          {/* 3. SNS */}
          <div className="min-w-[180px] md:min-w-0">
            <h3 className="font-semibold text-white mb-3">소셜미디어</h3>
            <div className="space-y-2">
              <a
                href="https://www.instagram.com/cclemang/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a
                href="https://pf.kakao.com/_cPwxfb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>카카오톡 채널</span>
              </a>
            </div>
          </div>

          {/* 4. 정책 */}
          <div className="min-w-[180px] md:min-w-0">
            <h3 className="font-semibold text-white mb-3">정책 및 약관</h3>
            <div className="space-y-2">
              <Link href="/privacy-policy">
                <a className="block text-gray-300 hover:text-white transition-colors">
                  개인정보처리방침
                </a>
              </Link>
              <Link href="/terms-of-service">
                <a className="block text-gray-300 hover:text-white transition-colors">
                  이용약관
                </a>
              </Link>
              <Link href="/cookie-policy">
                <a className="block text-gray-300 hover:text-white transition-colors">
                  쿠키정책
                </a>
              </Link>
              <p className="text-sm text-gray-400">
                © 2021 (주)끄레망. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
