
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Clock, Heart, Send, MessageSquare, Music } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useComments, useAddComment, Comment } from "@/hooks/useComments";

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
  const { data: comments = [], isLoading } = useComments(songId);
  const addComment = useAddComment();
  const commentListRef = useRef<HTMLDivElement>(null);

  const form = useForm<CommentFormValues>({
    defaultValues: {
      text: "",
      timestamp: currentTime
    }
  });

  const onSubmit = (data: CommentFormValues) => {
    // Convert timestamp to seconds for storage
    const [mins, secs] = data.timestamp.split(':').map(Number);
    const timestampInSeconds = (mins * 60) + (secs || 0);
    
    addComment.mutate({
      song_id: songId,
      content: data.text,
      timestamp_in_song: timestampInSeconds
    }, {
      onSuccess: () => {
        form.reset();
        
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully.",
          duration: 2000,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to add comment. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
        console.error("Error adding comment:", error);
      }
    });
  };

  const handleLikeComment = (commentId: string) => {
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

  // Format seconds to MM:SS
  const formatTimestamp = (seconds: number | null): string => {
    if (seconds === null) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    form.setValue("timestamp", currentTime);
  }, [currentTime, form]);

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
                    required
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
                        pattern="[0-9]+:[0-5][0-9]"
                        title="Format: M:SS or MM:SS"
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
              disabled={addComment.isPending}
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
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="bg-gray-800 bg-opacity-50 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <button
                  onClick={() => handleTimestampClick(formatTimestamp(comment.timestamp_in_song))}
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
