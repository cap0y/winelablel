import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface AddressSearchProps {
  onSelect: (addr: {
    roadAddr: string;
    siNm: string;
    sggNm: string;
    zipNo: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 검색 버튼 클릭 핸들러
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    try {
      // 서버 프록시 API를 통해 도로명주소 API 호출
      const response = await fetch('/api/address/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword })
      });
      
      const data = await response.json();
      
      if (data?.results?.common?.errorCode === "0") {
        setResults(data.results.juso || []);
      } else {
        console.error("주소 검색 오류:", data?.results?.common?.errorMessage);
        setResults([]);
      }
    } catch (e) {
      console.error("주소 검색 오류", e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 키워드 입력 시 자동 검색
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!keyword || keyword.length < 2) return; // 최소 2글자 이상 입력해야 검색
      handleSearch();
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  return (
    <div className="relative">
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="도로명 또는 지번 주소를 입력하세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 bg-white/70 border-gray-300 text-gray-900 focus:border-primary backdrop-blur-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <Button 
          onClick={handleSearch} 
          className="bg-primary hover:bg-primary/90 text-white"
          disabled={loading}
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
      {loading && <p className="text-xs text-gray-400 mt-1">검색 중...</p>}
      {results.length > 0 && (
        <ul className="absolute z-50 bg-white/90 border border-gray-200 backdrop-blur-md max-h-60 overflow-y-auto w-full mt-1 rounded shadow">
          {results.map((item) => (
            <li
              key={item.bdMgtSn}
              className="px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                (async () => {
                  let lat: number | undefined; 
                  let lon: number | undefined;
                  try {
                    // OpenStreetMap Nominatim API로 위치 정보 가져오기
                    const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.roadAddr)}&format=json&limit=1`);
                    const geoJson = await resGeo.json();
                    if (geoJson && geoJson.length > 0) {
                      lat = parseFloat(geoJson[0].lat);
                      lon = parseFloat(geoJson[0].lon);
                    }
                  } catch {}
                  
                  // 주소 선택 시 우편번호와 주소 정보를 함께 전달
                  onSelect({
                    roadAddr: item.roadAddr,
                    siNm: item.siNm,
                    sggNm: item.sggNm,
                    zipNo: item.zipNo,
                    latitude: lat,
                    longitude: lon,
                  });
                })();
                
                // 선택한 주소를 검색창에 표시하고 결과창 닫기
                setKeyword(item.roadAddr);
                setResults([]);
              }}
            >
              <div>
                <span className="bg-gray-200 text-gray-800 text-xs px-1 py-0.5 rounded mr-1">도로명</span> 
                {item.roadAddr}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                <span className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded mr-1">우편번호</span> 
                {item.zipNo}
              </div>
            </li>
          ))}
        </ul>
      )}
      {results.length === 0 && keyword.length > 1 && !loading && (
        <p className="text-xs text-gray-400 mt-1">검색 결과가 없습니다. 다른 주소를 입력해보세요.</p>
      )}
    </div>
  );
} 