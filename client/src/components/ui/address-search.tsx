import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressSearchProps {
  onSelect: (addr: {
    roadAddr: string;
    siNm: string;
    sggNm: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const API_KEY = "devU01TX0FVVEgyMDI1MDQxNDEyMjYyNjExNTY0ODc=";

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!keyword) return;
      (async () => {
        setLoading(true);
        try {
          const url = `https://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${API_KEY}&keyword=${encodeURIComponent(
            keyword
          )}&resultType=json`;
          const res = await fetch(url);
          const data = await res.json();
          const list = data?.results?.juso || [];
          setResults(list);
        } catch (e) {
          console.error("주소 검색 오류", e);
        } finally {
          setLoading(false);
        }
      })();
    }, 500);
    return () => clearTimeout(handler);
  }, [keyword]);

  return (
    <div className="relative">
      <Input
        placeholder="도로명 주소 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {loading && <p className="text-xs text-gray-400 mt-1">검색 중...</p>}
      {results.length > 0 && (
        <ul className="absolute z-50 bg-gray-800 border border-gray-600 max-h-60 overflow-y-auto w-full mt-1 rounded">
          {results.map((item) => (
            <li
              key={item.bdMgtSn}
              className="px-3 py-2 text-sm hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                (async () => {
                  let lat: number | undefined; let lon: number | undefined;
                  try {
                    const resGeo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.roadAddr)}&format=json&limit=1`);
                    const geoJson = await resGeo.json();
                    if (geoJson && geoJson.length > 0) {
                      lat = parseFloat(geoJson[0].lat);
                      lon = parseFloat(geoJson[0].lon);
                    }
                  } catch {}
                  onSelect({
                    roadAddr: item.roadAddr,
                    siNm: item.siNm,
                    sggNm: item.sggNm,
                    latitude: lat,
                    longitude: lon,
                  });
                })();
                setKeyword(item.roadAddr);
                setResults([]);
              }}
            >
              {item.roadAddr}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 