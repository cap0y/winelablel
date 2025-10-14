import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, TrendingUp, Star, Shield, Clock, Warehouse } from "lucide-react";

export default function Franchise() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="px-4 py-10 bg-gradient-to-r from-primary/20 to-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">왜 끄레망 프랜차이즈인가?</h1>
          <p className="text-gray-300 leading-relaxed">
            셀프 스토리지 시장은 국내에서 이제 막 성장 중입니다. 100% 무인 운영 시스템으로 인건비 부담 없이
            안정적인 수익 구조를 확보하세요.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">임대 대비 160% 매출</h3>
              <p className="text-sm text-gray-400">
                동일 면적 대비 일반 임대 수익보다 높은 매출 구조가 검증되었습니다.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">100% 무인 운영</h3>
              <p className="text-sm text-gray-400">
                인건비 제로! 24시간 365일 운영되는 무인 시스템으로 효율적인 관리가 가능합니다.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">안정적인 수익 구조</h3>
              <p className="text-sm text-gray-400">
                장기 고객 확보와 유지성 높은 정기 결제 시스템으로 꾸준한 매출을 창출합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Franchise Benefits */}
      <section className="px-4 py-10">
        <h2 className="text-2xl font-bold mb-6 text-center">끄레망 가맹점 혜택</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto">
          <Benefit icon={Star} title="브랜드 파워" desc="국내 최초 공유창고 브랜드로 고객 신뢰를 확보합니다." />
          <Benefit icon={Users} title="전문 운영 지원" desc="전문 CS · 마케팅 · 운영 매뉴얼을 제공합니다." />
          <Benefit icon={Warehouse} title="입지 분석" desc="데이터 기반 상권 분석으로 최적의 입지를 제안합니다." />
          <Benefit icon={Building} title="확장성" desc="신규 지점 확장 시 본사 통합 관리 시스템을 제공합니다." />
          <Benefit icon={TrendingUp} title="투자 대비 수익" desc="초기 투자 후 추가 비용 없이 안정적인 수익을 유지합니다." />
          <Benefit icon={Shield} title="안전 시설" desc="CCTV · 출입 통제 시스템 등 최신 보안 장비를 적용합니다." />
        </div>
      </section>

      {/* Process Section */}
      <section className="px-4 py-10 bg-gray-800/40">
        <h2 className="text-2xl font-bold mb-6 text-center">개설 절차</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <ProcessStep num="01" title="상담 문의" desc="전화 · 이메일로 예비 가맹 상담" />
          <ProcessStep num="02" title="상권 분석" desc="데이터 기반 입지·수익성 분석" />
          <ProcessStep num="03" title="계약 체결" desc="가맹 계약 및 인테리어 설계" />
          <ProcessStep num="04" title="시공 · 세팅" desc="창고 시공 및 무인 시스템 구축" />
          <ProcessStep num="05" title="오픈&운영" desc="마케팅 · 운영 교육 후 정식 오픈" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">지금 바로 끄레망와 함께 하세요</h2>
        <p className="text-gray-300 mb-6">가맹 상담은 전화 · 이메일로 접수 가능합니다. 전문 매니저가 빠르게 연락드리겠습니다.</p>
        <div className="space-y-2">
          <p>☎ 전화 상담 : <span className="font-semibold text-primary">1588-1234</span></p>
          <p>✉ 이메일 : <span className="font-semibold text-primary">franchise@끄레망.co.kr</span></p>
        </div>
      </section>
    </div>
  );
}

function Benefit({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-400">{desc}</p>
      </CardContent>
    </Card>
  );
}

function ProcessStep({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-start space-x-4">
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
        {num}
      </div>
      <div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </div>
  );
}