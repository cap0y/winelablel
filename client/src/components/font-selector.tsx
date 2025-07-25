import { Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TextFonts } from "@/hooks/use-design-state";

interface FontSelectorProps {
  fonts: TextFonts;
  onFontUpdate: (field: keyof TextFonts, font: string) => void;
}

const fontOptions = [
  { value: "Inter", name: "Inter", description: "모던한 산세리프" },
  { value: "Playfair", name: "Playfair Display", description: "클래식한 세리프" },
  { value: "Roboto", name: "Roboto", description: "깔끔한 산세리프" },
  { value: "Crimson", name: "Crimson Text", description: "우아한 세리프" },
  { value: "Montserrat", name: "Montserrat", description: "기하학적 산세리프" },
  { value: "Merriweather", name: "Merriweather", description: "가독성 좋은 세리프" },
  { value: "Lato", name: "Lato", description: "인본주의적 산세리프" },
  { value: "Open Sans", name: "Open Sans", description: "친근한 산세리프" },
  { value: "Source Sans Pro", name: "Source Sans Pro", description: "Adobe 산세리프" },
  { value: "Nunito", name: "Nunito", description: "둥근 산세리프" },
  { value: "Poppins", name: "Poppins", description: "기하학적 산세리프" },
  { value: "Raleway", name: "Raleway", description: "세련된 산세리프" }
];

export default function FontSelector({ fonts, onFontUpdate }: FontSelectorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Type className="mr-2 text-purple-400 w-5 h-5" />
          폰트 선택
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wine Name Font */}
        <div>
          <label className="text-sm font-medium text-notion-text-primary mb-2 block">
            와인 이름 폰트
          </label>
          <Select value={fonts.name} onValueChange={(value) => onFontUpdate('name', value)}>
            <SelectTrigger className="notion-select w-full">
              <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: font.value === 'Playfair' ? 'Playfair Display, serif' : 
                                               font.value === 'Roboto' ? 'Roboto, sans-serif' :
                                               font.value === 'Crimson' ? 'Crimson Text, serif' :
                                               font.value === 'Montserrat' ? 'Montserrat, sans-serif' :
                                               font.value === 'Merriweather' ? 'Merriweather, serif' :
                                               font.value === 'Lato' ? 'Lato, sans-serif' :
                                               font.value === 'Open Sans' ? 'Open Sans, sans-serif' :
                                               font.value === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                                               font.value === 'Nunito' ? 'Nunito, sans-serif' :
                                               font.value === 'Poppins' ? 'Poppins, sans-serif' :
                                               font.value === 'Raleway' ? 'Raleway, sans-serif' :
                                               'Inter, sans-serif' }}>
                      {font.name}
                    </span>
                    <span className="text-xs text-notion-text-muted">{font.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Vintage Font */}
        <div>
          <label className="text-sm font-medium text-notion-text-primary mb-2 block">
            빈티지 연도 폰트
          </label>
          <Select value={fonts.vintage} onValueChange={(value) => onFontUpdate('vintage', value)}>
            <SelectTrigger className="notion-select w-full">
              <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: font.value === 'Playfair' ? 'Playfair Display, serif' : 
                                               font.value === 'Roboto' ? 'Roboto, sans-serif' :
                                               font.value === 'Crimson' ? 'Crimson Text, serif' :
                                               font.value === 'Montserrat' ? 'Montserrat, sans-serif' :
                                               font.value === 'Merriweather' ? 'Merriweather, serif' :
                                               font.value === 'Lato' ? 'Lato, sans-serif' :
                                               font.value === 'Open Sans' ? 'Open Sans, sans-serif' :
                                               font.value === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                                               font.value === 'Nunito' ? 'Nunito, sans-serif' :
                                               font.value === 'Poppins' ? 'Poppins, sans-serif' :
                                               font.value === 'Raleway' ? 'Raleway, sans-serif' :
                                               'Inter, sans-serif' }}>
                      {font.name}
                    </span>
                    <span className="text-xs text-notion-text-muted">{font.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Wine Type Font */}
        <div>
          <label className="text-sm font-medium text-notion-text-primary mb-2 block">
            와인 타입 폰트
          </label>
          <Select value={fonts.type} onValueChange={(value) => onFontUpdate('type', value)}>
            <SelectTrigger className="notion-select w-full">
              <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <div className="flex flex-col">
                    <span style={{ fontFamily: font.value === 'Playfair' ? 'Playfair Display, serif' : 
                                               font.value === 'Roboto' ? 'Roboto, sans-serif' :
                                               font.value === 'Crimson' ? 'Crimson Text, serif' :
                                               font.value === 'Montserrat' ? 'Montserrat, sans-serif' :
                                               font.value === 'Merriweather' ? 'Merriweather, serif' :
                                               font.value === 'Lato' ? 'Lato, sans-serif' :
                                               font.value === 'Open Sans' ? 'Open Sans, sans-serif' :
                                               font.value === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                                               font.value === 'Nunito' ? 'Nunito, sans-serif' :
                                               font.value === 'Poppins' ? 'Poppins, sans-serif' :
                                               font.value === 'Raleway' ? 'Raleway, sans-serif' :
                                               'Inter, sans-serif' }}>
                      {font.name}
                    </span>
                    <span className="text-xs text-notion-text-muted">{font.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}