import { Type } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DesignState } from "@/hooks/use-design-state";

interface TextEditorProps {
  design: DesignState;
  onTextUpdate: (field: string, value: string) => void;
  onFontUpdate: (field: string, font: string) => void;
}

export default function TextEditor({ design, onTextUpdate, onFontUpdate }: TextEditorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Type className="mr-2 text-indigo-400 w-5 h-5" />
          텍스트 편집
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Wine name */}
          <div className="space-y-2">
            <Label className="text-sm text-notion-text-secondary">와인 이름</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="와인 이름을 입력하세요"
                value={design.textElements.name}
                onChange={(e) => onTextUpdate('name', e.target.value)}
                className="notion-input flex-1"
              />
              <Select value={design.fonts.name} onValueChange={(value) => onFontUpdate('name', value)}>
                <SelectTrigger className="w-24 notion-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="notion-card">
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Playfair">Playfair</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vintage */}
          <div className="space-y-2">
            <Label className="text-sm text-notion-text-secondary">빈티지</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="연도를 입력하세요"
                value={design.textElements.vintage}
                onChange={(e) => onTextUpdate('vintage', e.target.value)}
                className="notion-input flex-1"
              />
              <Select value={design.fonts.vintage} onValueChange={(value) => onFontUpdate('vintage', value)}>
                <SelectTrigger className="w-24 notion-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="notion-card">
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Playfair">Playfair</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Wine type */}
          <div className="space-y-2">
            <Label className="text-sm text-notion-text-secondary">와인 타입</Label>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="와인 종류를 입력하세요"
                value={design.textElements.type}
                onChange={(e) => onTextUpdate('type', e.target.value)}
                className="notion-input flex-1"
              />
              <Select value={design.fonts.type} onValueChange={(value) => onFontUpdate('type', value)}>
                <SelectTrigger className="w-24 notion-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="notion-card">
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Playfair">Playfair</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
