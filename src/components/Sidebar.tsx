
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Library, 
  ListMusic, 
  Music2, 
  Disc3, 
  Users, 
  Radio, 
  Mic2, 
  Zap, 
  Settings, 
  Heart,
  Sparkles,
  LogOut,
  User
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  aiModeEnabled: boolean;
  handleAiModeToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ aiModeEnabled, handleAiModeToggle }) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    }
  };

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-gray-100 p-4 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-xl font-bold">MusicAI</h2>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">AI Mode</span>
        </div>
        <Switch checked={aiModeEnabled} onCheckedChange={handleAiModeToggle} />
      </div>
      
      <nav className="space-y-1 flex-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/library" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Library className="h-5 w-5" />
          <span>Library</span>
        </NavLink>
        
        <NavLink 
          to="/playlists" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <ListMusic className="h-5 w-5" />
          <span>Playlists</span>
        </NavLink>
        
        <NavLink 
          to="/favorites" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Heart className="h-5 w-5" />
          <span>Favorites</span>
        </NavLink>
        
        <NavLink 
          to="/contextual" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Radio className="h-5 w-5" />
          <span>Contextual</span>
        </NavLink>
        
        <NavLink 
          to="/remix" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Music2 className="h-5 w-5" />
          <span>Remix</span>
        </NavLink>
        
        <NavLink 
          to="/albums" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Disc3 className="h-5 w-5" />
          <span>Albums</span>
        </NavLink>
        
        <NavLink 
          to="/artists" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Users className="h-5 w-5" />
          <span>Artists</span>
        </NavLink>
        
        <NavLink 
          to="/lyrics" 
          className={({ isActive }) => 
            `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
              isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
            }`
          }
        >
          <Mic2 className="h-5 w-5" />
          <span>Lyrics</span>
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-gray-800">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                isActive ? 'bg-gray-800 text-purple-400' : 'hover:bg-gray-800 hover:text-purple-400'
              }`
            }
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* User section at bottom */}
      <div className="mt-auto pt-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-400">Premium Member</p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
