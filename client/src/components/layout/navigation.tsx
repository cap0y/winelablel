import { Link, useRoute } from "wouter";
import { Package, Palette, User, Images } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { commonTranslations } from "@/lib/translations";
import { useAuth } from "@/contexts/auth-context";

export default function Navigation() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const t = commonTranslations[language];
  
  const [isHomeActive] = useRoute("/");
  const [isPackageSelectorActive] = useRoute("/package-selector");
  const [isGalleryActive] = useRoute("/gallery");
  const [isContactActive] = useRoute("/contact");
  const [isProfileActive] = useRoute("/profile/*");
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/70 backdrop-blur-md">
      <div className="flex justify-around items-center px-2 py-3">
        <Link href="/">
          <div className={`flex flex-col items-center ${isHomeActive ? 'text-primary' : 'text-gray-500'}`}>
            <Package className="w-5 h-5 text-[#2F3437]" />
            <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">홈</span>
          </div>
        </Link>
        
        <Link href="/package-selector">
          <div className={`flex flex-col items-center ${isPackageSelectorActive ? 'text-primary' : 'text-gray-500'}`}>
            <Package className="w-5 h-5 text-[#0F7B6C]" />
            <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">패키지 선택</span>
          </div>
        </Link>
        
        <Link href="/gallery">
          <div className={`flex flex-col items-center ${isGalleryActive ? 'text-primary' : 'text-gray-500'}`}>
            <Images className="w-5 h-5 text-[#B05C00]" />
            <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">디자인 갤러리</span>
          </div>
        </Link>
        
        <Link href="/contact">
          <div className={`flex flex-col items-center ${isContactActive ? 'text-primary' : 'text-gray-500'}`}>
            <Palette className="w-5 h-5 text-[#8A3FFC]" />
            <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">문의/예약</span>
          </div>
        </Link>
        
        {/* 로그인 상태에 따라 다른 메뉴 표시 */}
        {isAuthenticated ? (
          <Link href="/profile">
            <div className={`flex flex-col items-center ${isProfileActive ? 'text-primary' : 'text-gray-500'}`}>
              <User className="w-5 h-5 text-[#2F3437]" />
              <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">프로필</span>
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <div className={`flex flex-col items-center text-gray-500`}>
              <User className="w-5 h-5" />
              <span className="mt-1 text-[10px] leading-tight whitespace-normal text-center break-words">로그인</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
