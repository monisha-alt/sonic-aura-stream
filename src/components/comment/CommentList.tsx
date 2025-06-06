
import React, { useRef } from "react";
import { Comment } from "@/hooks/useComments";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  onTimestampClick: (timestamp: string) => void;
}

const CommentList = ({ comments, isLoading, onTimestampClick }: CommentListProps) => {
  const commentListRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className="space-y-4 max-h-96 overflow-y-auto pr-2 pb-2" 
      ref={commentListRef}
    >
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : comments.length > 0 ? (
        comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment}
            onTimestampClick={onTimestampClick}
          />
        ))
      ) : (
        <div className="text-center text-gray-400 py-8">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default CommentList;
