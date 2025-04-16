import React, { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Clock, Heart, Send, MessageSquare, Music } from "lucide-react";
import { comments as allComments, CommentType } from "@/data";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

interface SongCommentsProps {
  songId: string;
  currentTime?: string;
  onTimestampClick?: (timestamp: string) => void;
}

interface CommentFormValues {
  text: string;
  timestamp: string;
}

const SongComments = ({ songId, currentTime = "0:00", onTimestampClick }: SongCommentsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [comments, setComments] = useState<CommentType[]>(allComments[songId] || []);
  const commentListRef = useRef<HTMLDivElement>(null);

  const form = useForm<CommentFormValues>({
    defaultValues: {
      text: "",
      timestamp: currentTime
    }
  });

  const onSubmit = (data: CommentFormValues) => {
    const newComment: CommentType = {
      id: `c${Date.now()}`,
      songId: songId,
      userId: "currentUser",
      timestamp: data.timestamp,
      text: data.text,
      createdAt: new Date(),
      likes: 0
    };

    setComments((prev) => [newComment, ...prev]);
    form.reset();

    if (commentListRef.current) {
      commentListRef.current.scrollTop = 0;
    }

    toast({
      title: "Comment added",
      description: "Your comment has been added successfully.",
      duration: 2000,
    });
  };

  const handleLikeComment = (commentId: string) => {
    setComments((prev) => 
      prev.map((comment) => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 } 
          : comment
      )
    );

    toast({
      title: "Liked",
      description: "You liked this comment",
      duration: 1500,
    });
  };

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

  React.useEffect(() => {
    form.setValue("timestamp", currentTime);
  }, [currentTime, form]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" /> 
          Comments ({comments.length})
        </h3>
        <Link to={`/remix/${songId}`}>
          <Button variant="outline" className="flex items-center">
            <Music className="mr-2 h-4 w-4" />
            Remix this song
          </Button>
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea 
                    placeholder="Add your comment about this song..." 
                    className="resize-none bg-gray-800 text-white"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex space-x-2">
            <FormField
              control={form.control}
              name="timestamp"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormControl>
                    <div className="flex items-center bg-gray-800 rounded-md px-2">
                      <Clock className="h-4 w-4 mr-1 text-purple-500" />
                      <Input 
                        placeholder="0:00" 
                        className="border-0 bg-transparent p-1 w-full text-center focus-visible:ring-0"
                        {...field}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700 flex-shrink-0"
            >
              <Send className="mr-2 h-4 w-4" />
              Comment
            </Button>
          </div>
        </form>
      </Form>

      <div 
        className="space-y-4 max-h-96 overflow-y-auto pr-2 pb-2" 
        ref={commentListRef}
      >
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-gray-800 bg-opacity-50 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => handleTimestampClick(comment.timestamp)}
                  className="flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {comment.timestamp}
                </button>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-200 mb-3">{comment.text}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="text-gray-400 hover:text-purple-400 text-sm flex items-center"
                >
                  <Heart className="mr-1 h-3.5 w-3.5" />
                  {comment.likes}
                </button>
                <span className="text-xs text-gray-500">
                  User {comment.userId}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};

export default SongComments;
