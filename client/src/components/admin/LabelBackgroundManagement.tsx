import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminApi, uploadApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Plus, Edit, Check, X, ImageIcon, Grid, List, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LabelBackgroundManagement() {
  const { toast } = useToast();
  
  // 상태 관리
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [userUploads, setUserUploads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // 초기 로딩 상태를 false로 변경
  const [activeTab, setActiveTab] = useState("backgrounds");
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'category'>('grid'); // 전체보기를 기본값으로 변경
  
  // 캐싱을 위한 상태 추가
  const [backgroundsLoaded, setBackgroundsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [userUploadsLoaded, setUserUploadsLoaded] = useState(false);
  
  // 카테고리 관리 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // 배경 이미지와 카테고리 관계 관리 상태
  const [isAssigningCategories, setIsAssigningCategories] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<any>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  
  // 데이터 로드
  useEffect(() => {
    // 컴포넌트 마운트 시 현재 탭에 맞는 데이터 즉시 로드
    if (activeTab === "backgrounds") {
      fetchBackgrounds();
      fetchCategories();
      fetchUserUploads(); // 사용자 업로드 이미지도 함께 로드
    } else if (activeTab === "categories") {
      fetchCategories();
    }
  }, []); // 빈 의존성 배열로 마운트 시에만 실행
  
  // 배경 이미지 로드
  const fetchBackgrounds = async () => {
    if (backgroundsLoaded) return; // 이미 로드된 경우 중복 요청 방지
    
    setIsLoading(true);
    try {
      const response = await adminApi.getLabelBackgrounds();
      if (response.data.success) {
        setBackgrounds(response.data.backgrounds);
        setBackgroundsLoaded(true);
      }
    } catch (error) {
      console.error("배경 이미지 로드 오류:", error);
      toast({
        title: "오류",
        description: "배경 이미지를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 카테고리 로드
  const fetchCategories = async () => {
    try {
      const response = await adminApi.getLabelCategories();
      if (response.data.success) {
        setCategories(response.data.categories);
        setCategoriesLoaded(true);
      }
    } catch (error) {
      console.error("카테고리 로드 오류:", error);
      toast({
        title: "오류",
        description: "카테고리를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 사용자 업로드 이미지 로드
  const fetchUserUploads = async () => {
    if (userUploadsLoaded) return; // 이미 로드된 경우 중복 요청 방지
    
    try {
      const response = await uploadApi.getUploads();
      if (response.data.success) {
        setUserUploads(response.data.uploads || []);
        setUserUploadsLoaded(true);
      }
    } catch (error) {
      console.error("사용자 업로드 이미지 로드 오류:", error);
      toast({
        title: "오류",
        description: "사용자 업로드 이미지를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 배경 새로고침 함수 (캐시 무효화)
  const refreshBackgrounds = async () => {
    setBackgroundsLoaded(false);
    await fetchBackgrounds();
  };

  // 카테고리 새로고침 함수 (캐시 무효화)
  const refreshCategories = async () => {
    setCategoriesLoaded(false);
    await fetchCategories();
  };

  // 사용자 업로드 새로고침 함수 (캐시 무효화)
  const refreshUserUploads = async () => {
    setUserUploadsLoaded(false);
    await fetchUserUploads();
  };

  // 카테고리별로 배경 이미지 그룹화하는 함수
  const getBackgroundsByCategory = () => {
    const backgroundsByCategory: { [key: string]: any[] } = {};
    
    // 카테고리별로 그룹화
    categories.forEach(category => {
      backgroundsByCategory[category.name] = backgrounds.filter(bg => 
        bg.categories && bg.categories.some((cat: any) => cat.id === category.id)
      );
    });
    
    // 카테고리가 할당되지 않은 배경들
    const uncategorizedBackgrounds = backgrounds.filter(bg => 
      !bg.categories || bg.categories.length === 0
    );
    
    if (uncategorizedBackgrounds.length > 0) {
      backgroundsByCategory['미분류'] = uncategorizedBackgrounds;
    }
    
    return backgroundsByCategory;
  };

  // 배경 이미지 업로드
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploadingBackground(true);
    
    try {
      const response = await adminApi.uploadLabelBackground(formData);
      if (response.data.success) {
        toast({
          title: "업로드 성공",
          description: "배경 이미지가 성공적으로 업로드되었습니다.",
        });
        
        // 새로 업로드된 배경 이미지를 선택하여 카테고리 할당 다이얼로그 표시
        const newBackground = response.data.file;
        setSelectedBackground({
          id: newBackground.id,
          filename: newBackground.filename
        });
        setSelectedCategoryIds([]);
        setIsAssigningCategories(true);
        
        // 배경 목록 새로고침
        refreshBackgrounds();
      }
    } catch (error) {
      console.error("배경 업로드 오류:", error);
      toast({
        title: "업로드 실패",
        description: "배경 이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploadingBackground(false);
      // 파일 인풋 초기화
      event.target.value = "";
    }
  };
  
  // 배경 이미지 삭제
  const handleDeleteBackground = async (filename: string) => {
    if (!confirm("정말 이 배경 이미지를 삭제하시겠습니까?")) return;
    
    try {
      const response = await adminApi.deleteLabelBackground(filename);
      if (response.data.success) {
        toast({
          title: "삭제 성공",
          description: "배경 이미지가 성공적으로 삭제되었습니다.",
        });
        refreshBackgrounds();
      }
    } catch (error) {
      console.error("배경 삭제 오류:", error);
      toast({
        title: "삭제 실패",
        description: "배경 이미지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 새 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "오류",
        description: "카테고리 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await adminApi.createLabelCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim(),
      });
      
      if (response.data.success) {
        toast({
          title: "추가 성공",
          description: "카테고리가 성공적으로 추가되었습니다.",
        });
        setNewCategoryName("");
        setNewCategoryDescription("");
        setIsAddingCategory(false);
        refreshCategories();
        refreshBackgrounds(); // 카테고리 추가 후 배경 이미지 목록도 새로고침
      }
    } catch (error) {
      console.error("카테고리 추가 오류:", error);
      toast({
        title: "추가 실패",
        description: "카테고리 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 카테고리 수정
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "오류",
        description: "카테고리 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await adminApi.updateLabelCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        description: editingCategory.description.trim(),
        isActive: editingCategory.isActive,
        displayOrder: editingCategory.displayOrder
      });
      
      if (response.data.success) {
        toast({
          title: "수정 성공",
          description: "카테고리가 성공적으로 수정되었습니다.",
        });
        setEditingCategory(null);
        refreshCategories();
        refreshBackgrounds(); // 카테고리 수정 후 배경 이미지 목록도 새로고침
      }
    } catch (error) {
      console.error("카테고리 수정 오류:", error);
      toast({
        title: "수정 실패",
        description: "카테고리 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm("정말 이 카테고리를 삭제하시겠습니까?")) return;
    
    try {
      const response = await adminApi.deleteLabelCategory(categoryId);
      if (response.data.success) {
        toast({
          title: "삭제 성공",
          description: "카테고리가 성공적으로 삭제되었습니다.",
        });
        refreshCategories();
        refreshBackgrounds(); // 카테고리 삭제 후 배경 이미지 목록도 새로고침
      }
    } catch (error) {
      console.error("카테고리 삭제 오류:", error);
      toast({
        title: "삭제 실패",
        description: "카테고리 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };
  
  // 배경 이미지에 카테고리 할당
  const handleAssignCategories = async () => {
    if (!selectedBackground) return;
    
    try {
      const response = await adminApi.assignCategoriesToBackground(
        selectedBackground.id,
        selectedCategoryIds
      );
      
      if (response.data.success) {
        toast({
          title: "할당 성공",
          description: "카테고리가 성공적으로 할당되었습니다.",
        });
        setIsAssigningCategories(false);
        setSelectedBackground(null);
        setSelectedCategoryIds([]);
        refreshBackgrounds(); // 카테고리 할당 후 배경 이미지 목록 새로고침
      }
    } catch (error) {
      console.error("카테고리 할당 오류:", error);
      toast({
        title: "할당 실패",
        description: "카테고리 할당 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 배경 이미지에 카테고리 할당 다이얼로그 열기
  const openAssignCategoriesDialog = (background: any) => {
    setSelectedBackground(background);
    // 기존에 할당된 카테고리들을 미리 선택된 상태로 설정
    const currentCategoryIds = background.categories ? background.categories.map((cat: any) => cat.id) : [];
    setSelectedCategoryIds(currentCategoryIds);
    setIsAssigningCategories(true);
  };
  
  // 카테고리 체크박스 변경 처리
  const handleCategoryCheckboxChange = (categoryId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // 배경 이미지 다운로드
  const handleDownloadBackground = async (background: any) => {
    try {
      const link = document.createElement('a');
      link.href = background.url;
      link.download = background.filename || `background_${background.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "다운로드 시작",
        description: "배경 이미지 다운로드가 시작되었습니다.",
      });
    } catch (error) {
      console.error("다운로드 오류:", error);
      toast({
        title: "다운로드 실패",
        description: "배경 이미지 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 사용자 업로드 이미지 다운로드
  const handleDownloadUserUpload = async (upload: any) => {
    try {
      const link = document.createElement('a');
      link.href = upload.url;
      link.download = upload.filename || `user_upload_${upload.id}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "다운로드 시작",
        description: "사용자 업로드 이미지 다운로드가 시작되었습니다.",
      });
    } catch (error) {
      console.error("다운로드 오류:", error);
      toast({
        title: "다운로드 실패",
        description: "사용자 업로드 이미지 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 배경 이미지 컴포넌트
  const BackgroundImageCard = ({ background }: { background: any }) => (
    <div className="relative group flex-shrink-0 w-48">
      <div className="aspect-[4/3] bg-gray-800 rounded-md overflow-hidden border border-gray-700">
        <img 
          src={background.url} 
          alt={background.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-green-900/20 hover:bg-green-800/30 text-green-400 border-green-700"
          onClick={() => handleDownloadBackground(background)}
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-blue-900/20 hover:bg-blue-800/30 text-blue-400 border-blue-700"
          onClick={() => openAssignCategoriesDialog(background)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-red-900/20 hover:bg-red-800/30 text-red-400 border-red-700"
          onClick={() => handleDeleteBackground(background.filename)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-300 truncate">{background.name}</p>
        {/* 카테고리 태그 표시 */}
        {background.categories && background.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {background.categories.map((cat: any) => (
              <span 
                key={cat.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-cyan-900/30 text-cyan-400 border border-cyan-700"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // 사용자 업로드 이미지 컴포넌트 (관리자가 볼 수만 있음)
  const UserUploadImageCard = ({ upload }: { upload: any }) => (
    <div className="relative group flex-shrink-0 w-48">
      <div className="aspect-[4/3] bg-gray-800 rounded-md overflow-hidden border border-purple-500/50">
        <img 
          src={upload.url} 
          alt={upload.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute top-2 right-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-900/80 text-purple-300 border border-purple-600">
          사용자 업로드
        </span>
      </div>
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-green-900/20 hover:bg-green-800/30 text-green-400 border-green-700"
          onClick={() => handleDownloadUserUpload(upload)}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-2">
        <p className="text-sm text-purple-300 truncate">{upload.name}</p>
        <p className="text-xs text-gray-400 truncate">업로드: {new Date(upload.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );

  // 수평 스크롤 컨테이너 컴포넌트
  const HorizontalScrollContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`flex space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 ${className}`}>
      {children}
    </div>
  );

  // 전체보기용 4줄 수평 스크롤 컴포넌트
  const FourRowHorizontalGrid = ({ backgrounds }: { backgrounds: any[] }) => {
    // 배경을 3줄로 나누기 (4번째 줄은 사용자 업로드 이미지용)
    const rowSize = Math.ceil(backgrounds.length / 3);
    const backgroundRows = [
      backgrounds.slice(0, rowSize),
      backgrounds.slice(rowSize, rowSize * 2),
      backgrounds.slice(rowSize * 2)
    ].filter(row => row.length > 0);

    return (
      <div className="space-y-6">
        {/* 관리자 배경 이미지 3줄 */}
        {backgroundRows.map((row, rowIndex) => (
          <div key={rowIndex}>
            <h4 className="text-sm font-medium text-gray-400 mb-3">
              관리자 배경 라인 {rowIndex + 1} ({row.length}개)
            </h4>
            <HorizontalScrollContainer>
              {row.map((background) => (
                <BackgroundImageCard key={background.id} background={background} />
              ))}
            </HorizontalScrollContainer>
          </div>
        ))}
        
        {/* 4번째 줄: 사용자 업로드 이미지 */}
        <div>
          <h4 className="text-sm font-medium text-purple-400 mb-3">
            사용자 업로드 이미지 ({userUploads.length}개)
          </h4>
          {userUploads.length > 0 ? (
            <HorizontalScrollContainer>
              {userUploads.map((upload) => (
                <UserUploadImageCard key={upload.id} upload={upload} />
              ))}
            </HorizontalScrollContainer>
          ) : (
            <div className="bg-gray-800/30 rounded-lg p-6 text-center text-gray-400 border border-gray-700">
              사용자가 업로드한 이미지가 없습니다.
            </div>
          )}
        </div>
      </div>
    );
  };

  // 탭 변경 핸들러
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // 탭 변경 시 즉시 데이터 로드
    if (newTab === "backgrounds" && !backgroundsLoaded) {
      fetchBackgrounds();
      fetchCategories(); // 카테고리도 필요
      fetchUserUploads(); // 사용자 업로드 이미지도 필요
    } else if (newTab === "categories" && !categoriesLoaded) {
      fetchCategories();
    }
  };

  return (
    <Card className="w-full border-gray-800 bg-gray-900/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="text-gray-100">라벨 배경 관리</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="backgrounds">배경 이미지</TabsTrigger>
            <TabsTrigger value="categories">카테고리</TabsTrigger>
          </TabsList>
          
          {/* 배경 이미지 관리 탭 */}
          <TabsContent value="backgrounds">
            <div className="space-y-4">
              {/* 상단 컨트롤 바 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'category' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('category')}
                    className={viewMode === 'category' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-700' : 'bg-gray-800/50 text-gray-300 border-gray-700'}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    카테고리별
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-cyan-900/30 text-cyan-400 border-cyan-700' : 'bg-gray-800/50 text-gray-300 border-gray-700'}
                  >
                    <List className="w-4 h-4 mr-2" />
                    전체보기
                  </Button>
                </div>
                
                <Label 
                  htmlFor="background-upload" 
                  className="flex items-center px-4 py-2 rounded-md bg-cyan-900/30 hover:bg-cyan-800/30 text-cyan-400 border border-cyan-700 cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" /> 
                  배경 이미지 업로드
                </Label>
                <Input 
                  id="background-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleBackgroundUpload} 
                  disabled={uploadingBackground}
                />
              </div>
              
              {/* 배경 이미지 목록 */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
              ) : viewMode === 'category' ? (
                // 카테고리별 보기 - 각 카테고리별로 수평 스크롤
                <div className="space-y-4">
                  {Object.entries(getBackgroundsByCategory()).map(([categoryName, categoryBackgrounds]) => (
                    <div key={categoryName} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-cyan-400">{categoryName}</h3>
                        <span className="text-sm text-gray-400">({categoryBackgrounds.length}개)</span>
                      </div>
                      
                      {categoryBackgrounds.length === 0 ? (
                        <div className="bg-gray-800/30 rounded-lg p-6 text-center text-gray-400 border border-gray-700">
                          이 카테고리에 할당된 배경 이미지가 없습니다.
                        </div>
                      ) : (
                        <HorizontalScrollContainer>
                          {categoryBackgrounds.map((background) => (
                            <BackgroundImageCard key={background.id} background={background} />
                          ))}
                        </HorizontalScrollContainer>
                      )}
                    </div>
                  ))}
                  
                  {Object.keys(getBackgroundsByCategory()).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      업로드된 배경 이미지가 없습니다.
                    </div>
                  )}
                </div>
              ) : (
                // 전체보기 - 4줄 수평 스크롤
                <div>
                  {backgrounds.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      업로드된 배경 이미지가 없습니다.
                    </div>
                  ) : (
                    <FourRowHorizontalGrid backgrounds={backgrounds} />
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* 카테고리 관리 탭 */}
          <TabsContent value="categories">
            <div className="space-y-4">
              {/* 새 카테고리 추가 버튼 */}
              <div className="flex justify-end">
                <Button 
                  variant="default" 
                  onClick={() => setIsAddingCategory(true)}
                  className="bg-cyan-900/30 hover:bg-cyan-800/30 text-cyan-400 border border-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" /> 새 카테고리
                </Button>
              </div>
              
              {/* 카테고리 목록 */}
              <Table className="border-collapse">
                <TableHeader className="bg-gray-800/50">
                  <TableRow className="border-b border-gray-700">
                    <TableHead className="text-gray-300">이름</TableHead>
                    <TableHead className="text-gray-300">설명</TableHead>
                    <TableHead className="text-gray-300">순서</TableHead>
                    <TableHead className="text-gray-300">상태</TableHead>
                    <TableHead className="text-gray-300 text-right">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        등록된 카테고리가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} className="border-b border-gray-800">
                        {editingCategory && editingCategory.id === category.id ? (
                          <>
                            <TableCell>
                              <Input 
                                value={editingCategory.name} 
                                onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                className="bg-gray-800 border-gray-700 text-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={editingCategory.description || ''} 
                                onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                                className="bg-gray-800 border-gray-700 text-gray-200"
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number"
                                value={editingCategory.displayOrder} 
                                onChange={(e) => setEditingCategory({...editingCategory, displayOrder: parseInt(e.target.value) || 0})}
                                className="bg-gray-800 border-gray-700 text-gray-200 w-16"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox 
                                  checked={editingCategory.isActive} 
                                  onCheckedChange={(checked) => setEditingCategory({...editingCategory, isActive: !!checked})}
                                  className="data-[state=checked]:bg-cyan-600"
                                />
                                <span className="ml-2 text-gray-300">활성화</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-900/20 hover:bg-green-800/30 text-green-400 border-green-700"
                                onClick={handleUpdateCategory}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border-gray-700"
                                onClick={() => setEditingCategory(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium text-gray-200">
                              {category.name}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {category.description || '-'}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {category.displayOrder}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${category.isActive ? 'bg-green-900/20 text-green-400 border border-green-700' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                                {category.isActive ? '활성화' : '비활성화'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-blue-900/20 hover:bg-blue-800/30 text-blue-400 border-blue-700"
                                onClick={() => setEditingCategory(category)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-red-900/20 hover:bg-red-800/30 text-red-400 border-red-700"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* 새 카테고리 추가 다이얼로그 */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 shadow-[0_0_15px_rgba(0,200,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">새 카테고리 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name" className="text-gray-300">카테고리 이름</Label>
              <Input 
                id="category-name" 
                value={newCategoryName} 
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-200 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category-description" className="text-gray-300">설명 (선택사항)</Label>
              <Input 
                id="category-description" 
                value={newCategoryDescription} 
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-200 mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingCategory(false)}
              className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border-gray-700"
            >
              취소
            </Button>
            <Button 
              variant="default" 
              onClick={handleAddCategory}
              className="bg-cyan-900/30 hover:bg-cyan-800/30 text-cyan-400 border border-cyan-700"
            >
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 배경 이미지에 카테고리 할당 다이얼로그 */}
      <Dialog open={isAssigningCategories} onOpenChange={setIsAssigningCategories}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 shadow-[0_0_15px_rgba(0,200,255,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">카테고리 할당</DialogTitle>
          </DialogHeader>
          {selectedBackground && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-800 rounded-md overflow-hidden border border-gray-700">
                  <img 
                    src={`/images/label/${selectedBackground.filename}`} 
                    alt="배경 이미지"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-gray-200">{selectedBackground.id}</p>
                  <p className="text-sm text-gray-400">{selectedBackground.filename}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">카테고리 선택</Label>
                <ScrollArea className="h-60 border border-gray-800 rounded-md p-2">
                  {categories.length === 0 ? (
                    <div className="py-4 text-center text-gray-400">
                      등록된 카테고리가 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={selectedCategoryIds.includes(category.id)}
                            onCheckedChange={() => handleCategoryCheckboxChange(category.id)}
                            className="data-[state=checked]:bg-cyan-600"
                          />
                          <Label 
                            htmlFor={`category-${category.id}`}
                            className="text-gray-200 cursor-pointer flex-1"
                          >
                            {category.name}
                            {category.description && (
                              <span className="text-sm text-gray-400 ml-2">
                                ({category.description})
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAssigningCategories(false)}
              className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border-gray-700"
            >
              취소
            </Button>
            <Button 
              variant="default" 
              onClick={handleAssignCategories}
              className="bg-cyan-900/30 hover:bg-cyan-800/30 text-cyan-400 border border-cyan-700"
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 