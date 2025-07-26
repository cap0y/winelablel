import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// DeepL API 키 (보안을 위해 실서비스에서는 .env 등에 보관하세요)
const DEEPL_API_KEY = '5341f2e7-d826-40d0-ae2d-611cf0d16fc0:fx';

// DeepL 대상 언어 코드 매핑
const DEEPL_LANG_MAP: Record<Language, string> = {
  ko: 'KO', // 사용되지 않음
  en: 'EN',
  ja: 'JA',
  zh: 'ZH',
};

// 원본 텍스트 보관용 (복원 시 사용)
const originalTextMap: Map<Node, string> = new Map();

// 단일 텍스트 DeepL 번역 (fallback 용)
async function deeplTranslate(text: string, targetLang: Language): Promise<string> {
  try {
    const params = new URLSearchParams();
    params.append('auth_key', DEEPL_API_KEY);
    params.append('text', text);
    params.append('target_lang', DEEPL_LANG_MAP[targetLang]);

    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.translations?.[0]?.text ?? text;
  } catch (err) {
    console.error('DeepL 번역 오류:', err);
    return text;
  }
}

// 다중 텍스트 DeepL 번역 (중복 문장 캐싱)
async function deeplTranslateBatch(texts: string[], targetLang: Language): Promise<Map<string, string>> {
  const unique = Array.from(new Set(texts));

  // 1) 서버 프록시 시도
  try {
    const proxyRes = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: unique, target: DEEPL_LANG_MAP[targetLang] }),
    });

    if (proxyRes.ok) {
      const proxyData = await proxyRes.json() as { translations: string[] };
      const proxyMap = new Map<string, string>();
      unique.forEach((src, idx) => proxyMap.set(src, proxyData.translations[idx] ?? src));
      return proxyMap;
    } else {
      console.warn('Proxy translate 실패', await proxyRes.text());
    }
  } catch (proxyErr) {
    console.warn('Proxy translate 예외', proxyErr);
  }

  // 2) DeepL 직접 호출 시도 (CORS 예상)
  try {
    const params = new URLSearchParams();
    params.append('auth_key', DEEPL_API_KEY);
    unique.forEach(t => params.append('text', t));
    params.append('target_lang', DEEPL_LANG_MAP[targetLang]);

    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      const map = new Map<string, string>();
      unique.forEach((src, idx) => map.set(src, data.translations?.[idx]?.text ?? src));
      return map;
    } else {
      console.warn('DeepL 직접 호출 실패', await res.text());
    }
  } catch (err) {
    console.error('DeepL 직접 호출 예외', err);
  }

  // 3) 실패 시 원본 반환
  const fallback = new Map<string, string>();
  unique.forEach(src => fallback.set(src, src));
  return fallback;
}

// 페이지 전체 텍스트 노드 번역
async function translateEntirePage(targetLang: Language) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  const nodes: Node[] = [];
  const texts: string[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const value = n.nodeValue?.trim() ?? '';
    if (value && /[\uAC00-\uD7A3]/.test(value)) { // 한글 포함
      nodes.push(n);
      texts.push(value);
      if (!originalTextMap.has(n)) originalTextMap.set(n, value);
    }
  }

  if (texts.length === 0) return;

  const mapping = await deeplTranslateBatch(texts, targetLang);
  nodes.forEach(node => {
    const original = node.nodeValue?.trim() ?? '';
    const translated = mapping.get(original);
    if (translated) node.nodeValue = translated;
  });
}

function restoreOriginalPage() {
  originalTextMap.forEach((text, node) => {
    node.nodeValue = text;
  });
}

// 언어 타입 확장 (중국어 추가)
export type Language = 'ko' | 'en' | 'ja' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  refreshKey: number; // 강제 리렌더링을 위한 키
  translatePage: (text: string, targetLang: Language) => Promise<string>; // 페이지 번역 함수 추가
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 로컬 스토리지에서 언어 설정을 가져오거나, 기본값으로 'ko' 사용
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('app_language');
    return (savedLanguage as Language) || 'ko';
  });
  
  // 강제 리렌더링을 위한 키
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 언어 변경 함수 재정의
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setRefreshKey(prev => prev + 1); // 키 업데이트로 강제 리렌더링
  };

  // 문자열 단건 번역 함수 (컴포넌트에서 필요할 경우 사용)
  const translatePage = async (text: string, targetLang: Language): Promise<string> => {
    return deeplTranslate(text, targetLang);
  };

  // 언어 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('app_language', language);
    // HTML lang 속성 업데이트
    document.documentElement.lang = language;
    console.log('언어 변경:', language);

    if (language === 'ko') {
      restoreOriginalPage();
    } else {
      translateEntirePage(language).then(() => console.log('페이지 DeepL 번역 완료'));
    }
  }, [language, refreshKey]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleLanguageChange,
      refreshKey,
      translatePage
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 