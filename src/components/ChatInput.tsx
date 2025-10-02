import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onSendFile: (file: File) => void;
  quickReply?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onSendFile, quickReply }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickReply) {
      setMessage(prev => prev ? `${prev} ${quickReply}` : quickReply);
    }
  }, [quickReply]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 border-t">
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="pr-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center">
          <Button variant="ghost" size="icon" onClick={handleAttachmentClick}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button onClick={handleSend}>
            Send
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
