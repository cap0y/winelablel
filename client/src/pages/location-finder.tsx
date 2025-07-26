import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Navigation, Loader2 } from "lucide-react";
import GoogleMapComponent from "@/components/GoogleMap";
import type { StorageLocation } from "@shared/schema";

// 확장된 StorageLocation 타입을 정의
interface StorageLocationWithDistance extends StorageLocation {
  distance?: number;
}

// 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km 단위 거리
  return distance;
}

export default function LocationFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.9780 }); // 서울 중심
  
  const { data: locations, isLoading } = useQuery<StorageLocation[]>({
    queryKey: ["/api/storage-locations"],
  });

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userPos);
        setMapCenter(userPos);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setIsLoadingLocation(false);
      }
    );
  };

  const filteredLocations = locations?.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">지점 선택하기</h1>
          <button 
            onClick={getUserLocation} 
            className="flex items-center space-x-1 text-sm text-primary"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                <span>검색 중...</span>
              </>
            ) : (
              <>
                <Navigation className="mr-1 h-4 w-4" />
                <span>내 위치</span>
              </>
            )}
          </button>
        </div>
        
        {/* Interactive Map */}
        <div className="mb-6 rounded-xl overflow-hidden">
          <GoogleMapComponent
            center={mapCenter}
            zoom={userLocation ? 14 : 12}
            height="300px"
            fitBounds={true}
            markers={[
              ...(userLocation ? [{
                position: userLocation,
                title: "내 위치",
              }] : []),
              ...(filteredLocations || [])
                .filter(loc => loc.latitude && loc.longitude)
                .map(location => ({
                  position: { lat: Number(location.latitude), lng: Number(location.longitude) },
                  title: location.name,
                  address: location.address,
                  image: (location.images as string[] | undefined)?.[0]
                }))
            ]}
          />
        </div>

        {/* Search Bar */}
        <Card className="bg-gray-800 border-gray-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Search className="text-primary w-5 h-5" />
              <Input 
                type="text" 
                placeholder="지역 • 지점명을 검색해주세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage Locations List */}
        <div className="space-y-3">
          {filteredLocations && filteredLocations.length > 0 ? (
            filteredLocations.map((location) => (
              <Link key={location.id} href={`/storage/${location.id}`}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={(location.images as string[] | undefined)?.[0] || "https://images.unsplash.com/photo-1560185007-cde436f6a4d0"} 
                        alt={location.name}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{location.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-400 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{location.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          {(location.features as string[] | undefined)?.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                {searchTerm ? "검색 결과가 없습니다." : "등록된 지점이 없습니다."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
