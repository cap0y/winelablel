import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wine,
  Palette,
  ShoppingCart,
  Star,
  Heart,
  Sparkles,
  LucideWine,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { commonTranslations } from "@/lib/translations";
import { galleryApi } from "@/services/api";

// 와인 라벨 슬라이더 컴포넌트
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
    const fetchPopularLabels = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("API 호출 시작: 인기 라벨 이미지");
        const response = await galleryApi.getPopularLabelImages(5);
        console.log("API 응답 데이터:", response.data);

        let labelData: Array<{
          id: string;
          title: string;
          labelImage: string;
        }> = [];

        // 기본 라벨 이미지 준비 (필요시 사용)
        const defaultLabels = [
          {
            id: "default-1",
            title: "샘플 라벨 1",
            labelImage: "images/label/file-1753530879093-959834921.png",
          },
          {
            id: "default-2",
            title: "샘플 라벨 2",
            labelImage: "images/label/file-1753530768142-739119583.png",
          },
          {
            id: "default-3",
            title: "샘플 라벨 3",
            labelImage: "images/label/file-1753530313930-858584954.png",
          },
        ];

        // API 응답에서 라벨 가져오기
        if (
          response.data.success &&
          response.data.labels &&
          response.data.labels.length > 0
        ) {
          console.log("API에서 가져온 라벨 수:", response.data.labels.length);
          labelData = response.data.labels;

          // 라벨이 3개 미만이면 기본 이미지로 보충
          if (labelData.length < 3) {
            console.log(
              `라벨이 ${labelData.length}개뿐이므로 기본 이미지로 보충합니다.`,
            );

            // 필요한 만큼 기본 이미지 추가 (3개까지)
            const neededImages = 3 - labelData.length;
            console.log(`추가해야 할 이미지 수: ${neededImages}개`);

            for (let i = 0; i < neededImages; i++) {
              console.log(`기본 이미지 ${i + 1} 추가 중...`);
              labelData.push({ ...defaultLabels[i] });
            }

            // 추가 검증 로직: 최종 라벨 데이터가 3개인지 확인
            if (labelData.length < 3) {
              console.error(
                "보충 후에도 이미지가 3개가 안 됨. 강제로 3개 설정",
              );

              // 어떤 문제가 있든 강제로 3개 설정
              labelData = [
                ...labelData, // 기존 이미지는 유지
                // 부족한 만큼 기본 이미지 채우기
                ...defaultLabels.slice(0, 3 - labelData.length),
              ];
            }
          }
        } else {
          console.log("API에서 라벨 데이터가 없어 기본 이미지만 사용");
          labelData = defaultLabels;
        }

        console.log("최종 표시할 라벨 개수:", labelData.length);
        setLabels(labelData);
      } catch (error) {
        console.error("인기 라벨 이미지 가져오기 오류:", error);
        setError("이미지를 불러오는 중 오류가 발생했습니다");
        // 오류 발생시 기본 이미지 사용
        setLabels([
          {
            id: "default-1",
            title: "샘플 라벨 1",
            labelImage: "images/label/file-1753530879093-959834921.png",
          },
          {
            id: "default-2",
            title: "샘플 라벨 2",
            labelImage: "images/label/file-1753530768142-739119583.png",
          },
          {
            id: "default-3",
            title: "샘플 라벨 3",
            labelImage: "images/label/file-1753530313930-858584954.png",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularLabels();
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
      <div className="relative w-full h-60 bg-gray-800 rounded-xl mb-6 flex items-center justify-center">
        <div className="animate-pulse">이미지 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-60 bg-gray-800 rounded-xl mb-6 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="relative w-full h-60 bg-gray-800 rounded-xl mb-6 flex items-center justify-center">
        <div>표시할 라벨 이미지가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-60 overflow-hidden rounded-xl mb-6">
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
              alt={label.title || "와인 라벨 샘플"}
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

// 와인 디자인 과정 단계 컴포넌트
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
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4 text-center">
        <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
        <h3 className="font-medium text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

// 인기 와인 라벨 디자인 컴포넌트
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
    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
      <div className="relative">
        <img src={image} alt={title} className="w-full h-36 object-cover" />
        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm text-white">{title}</h4>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs ml-1 text-gray-300">{rating}</span>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 히어로 섹션 */}
      <section className="px-4 py-6">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">나만의 와인 라벨 제작</h1>
          <p className="text-gray-300 mb-4">
            특별한 순간을 위한 특별한 와인 라벨을 만들어보세요
          </p>

          <LabelSlider />

          <div className="flex flex-col space-y-2">
            <Link href="/wine-bottles">
              <Button className="w-full bg-gradient-to-r from-primary/80 to-primary/60 hover:opacity-90 text-white/90 backdrop-blur-md py-3 rounded-lg font-medium flex items-center justify-center">
                <Wine className="mr-2 h-4 w-4" />
                시작하기
              </Button>
            </Link>

            <Link href="/gallery">
              <Button
                variant="outline"
                className="w-full bg-gray-800/80 text-primary border-primary/30 hover:bg-gray-800/90 py-3 rounded-lg font-medium flex items-center justify-center"
              >
                <Star className="mr-2 h-4 w-4" />
                인기 디자인 구경하기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 탭 콘텐츠 */}
      <section className="px-4 py-6">
        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger
              value="process"
              className="text-sm flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Palette className="w-4 h-4" />
              제작 과정
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="text-sm flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Star className="w-4 h-4" />
              인기 디자인
            </TabsTrigger>
            <TabsTrigger
              value="features"
              className="text-sm flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4" />
              특징
            </TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="mt-6">
            <div className="space-y-4">
              <DesignProcessCard
                icon={<Wine className="w-6 h-6 text-primary" />}
                title="와인병 선택"
                description="다양한 와인병 중에서 원하는 형태와 크기를 선택하세요."
              />
              <DesignProcessCard
                icon={<Palette className="w-6 h-6 text-primary" />}
                title="라벨 디자인"
                description="다양한 배경과 디자인 요소를 활용해 나만의 라벨을 만들어보세요."
              />
              <DesignProcessCard
                icon={<ShoppingCart className="w-6 h-6 text-primary" />}
                title="주문 및 배송"
                description="디자인이 완료되면 주문하고 곧 특별한 와인 라벨을 받아보세요."
              />

              <Link href="/wine-bottles">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2">
                  <Wine className="w-4 h-4" />
                  지금 시작하기
                </Button>
              </Link>
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
              <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2">
                더 많은 디자인 보기
              </Button>
            </Link>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                <Wine className="text-primary w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">프리미엄 품질</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                <Palette className="text-primary w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">맞춤형 디자인</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                <Sparkles className="text-primary w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">특별한 이벤트</p>
              </Card>
              <Card className="bg-gray-800 border-gray-700 p-4 text-center">
                <ShoppingCart className="text-primary w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium text-white">빠른 배송</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
