import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wineLabelDesigns } from "@/assets/wine-label-designs";

interface LabelSelectorProps {
  selectedLabel: string;
  onLabelSelect: (labelType: string) => void;
}

const labelDesigns = [
  {
    id: "vintage",
    name: "빈티지",
    description: "클래식한 골드 장식"
  },
  {
    id: "modern",
    name: "모던",
    description: "깔끔한 미니멀 스타일"
  },
  {
    id: "elegant",
    name: "엘레강트",
    description: "고급스러운 다크 골드"
  },
  {
    id: "rustic",
    name: "러스틱",
    description: "자연스러운 우드 텍스처"
  },
  {
    id: "premium",
    name: "프리미엄",
    description: "럭셔리 다크 골드"
  },
  {
    id: "classic",
    name: "클래식",
    description: "전통적인 크림 베이지"
  },
  {
    id: "minimal",
    name: "미니멀",
    description: "심플한 화이트"
  },
  {
    id: "ornate",
    name: "화려한",
    description: "화려한 버건디 골드"
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
            {labelDesigns.map((label) => {
              const LabelComponent = wineLabelDesigns[label.id as keyof typeof wineLabelDesigns];
              return (
                <div
                  key={label.id}
                  className={`w-20 h-24 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                    selectedLabel === label.id
                      ? "border-green-400 ring-2 ring-green-400/20"
                      : "border-notion-border hover:border-green-400/50"
                  }`}
                  onClick={() => onLabelSelect(label.id)}
                >
                  <div className="w-full h-20 p-1">
                    <LabelComponent className="w-full h-full rounded-md" />
                  </div>
                  <div className="text-center mt-1">
                    <p className="text-xs font-medium text-notion-text-primary">
                      {label.name}
                    </p>
                    <p className="text-[10px] text-notion-text-secondary opacity-75">
                      {label.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
