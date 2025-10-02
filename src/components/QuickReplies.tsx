import React from 'react';
import { Button } from './ui/button';

interface QuickRepliesProps {
  replies: string[];
  onSelectReply: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelectReply }) => {
  return (
    <div className="p-2 flex flex-wrap gap-2">
      {replies.map((reply, index) => (
        <Button key={index} variant="outline" size="sm" onClick={() => onSelectReply(reply)}>
          {reply}
        </Button>
      ))}
    </div>
  );
};

export default QuickReplies;
