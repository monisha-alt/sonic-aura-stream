
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Music, Headphones, Users, Share2, Wand2, Library } from "lucide-react";

const MainNavigationMenu = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/library">
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/library") && "bg-accent text-accent-foreground"
              )}
            >
              <Library className="w-4 h-4 mr-2" />
              Library
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/albums">
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/albums") && "bg-accent text-accent-foreground"
              )}
            >
              <Music className="w-4 h-4 mr-2" />
              Albums
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/artists">
            <NavigationMenuLink 
              className={cn(
                navigationMenuTriggerStyle(),
                isActive("/artists") && "bg-accent text-accent-foreground"
              )}
            >
              <Users className="w-4 h-4 mr-2" />
              Artists
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={isActive("/contextual") ? "bg-accent text-accent-foreground" : ""}>
            <Headphones className="w-4 h-4 mr-2" />
            Discover
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <li className="row-span-3">
                <Link to="/contextual">
                  <NavigationMenuLink
                    className={cn(
                      "flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500 to-purple-900 p-6 no-underline outline-none focus:shadow-md",
                      isActive("/contextual") && "ring-2 ring-purple-400"
                    )}
                  >
                    <div className="mb-2 mt-4 text-lg font-medium text-white">
                      Contextual Music
                    </div>
                    <p className="text-sm leading-tight text-white/90">
                      Discover music that adapts to your environment and mood
                    </p>
                  </NavigationMenuLink>
                </Link>
              </li>
              <li>
                <Link to="/live">
                  <NavigationMenuLink 
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      isActive("/live") && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="text-sm font-medium leading-none">Live Sessions</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Join other listeners in real-time music sessions
                    </p>
                  </NavigationMenuLink>
                </Link>
              </li>
              <li>
                <NavigationMenuLink
                  asChild
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Link to="/">
                    <div className="text-sm font-medium leading-none">AI Recommendations</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Get personalized song suggestions based on your preferences
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Share2 className="w-4 h-4 mr-2" />
            Share & Create
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-[220px]">
              <li>
                <NavigationMenuLink
                  asChild
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Link to="/albums">
                    <div className="flex items-center">
                      <Share2 className="w-4 h-4 mr-2" />
                      <div className="text-sm font-medium leading-none">Share Albums</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Share your favorite albums with friends
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  asChild
                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  <Link to="/lyrics/song-01">
                    <div className="flex items-center">
                      <Wand2 className="w-4 h-4 mr-2" />
                      <div className="text-sm font-medium leading-none">Remix Songs</div>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      Create custom remixes of your favorite tracks
                    </p>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigationMenu;
