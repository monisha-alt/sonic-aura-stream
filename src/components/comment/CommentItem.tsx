
import React from "react";
import { Comment } from "@/hooks/useComments";
import { Clock, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentItemProps {
  comment: Comment;
  onTimestampClick: (timestamp: string) => void;
}

const CommentItem = ({ comment, onTimestampClick }: CommentItemProps) => {
  const { toast } = useToast();

  // Format seconds to MM:SS
  const formatTimestamp = (seconds: number | null): string => {
    if (seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLikeComment = (commentId: string) => {
    toast({
      title: "Liked",
      description: "You liked this comment",
      duration: 1500,
    });
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <button
          onClick={() => onTimestampClick(formatTimestamp(comment.timestamp_in_song))}
          className="flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          <Clock className="mr-1 h-3.5 w-3.5" />
          {formatTimestamp(comment.timestamp_in_song)}
        </button>
        <span className="text-xs text-gray-400">
          {new Date(comment.created_at || "").toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-200 mb-3">{comment.content}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleLikeComment(comment.id)}
          className="text-gray-400 hover:text-purple-400 text-sm flex items-center"
        >
          <Heart className="mr-1 h-3.5 w-3.5" />
          {comment.likes_count}
        </button>
        <span className="text-xs text-gray-500">
          User {comment.user_id?.substring(0, 8) || "Anonymous"}
        </span>
      </div>
    </div>
  );
};

export default CommentItem;
