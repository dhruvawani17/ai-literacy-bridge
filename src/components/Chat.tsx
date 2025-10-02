import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickReplies from './QuickReplies';
import { User as FirebaseUser } from 'firebase/auth';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onSendFile: (file: File) => void;
  quickReplies: string[];
  onMarkAsRead: (messageId: string) => void;
  currentUser: FirebaseUser | null;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, onSendFile, quickReplies, onMarkAsRead, currentUser }) => {
  const [selectedQuickReply, setSelectedQuickReply] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            if (messageId) {
              const message = messages.find((m) => m.id === messageId);
              if (message && message.senderId !== currentUser.uid && !message.readBy[currentUser.uid]) {
                onMarkAsRead(messageId);
              }
            }
          }
        });
      },
      { threshold: 1.0 }
    );

    messageRefs.current.forEach((ref) => {
      observer.observe(ref);
    });

    return () => {
      messageRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, [messages, currentUser, onMarkAsRead]);


  const handleSelectReply = (reply: string) => {
    setSelectedQuickReply(reply);
    // Resetting after a short delay to allow ChatInput to pick it up
    setTimeout(() => setSelectedQuickReply(undefined), 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUser?.uid;
          const isRead = Object.keys(msg.readBy).length > 1;
          return (
            <div
              key={msg.id}
              ref={(el) => {
                if (el) messageRefs.current.set(msg.id, el);
                else messageRefs.current.delete(msg.id);
              }}
              data-message-id={msg.id}
            >
              <ChatMessage key={msg.id} message={msg} isRead={isRead} currentUser={currentUser} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <QuickReplies replies={quickReplies} onSelectReply={handleSelectReply} />
      <ChatInput onSendMessage={onSendMessage} onSendFile={onSendFile} quickReply={selectedQuickReply} />
    </div>
  );
};

export default Chat;
