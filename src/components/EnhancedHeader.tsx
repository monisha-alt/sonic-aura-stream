
import React from "react";
import { Link } from "react-router-dom";
import { MusicIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import MainNavigationMenu from "./NavigationMenu";

const EnhancedHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <MusicIcon className="h-6 w-6 text-purple-500" />
            <span className="font-bold text-xl">AuraSync</span>
          </Link>
          <MainNavigationMenu />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;
