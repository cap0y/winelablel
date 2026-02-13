import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Palette,
  ShoppingCart,
  Star,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Award,
  Zap,
  Gift,
  Users,
  TrendingUp,
  Crown,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { commonTranslations } from "@/lib/translations";
import { galleryApi, labelApi } from "@/services/api";

// 떠다니는 패키지 요소들 애니메이션 컴포넌트
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 떠다니는 패키지 아이콘 */}
      <div className="absolute top-10 left-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
        <Package className="w-8 h-8 text-purple-400/30" />
      </div>
      <div className="absolute top-20 right-16 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
        <Package className="w-6 h-6 text-rose-400/30" />
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
        <Package className="w-7 h-7 text-amber-400/30" />
      </div>
      
      {/* 떠다니는 별들 */}
      <div className="absolute top-16 left-1/3 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <Sparkles className="w-5 h-5 text-yellow-400/40" />
      </div>
      <div className="absolute bottom-32 right-1/4 animate-pulse" style={{ animationDelay: '1.5s' }}>
        <Sparkles className="w-4 h-4 text-pink-400/40" />
      </div>
      <div className="absolute top-1/3 right-12 animate-pulse" style={{ animationDelay: '2.5s' }}>
        <Sparkles className="w-6 h-6 text-blue-400/40" />
      </div>
      
      {/* 떠다니는 하트 */}
      <div className="absolute top-24 left-2/3 animate-ping" style={{ animationDelay: '1s', animationDuration: '2s' }}>
        <Heart className="w-5 h-5 text-red-400/30" />
      </div>
      <div className="absolute bottom-16 left-1/2 animate-ping" style={{ animationDelay: '3s', animationDuration: '2.5s' }}>
        <Heart className="w-4 h-4 text-pink-400/30" />
      </div>
    </div>
  );
}

// 실시간 통계 카운터 애니메이션
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span ref={countRef} className="font-bold text-2xl text-primary">{count.toLocaleString()}{suffix}</span>;
}

// 파트너 브랜드 로고 슬라이더 컴포넌트
function PartnerBrandLogos() {
  // 로컬 로고 이미지들 (1~17)
  const logoImages = Array.from({ length: 17 }, (_, i) => ({
    id: i + 1,
    logo: `/images/logo/${i + 1}.png`,
    name: `Brand ${i + 1}`
  }));

  // 첫 번째 줄 (1~9)
  const firstRowLogos = logoImages.slice(0, 9);
  // 두 번째 줄 (10~17)
  const secondRowLogos = logoImages.slice(9, 17);

  return (
    <div className="relative overflow-hidden py-2">
      
      <div className="space-y-3">
        {/* 첫 번째 줄 - 왼쪽에서 오른쪽으로 */}
        <div className="flex animate-slide-infinite">
          {/* 첫 번째 세트 */}
          <div className="flex space-x-6 min-w-full shrink-0">
            {firstRowLogos.map((logo, idx) => (
              <div
                key={`first-row-1-${idx}`}
                className="flex-shrink-0 flex items-center justify-center min-w-[80px] h-12 transition-all duration-300 hover:scale-110 group"
              >
                <img 
                  src={logo.logo} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-bold text-xs';
                    fallback.textContent = logo.id.toString();
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* 두 번째 세트 (무한 반복) - 간격 추가 */}
          <div className="flex space-x-6 min-w-full shrink-0 ml-6">
            {firstRowLogos.map((logo, idx) => (
              <div
                key={`first-row-2-${idx}`}
                className="flex-shrink-0 flex items-center justify-center min-w-[80px] h-12 transition-all duration-300 hover:scale-110 group"
              >
                <img 
                  src={logo.logo} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-bold text-xs';
                    fallback.textContent = logo.id.toString();
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 두 번째 줄 - 오른쪽에서 왼쪽으로 (반대 방향) */}
        <div className="flex animate-slide-infinite-reverse">
          {/* 첫 번째 세트 */}
          <div className="flex space-x-6 min-w-full shrink-0">
            {secondRowLogos.map((logo, idx) => (
              <div
                key={`second-row-1-${idx}`}
                className="flex-shrink-0 flex items-center justify-center min-w-[80px] h-12 transition-all duration-300 hover:scale-110 group"
              >
                <img 
                  src={logo.logo} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-bold text-xs';
                    fallback.textContent = logo.id.toString();
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* 두 번째 세트 (무한 반복) - 간격 추가 */}
          <div className="flex space-x-6 min-w-full shrink-0 ml-6">
            {secondRowLogos.map((logo, idx) => (
              <div
                key={`second-row-2-${idx}`}
                className="flex-shrink-0 flex items-center justify-center min-w-[80px] h-12 transition-all duration-300 hover:scale-110 group"
              >
                <img 
                  src={logo.logo} 
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 font-bold text-xs';
                    fallback.textContent = logo.id.toString();
                    target.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 고객 후기 자동 슬라이드 컴포넌트
function TestimonialCarousel() {
  const testimonials = [
    { name: "김민지", text: "정말 만족스러운 박스 패키지였어요! 결혼식에서 너무 예뻤습니다.", rating: 5 },
    { name: "박준호", text: "디자인이 정말 세련되고 품질도 최고예요. 다음에도 이용할게요!", rating: 5 },
    { name: "이수진", text: "생일선물용 패키지로 주문했는데 받는 분이 너무 좋아하셨어요.", rating: 5 },
    { name: "최영수", text: "빠른 배송과 완벽한 포장까지! 모든게 완벽했습니다.", rating: 5 },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="relative overflow-hidden h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="min-w-full flex flex-col justify-center">
            <div className="flex items-center mb-1">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-gray-700 mb-1">"{testimonial.text}"</p>
            <p className="text-xs text-gray-500 font-medium">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 패키지 디자인 슬라이더 컴포넌트
function LabelSlider() {
  const [labels, setLabels] = useState<
    Array<{ id: string; title: string; labelImage: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // 이전 슬라이드로 이동
  const prevSlide = () => {
    setActiveIndex((current) => 
      current === 0 ? labels.length - 1 : current - 1,
    );
  };

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    setActiveIndex((current) => 
      current === labels.length - 1 ? 0 : current + 1,
    );
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    // 홈 정적 슬라이드 이미지로 대체 (/public/images/home/1.png ~ 10.png)
        setLoading(true);
    const staticSlides = Array.from({ length: 10 }).map((_, idx) => {
      const n = idx + 1;
      return {
        id: `home-${n}`,
        title: `홈 이미지 ${n}`,
        labelImage: `/images/home/${n}.png`,
      };
    });
    setLabels(staticSlides);
        setError(null);
        setLoading(false);
  }, []);

  // 자동 슬라이딩 설정
  useEffect(() => {
    if (labels.length <= 1) return; // 슬라이드가 1개 이하면 자동 슬라이딩 안 함
    
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    
    return () => clearInterval(timer);
  }, [labels.length, activeIndex]);

  if (loading) {
    return (
      <div className="relative w-full h-[30rem] bg-white/60 rounded-xl mb-6 flex items-center justify-center border border-gray-200 backdrop-blur-md">
        <div className="animate-pulse">이미지 로딩 중...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="relative w-full h-[30rem] bg-white/60 rounded-xl mb-6 flex items-center justify-center border border-gray-200 backdrop-blur-md">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }
  
  if (labels.length === 0) {
    return (
      <div className="relative w-full h-[30rem] bg-white/60 rounded-xl mb-6 flex items-center justify-center border border-gray-200 backdrop-blur-md">
        <div>표시할 디자인 이미지가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[30rem] overflow-hidden rounded-xl mb-6">
      {/* 슬라이드 이미지 */}
      <div className="h-full">
        {labels.map((label, idx) => (
          <div
            key={label.id}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
              idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={label.labelImage}
              alt={label.title || "패키지 디자인 샘플"}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* 좌우 화살표 네비게이션 */}
      <button 
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 p-1 rounded-full z-20"
        onClick={prevSlide}
      >
        <ChevronLeft className="text-white w-6 h-6" />
      </button>
      <button 
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 p-1 rounded-full z-20"
        onClick={nextSlide}
      >
        <ChevronRight className="text-white w-6 h-6" />
      </button>
      
      {/* 하단 인디케이터 */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-20">
        {labels.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === activeIndex ? "bg-primary" : "bg-white/40"
            }`}
            aria-label={`슬라이드 ${idx + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}

// 패키지 디자인 과정 단계 컴포넌트
function DesignProcessCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-white/60 border border-gray-200 backdrop-blur-lg rounded-xl shadow-md transform hover:scale-105 hover:shadow-lg transition-all duration-300 hover-lift">
      <CardContent className="p-4 text-center">
        <div className="w-12 h-12 bg-white/70 border border-gray-200 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm hover:shadow-md transition-all duration-300">
          {icon}
        </div>
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-700">{description}</p>
      </CardContent>
    </Card>
  );
}

// 인기 패키지 디자인 컴포넌트
function PopularDesignCard({
  image,
  title,
  rating,
}: {
  image: string;
  title: string;
  rating: number;
}) {
  return (
    <Card className="glass-card overflow-hidden transform hover:scale-105 hover:shadow-xl transition-all duration-300 hover-lift group">
      <div className="relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-36 object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow transform group-hover:scale-110 transition-all duration-300">
          <Heart className="w-4 h-4 text-rose-600 group-hover:animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{title}</h4>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 group-hover:animate-spin transition-all duration-300" />
            <span className="text-xs ml-1 text-gray-700 font-bold">{rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { language } = useLanguage();
  const t = commonTranslations[language]; // 번역 객체

  // 인기 디자인 상태 관리
  const [popularDesigns, setPopularDesigns] = useState<
    Array<{
    id: string | number;
    image: string;
    title: string;
    rating: number;
    }>
  >([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [designsError, setDesignsError] = useState<string | null>(null);

  // 예약 링크 상태 관리
  const [reservationLinks, setReservationLinks] = useState<
    Array<{
      id: string | number;
      title: string;
      url: string;
      isActive: boolean;
      displayOrder: number;
    }>
  >([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  // 인기 디자인 가져오기
  useEffect(() => {
    const fetchPopularDesigns = async () => {
      try {
        setLoadingDesigns(true);
        setDesignsError(null);
        
        console.log("인기 디자인 API 호출 시작");
        const response = await galleryApi.getLabels();
        console.log("갤러리 API 응답:", response.data);
        
        if (
          response.data.success &&
          response.data.labels &&
          response.data.labels.length > 0
        ) {
          // 평점 높은 순서대로 정렬하고 상위 4개만 선택
          const sortedItems = response.data.labels
            .filter((item: any) => item.rating && item.rating > 0) // 평점이 있는 항목만
            .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)) // 평점 높은 순 정렬
            .slice(0, 4) // 상위 4개만
            .map((item: any) => ({
              id: item.id,
              image: item.labelImage || item.bottleImage || "",
              title: item.title || "무제",
              rating: item.rating || 0,
            }));
          
          console.log("정렬된 인기 디자인:", sortedItems);
          setPopularDesigns(sortedItems);
        } else {
          console.log("갤러리 데이터가 없음");
          setPopularDesigns([]);
        }
      } catch (error) {
        console.error("인기 디자인 가져오기 오류:", error);
        setDesignsError("인기 디자인을 불러오는 중 오류가 발생했습니다");
        setPopularDesigns([]);
      } finally {
        setLoadingDesigns(false);
      }
    };

    fetchPopularDesigns();
  }, []);

  // 예약 링크 가져오기
  useEffect(() => {
    const fetchReservationLinks = async () => {
      try {
        setLoadingLinks(true);
        const response = await labelApi.getReservationLinks();
        if (response.data && Array.isArray(response.data)) {
          const activeLinks = response.data
            .filter((link: any) => link.isActive)
            .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .slice(0, 3); // 상위 3개만 표시
          setReservationLinks(activeLinks);
        }
      } catch (error) {
        console.error("예약 링크 가져오기 오류:", error);
        setReservationLinks([]);
      } finally {
        setLoadingLinks(false);
      }
    };

    fetchReservationLinks();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 히어로 섹션 */}
      <section className="px-4 py-1">
        <div className="container mx-auto max-w-3xl">
          <div className="relative rounded-2xl overflow-hidden mb-6">
            <div className="absolute inset-0">
              <img src="/images/home/2.png" alt="Hero 배경" className="w-full h-full object-cover" />
            </div>
            
            {/* 떠다니는 애니메이션 요소들 */}
            <FloatingElements />
            
            <div className="relative rounded-2xl p-6 bg-white/60 border border-gray-200 backdrop-blur-lg shadow-md">
              {/* 화려한 타이틀 애니메이션 */}
              <div className="text-center mb-4">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent animate-pulse">
                  ✨ 나만의 패키지 디자인 ✨
                </h1>
                <p className="text-gray-700 mb-2 animate-fade-in">
                  특별한 순간을 위한 특별한 박스 패키지를 디자인해보세요
                </p>
                <p className="text-sm text-primary font-medium animate-bounce">
                  🎉 로그인 없이 바로 주문 가능! 🎉
                </p>
              </div>
          
          <LabelSlider />

              {/* 화려한 CTA 버튼들 */}
              <div className="flex flex-col space-y-3">
            <Link href="/package-selector">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center group">
                    <Package className="mr-2 h-5 w-5 group-hover:animate-spin" />
                    🚀 지금 바로 시작하기 🚀
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/gallery">
              <Button 
                      variant="outline"
                      className="w-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-300 hover:bg-gradient-to-r hover:from-amber-500/30 hover:to-orange-500/30 backdrop-blur-sm py-3 rounded-lg font-medium flex items-center justify-center group transform hover:scale-105 transition-all duration-300"
              >
                      <Star className="mr-1 h-4 w-4 group-hover:animate-pulse" />
                      인기 디자인
              </Button>
            </Link>
            
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border-green-300 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 backdrop-blur-sm py-3 rounded-lg font-medium flex items-center justify-center group transform hover:scale-105 transition-all duration-300"
                    >
                      <Gift className="mr-1 h-4 w-4 group-hover:animate-bounce" />
                      문의하기
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 특별 혜택 배너 */}
              <div className="mt-4 p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg border border-red-200 text-center animate-pulse">
                <p className="text-sm font-bold text-red-700">
                  🎁 신규 고객 특가! 첫 주문 시 10% 할인! 🎁
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 예약 링크 광고 섹션 */}
      {reservationLinks.length > 0 && (
        <section className="px-4 py-1">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl p-4 border border-red-200 animate-pulse">
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-red-700 mb-1 animate-bounce">
                  🎉 특별 예약 이벤트 🎉
                </h2>
                <p className="text-xs text-red-600">지금 예약하고 특별한 혜택을 받아보세요!</p>
              </div>
              <div className="grid gap-2">
                {reservationLinks.map((link, idx) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-red-200 hover:bg-white/90 hover:scale-105 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-800 group-hover:text-red-900">
                        {link.title}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full animate-pulse">
                          HOT
                        </span>
                        <TrendingUp className="w-4 h-4 text-red-600 animate-bounce" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 고객 후기 섹션 */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2 animate-fade-in">⭐ 고객 후기 ⭐</h2>
            <p className="text-sm text-gray-600 animate-slide-in-left">실제 고객들의 생생한 후기를 확인해보세요</p>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* 추가 광고 효과 - 한정 시간 할인 */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-3xl">
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-red-500/20 rounded-2xl p-4 border border-orange-200">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-gradient"></div>
            <div className="relative z-10 text-center">
              <h3 className="text-lg font-bold text-orange-800 mb-2 animate-bounce">
                ⏰ 한정 시간 특가! ⏰
              </h3>
              <p className="text-sm text-orange-700 mb-3">
                지금 주문하면 <span className="font-bold text-red-600 animate-pulse">30% 할인</span> + 무료배송!
              </p>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white/70 rounded p-2 animate-float">
                  <div className="font-bold text-orange-600">1,247</div>
                  <div className="text-gray-600">주문 완료</div>
                </div>
                <div className="bg-white/70 rounded p-2 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="font-bold text-green-600">24H</div>
                  <div className="text-gray-600">빠른 제작</div>
                </div>
                <div className="bg-white/70 rounded p-2 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="font-bold text-blue-600">98%</div>
                  <div className="text-gray-600">만족도</div>
                </div>
              </div>
              <Link href="/package-selector">
                <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-2 rounded-full font-bold transform hover:scale-110 transition-all duration-300 animate-pulse">
                  🔥 지금 바로 주문하기 🔥
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 파트너 브랜드 로고 슬라이더 */}
      <section className="px-4 py-4">
        <div className="container mx-auto max-w-3xl">
          <PartnerBrandLogos />
        </div>
      </section>

      {/* 탭 콘텐츠 */}
      <section className="px-4 py-6">
        <div className="container mx-auto max-w-3xl">
        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 border border-gray-200 backdrop-blur-sm">
            <TabsTrigger
              value="process"
              className="text-xs flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Palette className="w-3 h-3" />
              제작과정
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="text-xs flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <Star className="w-3 h-3" />
              인기작품
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="text-xs flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-3 h-3" />
              특징
            </TabsTrigger>
            <TabsTrigger
              value="benefits"
              className="text-xs flex items-center gap-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              <Crown className="w-3 h-3" />
              혜택
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="mt-6">
            {/* Discord-like translucent background overlay with image 2.png */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{}}
            >
              <div className="absolute inset-0">
                <img
                  src="/images/home/2.png"
                  alt="제작 과정 배경"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-4 space-y-4 bg-white/70 border border-gray-200 backdrop-blur-md rounded-2xl">
              <DesignProcessCard 
                icon={
                  <div className="animate-bounce">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                }
                title="📦 패키지 선택"
                description="다양한 박스 패키지 중에서 원하는 형태와 크기를 선택하세요."
              />
              <DesignProcessCard 
                icon={
                  <div className="animate-pulse">
                    <Palette className="w-6 h-6 text-emerald-600" />
                  </div>
                }
                title="🎨 패키지 디자인"
                description="다양한 배경과 디자인 요소를 활용해 나만의 패키지를 만들어보세요."
              />
              <DesignProcessCard 
                icon={
                  <div className="animate-spin" style={{ animationDuration: '3s' }}>
                    <ShoppingCart className="w-6 h-6 text-amber-600" />
                  </div>
                }
                title="🚚 주문 및 배송"
                description="디자인이 완료되면 주문하고 곧 특별한 패키지를 받아보세요."
              />
              
              <Link href="/package-selector">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300 pulse-glow">
                  <Package className="w-4 h-4 animate-bounce" />
                  🚀 지금 시작하기 🚀
                </Button>
              </Link>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              {loadingDesigns ? (
                <div className="col-span-2 text-center py-8">
                  인기 디자인 로딩 중...
                </div>
              ) : designsError ? (
                <div className="col-span-2 text-center py-8 text-red-400">
                  {designsError}
                </div>
              ) : popularDesigns.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  표시할 인기 디자인이 없습니다.
                </div>
              ) : (
                popularDesigns.map((design) => (
                  <PopularDesignCard 
                    key={design.id}
                    image={design.image}
                    title={design.title}
                    rating={design.rating}
                  />
                ))
              )}
            </div>
            <Link href="/gallery">
              <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300 animate-pulse">
                <Star className="w-4 h-4 animate-spin" />
                ✨ 더 많은 디자인 보기 ✨
              </Button>
            </Link>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card p-4 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <div className="animate-bounce">
                  <Package className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">프리미엄 품질</p>
                <p className="text-xs text-gray-600 mt-1">최고급 재료 사용</p>
              </Card>
              <Card className="glass-card p-4 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <div className="animate-pulse">
                  <Palette className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">맞춤형 디자인</p>
                <p className="text-xs text-gray-600 mt-1">1000+ 디자인 템플릿</p>
              </Card>
              <Card className="glass-card p-4 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <div className="animate-spin">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">특별한 이벤트</p>
                <p className="text-xs text-gray-600 mt-1">결혼식, 생일, 기념일</p>
              </Card>
              <Card className="glass-card p-4 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                <div className="animate-bounce">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">빠른 제작</p>
                <p className="text-xs text-gray-600 mt-1">24시간 내 완성</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center mb-2">
                  <Crown className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="font-bold text-purple-800">VIP 회원 혜택</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 모든 디자인 무료 이용</li>
                  <li>• 우선 제작 서비스</li>
                  <li>• 전담 디자이너 배정</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg border border-green-200">
                <div className="flex items-center mb-2">
                  <Gift className="w-6 h-6 text-green-600 mr-2" />
                  <h3 className="font-bold text-green-800">특별 이벤트</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 첫 주문 10% 할인</li>
                  <li>• 5개 이상 주문 시 20% 할인</li>
                  <li>• 추천 고객 적립금 지급</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Users className="w-6 h-6 text-blue-600 mr-2" />
                  <h3 className="font-bold text-blue-800">고객 서비스</h3>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 24시간 고객 상담</li>
                  <li>• 무료 수정 서비스</li>
                  <li>• 100% 만족 보장</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </section>
    </div>
  );
}
