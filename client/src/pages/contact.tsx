import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ExternalLink as ExternalLinkIcon,
  Copy as CopyIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { adminApi, labelApi } from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function Contact() {
  const { user } = useAuth();
  const isAdmin = user?.userType === "admin";

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "wine">("general");

  // 예약 링크 - 서버 저장/조회
  type LinkItem = { id?: number; title: string; url: string; isActive?: boolean; displayOrder?: number };
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const res = isAdmin ? await adminApi.getReservationLinks() : await labelApi.getReservationLinks();
        const data = Array.isArray(res.data) ? res.data : [];
        setLinks(data);
      } catch (_e) {
        setLinks([]);
      }
    };
    load();
  }, [isAdmin]);

  const saveLinks = async () => {
    // 생성/수정 분리 저장 후 재조회
    const creates = links.filter((l) => !l.id && (l.title || l.url));
    const updates = links.filter((l) => l.id);
    try {
      await Promise.all([
        ...creates.map((l, idx) =>
          adminApi.createReservationLink({
            title: l.title || "예약",
            url: l.url || "",
            isActive: l.isActive ?? true,
            displayOrder: l.displayOrder ?? idx,
          }),
        ),
        ...updates.map((l, idx) =>
          adminApi.updateReservationLink(l.id as number, {
            title: l.title,
            url: l.url,
            isActive: l.isActive,
            displayOrder: l.displayOrder ?? idx,
          }),
        ),
      ]);
      const fresh = await adminApi.getReservationLinks();
      setLinks(fresh.data || []);
    } catch (e) {
      console.error('예약 링크 저장 오류', e);
    }
  };

  const removeLink = async (idx: number) => {
    const target = links[idx];
    try {
      if (target?.id) {
        await adminApi.deleteReservationLink(target.id);
      }
      setLinks((prev) => prev.filter((_, i) => i !== idx));
    } catch (e) {
      console.error('삭제 오류', e);
    }
  };

  const removeSelected = async () => {
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map((i) => links[i]?.id ? adminApi.deleteReservationLink(links[i].id as number) : Promise.resolve()));
      setLinks((prev) => prev.filter((_, i) => !selected.has(i)));
      setSelected(new Set());
    } catch (e) {
      console.error('일괄 삭제 오류', e);
    }
  };

  const moveLink = (from: number, to: number) => {
    setLinks((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((x, i) => ({ ...x, displayOrder: i }));
    });
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('text/plain', String(index));
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!Number.isNaN(from) && from !== index) moveLink(from, index);
  };

  const isValidUrl = (value: string) => {
    if (!value) return false;
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  /* FAQ 데이터 – 결제 & 와인라벨 */
  const generalFaqs = [
    {
      id: "payment_flow",
      question: "결제 프로세스",
      answer:
        " 주문하기 → 체크아웃 페이지에서 금액 확인 → 계좌번호 결제창이 열립니다.",
    },
    {
      id: "payment_methods",
      question: "지원 결제 수단",
      answer:
        "국내 계좌이체를 지원합니다. 해외 카드 및 무통장입금도 지원합니다.",
    },
    {
      id: "receipt",
      question: "영수증 및 세금계산서 발급",
      answer:
        "결제 완료 후 info@cclemang.com 로 사업자 정보를 보내주세요.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-2 px-0">
        <div className="max-w-3xl mx-auto glass-card p-2 text-center ring-1 ring-blue-200">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">도움이 필요하신가요?</h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            자주 묻는 질문을 먼저 확인하시면 더 빠르게 답을 찾으실 수 있습니다.
          </p>
        </div>
      </section>

      {/* 예약 링크 + 안내 섹션 */}
      <section className="px-0 max-w-3xl mx-auto mb-1">
        <Card className="glass-card ring-1 ring-sky-200">
          <CardHeader>
            <CardTitle className="text-gray-900">예약 링크</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-sky-500/10 border border-sky-200 rounded p-3 backdrop-blur-sm text-sm text-gray-700">
              문의하기 전에 FAQ를 확인하시면 대부분의 질문에 대한 답을 바로 찾을 수 있습니다.
            </div>

            {/* 공개 예약 링크 목록 */}
            {links && links.length > 0 && (
              <div className="space-y-2">
                {links.filter(l => l.isActive !== false).sort((a,b)=>(a.displayOrder ?? 0)-(b.displayOrder ?? 0)).map((l, idx) => (
                  <div key={`${l.title}-${idx}`} className="flex items-center justify-between px-2 py-2.5 rounded border ring-1 bg-white/70 border-gray-200 ring-indigo-200">
                    <a
                      href={isValidUrl(l.url) ? l.url : "#"}
                      target={isValidUrl(l.url) ? "_blank" : undefined}
                      rel={isValidUrl(l.url) ? "noopener noreferrer" : undefined}
                      className={`truncate text-gray-900 hover:underline ${!isValidUrl(l.url) ? 'pointer-events-none opacity-60' : ''}`}
                    >
                      {l.title || "예약 링크"}
                    </a>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" className="h-7 bg-white/70 border-gray-200 text-gray-600" onClick={() => copyToClipboard(l.url)}>
                        <CopyIcon className="w-3.5 h-3.5" />
                      </Button>
                      {isValidUrl(l.url) && (
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 w-7 rounded border bg-white/70 border-gray-200 text-gray-600">
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 관리자 편집 영역 */}
            {isAdmin && (
              <div className="bg-indigo-500/5 border border-indigo-200 rounded p-1 backdrop-blur-sm">
                <h4 className="font-medium text-gray-900 mb-2">예약 링크 관리 (관리자)</h4>
                <div className="space-y-2">
                  {links.map((l, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 items-center bg-white/50 border border-gray-200 rounded p-2"
                      draggable
                      onDragStart={(e) => onDragStart(e, i)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, i)}
                    >
                      <div className="col-span-1 flex items-center gap-2">
                        <Checkbox
                          checked={selected.has(i)}
                          onCheckedChange={(ck) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (ck) next.add(i); else next.delete(i);
                              return next;
                            });
                          }}
                          className="border-gray-300"
                        />
                        <span className="text-xs text-gray-500 select-none cursor-move">≡</span>
                      </div>
                      <Input
                        className="col-span-3 bg-white/70 border-gray-300 text-gray-900"
                        value={l.title}
                        placeholder="버튼 제목"
                        onChange={(e) =>
                          setLinks((prev) => prev.map((p, idx) => (idx === i ? { ...p, title: e.target.value } : p)))
                        }
                      />
                      <Input
                        className="col-span-6 bg-white/70 border-gray-300 text-gray-900"
                        value={l.url}
                        placeholder="https:// 링크"
                        onChange={(e) =>
                          setLinks((prev) => prev.map((p, idx) => (idx === i ? { ...p, url: e.target.value } : p)))
                        }
                      />
                      <div className="col-span-2 flex items-center justify-center">
                        <Switch
                          checked={l.isActive !== false}
                          onCheckedChange={(checked) =>
                            setLinks((prev) => prev.map((p, idx) => (idx === i ? { ...p, isActive: !!checked } : p)))
                          }
                        />
                      </div>
                      <div className="col-span-1" />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => setLinks((prev) => [...prev, { title: "[예약] NAVER", url: "", isActive: true, displayOrder: prev.length }])}>추가</Button>
                    <Button variant="outline" onClick={saveLinks} className="bg-white/70 border-gray-200 text-gray-700">저장</Button>
                    <Button variant="outline" className="bg-red-50 border-red-200 text-red-600" onClick={removeSelected}>선택 삭제</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 연락 수단 */}
      <section className="px-0 py-1 max-w-3xl mx-auto grid gap-2 sm:grid-cols-3">
        <Card className="glass-card bg-slate-500/10 ring-1 ring-slate-200">
          <CardContent className="p-3.5 flex flex-col items-center space-y-1.5">
            <Phone className="w-6 h-6 text-[#2F3437]" />
            <p className="font-medium">전화문의</p>
            <p className="text-sm text-gray-600">051.245.2983</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-emerald-500/10 ring-1 ring-emerald-200">
          <CardContent className="p-3.5 flex flex-col items-center space-y-1.5">
            <Mail className="w-6 h-6 text-[#0F7B6C]" />
            <p className="font-medium">이메일 문의</p>
            <p className="text-sm text-gray-600">info@cclemang.com</p>
          </CardContent>
        </Card>

        <Card className="glass-card bg-violet-500/10 ring-1 ring-violet-200">
          <CardContent className="p-3.5 flex flex-col items-center space-y-1.5">
            <MessageSquare className="w-6 h-6 text-[#8A3FFC]" />
            <p className="font-medium">카카오톡 채널</p>
            <p className="text-sm text-gray-600">@끄레망</p>
          </CardContent>
        </Card>
      </section>

      {/* 상담 시간 */}
      {/* 고객센터 운영시간 + 사업자 정보 (좌우 배치) */}
      <section className="px-0 mb-5">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card className="glass-card h-full bg-amber-500/10 ring-1 ring-amber-200">
            <CardContent className="p-4 text-center h-full flex flex-col justify-center">
              <Clock className="w-8 h-8 mx-auto mb-4 text-[#B05C00]" />
              <h3 className="font-bold text-lg mb-2 text-gray-900">고객센터 운영시간</h3>
              <p className="text-gray-700 mb-2">평일 09:00 ~ 18:00</p>
              <p className="text-sm text-gray-600">주말 및 공휴일은 휴무입니다.</p>
            </CardContent>
          </Card>
          <Card className="glass-card h-full bg-sky-500/10 ring-1 ring-sky-200">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-2 text-center text-gray-900">사업자 정보</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium text-gray-900">회사명:</span>{" "}
                  (주)끄레망
                </p>
                <p>
                  <span className="font-medium text-gray-900">사업자등록번호:</span>{" "}
                  602-81-55426
                </p>
                <p>
                  <span className="font-medium text-gray-900">주소:</span> 부산시
                  서구 흑교로 109번길 6, 5층
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-0 py-5">
        <h2 className="text-2xl font-bold text-center mb-3 text-gray-900">자주 묻는 질문</h2>

        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={activeTab === "general" ? "default" : "outline"}
            onClick={() => setActiveTab("general")}
            className={`text-sm ${
              activeTab === "general"
                ? "bg-primary text-white"
                : "bg-white/70 border-gray-200 text-gray-700 backdrop-blur-sm"
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
                : "bg-white/70 border-gray-200 text-gray-700 backdrop-blur-sm"
            }`}
          >
            끄레망 와인라벨
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-2.5">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              className="bg-gray-50/70 border border-gray-200 rounded-lg backdrop-blur-sm"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-3 flex items-center justify-between text-left"
              >
                <span className="text-primary font-medium">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="text-gray-500 w-4 h-4" />
                ) : (
                  <ChevronDown className="text-gray-500 w-4 h-4" />
                )}
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-2.5 text-sm text-gray-700">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
