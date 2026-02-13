export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">개인정보처리방침</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제1조 (개인정보의 처리 목적)</h2>
            <p className="mb-4">
              주식회사 디컴소프트('디컴소프트 패키지 디자인')는 다음의 목적을 위하여 개인정보를 처리합니다. 
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
              이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
              <li>패키지 디자인 주문 및 배송</li>
              <li>민원사무 처리</li>
              <li>마케팅 및 광고에의 활용</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제2조 (개인정보의 처리 및 보유 기간)</h2>
            <p className="mb-4">
              ① 주식회사 디컴소프트는 정보주체로부터 개인정보를 수집할 때 동의 받은 개인정보 보유·이용기간 
              또는 법령에 따른 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <p className="mb-4">② 구체적인 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>회원정보: 회원 탈퇴 시까지</li>
              <li>주문정보: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              <li>결제정보: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제3조 (개인정보의 제3자 제공)</h2>
            <p className="mb-4">
              ① 주식회사 디컴소프트는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 
              정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
            <p>② 주식회사 디컴소프트는 다음과 같이 개인정보를 제3자에게 제공하고 있습니다.</p>
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="font-semibold">배송업체</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>제공받는 자: 택배업체 (CJ대한통운, 한진택배 등)</li>
                <li>제공하는 개인정보 항목: 이름, 전화번호, 주소</li>
                <li>제공목적: 상품배송</li>
                <li>보유 및 이용기간: 배송완료 후 즉시 파기</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제4조 (개인정보처리의 위탁)</h2>
            <p className="mb-4">
              ① 주식회사 디컴소프트는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="font-semibold">결제처리업체</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>위탁받는 자: 포트원(PortOne)</li>
                  <li>위탁하는 업무의 내용: 결제처리 및 결제정보 관리</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제5조 (정보주체와 법정대리인의 권리·의무 및 그 행사방법)</h2>
            <p className="mb-4">
              ① 정보주체는 주식회사 디컴소프트에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>개인정보 처리현황 통지요구</li>
              <li>개인정보 처리정지 요구</li>
              <li>개인정보의 정정·삭제 요구</li>
              <li>손해배상 청구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제6조 (개인정보의 안전성 확보 조치)</h2>
            <p className="mb-4">
              주식회사 디컴소프트는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>개인정보에 대한 접근 제한</li>
              <li>접속기록의 보관 및 위변조 방지</li>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제7조 (개인정보 보호책임자)</h2>
            <p className="mb-4">
              ① 주식회사 디컴소프트는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
            </p>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="font-semibold mb-2">개인정보 보호책임자</p>
              <ul className="space-y-1">
                <li>성명: 김영철</li>
                <li>직책: 대표이사</li>
                <li>연락처: 055-762-9703, decom2soft@gmail.com</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제8조 (개인정보 처리방침 변경)</h2>
            <p>
              ① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <div className="text-center mt-12 p-6 bg-gray-800 rounded-lg">
            <p className="font-semibold text-white">본 방침은 2024년 1월 1일부터 시행됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 