import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function Contact() {
  // 문의 폼을 제거했으므로 toast 사용 코드도 삭제했습니다.
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "wine">("general");
  // 문의 폼 제거로 상태 관리 불필요

  /* FAQ 데이터 – 결제 & 와인라벨 */
  const generalFaqs = [
    {
      id: "payment_flow",
      question: "결제 프로세스",
      answer:
        "끄레망는 포트원(PortOne) 결제 게이트웨이를 사용합니다. 주문하기 → 체크아웃 페이지에서 금액 확인 → 결제 요청 시 PortOne 카드 결제창이 열립니다.",
    },
    {
      id: "payment_methods",
      question: "지원 결제 수단",
      answer:
        "국내 신용·체크카드, 카카오페이·네이버페이 등 간편결제, 휴대폰 소액결제를 지원합니다. 해외 카드 및 무통장입금도 지원합니다.",
    },
    {
      id: "receipt",
      question: "영수증 및 세금계산서 발급",
      answer:
        "결제 완료 후 PortOne 전자 영수증이 이메일로 전송됩니다. 세금계산서가 필요하시면 support@끄레망.kr 로 사업자 정보를 보내주세요.",
    },
    {
      id: "refund_policy",
      question: "환불 정책",
      answer:
        "결제 후 24시간 이내 취소 시 전액 환불되며, 이후에는 이용약관의 환불 규정을 따릅니다. 마이페이지 또는 고객센터를 통해 환불을 신청할 수 있습니다.",
    },
  ];

  const wineFaqs = [
    {
      id: "design_process",
      question: "라벨 디자인 과정",
      answer:
        "웹사이트에서 원하는 와인병을 선택한 후, 제공되는 디자인 도구를 이용해 텍스트, 이미지, 장식 등을 추가하여 나만의 라벨을 만들 수 있습니다.",
    },
    {
      id: "delivery",
      question: "배송 및 소요 시간",
      answer:
        "라벨 제작 완료 후 배송까지 약 3-5일 정도 소요됩니다. 주문량이 많거나 특별한 디자인의 경우 추가 시간이 필요할 수 있습니다.",
    },
    {
      id: "wine_types",
      question: "와인 종류 및 품질",
      answer:
        "레드, 화이트, 로제, 스파클링 등 다양한 종류의 와인을 제공하고 있으며, 모두 엄선된 품질의 와인입니다. 각 와인에 대한 상세 정보는 와인 선택 페이지에서 확인하실 수 있습니다.",
    },
    {
      id: "bulk_order",
      question: "대량 주문 및 기업 선물",
      answer:
        "기업 행사나 단체 선물을 위한 대량 주문도 가능합니다. 10병 이상 주문 시 10%, 50병 이상 주문 시 20% 할인이 적용됩니다. 별도의 견적이 필요하시면 고객센터로 연락 주시기 바랍니다.",
    },
    {
      id: "label_quality",
      question: "라벨 인쇄 품질 및 재질",
      answer:
        "모든 라벨은 고품질 방수 스티커 용지에 1200dpi 이상의 해상도로 인쇄되어 선명하고 오래 지속됩니다. 와인병에 부착 후에도 쉽게 벗겨지거나 색이 바래지 않습니다.",
    },
  ];

  const faqData = activeTab === "general" ? generalFaqs : wineFaqs;

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // 문의 폼 제거로 handleSubmit 함수 삭제

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary/30 to-primary/10 py-16 text-center px-4">
        <h1 className="text-3xl font-bold mb-4">도움이 필요하신가요?</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          자주 묻는 질문을 먼저 확인하시면 더 빠르게 답을 찾으실 수 있습니다.
        </p>
      </section>

      {/* 연락 수단 */}
      <section className="px-4 py-10 max-w-4xl mx-auto grid gap-6 sm:grid-cols-3">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Phone className="text-primary w-6 h-6" />
            <p className="font-medium">전화문의</p>
            <p className="text-sm text-gray-400">02-555-5155</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Mail className="text-primary w-6 h-6" />
            <p className="font-medium">이메일 문의</p>
            <p className="text-sm text-gray-400">support@끄레망.kr</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <MessageSquare className="text-primary w-6 h-6" />
            <p className="font-medium">카카오톡 채널</p>
            <p className="text-sm text-gray-400">@끄레망</p>
          </CardContent>
        </Card>
      </section>

      {/* 상담 시간 */}
      <section className="px-4">
        <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
          <CardContent className="p-6 flex items-center justify-center space-x-3">
            <Clock className="text-primary w-6 h-6" />
            <p className="text-sm text-gray-400">
              상담 시간 : 평일 10:00 - 18:00 (점심시간 12:00 - 13:00)
            </p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="px-4 py-12 bg-gray-800/40">
        <h2 className="text-2xl font-bold text-center mb-6">자주 묻는 질문</h2>

        <div className="flex justify-center gap-2 mb-8">
          <Button
            variant={activeTab === "general" ? "default" : "outline"}
            onClick={() => setActiveTab("general")}
            className={`text-sm ${
              activeTab === "general"
                ? "bg-primary text-white"
                : "bg-gray-700 border-gray-600 text-gray-300"
            }`}
          >
            공통질문
          </Button>
          <Button
            variant={activeTab === "wine" ? "default" : "outline"}
            onClick={() => setActiveTab("wine")}
            className={`text-sm ${
              activeTab === "wine"
                ? "bg-primary text-white"
                : "bg-gray-700 border-gray-600 text-gray-300"
            }`}
          >
            끄레망 와인라벨
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-800 border border-gray-700 rounded-lg"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <span className="text-primary font-medium">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="text-gray-400 w-4 h-4" />
                ) : (
                  <ChevronDown className="text-gray-400 w-4 h-4" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 text-sm text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 문의 폼 삭제 완료 */}
    </div>
  );
}
