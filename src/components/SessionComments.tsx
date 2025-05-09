
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

interface SessionComment {
  id: string;
  session_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface SessionCommentsProps {
  sessionId: string;
}

const SessionComments = ({ sessionId }: SessionCommentsProps) => {
  const [comments, setComments] = useState<SessionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Generate a temporary user ID if none exists
  useEffect(() => {
    const storedId = localStorage.getItem('guestUserId');
    if (storedId) {
      setUserId(storedId);
    } else {
      const newId = nanoid();
      localStorage.setItem('guestUserId', newId);
      setUserId(newId);
    }
  }, []);

  // Fetch comments for this session
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('session_comments')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Set up realtime subscription
    const channel = supabase
      .channel('public:session_comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'session_comments',
          filter: `session_id=eq.${sessionId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new as SessionComment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => 
              prev.map(c => c.id === payload.new.id ? payload.new as SessionComment : c)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userId) return;

    try {
      const { error } = await supabase
        .from('session_comments')
        .insert({
          session_id: sessionId,
          user_id: userId,
          comment: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment was posted successfully",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        Live Comments
      </h3>
      
      <div className="flex space-x-2 mb-4">
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none bg-gray-700 border-gray-600"
        />
        <Button 
          onClick={handleSubmitComment} 
          className="flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id}
              className="bg-gray-700 p-3 rounded-md"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm flex items-center">
                  <User className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  User {comment.user_id.substring(0, 6)}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-200">{comment.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default SessionComments;
