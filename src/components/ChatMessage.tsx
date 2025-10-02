import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface ChatMessageProps {
  message: Message;
  isRead: boolean;
  currentUser: FirebaseUser | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isRead, currentUser }) => {
  const isSender = message.senderId === currentUser?.uid;

  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return <img src={message.content} alt={message.fileName || 'Image'} className="rounded-lg max-w-xs" />;
      case 'file':
        return (
          <a href={message.content} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            {message.fileName || 'Download File'}
          </a>
        );
      default:
        return (
          <span
            className={`px-4 py-2 rounded-lg inline-block ${
              isSender ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-300 text-gray-600 rounded-bl-none'
            }`}
          >
            {message.content}
          </span>
        );
    }
  };

  return (
    <div className={`flex items-end mb-4 ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex flex-col space-y-2 text-base max-w-xs mx-2 ${
          isSender ? 'order-1 items-end' : 'order-2 items-start'
        }`}
      >
        <div>{renderContent()}</div>
        {isSender && (
          <div className="flex items-center text-xs text-gray-500">
            {isRead ? <CheckCheck className="h-4 w-4 text-blue-500" /> : <Check className="h-4 w-4" />}
            <span className="ml-1">{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        )}
        {!isSender && message.timestamp && (
          <div className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
