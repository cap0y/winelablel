import { Wine } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 px-4 py-6 mt-8 mb-20">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Wine className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">끄레망 와인라벨</span>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          © 2025 끄레망 와인라벨. All rights reserved.
        </p>
        <p className="text-xs text-gray-500">특별한 순간을 위한 특별한 와인 라벨</p>
      </div>
    </footer>
  );
}
