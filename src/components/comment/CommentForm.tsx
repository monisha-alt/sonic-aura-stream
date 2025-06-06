
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Clock, Send } from "lucide-react";
import { useAddComment } from "@/hooks/useComments";
import { useToast } from "@/hooks/use-toast";

interface CommentFormProps {
  songId: string;
  currentTime: string;
}

interface CommentFormValues {
  text: string;
  timestamp: string;
}

const CommentForm = ({ songId, currentTime }: CommentFormProps) => {
  const { toast } = useToast();
  const addComment = useAddComment();
  
  const form = useForm<CommentFormValues>({
    defaultValues: {
      text: "",
      timestamp: currentTime
    }
  });

  useEffect(() => {
    form.setValue("timestamp", currentTime);
  }, [currentTime, form]);

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

  return (
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
  );
};

export default CommentForm;
