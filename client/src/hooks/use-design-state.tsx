import { useState, useCallback } from "react";

export interface TextElement {
  name: string;
  vintage: string;
  type: string;
}

export interface TextPositions {
  name: { x: number; y: number };
  vintage: { x: number; y: number };
  type: { x: number; y: number };
}

export interface IconPositions {
  [key: string]: { x: number; y: number };
}

export interface TextFonts {
  name: string;
  vintage: string;
  type: string;
}

export interface DesignState {
  bottleType: string;
  labelDesign: string;
  icons: string[];
  textElements: TextElement;
  positions: TextPositions;
  iconPositions: IconPositions;
  fonts: TextFonts;
  quantity: number;
}

const initialState: DesignState = {
  bottleType: "classic",
  labelDesign: "vintage",
  icons: [],
  textElements: {
    name: "샤토 끄레망",
    vintage: "2023",
    type: "까베르네 소비뇽"
  },
  positions: {
    name: { x: 30, y: 40 },
    vintage: { x: 80, y: 120 },
    type: { x: 40, y: 160 }
  },
  iconPositions: {},
  fonts: {
    name: "Playfair",
    vintage: "Inter",
    type: "Inter"
  },
  quantity: 1
};

export function useDesignState() {
  const [design, setDesign] = useState<DesignState>(initialState);

  const updateBottleType = useCallback((bottleType: string) => {
    setDesign(prev => ({ ...prev, bottleType }));
  }, []);

  const updateLabelDesign = useCallback((labelDesign: string) => {
    setDesign(prev => ({ ...prev, labelDesign }));
  }, []);

  const addIcon = useCallback((icon: string) => {
    setDesign(prev => ({
      ...prev,
      icons: [...prev.icons, icon]
    }));
  }, []);

  const removeIcon = useCallback((icon: string) => {
    setDesign(prev => ({
      ...prev,
      icons: prev.icons.filter(i => i !== icon)
    }));
  }, []);

  const updateTextElement = useCallback((field: keyof TextElement, value: string) => {
    setDesign(prev => ({
      ...prev,
      textElements: {
        ...prev.textElements,
        [field]: value
      }
    }));
  }, []);

  const updateTextPosition = useCallback((field: keyof TextPositions, position: { x: number; y: number }) => {
    setDesign(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [field]: position
      }
    }));
  }, []);

  const updateTextFont = useCallback((field: keyof TextFonts, font: string) => {
    setDesign(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [field]: font
      }
    }));
  }, []);

  const updateIconPosition = useCallback((iconKey: string, position: { x: number; y: number }) => {
    setDesign(prev => ({
      ...prev,
      iconPositions: {
        ...prev.iconPositions,
        [iconKey]: position
      }
    }));
  }, []);

  const updateQuantity = useCallback((quantity: number) => {
    setDesign(prev => ({ ...prev, quantity: Math.max(1, quantity) }));
  }, []);

  return {
    design,
    updateBottleType,
    updateLabelDesign,
    addIcon,
    removeIcon,
    updateTextElement,
    updateTextPosition,
    updateIconPosition,
    updateTextFont,
    updateQuantity,
    setDesign
  };
}
