
import React from "react";
import { Link } from "react-router-dom";
import { List, Disc, User, Music, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SidebarProps {
  aiModeEnabled: boolean;
  handleAiModeToggle: () => void;
}

const Sidebar = ({ aiModeEnabled, handleAiModeToggle }: SidebarProps) => {
  return (
    <div className="w-full md:w-64 p-4 border-r border-gray-700 space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Your Library</h2>
        <Link to="/" className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
          <Music className="h-5 w-5" />
          <span>Discover</span>
        </Link>
        <Link to="/albums" className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
          <Disc className="h-5 w-5" />
          <span>Albums</span>
        </Link>
        <Link to="/artists" className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
          <User className="h-5 w-5" />
          <span>Artists</span>
        </Link>
        <Link to="/contextual" className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
          <MapPin className="h-5 w-5" />
          <span>Contextual</span>
        </Link>
        <div className="flex items-center space-x-2 text-gray-300 hover:text-white p-2 rounded hover:bg-gray-800">
          <List className="h-5 w-5" />
          <span>Playlists</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">AI Features</h2>
        <div className="space-y-2 p-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="ai-mode">AI Mode</Label>
            <Switch id="ai-mode" checked={aiModeEnabled} onCheckedChange={handleAiModeToggle} />
          </div>
          <p className="text-xs text-gray-400">Enhance your music experience with personalized AI recommendations</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
