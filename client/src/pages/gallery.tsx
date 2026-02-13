import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Star,
  Search,
  Heart,
  Package,
  Filter,
  X,
  Send,
  Clock,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Award,
  Zap,
  Gift,
  Users,
  Crown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { galleryApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import React from "react";

// 갤러리 아이템 타입 정의
interface GalleryItem {
  id: string;
  title: string;
  labelImage: string;
  bottleName: string;
  rating: string;
  ratingCount: number;
  likes: number;
  designer: string;
  createdAt: string;
}

interface Comment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  displayName?: string;
  username: string;
  photoURL?: string;
}

// 갤러리 카드 컴포넌트
function GalleryCard({
  item,
  onLikeToggle,
  isUserLiked,
  onClick,
}: {
  item: GalleryItem;
  onLikeToggle: () => void;
  isUserLiked: boolean;
  onClick: () => void;
}) {
  const date = new Date(item.createdAt);
  const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;

  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer glass-card"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={item.labelImage}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <button
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all hover:scale-110 ${isUserLiked ? "bg-rose-500 text-white shadow-lg shadow-rose-500/50" : "bg-white/80 text-gray-600 hover:bg-rose-100"}`}
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle();
          }}
        >
          <Heart className={`w-4 h-4 ${isUserLiked ? "fill-white" : ""}`} />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1 text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-600 mb-2">
          by <span className="text-[#0F7B6C]">{item.designer}</span>
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formattedDate}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm text-yellow-700">{item.rating}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({item.ratingCount})
            </span>
            <span className="text-xs text-rose-600 ml-2 flex items-center">
              <Heart className="w-3 h-3 mr-1 fill-rose-600" />
              {item.likes}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 별점 선택 컴포넌트
function StarRating({
  rating,
  setRating,
  readOnly = false,
}: {
  rating: number;
  setRating?: (value: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((value) => {
        const isHalfStar = rating > value - 1 && rating < value;
        const isFullStar = rating >= value;
        return (
          <button
            key={value}
            type="button"
            disabled={readOnly}
            onClick={() => setRating && setRating(value)}
            className={`${!readOnly ? "cursor-pointer hover:scale-110 transition-transform" : ""} p-0.5`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isFullStar
                  ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                  : isHalfStar
                    ? "text-yellow-400 fill-gradient-lr-yellow"
                    : "text-gray-600 hover:text-yellow-500"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// 디자인 상세 대화상자 컴포넌트
function LabelDetailDialog({
  labelId,
  isOpen,
  onClose,
}: {
  labelId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["labelDetail", labelId],
    queryFn: () =>
      labelId
        ? galleryApi.getLabelDetail(labelId).then((res) => res.data)
        : null,
    enabled: !!labelId && isOpen,
  });

  const label = data?.label;

  // 댓글 제출 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !labelId || !comment.trim()) return;

    try {
      await galleryApi.addComment(labelId, user.id, comment);
      toast({ title: "댓글이 등록되었습니다." });
      setComment("");
      refetch();
    } catch (err) {
      toast({
        title: "댓글 등록 실패",
        description: "댓글을 등록하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 별점 등록 처리
  const handleRating = async (value: number) => {
    if (!user || !labelId) return;

    try {
      await galleryApi.rateLabel(labelId, user.id, value);
      setUserRating(value);
      toast({ title: "별점이 등록되었습니다." });
      refetch();
    } catch (err) {
      toast({
        title: "별점 등록 실패",
        description: "별점을 등록하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!user || !labelId) return;

    try {
      await galleryApi.toggleLike(labelId, user.id);
      setIsLiked(!isLiked);
      refetch();
    } catch (err) {
      toast({
        title: "좋아요 처리 실패",
        description: "좋아요를 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (!labelId || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto p-0 bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">디자인 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>디자인 정보를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : label ? (
          <div className="grid md:grid-cols-2">
            <div className="bg-white/70 backdrop-blur-sm flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200">
              <img
                src={label.labelImage}
                alt={label.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-6 flex flex-col h-full max-h-[80vh] overflow-hidden bg-white">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl text-gray-900 font-bold">
                  {label.title}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  패키지 디자인 상세 정보 및 평점과 댓글을 확인하고 추가할 수
                  있습니다.
                </DialogDescription>
              </DialogHeader>

              <div className="mb-6 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">
                    by <span className="text-[#0F7B6C]">{label.designer}</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-yellow-300 font-semibold">
                        {label.rating}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        ({label.ratingCount})
                      </span>
                    </div>
                    <button
                      className="flex items-center gap-1 text-sm hover:scale-105 transition-transform"
                      onClick={handleLikeToggle}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-rose-400 text-rose-400" : "text-gray-400 hover:text-rose-300"}`}
                      />
                      <span className="text-gray-300">{label.likes}</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full inline-block w-fit">
                  {label.bottleName}
                </p>

                {user && (
                  <div className="mt-3 p-3 bg-white/70 rounded-lg border border-gray-200 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm mr-3 text-gray-700 font-medium">
                          별점 주기:
                        </span>
                        <StarRating
                          rating={userRating}
                          setRating={handleRating}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto mb-4">
                <h3 className="font-medium mb-3 flex items-center text-gray-900 border-b border-gray-200 pb-2">
                  <MessageSquare className="w-4 h-4 mr-2 text-[#2F3437]" />
                  댓글 ({label.comments?.length || 0})
                </h3>
                <div className="overflow-auto pr-2 max-h-60">
                  {label.comments?.length ? (
                    label.comments.map((comment: Comment) => (
                      <div
                        key={comment.id}
                        className="py-3 border-b border-gray-200 last:border-0"
                      >
                        <div className="flex items-start">
                          <Avatar className="w-8 h-8 mr-3 border border-gray-300">
                            {comment.photoURL ? (
                              <AvatarImage
                                src={comment.photoURL}
                                alt={comment.displayName || comment.username}
                              />
                            ) : (
                              <AvatarFallback className="bg-gray-200 text-gray-700">
                                {(
                                  comment.displayName ||
                                  comment.username ||
                                  "?"
                                ).substring(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm text-blue-700">
                                {comment.displayName || comment.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "ko-KR",
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-lg">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </p>
                  )}
                </div>
              </div>

              {user && (
                <form
                  onSubmit={handleCommentSubmit}
                  className="pt-3 border-t border-gray-200"
                >
                  <div className="flex gap-2 items-start">
                    <Avatar className="w-8 h-8 border border-gray-600">
                      {user.photoURL ? (
                        <AvatarImage
                          src={user.photoURL}
                          alt={user.displayName || user.username}
                        />
                      ) : (
                        <AvatarFallback className="bg-gray-700 text-gray-300">
                          {(user.displayName || user.username || "?").substring(
                            0,
                            2,
                          )}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Textarea
                      placeholder="댓글을 남겨보세요..."
                      className="flex-1 min-h-[60px] resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-primary"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="mt-1 bg-primary hover:bg-primary/90 text-white border-none"
                      disabled={!comment.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400">디자인 정보를 찾을 수 없습니다.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Gallery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 디자인 목록 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["galleryLabels"],
    queryFn: () => galleryApi.getLabels().then((res) => res.data),
    staleTime: 60000, // 1분간 데이터 신선한 상태 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 갱신 방지
  });

  // 필터링된 아이템 목록
  const filteredItems = React.useMemo(() => {
    if (!data?.labels) return [];

    return data.labels.filter((item: GalleryItem) => {
      if (!searchTerm.trim()) return true; // 검색어가 없으면 모든 아이템 표시

      const searchLower = searchTerm.toLowerCase();
      // 검색어 필터링
      return (
        (item.title || "").toLowerCase().includes(searchLower) ||
        (item.designer || "").toLowerCase().includes(searchLower) ||
        (item.bottleName || "").toLowerCase().includes(searchLower)
      );
    });
  }, [data?.labels, searchTerm]);

  // 페이지네이션된 아이템 목록
  const paginatedItems = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // 검색어 변경 시 첫 페이지로 이동
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 디버깅 정보
  useEffect(() => {
    console.log("데이터 로드됨:", !!data);
    console.log("디자인 개수:", data?.labels?.length || 0);
    console.log("검색어:", searchTerm);
    console.log("필터링된 결과 개수:", filteredItems.length);
  }, [data, searchTerm, filteredItems.length]);

  // 사용자가 좋아요한 디자인 확인
  const handleLikeToggle = async (labelId: string) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요를 남기려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await galleryApi.toggleLike(labelId, user.id);
      setUserLikes((prev) => ({ ...prev, [labelId]: !prev[labelId] }));
      refetch();
    } catch (err) {
      toast({
        title: "좋아요 처리 실패",
        description: "좋아요를 처리하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 디자인 클릭 처리
  const handleLabelClick = (labelId: string) => {
    setSelectedLabel(labelId);
    setIsDialogOpen(true);
  };

  // 대화상자 닫기 처리
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLabel(null);
    refetch(); // 목록 새로고침
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        인기 패키지 디자인 갤러리
      </h1>

      {/* 검색 필드 */}
      <div className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="디자인, 디자이너, 패키지 이름으로 검색"
            className="pl-10 bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              console.log("검색어 변경:", newSearchTerm);
              setSearchTerm(newSearchTerm);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("검색 실행:", searchTerm);
                // 검색 실행 시 포커스 제거하여 키보드 닫기
                e.currentTarget.blur();
              }
            }}
          />
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div className="flex justify-center">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-600">패키지 디자인을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>패키지 디자인을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : paginatedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-7xl">
            {paginatedItems.map((item: GalleryItem) => (
              <GalleryCard
                key={item.id}
                item={item}
                onLikeToggle={() => handleLikeToggle(item.id)}
                isUserLiked={!!userLikes[item.id]}
                onClick={() => handleLabelClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto mb-4 text-gray-500 w-12 h-12" />
            <h3 className="text-xl font-medium mb-2 text-gray-900">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">다른 검색어를 입력해보세요</p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm"
          >
            이전
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // 현재 페이지 주변 5개 페이지만 표시
                return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                // 생략 표시 (...) 추가
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="px-2 py-1 text-sm text-gray-500">...</span>
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm ${
                          currentPage === page 
                            ? "bg-primary text-white" 
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  );
                }
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm ${
                      currentPage === page 
                        ? "bg-primary text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm"
          >
            다음
          </Button>
        </div>
      )}

      {/* 페이지 정보 */}
      {filteredItems.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          총 {filteredItems.length}개 중 {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)}개 표시
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/package-selector">
          <Button className="bg-primary hover:bg-primary/90 text-white border-none shadow-lg transition-all">
            <Package className="mr-2 w-4 h-4" />
            나만의 패키지 디자인하기
          </Button>
        </Link>
      </div>

      {/* 🔥 갤러리 특별 광고 섹션 🔥 */}
      <div className="mt-12 space-y-6">
        {/* 인기 디자이너 특가 이벤트 */}
        <section className="px-4 py-6">
          <div className="container mx-auto max-w-4xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 rounded-2xl p-6 border border-purple-200">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 animate-gradient"></div>
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-3">
                  <Crown className="w-6 h-6 text-yellow-500 animate-bounce mr-2" />
                  <h3 className="text-xl font-bold text-purple-800 animate-pulse">
                    🎨 인기 디자이너 특가 이벤트 🎨
                  </h3>
                  <Crown className="w-6 h-6 text-yellow-500 animate-bounce ml-2" />
                </div>
                <p className="text-sm text-purple-700 mb-4">
                  갤러리 TOP 10 디자이너의 <span className="font-bold text-red-600 animate-pulse">프리미엄 템플릿</span> 무료 제공!
                </p>
                <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="bg-white/70 rounded p-3 animate-float">
                    <Award className="w-5 h-5 text-yellow-500 mx-auto mb-1 animate-spin" />
                    <div className="font-bold text-purple-600">TOP 10</div>
                    <div className="text-gray-600">인기 디자이너</div>
                  </div>
                  <div className="bg-white/70 rounded p-3 animate-float" style={{ animationDelay: '0.5s' }}>
                    <Gift className="w-5 h-5 text-green-500 mx-auto mb-1 animate-pulse" />
                    <div className="font-bold text-green-600">무료</div>
                    <div className="text-gray-600">프리미엄 템플릿</div>
                  </div>
                  <div className="bg-white/70 rounded p-3 animate-float" style={{ animationDelay: '1s' }}>
                    <Users className="w-5 h-5 text-blue-500 mx-auto mb-1 animate-bounce" />
                    <div className="font-bold text-blue-600">500+</div>
                    <div className="text-gray-600">만족 고객</div>
                  </div>
                </div>
                <Link href="/package-selector">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-full font-bold transform hover:scale-110 transition-all duration-300 animate-pulse">
                    <Sparkles className="mr-2 w-4 h-4 animate-spin" />
                    지금 바로 시작하기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 고객 성공 스토리 */}
        <section className="px-4 py-6">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl p-6 border border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-blue-800 mb-2">
                  🌟 고객 성공 스토리 🌟
                </h3>
                <p className="text-sm text-blue-700">
                  우리 갤러리에서 영감을 받은 고객들의 실제 후기
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-bold text-gray-700">김○○님</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "갤러리에서 본 디자인을 참고해서 우리 브랜드만의 독특한 패키지를 만들었어요. 매출이 30% 증가했습니다!"
                  </p>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-bold text-gray-700">박○○님</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "프리미엄 디자인 템플릿 덕분에 전문가 수준의 패키지를 쉽게 만들 수 있었습니다. 강력 추천!"
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-full text-sm font-bold transform hover:scale-105 transition-all duration-300">
                    <MessageSquare className="mr-2 w-4 h-4" />
                    더 많은 후기 보기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 실시간 갤러리 통계 */}
        <section className="px-4 py-6">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl p-6 border border-green-200">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  📊 실시간 갤러리 통계 📊
                </h3>
                <p className="text-sm text-green-700">
                  지금 이 순간에도 계속 성장하는 우리 갤러리
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center bg-white/70 rounded-lg p-4 animate-float">
                  <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2 animate-bounce" />
                  <div className="text-xl font-bold text-green-600">2,847</div>
                  <div className="text-xs text-gray-600">총 패키지 디자인</div>
                </div>
                
                <div className="text-center bg-white/70 rounded-lg p-4 animate-float" style={{ animationDelay: '0.3s' }}>
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2 animate-pulse" />
                  <div className="text-xl font-bold text-red-600">15,932</div>
                  <div className="text-xs text-gray-600">좋아요 수</div>
                </div>
                
                <div className="text-center bg-white/70 rounded-lg p-4 animate-float" style={{ animationDelay: '0.6s' }}>
                  <Users className="w-6 h-6 text-blue-500 mx-auto mb-2 animate-bounce" />
                  <div className="text-xl font-bold text-blue-600">1,234</div>
                  <div className="text-xs text-gray-600">활성 디자이너</div>
                </div>
                
                <div className="text-center bg-white/70 rounded-lg p-4 animate-float" style={{ animationDelay: '0.9s' }}>
                  <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2 animate-spin" />
                  <div className="text-xl font-bold text-yellow-600">98.7%</div>
                  <div className="text-xs text-gray-600">고객 만족도</div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/package-selector">
                  <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2 rounded-full font-bold transform hover:scale-105 transition-all duration-300">
                    <Award className="mr-2 w-4 h-4 animate-bounce" />
                    나도 갤러리 스타 되기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 디자인 상세 대화상자 */}
      <LabelDetailDialog
        labelId={selectedLabel}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
