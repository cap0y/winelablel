import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LabelSelectorProps {
  selectedLabel: string;
  onLabelSelect: (labelType: string) => void;
}

const labelDesigns = [
  {
    id: "vintage",
    name: "빈티지",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=200&fit=crop"
  },
  {
    id: "modern",
    name: "모던",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&h=200&fit=crop"
  },
  {
    id: "elegant",
    name: "엘레강트",
    image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=160&h=200&fit=crop"
  },
  {
    id: "rustic",
    name: "러스틱",
    image: "https://images.unsplash.com/photo-1506377872008-6645d6238ad6?w=160&h=200&fit=crop"
  },
  {
    id: "premium",
    name: "프리미엄",
    image: "https://images.unsplash.com/photo-1569275808998-5d4b4dc3cf3b?w=160&h=200&fit=crop"
  },
  {
    id: "classic",
    name: "클래식",
    image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=160&h=200&fit=crop"
  },
  {
    id: "minimal",
    name: "미니멀",
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=160&h=200&fit=crop"
  },
  {
    id: "ornate",
    name: "화려한",
    image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=160&h=200&fit=crop"
  }
];

export default function LabelSelector({ selectedLabel, onLabelSelect }: LabelSelectorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Tag className="mr-2 text-green-400 w-5 h-5" />
          라벨 디자인
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="scroll-container overflow-x-auto">
          <div className="flex space-x-3 pb-2" style={{ width: "max-content" }}>
            {labelDesigns.map((label) => (
              <div
                key={label.id}
                className={`w-20 h-24 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                  selectedLabel === label.id
                    ? "border-green-400 ring-2 ring-green-400/20"
                    : "border-notion-border hover:border-green-400/50"
                }`}
                onClick={() => onLabelSelect(label.id)}
              >
                <img
                  src={label.image}
                  alt={label.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
