import { useCallback, useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  height?: string;
  fitBounds?: boolean;
  markers?: Array<{
    position: {
      lat: number;
      lng: number;
    };
    title?: string;
    address?: string;
    image?: string;
  }>;
}

const libraries = ["places"];

export default function GoogleMapComponent({ center, zoom = 15, height = "400px", fitBounds = false, markers = [] }: MapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<typeof markers[0] | null>(null);

  // 첫 마커를 기본 선택 – markers 변경 시 동기화
  useEffect(() => {
    if (markers && markers.length > 0) {
      setSelectedMarker(markers[0]);
    }
  }, [markers]);

  // API 로드 상태 관리
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDZZkoRGw9UByZ2vuNC9j95H4EYcxCl1Vs",
    libraries: libraries as any,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 모든 마커가 보이도록 지도 경계 조정
  useEffect(() => {
    if (isLoaded && map && markers.length > 0 && fitBounds) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        
        markers.forEach(marker => {
          bounds.extend(new window.google.maps.LatLng(
            marker.position.lat,
            marker.position.lng
          ));
        });
        
        // 경계에 맞추기
        map.fitBounds(bounds);
        
        // 너무 가깝게 확대되는 것 방지
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          const zoom = map.getZoom();
          if (zoom !== undefined && zoom > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      } catch (error) {
        console.error("지도 경계 설정 중 오류 발생:", error);
      }
    }
  }, [isLoaded, map, markers, fitBounds]);

  const containerStyle = {
    width: "100%",
    height: height,
  };

  // 로딩 중 표시
  if (!isLoaded) {
    return (
      <div 
        style={{ 
          width: "100%", 
          height, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "#2a2a2a"
        }}
      >
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // API 로드 오류
  if (loadError) {
    return (
      <div 
        style={{ 
          width: "100%", 
          height, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          backgroundColor: "#2a2a2a",
          color: "white"
        }}
      >
        지도를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: [
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#ffffff"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#000000"}, {"lightness": 13}]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#000000"}]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#144b53"}, {"lightness": 14}, {"weight": 1.4}]
          },
          {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#08304b"}]
          },
          {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{"color": "#0c4152"}, {"lightness": 5}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#000000"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#0b434f"}, {"lightness": 25}]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#000000"}]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.stroke",
            "stylers": [{"color": "#0b3d51"}, {"lightness": 16}]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{"color": "#000000"}]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"color": "#146474"}]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#021019"}]
          }
        ]
      }}
    >
      {markers.map((marker, index) => (
        <Marker 
          key={index} 
          position={marker.position}
          title={marker.title}
          onClick={() => setSelectedMarker(marker)}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: marker.title === "내 위치" ? "#ff0000" : "#00e5c9",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: marker.title === "내 위치" ? 10 : 8
          }}
        />
      ))}

      {selectedMarker && (
        <InfoWindow
          position={selectedMarker.position}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div style={{ color: "#333", padding: "1px", maxWidth: "120px" }}>
            {selectedMarker.image && (
              <img src={selectedMarker.image} alt={selectedMarker.title} style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "4px", marginBottom: "1px" }} />
            )}
            {selectedMarker.title && (
              <h3 style={{ margin: "0 0 3px 0", fontWeight: "bold", color: "#14b8a6", fontSize: "12px" }}>{selectedMarker.title}</h3>
            )}
            {selectedMarker.address && (
              <p style={{ margin: 0, fontSize: "11px" }}>{selectedMarker.address}</p>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
} 