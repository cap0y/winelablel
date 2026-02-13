export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">쿠키 정책</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. 쿠키란 무엇인가요?</h2>
            <p className="mb-4">
              쿠키는 웹사이트를 방문할 때 브라우저에 저장되는 작은 텍스트 파일입니다. 
              쿠키는 웹사이트가 사용자의 브라우저를 인식하고, 사용자의 방문 기록과 선호도를 기억할 수 있게 해줍니다.
            </p>
            <p>
              주식회사 디컴소프트는 사용자에게 더 나은 서비스를 제공하고 웹사이트의 성능을 개선하기 위해 쿠키를 사용합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. 사용하는 쿠키의 종류</h2>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">필수 쿠키 (Essential Cookies)</h3>
                <p className="mb-2">웹사이트의 기본 기능을 수행하는 데 필요한 쿠키입니다.</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>로그인 상태 유지</li>
                  <li>장바구니 정보 보관</li>
                  <li>보안 및 인증</li>
                  <li>사용자 설정 저장</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">성능 쿠키 (Performance Cookies)</h3>
                <p className="mb-2">웹사이트의 성능을 분석하고 개선하기 위한 쿠키입니다.</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>페이지 방문 수 집계</li>
                  <li>사용자 행동 패턴 분석</li>
                  <li>사이트 성능 모니터링</li>
                  <li>오류 발생 추적</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">기능성 쿠키 (Functionality Cookies)</h3>
                <p className="mb-2">사용자 경험을 향상시키기 위한 쿠키입니다.</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>언어 설정 기억</li>
                  <li>지역 설정 기억</li>
                  <li>사용자 맞춤 설정</li>
                  <li>최근 본 상품 저장</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">마케팅 쿠키 (Marketing Cookies)</h3>
                <p className="mb-2">맞춤형 광고 제공을 위한 쿠키입니다.</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>관심사 기반 광고</li>
                  <li>광고 효과 측정</li>
                  <li>소셜 미디어 연동</li>
                  <li>리마케팅 캠페인</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. 제3자 쿠키</h2>
            <p className="mb-4">
              저희 웹사이트에서는 다음과 같은 제3자 서비스의 쿠키가 사용될 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Google Analytics:</strong> 웹사이트 트래픽 분석</li>
              <li><strong>Google Ads:</strong> 광고 성과 측정</li>
              <li><strong>Facebook Pixel:</strong> 소셜 미디어 마케팅</li>
              <li><strong>Kakao:</strong> 카카오 로그인 및 연동 서비스</li>
              <li><strong>PortOne:</strong> 결제 처리 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. 쿠키 관리 방법</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">브라우저 설정을 통한 관리</h3>
                <p className="mb-2">대부분의 브라우저에서는 쿠키 설정을 관리할 수 있습니다:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터</li>
                  <li><strong>Firefox:</strong> 설정 → 개인정보 및 보안 → 쿠키 및 사이트 데이터</li>
                  <li><strong>Safari:</strong> 환경설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터</li>
                  <li><strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 → 쿠키 및 저장된 데이터</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">⚠️ 중요 안내</h3>
                <p>
                  필수 쿠키를 비활성화하면 웹사이트의 일부 기능이 제대로 작동하지 않을 수 있습니다. 
                  로그인, 장바구니, 주문 기능 등에 영향을 줄 수 있으니 주의해 주세요.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">5. 쿠키 보존 기간</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">세션 쿠키 (Session Cookies)</h3>
                <p>브라우저를 닫으면 자동으로 삭제되는 임시 쿠키입니다.</p>
              </div>
              
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="font-semibold text-white mb-2">영구 쿠키 (Persistent Cookies)</h3>
                <p>설정된 만료일까지 브라우저에 저장되는 쿠키입니다. (일반적으로 30일~2년)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">6. 개인정보보호</h2>
            <p className="mb-4">
              쿠키를 통해 수집되는 정보는 개인정보처리방침에 따라 처리됩니다. 
              쿠키 데이터는 보안이 유지되며, 승인되지 않은 접근으로부터 보호됩니다.
            </p>
            <p>
              개인정보 처리에 대한 자세한 내용은 
              <a href="/privacy-policy" className="text-primary hover:underline">개인정보처리방침</a>을 
              참조해 주세요.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">7. 문의사항</h2>
            <p className="mb-4">
              쿠키 정책에 대한 문의사항이 있으시면 아래 연락처로 연락해 주세요:
            </p>
            <div className="p-4 bg-gray-800 rounded-lg">
              <ul className="space-y-2">
                <li><strong>이메일:</strong> decom2soft@gmail.com</li>
                <li><strong>전화:</strong> 055-762-9703</li>
                <li><strong>운영시간:</strong> 평일 09:00 ~ 18:00</li>
              </ul>
            </div>
          </section>

          <div className="text-center mt-12 p-6 bg-gray-800 rounded-lg">
            <p className="font-semibold text-white mb-2">본 쿠키 정책은 2024년 1월 1일부터 시행됩니다.</p>
            <p className="text-sm text-gray-400">
              이 정책은 필요에 따라 업데이트될 수 있으며, 변경 시 웹사이트를 통해 공지됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 