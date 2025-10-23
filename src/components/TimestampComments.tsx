import React, { useMemo, useState } from "react";
import { comments as initialComments, CommentType } from "@/data/comments";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TimestampCommentsProps {
  songId: string;
  currentTimestamp: string; // MM:SS
}

const TimestampComments = ({ songId, currentTimestamp }: TimestampCommentsProps) => {
  const [comments, setComments] = useState<Record<string, CommentType[]>>(initialComments);
  const [text, setText] = useState("");

  const items = useMemo(() => (comments[songId] || []).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [comments, songId]);

  const addComment = () => {
    if (!text.trim()) return;
    const newComment: CommentType = {
      id: `c${Date.now()}`,
      songId,
      userId: "u_current",
      timestamp: currentTimestamp,
      text: text.trim(),
      createdAt: new Date(),
      likes: 0
    };
    setComments(prev => ({
      ...prev,
      [songId]: [newComment, ...(prev[songId] || [])]
    }));
    setText("");
  };

  return (
    <Card className="mt-6 bg-gray-800 border-gray-700">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Live Comments</div>
          <div className="text-xs text-gray-400">Current: {currentTimestamp}</div>
        </div>
        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Add a comment for ${currentTimestamp}`}
            className="bg-gray-900 border-gray-700"
          />
          <Button onClick={addComment} className="bg-purple-600 hover:bg-purple-700">Comment</Button>
        </div>
        <div className="space-y-2 max-h-56 overflow-auto">
          {items.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <div className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-200 mt-1">{c.timestamp}</div>
              <div>
                <div className="text-sm">{c.text}</div>
                <div className="text-[10px] text-gray-500">{c.createdAt.toLocaleDateString()}</div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-gray-400">Be the first to comment on this track.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimestampComments;

