import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import type { StorageLocation } from "@shared/schema";

interface LocationMapProps {
  locations: StorageLocation[];
}

export default function LocationMap({ locations }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="relative h-64 bg-gray-300 rounded-xl overflow-hidden">
            {/* Seoul cityscape background */}
            <img 
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
              alt="Seoul cityscape with modern buildings" 
              className="w-full h-full object-cover"
            />
            
            {/* Location markers */}
            {locations.map((location, index) => (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
                  selectedLocation?.id === location.id ? "ring-2 ring-white" : ""
                }`}
                style={{
                  top: `${20 + (index * 15)}%`,
                  left: `${15 + (index * 20)}%`,
                }}
              >
                <MapPin className="text-white w-4 h-4" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Location Info */}
      {selectedLocation && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h4 className="font-medium text-white mb-2">{selectedLocation.name}</h4>
            <p className="text-sm text-gray-400 mb-3">{selectedLocation.address}</p>
            <div className="flex flex-wrap gap-2">
              {selectedLocation.features?.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
