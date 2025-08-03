import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Star, Search, Heart, Wine, Filter, X, Send, Clock, MessageSquare, ThumbsUp } from "lucide-react";
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
function GalleryCard({ item, onLikeToggle, isUserLiked, onClick }: { 
  item: GalleryItem; 
  onLikeToggle: () => void;
  isUserLiked: boolean;
  onClick: () => void;
}) {
  const date = new Date(item.createdAt);
  const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer bg-gray-900 border-gray-700 hover:border-cyan-500/50" onClick={onClick}>
      <div className="relative">
        <img 
          src={item.labelImage} 
          alt={item.title} 
          className="w-full h-48 object-cover" 
        />
        <button 
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all hover:scale-110 ${isUserLiked ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50' : 'bg-white/80 text-gray-600 hover:bg-rose-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle();
          }}
        >
          <Heart className={`w-4 h-4 ${isUserLiked ? 'fill-white' : ''}`} />
        </button>
      </div>
      <CardContent className="p-4 bg-gray-900">
        <h3 className="font-medium mb-1 text-cyan-300">{item.title}</h3>
        <p className="text-sm text-gray-400 mb-2">by <span className="text-cyan-400">{item.designer}</span></p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formattedDate}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
            <span className="text-sm text-yellow-300">{item.rating}</span>
            <span className="text-xs text-gray-500 ml-1">({item.ratingCount})</span>
            <span className="text-xs text-rose-400 ml-2 flex items-center">
              <Heart className="w-3 h-3 mr-1 fill-rose-400" />
              {item.likes}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 별점 선택 컴포넌트
function StarRating({ rating, setRating, readOnly = false }: { 
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
            className={`${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : ''} p-0.5`}
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                isFullStar
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm'
                  : isHalfStar
                  ? 'text-yellow-400 fill-gradient-lr-yellow'
                  : 'text-gray-600 hover:text-yellow-500'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

// 라벨 상세 대화상자 컴포넌트
function LabelDetailDialog({ labelId, isOpen, onClose }: { 
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
    queryKey: ['labelDetail', labelId],
    queryFn: () => labelId ? galleryApi.getLabelDetail(labelId).then(res => res.data) : null,
    enabled: !!labelId && isOpen
  });

  const label = data?.label;

  // 댓글 제출 처리
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !labelId || !comment.trim()) return;

    try {
      await galleryApi.addComment(labelId, user.id, comment);
      toast({ title: '댓글이 등록되었습니다.' });
      setComment("");
      refetch();
    } catch (err) {
      toast({ 
        title: '댓글 등록 실패', 
        description: '댓글을 등록하는 중 오류가 발생했습니다.', 
        variant: 'destructive' 
      });
    }
  };

  // 별점 등록 처리
  const handleRating = async (value: number) => {
    if (!user || !labelId) return;

    try {
      await galleryApi.rateLabel(labelId, user.id, value);
      setUserRating(value);
      toast({ title: '별점이 등록되었습니다.' });
      refetch();
    } catch (err) {
      toast({ 
        title: '별점 등록 실패', 
        description: '별점을 등록하는 중 오류가 발생했습니다.', 
        variant: 'destructive' 
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
        title: '좋아요 처리 실패', 
        description: '좋아요를 처리하는 중 오류가 발생했습니다.', 
        variant: 'destructive' 
      });
    }
  };

  if (!labelId || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto p-0 bg-gray-900 border-gray-800 text-white">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-gray-300">라벨 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <p>라벨 정보를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : label ? (
          <div className="grid md:grid-cols-2">
            <div className="bg-gray-800 flex items-center justify-center p-4">
              <img 
                src={label.labelImage} 
                alt={label.title} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-6 flex flex-col h-full max-h-[80vh] overflow-hidden bg-gray-900">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl text-cyan-400 font-bold">{label.title}</DialogTitle>
              </DialogHeader>
              
              <div className="mb-6 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">by <span className="text-cyan-300">{label.designer}</span></span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-yellow-300 font-semibold">{label.rating}</span>
                      <span className="text-xs text-gray-400 ml-1">({label.ratingCount})</span>
                    </div>
                    <button 
                      className="flex items-center gap-1 text-sm hover:scale-105 transition-transform"
                      onClick={handleLikeToggle}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400 text-rose-400' : 'text-gray-400 hover:text-rose-300'}`} />
                      <span className="text-gray-300">{label.likes}</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full inline-block w-fit">
                  {label.bottleName}
                </p>
                
                {user && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm mr-3 text-gray-300 font-medium">별점 주기:</span>
                        <StarRating rating={userRating} setRating={handleRating} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-auto mb-4">
                <h3 className="font-medium mb-3 flex items-center text-cyan-400 border-b border-gray-700 pb-2">
                  <MessageSquare className="w-4 h-4 mr-2 text-cyan-500" />
                  댓글 ({label.comments?.length || 0})
                </h3>
                <div className="overflow-auto pr-2 max-h-60">
                  {label.comments?.length ? (
                    label.comments.map((comment: Comment) => (
                      <div key={comment.id} className="py-3 border-b border-gray-700 last:border-0">
                        <div className="flex items-start">
                          <Avatar className="w-8 h-8 mr-3 border border-gray-600">
                            {comment.photoURL ? (
                              <AvatarImage src={comment.photoURL} alt={comment.displayName || comment.username} />
                            ) : (
                              <AvatarFallback className="bg-gray-700 text-gray-300">
                                {(comment.displayName || comment.username || '?').substring(0, 2)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm text-cyan-300">
                                {comment.displayName || comment.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 bg-gray-800/30 p-2 rounded-lg">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4 bg-gray-800/30 rounded-lg">
                      아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </p>
                  )}
                </div>
              </div>
              
              {user && (
                <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-gray-700">
                  <div className="flex gap-2 items-start">
                    <Avatar className="w-8 h-8 border border-gray-600">
                      {user.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || user.username} />
                      ) : (
                        <AvatarFallback className="bg-gray-700 text-gray-300">
                          {(user.displayName || user.username || '?').substring(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Textarea 
                      placeholder="댓글을 남겨보세요..."
                      className="flex-1 min-h-[60px] resize-none bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-cyan-500"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      size="sm" 
                      className="mt-1 bg-cyan-600 hover:bg-cyan-700 text-white border-none"
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
            <p className="text-gray-400">라벨 정보를 찾을 수 없습니다.</p>
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
  
  // 라벨 목록 가져오기
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['galleryLabels'],
    queryFn: () => galleryApi.getLabels().then(res => res.data),
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
        (item.title || '').toLowerCase().includes(searchLower) ||
        (item.designer || '').toLowerCase().includes(searchLower) ||
        (item.bottleName || '').toLowerCase().includes(searchLower)
      );
    });
  }, [data?.labels, searchTerm]);

  // 디버깅 정보
  useEffect(() => {
    console.log("데이터 로드됨:", !!data);
    console.log("라벨 개수:", data?.labels?.length || 0);
    console.log("검색어:", searchTerm);
    console.log("필터링된 결과 개수:", filteredItems.length);
  }, [data, searchTerm, filteredItems.length]);
  
  // 사용자가 좋아요한 라벨 확인
  const handleLikeToggle = async (labelId: string) => {
    if (!user) {
      toast({ 
        title: '로그인이 필요합니다', 
        description: '좋아요를 남기려면 먼저 로그인해주세요.', 
        variant: 'destructive' 
      });
      return;
    }
    
    try {
      await galleryApi.toggleLike(labelId, user.id);
      setUserLikes(prev => ({ ...prev, [labelId]: !prev[labelId] }));
      refetch();
    } catch (err) {
      toast({ 
        title: '좋아요 처리 실패', 
        description: '좋아요를 처리하는 중 오류가 발생했습니다.', 
        variant: 'destructive' 
      });
    }
  };
  
  // 라벨 클릭 처리
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
    <div className="container mx-auto px-4 py-6 min-h-screen bg-gray-950">
      <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400">인기 라벨 디자인 갤러리</h1>
      
      {/* 검색 필드 */}
      <div className="mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="디자인, 디자이너, 와인 이름으로 검색" 
            className="pl-10 bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-cyan-500"
            value={searchTerm}
            onChange={(e) => {
              const newSearchTerm = e.target.value;
              console.log("검색어 변경:", newSearchTerm);
              setSearchTerm(newSearchTerm);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                console.log("검색 실행:", searchTerm);
                // 검색 실행 시 포커스 제거하여 키보드 닫기
                e.currentTarget.blur();
              }
            }}
          />
        </div>
      </div>
      
      {/* 갤러리 그리드 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">라벨 디자인을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>라벨 디자인을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item: GalleryItem) => (
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
          <Wine className="mx-auto mb-4 text-gray-500 w-12 h-12" />
          <h3 className="text-xl font-medium mb-2 text-gray-300">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어를 입력해보세요</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/wine-bottles">
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg hover:shadow-cyan-500/25 transition-all">
            <Wine className="mr-2 w-4 h-4" />
            나만의 라벨 디자인하기
          </Button>
        </Link>
      </div>
      
      {/* 라벨 상세 대화상자 */}
      <LabelDetailDialog 
        labelId={selectedLabel} 
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
} 