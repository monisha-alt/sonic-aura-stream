
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useComments } from "@/hooks/useComments";
import CommentForm from "./comment/CommentForm";
import CommentList from "./comment/CommentList";

interface SongCommentsProps {
  songId: string;
  currentTime?: string;
  onTimestampClick?: (timestamp: string) => void;
}

const SongComments = ({ songId, currentTime = "0:00", onTimestampClick }: SongCommentsProps) => {
  const { toast } = useToast();
  const { data: comments = [], isLoading } = useComments(songId);

  const handleTimestampClick = (timestamp: string) => {
    if (onTimestampClick) {
      onTimestampClick(timestamp);
      toast({
        title: "Jumping to timestamp",
        description: `Moving to ${timestamp}`,
        duration: 1500,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" /> 
          Comments {!isLoading && `(${comments.length})`}
        </h3>
        <Link to={`/remix/${songId}`}>
          <Button variant="outline" className="flex items-center">
            <Music className="mr-2 h-4 w-4" />
            Remix this song
          </Button>
        </Link>
      </div>

      <CommentForm 
        songId={songId} 
        currentTime={currentTime} 
      />

      <CommentList 
        comments={comments}
        isLoading={isLoading}
        onTimestampClick={handleTimestampClick}
      />
    </div>
  );
};

export default SongComments;
