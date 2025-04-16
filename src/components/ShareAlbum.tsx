
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share, Share2, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { shareAlbum, shareOptions } from "./remix/remixUtils";

interface ShareAlbumProps {
  albumId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

const ShareAlbum: React.FC<ShareAlbumProps> = ({ 
  albumId, 
  size = "default", 
  variant = "outline" 
}) => {
  const handleShare = (platform: string) => {
    const result = shareAlbum(albumId, platform);
    if (result) {
      toast.success(result);
    }
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'share':
        return <Share className="h-4 w-4 mr-2" />;
      case 'share-2':
        return <Share2 className="h-4 w-4 mr-2" />;
      case 'mail':
        return <Mail className="h-4 w-4 mr-2" />;
      case 'copy':
        return <Copy className="h-4 w-4 mr-2" />;
      default:
        return <Share className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareOptions.map((option) => (
          <DropdownMenuItem key={option.id} onClick={() => handleShare(option.id)}>
            {getIcon(option.icon)}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareAlbum;
