import React, { useState, useEffect } from 'react';

interface Comment {
  id: string;
  timestamp: number;
  text: string;
  userId: string;
  userName: string;
}

interface TimestampCommentsProps {
  songId: string | null | undefined;
  currentTime: number;
  duration: number;
}

const TimestampComments: React.FC<TimestampCommentsProps> = ({ 
  songId, 
  currentTime, 
  duration: _duration 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fix Bug 2: Add null/undefined check for songId
  useEffect(() => {
    if (!songId || songId === 'undefined' || songId === 'null') {
      setComments([]);
      return;
    }

    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/songs/${songId}/comments`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [songId]);

  const handleAddComment = async () => {
    // Fix Bug 2: Validate songId before making request
    if (!songId || songId === 'undefined' || songId === 'null' || !newComment.trim()) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/songs/${songId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: currentTime,
          text: newComment,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([...comments, comment]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!songId || songId === 'undefined' || songId === 'null') {
    return null;
  }

  return (
    <div className="timestamp-comments">
      <h3>Comments at {Math.floor(currentTime)}s</h3>
      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>{comment.text}</p>
              <span>{comment.userName} - {Math.floor(comment.timestamp)}s</span>
            </div>
          ))}
        </div>
      )}
      <div className="add-comment">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default TimestampComments;

