'use client';

import React, { useState, useEffect } from 'react';
import Chat from '@/components/Chat';
import { Message } from '@/types/chat';
import { onMessagesUpdate, sendMessage, sendFileMessage, markMessageAsRead } from '@/lib/chat-service';
import { useFirebaseAuth } from '@/lib/firebase-auth-provider';

const ChatPage = () => {
  const { user } = useFirebaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const chatId = 'test-chat'; // Hardcoded for now

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onMessagesUpdate(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = (content: string) => {
    if (user) {
      sendMessage(chatId, user.uid, content);
    }
  };

  const handleSendFile = (file: File) => {
    if (user) {
      sendFileMessage(chatId, user.uid, file);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    if (user) {
      const message = messages.find(m => m.id === messageId);
      if (message && !message.readBy[user.uid]) {
        markMessageAsRead(chatId, messageId, user.uid);
      }
    }
  };

  const quickReplies = [
    "I'm on my way.",
    "I'll be there in 5 minutes.",
    "Can you please repeat that?",
    "Thank you!",
  ];

  return (
    <div className="h-screen">
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        quickReplies={quickReplies}
        onMarkAsRead={handleMarkAsRead}
        currentUser={user}
      />
    </div>
  );
};

export default ChatPage;
