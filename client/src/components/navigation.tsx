import { Wine, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wine className="text-purple-400 w-6 h-6" />
          <h1 className="text-lg font-semibold text-notion-text-primary">끄레망 와인라벨</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 rounded-lg bg-notion-card text-notion-text-secondary hover:bg-notion-border transition-colors"
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </nav>
  );
}
