import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Search, Heart, Settings, User } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center space-x-2">
        <Music className="h-8 w-8 text-purple-500" />
        <h1 className="text-xl font-bold">AuraSync</h1>
      </div>
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            className="pl-8 bg-gray-800 border-gray-700 focus:border-purple-500 placeholder:text-gray-500" 
            placeholder="Search for songs, artists, or albums" 
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Header;
