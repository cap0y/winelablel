export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">이용약관</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제1조 (목적)</h2>
            <p>
              이 약관은 (주)끄레망(이하 "회사")이 운영하는 와인라벨 제작 서비스(이하 "서비스")의 이용과 관련하여 
              회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제2조 (정의)</h2>
            <p className="mb-4">이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>"서비스"라 함은 회사가 제공하는 와인라벨 제작 및 관련 서비스를 의미합니다.</li>
              <li>"회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
              <li>"아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자 또는 숫자의 조합을 의미합니다.</li>
              <li>"비밀번호"라 함은 회원이 부여 받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제3조 (약관의 효력 및 변경)</h2>
            <p className="mb-4">① 이 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.</p>
            <p className="mb-4">② 회사는 합리적인 사유가 발생될 경우 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
            <p>③ 약관이 변경되는 경우 회사는 변경된 약관을 그 적용일자 7일 이전에 공지합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제4조 (이용계약의 성립)</h2>
            <p className="mb-4">① 이용계약은 회원이 되고자 하는 자가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
            <p>② 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-2 mt-4">
              <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
              <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
              <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제5조 (서비스의 제공 및 변경)</h2>
            <p className="mb-4">① 회사는 회원에게 아래와 같은 서비스를 제공합니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>와인라벨 디자인 도구 제공</li>
              <li>와인라벨 주문 및 제작 서비스</li>
              <li>고객상담 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
            <p className="mt-4">② 회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제6조 (서비스의 중단)</h2>
            <p className="mb-4">① 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
            <p>② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 회원 또는 제3자가 입은 손해에 대하여 배상하지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제7조 (회원의 의무)</h2>
            <p className="mb-4">① 회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>신청 또는 변경시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제8조 (주문 및 결제)</h2>
            <p className="mb-4">① 회원은 서비스에서 다음과 같은 방법으로 주문을 신청합니다.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>와인병 선택</li>
              <li>라벨 디자인 작성</li>
              <li>받는 사람의 성명, 주소, 전화번호 등의 입력</li>
              <li>결제방법의 선택 및 결제 정보의 입력</li>
              <li>약관의 내용에 대한 확인 및 결제</li>
            </ul>
            <p className="mt-4">② 회사는 다음 각 호에 해당하는 경우에는 승낙하지 않을 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
              <li>기타 회사가 필요하다고 인정하는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제9조 (환불정책)</h2>
            <p className="mb-4">① 주문 후 24시간 이내에 취소 요청 시 전액 환불이 가능합니다.</p>
            <p className="mb-4">② 제작이 시작된 이후에는 원칙적으로 환불이 불가능합니다.</p>
            <p>③ 회사의 귀책사유로 인한 결함이 있는 경우에는 교환 또는 환불이 가능합니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제10조 (면책조항)</h2>
            <p className="mb-4">① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
            <p className="mb-4">② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</p>
            <p>③ 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">제11조 (분쟁의 해결)</h2>
            <p className="mb-4">① 회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</p>
            <p>② 이 약관에 관하여 분쟁이 있을 경우에는 회사의 소재지를 관할하는 법원을 관할법원으로 합니다.</p>
          </section>

          <div className="text-center mt-12 p-6 bg-gray-800 rounded-lg">
            <p className="font-semibold text-white">본 약관은 2024년 1월 1일부터 시행됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 