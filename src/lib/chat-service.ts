import { db, storage } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Message } from '@/types/chat';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

export const sendMessage = async (chatId: string, senderId: string, content: string) => {
  if (!db) {
    console.error('Firestore not initialized');
    return;
  }
  try {
    await addDoc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION), {
      senderId,
      content,
      timestamp: serverTimestamp(),
      type: 'text',
      readBy: { [senderId]: true },
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export const sendFileMessage = async (chatId: string, senderId: string, file: File) => {
  if (!db || !storage) {
    console.error('Firestore or Storage not initialized');
    return;
  }

  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `chat-files/${chatId}/${file.name}`);
    const uploadTask = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(uploadTask.ref);

    // Add message to Firestore
    await addDoc(collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION), {
      senderId,
      content: downloadURL,
      timestamp: serverTimestamp(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      readBy: { [senderId]: true },
      fileName: file.name,
    });
  } catch (error) {
    console.error('Error sending file message:', error);
  }
};

export const markMessageAsRead = async (chatId: string, messageId: string, userId: string) => {
  if (!db) {
    console.error('Firestore not initialized');
    return;
  }
  const messageRef = doc(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION, messageId);
  try {
    // Use dot notation to update a field in a map.
    await updateDoc(messageRef, {
      [`readBy.${userId}`]: true
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

export const onMessagesUpdate = (chatId: string, callback: (messages: Message[]) => void) => {
  if (!db) {
    console.error('Firestore not initialized');
    return () => {}; // Return an empty unsubscribe function
  }
  const messagesQuery = query(
    collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        chatId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp?.toDate(),
        type: data.type,
        readBy: data.readBy,
        fileName: data.fileName,
      };
    });
    callback(messages);
  });
};
