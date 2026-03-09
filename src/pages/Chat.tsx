import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, User, ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { subscribeToConversations, subscribeToMessages, sendMessage } from '../services/chatService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: string;
  otherUser?: {
    id: string;
    name: string;
    photoURL?: string;
  };
}

export default function Chat() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversationId');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.uid, async (convs) => {
      // Enrich conversations with other user data
      const enrichedConversations = await Promise.all(convs.map(async (conv) => {
        const otherUserId = conv.participants.find((id: string) => id !== user.uid);
        let otherUser = { id: otherUserId, name: 'Unknown User', photoURL: '' };

        if (otherUserId) {
          try {
             const userDoc = await getDoc(doc(db, 'users', otherUserId));
             if (userDoc.exists()) {
               const userData = userDoc.data();
               otherUser = { 
                 id: otherUserId, 
                 name: userData.displayName || `User ${otherUserId.substring(0, 5)}`, 
                 photoURL: userData.photoURL || '' 
               };
             } else {
               otherUser = { id: otherUserId, name: `User ${otherUserId.substring(0, 5)}`, photoURL: '' };
             }
          } catch (e) {
             console.error("Error fetching user details", e);
             otherUser = { id: otherUserId, name: `User ${otherUserId.substring(0, 5)}`, photoURL: '' };
          }
        }
        
        return { ...conv, otherUser };
      }));
      
      setConversations(enrichedConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle URL param for conversation ID
  useEffect(() => {
    if (conversationIdParam && !loading) {
      setSelectedConversationId(conversationIdParam);
    }
  }, [conversationIdParam, loading]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;

    const unsubscribe = subscribeToMessages(selectedConversationId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    try {
      await sendMessage(selectedConversationId, user.uid, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      toast.error('Failed to send message');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full flex flex-col bg-white ${selectedConversationId ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {conversations.length}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <p>No conversations yet.</p>
              <p className="text-sm mt-2">Start chatting with sellers!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {conversations.map(conversation => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                    selectedConversationId === conversation.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {conversation.otherUser?.photoURL ? (
                        <img
                          src={conversation.otherUser.photoURL}
                          alt={conversation.otherUser.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm">
                          <User className="h-6 w-6 text-indigo-400" />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{conversation.otherUser?.name}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                          {conversation.lastMessageTimestamp ? new Date(conversation.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${selectedConversationId === conversation.id ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-gray-50/50 ${!selectedConversationId ? 'hidden' : 'flex'}`}>
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm z-10">
              <div className="flex items-center space-x-3">
                <button 
                  className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setSelectedConversationId(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="relative">
                  {selectedConversation.otherUser?.photoURL ? (
                    <img
                      src={selectedConversation.otherUser.photoURL}
                      alt={selectedConversation.otherUser.name}
                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                      <User className="h-5 w-5 text-indigo-500" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedConversation.otherUser?.name}</h3>
                  <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isMe = message.senderId === user?.uid;
                  const isLast = index === messages.length - 1;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                          isMe 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-full border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none px-4 py-2 focus:ring-0 text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-indigo-600 text-white rounded-full p-2.5 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 text-gray-500 p-8">
            <div className="bg-white p-6 rounded-full shadow-sm mb-6">
              <div className="bg-indigo-100 p-4 rounded-full">
                <Send className="h-10 w-10 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
            <p className="text-center max-w-xs">Select a conversation from the sidebar to start chatting with sellers or buyers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
