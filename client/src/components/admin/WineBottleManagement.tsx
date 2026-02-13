import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Upload,
  Package,
  ArrowUpDown,
} from "lucide-react";
import { adminApi } from "@/services/api";

// 패키지 타입 정의
interface ProductPackage {
  id: string;
  name: string;
  image: string;
  type: "red" | "white" | "rose";
  bottleType: "bordeaux" | "burgundy" | "custom";
  dimensions: string;
  capacity: string;
  price: number;
  labelSize: {
    width: number;
    height: number;
    position: { top: number; left: number };
  };
}

// 패키지 관리 컴포넌트
const ProductPackageManagement = () => {
  const { toast } = useToast();

  // 상태 관리
  const [bottles, setBottles] = useState<ProductPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedBottle, setSelectedBottle] = useState<ProductPackage | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // 신규/수정용 패키지 데이터
  const [bottleData, setBottleData] = useState<Partial<ProductPackage>>({
    id: "",
    name: "",
    image: "",
    type: "red",
    bottleType: "bordeaux",
    dimensions: "",
    capacity: "750ml",
    price: 5000,
    labelSize: {
      width: 17.62,
      height: 20.16,
      position: { top: 70, left: 75 },
    },
  });

  // 파일 업로드 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadPackages();
  }, []);

  // 패키지 데이터 로드
  const loadPackages = async () => {
    setIsLoading(true);

    try {
      const response = await adminApi.getPackages();
      if (response.data.success) {
        setBottles(response.data.bottles || []);
      } else {
        toast({
          title: "패키지 목록 로드 실패",
          description:
            response.data.message || "패키지 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
        setBottles([]);
      }
    } catch (error: any) {
      console.error("패키지 목록 로드 오류:", error);
      toast({
        title: "패키지 목록 로드 실패",
        description: "패키지 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      setBottles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 정렬 핸들러
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 검색 및 정렬된 패키지 목록
  const filteredAndSortedBottles = bottles
    .filter((bottle) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        bottle.id.toLowerCase().includes(searchLower) ||
        bottle.name.toLowerCase().includes(searchLower) ||
        bottle.type.toLowerCase().includes(searchLower) ||
        bottle.bottleType.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue: any = a[sortField as keyof ProductPackage];
      let bValue: any = b[sortField as keyof ProductPackage];

      if (sortField === "price") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // 패키지 추가 모달 열기
  const handleAddBottle = () => {
    setBottleData({
      id: "",
      name: "",
      image: "",
      type: "red",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5000,
      labelSize: {
        width: 17.62,
        height: 20.16,
        position: { top: 70, left: 75 },
      },
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // 패키지 수정 모달 열기
  const handleEditBottle = (bottle: ProductPackage) => {
    setBottleData({ ...bottle });
    setSelectedBottle(bottle);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!bottleData.id || !bottleData.name || !bottleData.image) {
      toast({
        title: "필수 정보 누락",
        description: "ID, 이름, 이미지는 필수 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing) {
        // 패키지 정보 수정
        await adminApi.updatePackage(bottleData.id!, bottleData);

        setBottles(
          bottles.map((bottle) =>
            bottle.id === bottleData.id
              ? { ...(bottleData as ProductPackage) }
              : bottle,
          ),
        );

        toast({
          title: "수정 완료",
          description: "패키지 정보가 성공적으로 수정되었습니다.",
        });
      } else {
        // 중복 ID 확인
        if (bottles.some((bottle) => bottle.id === bottleData.id)) {
          toast({
            title: "중복된 ID",
            description: "이미 사용 중인 ID입니다. 다른 ID를 사용해주세요.",
            variant: "destructive",
          });
          return;
        }

        // 새 패키지 추가
        await adminApi.createPackage(bottleData);

        setBottles([...bottles, bottleData as ProductPackage]);

        toast({
          title: "추가 완료",
          description: "새 패키지가 성공적으로 추가되었습니다.",
        });
      }

      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("패키지 저장 오류:", error);
      toast({
        title: "저장 실패",
        description:
          error.response?.data?.message ||
          "패키지 정보 저장 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 패키지 삭제
  const handleDeleteBottle = async (bottleId: string) => {
    if (!window.confirm("정말 이 패키지를 삭제하시겠습니까?")) return;

    try {
      await adminApi.deletePackage(bottleId);

      setBottles(bottles.filter((bottle) => bottle.id !== bottleId));

      toast({
        title: "삭제 완료",
        description: "패키지가 성공적으로 삭제되었습니다.",
      });
    } catch (error: any) {
      console.error("패키지 삭제 오류:", error);
      toast({
        title: "삭제 실패",
        description:
          error.response?.data?.message ||
          "패키지 삭제 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setIsUploading(true);

    // 이미지 타입 검증
    if (!file.type.startsWith("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await adminApi.uploadPackageImage(formData);

      if (response.data.success) {
        setBottleData({
          ...bottleData,
          image: response.data.url,
        });

        toast({
          title: "이미지 업로드 성공",
          description: "패키지 이미지가 업로드되었습니다.",
        });
      } else {
        throw new Error(
          response.data.message || "이미지 업로드에 실패했습니다.",
        );
      }
    } catch (error: any) {
      console.error("이미지 업로드 오류:", error);
      toast({
        title: "이미지 업로드 실패",
        description:
          error.response?.data?.message ||
          "이미지 업로드 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 입력 핸들러
  const handleInputChange = (key: string, value: any) => {
    if (key.includes(".")) {
      const [parentKey, childKey] = key.split(".");

      if (parentKey === "labelSize") {
        setBottleData({
          ...bottleData,
          labelSize: {
            ...(bottleData.labelSize || {
              width: 17.62,
              height: 20.16,
              position: { top: 70, left: 75 },
            }),
            [childKey]: Number(value),
          },
        });
      } else {
        // 다른 중첩 객체가 있다면 여기에 추가
        setBottleData({
          ...bottleData,
          [parentKey]: {
            ...((bottleData as any)[parentKey] || {}),
            [childKey]: value,
          },
        });
      }
    } else if (key === "price") {
      setBottleData({
        ...bottleData,
        [key]: Number(value),
      });
    } else {
      setBottleData({
        ...bottleData,
        [key]: value,
      });
    }
  };

  // 디자인 위치 입력 핸들러
  const handleLabelPositionChange = (positionKey: string, value: string) => {
    setBottleData({
      ...bottleData,
      labelSize: {
        ...(bottleData.labelSize || {
          width: 17.62,
          height: 20.16,
          position: { top: 70, left: 75 },
        }),
        position: {
          ...(bottleData.labelSize?.position || { top: 70, left: 75 }),
          [positionKey]: Number(value),
        },
      },
    });
  };

  return (
    <Card className="w-full glass-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200">
        <div>
          <CardTitle className="text-gray-900">패키지 관리</CardTitle>
          <CardDescription className="text-gray-600">패키지 목록 관리 및 가격 설정</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[80px]"
            />
          </div>
          <Button
            onClick={handleAddBottle}
            className="bg-primary text-white hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4 mr-1" /> 패키지 추가
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader className="bg-white/70">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-10 whitespace-pre-line">ID</TableHead>
                  <TableHead className="w-16 whitespace-pre-line">이미지</TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors whitespace-pre-line"
                    onClick={() => handleSort("name")}
                  >
                    이름 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors whitespace-pre-line"
                    onClick={() => handleSort("type")}
                  >
                    타입<ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead className="whitespace-pre-line">규격</TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-700 hover:text-gray-900 transition-colors whitespace-pre-line"
                    onClick={() => handleSort("price")}
                  >
                    가격 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead className="text-right whitespace-pre-line">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedBottles.length === 0 ? (
                  <TableRow className="border-b border-gray-200">
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-gray-500"
                    >
                      패키지 데이터가 없거나 검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedBottles.map((bottle) => (
                    <TableRow
                      key={bottle.id}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="font-medium text-gray-900 whitespace-nowrap">
                        {bottle.id}
                      </TableCell>
                      <TableCell>
                        <div className="w-12 h-16 overflow-hidden">
                          <img
                            src={bottle.image}
                            alt={bottle.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-900 whitespace-nowrap">
                        {bottle.name}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            bottle.type === "red"
                              ? "bg-red-500/20 text-red-600 border border-red-200"
                              : bottle.type === "white"
                                ? "bg-yellow-500/20 text-yellow-700 border border-yellow-200"
                                : "bg-pink-500/20 text-pink-600 border border-pink-200"
                          }`}
                        >
                          {bottle.type === "red"
                            ? "레드"
                            : bottle.type === "white"
                              ? "화이트"
                              : "로제"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-700 whitespace-nowrap">
                        {bottle.dimensions}
                      </TableCell>
                      <TableCell className="text-gray-900 whitespace-nowrap">
                        {bottle.price.toLocaleString()}원
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 border-gray-300"
                            onClick={() => handleEditBottle(bottle)}
                          >
                            <Edit className="h-4 w-4 text-cyan-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 border-gray-300"
                            onClick={() => handleDeleteBottle(bottle.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* 패키지 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-md border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {isEditing ? "패키지 수정" : "새 패키지 추가"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              패키지의 고유 ID, 이름, 이미지를 입력하여 관리합니다.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="id" className="text-sm font-medium text-gray-700">
                    ID (고유 식별자)*
                  </Label>
                  <Input
                    id="id"
                    value={bottleData.id || ""}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    placeholder="예: bordeaux-red"
                    disabled={isEditing} // 수정 시에는 ID 변경 불가
                    className="bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    패키지 이름*
                  </Label>
                  <Input
                    id="name"
                    value={bottleData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="예: 까베르네쇼비뇽 레드"
                    className="bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    패키지 타입*
                  </Label>
                  <Select
                    value={bottleData.type || "red"}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md">
                      <SelectItem value="red">레드</SelectItem>
                      <SelectItem value="white">화이트</SelectItem>
                      <SelectItem value="rose">로제</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bottleType" className="text-sm font-medium text-gray-700">
                    패키지 형태*
                  </Label>
                  <Select
                    value={bottleData.bottleType || "bordeaux"}
                    onValueChange={(value) =>
                      handleInputChange("bottleType", value)
                    }
                  >
                    <SelectTrigger className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md">
                      <SelectItem value="bordeaux">보르도</SelectItem>
                      <SelectItem value="burgundy">버건디</SelectItem>
                      <SelectItem value="custom">커스텀</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700">
                    규격 (높이 x 지름)
                  </Label>
                  <Input
                    id="dimensions"
                    value={bottleData.dimensions || ""}
                    onChange={(e) =>
                      handleInputChange("dimensions", e.target.value)
                    }
                    placeholder="예: 높이 30cm x 지름 7.5cm"
                    className="bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                    용량
                  </Label>
                  <Input
                    id="capacity"
                    value={bottleData.capacity || ""}
                    onChange={(e) =>
                      handleInputChange("capacity", e.target.value)
                    }
                    placeholder="예: 750ml"
                    className="bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                    가격 (원)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={bottleData.price || 0}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="예: 5000"
                    className="bg-white/70 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-primary backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">패키지 이미지*</Label>
                  <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-md bg-white/50 backdrop-blur-sm h-48 mt-1">
                    {bottleData.image ? (
                      <div className="w-full h-full flex flex-col items-center">
                        <div className="relative w-24 h-40">
                          <img
                            src={bottleData.image}
                            alt="패키지 이미지"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-gray-600 hover:text-gray-800"
                          onClick={() => {
                            if (fileInputRef.current)
                              fileInputRef.current.click();
                          }}
                        >
                          변경
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => {
                          if (fileInputRef.current)
                            fileInputRef.current.click();
                        }}
                      >
                        <Package className="h-10 w-10 text-gray-500 mb-2" />
                        <span className="text-gray-600 text-sm">
                          이미지를 업로드하세요
                        </span>
                        <span className="text-gray-500 text-xs mt-1">
                          JPG, PNG 권장
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="border border-gray-300 rounded-md p-4 bg-white/50 backdrop-blur-sm">
                  <Label className="text-sm font-medium text-gray-700 block mb-2">
                    디자인 크기 및 위치 설정
                  </Label>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <Label
                        htmlFor="labelWidth"
                        className="text-xs text-gray-600"
                      >
                        디자인 너비 (rem)
                      </Label>
                      <Input
                        id="labelWidth"
                        type="number"
                        step="0.01"
                        value={bottleData.labelSize?.width || 17.62}
                        onChange={(e) =>
                          handleInputChange("labelSize.width", e.target.value)
                        }
                        className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="labelHeight"
                        className="text-xs text-gray-600"
                      >
                        디자인 높이 (rem)
                      </Label>
                      <Input
                        id="labelHeight"
                        type="number"
                        step="0.01"
                        value={bottleData.labelSize?.height || 20.16}
                        onChange={(e) =>
                          handleInputChange("labelSize.height", e.target.value)
                        }
                        className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="labelTop"
                        className="text-xs text-gray-600"
                      >
                        상단 위치 (%)
                      </Label>
                      <Input
                        id="labelTop"
                        type="number"
                        value={bottleData.labelSize?.position.top || 70}
                        onChange={(e) =>
                          handleLabelPositionChange("top", e.target.value)
                        }
                        className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="labelLeft"
                        className="text-xs text-gray-600"
                      >
                        좌측 위치 (%)
                      </Label>
                      <Input
                        id="labelLeft"
                        type="number"
                        value={bottleData.labelSize?.position.left || 75}
                        onChange={(e) =>
                          handleLabelPositionChange("left", e.target.value)
                        }
                        className="bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white/70 border-gray-300 text-gray-700 hover:bg-white/90 backdrop-blur-sm"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                    처리 중...
                  </>
                ) : isEditing ? (
                  "수정 완료"
                ) : (
                  "추가 완료"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductPackageManagement;
