import { Save } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

import Navigation from "@/components/navigation";
import WineBottleSelector from "@/components/wine-bottle-selector";
import LabelSelector from "@/components/label-selector";
import IconSelector from "@/components/icon-selector";
import DesignPreview from "@/components/design-preview";
import TextEditor from "@/components/text-editor";
import PaymentSection from "@/components/payment-section";
import { useDesignState } from "@/hooks/use-design-state";

export default function Home() {
  const { toast } = useToast();
  const {
    design,
    updateBottleType,
    updateLabelDesign,
    addIcon,
    removeIcon,
    updateTextElement,
    updateTextPosition,
    updateTextFont,
    updateQuantity,
  } = useDesignState();

  const saveDesign = useMutation({
    mutationFn: async () => {
      const designData = {
        bottleType: design.bottleType,
        labelDesign: design.labelDesign,
        icons: design.icons,
        textElements: {
          ...design.textElements,
          positions: design.positions,
          fonts: design.fonts,
        },
      };

      const response = await apiRequest("POST", "/api/wine-designs", designData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "디자인이 저장되었습니다!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "디자인 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleIconToggle = (iconId: string) => {
    if (design.icons.includes(iconId)) {
      removeIcon(iconId);
    } else {
      addIcon(iconId);
    }
  };

  const handleTextPositionUpdate = (field: string, position: { x: number; y: number }) => {
    updateTextPosition(field as any, position);
  };

  const handleSaveDesign = async (): Promise<string> => {
    const result = await new Promise<any>((resolve, reject) => {
      saveDesign.mutate(undefined, {
        onSuccess: resolve,
        onError: reject,
      });
    });
    return result.id;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--notion-bg)" }}>
      <Navigation />
      
      <main className="pt-16 pb-20 px-4 max-w-md mx-auto space-y-6">
        <WineBottleSelector
          selectedBottle={design.bottleType}
          onBottleSelect={updateBottleType}
        />

        <LabelSelector
          selectedLabel={design.labelDesign}
          onLabelSelect={updateLabelDesign}
        />

        <IconSelector
          selectedIcons={design.icons}
          onIconToggle={handleIconToggle}
        />

        <DesignPreview
          design={design}
          onTextPositionUpdate={handleTextPositionUpdate}
        />

        <TextEditor
          design={design}
          onTextUpdate={updateTextElement}
          onFontUpdate={updateTextFont}
        />

        <PaymentSection
          design={design}
          onQuantityUpdate={updateQuantity}
          onSaveDesign={handleSaveDesign}
        />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          className="w-14 h-14 notion-button rounded-full shadow-lg"
          onClick={() => saveDesign.mutate()}
          disabled={saveDesign.isPending}
        >
          <Save className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
