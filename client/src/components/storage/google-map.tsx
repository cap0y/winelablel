import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  className?: string;
  locationName?: string;
  address?: string;
  image?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMap({ 
  latitude, 
  longitude, 
  zoom = 15, 
  height = "300px",
  className = "",
  locationName = "Storage Location",
  address = "24시간 이용 가능한 셀프 스토리지",
  image
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // API 키를 직접 지정합니다
    const apiKey = "AIzaSyDZZkoRGw9UByZ2vuNC9j95H4EYcxCl1Vs";
    
    const initializeMap = () => {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          styles: [
            {
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#242f3e"
                }
              ]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#746855"
                }
              ]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#242f3e"
                }
              ]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#263c3f"
                }
              ]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#6b9a76"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#38414e"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#212a37"
                }
              ]
            },
            {
              "featureType": "road",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#9ca5b3"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#746855"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry.stroke",
              "stylers": [
                {
                  "color": "#1f2835"
                }
              ]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#f3d19c"
                }
              ]
            },
            {
              "featureType": "transit",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#2f3948"
                }
              ]
            },
            {
              "featureType": "transit.station",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#d59563"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [
                {
                  "color": "#17263c"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [
                {
                  "color": "#515c6d"
                }
              ]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.stroke",
              "stylers": [
                {
                  "color": "#17263c"
                }
              ]
            }
          ]
        });

        // Add custom marker
        const marker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          title: "Storage Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: "#14b8a6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8
          }
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 1px; color: #333; max-width: 160px;">
              ${image ? `<img src='${image}' style='width:100%;height:60px;object-fit:cover;border-radius:4px;margin-bottom:1px;' />` : ""}
              <h4 style="margin: 0 0 1px 0; color: #14b8a6;font-size:12px;">${locationName}</h4>
              <p style="margin: 0; font-size: 11px;">${address}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // 최초 로드 시 바로 InfoWindow 표시
        infoWindow.open(map, marker);
      }
    };

    if (window.google) {
      initializeMap();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = initializeMap;
      document.head.appendChild(script);
    }
  }, [latitude, longitude, zoom]);

  // API 키가 없는 경우를 처리하는 UI 삭제
  return (
    <div 
      ref={mapRef}
      className={`w-full ${className}`}
      style={{ height }}
    />
  );
}