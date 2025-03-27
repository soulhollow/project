import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { Send, User, MessageSquare, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
}

interface ChatPartner {
  id: string;
  name: string;
  bio: string;
}

interface RecentChat {
  partner: ChatPartner;
  lastMessage: Message;
}

const ChatPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get chat partner ID from URL query params
  const searchParams = new URLSearchParams(location.search);
  const partnerId = searchParams.get('with');

  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user) return;

      try {
        // Get all messages involving the current user
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;

        if (messages) {
          // Get unique chat partners
          const uniquePartnerIds = new Set<string>();
          const recentMessages: Message[] = [];

          messages.forEach(message => {
            const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
            if (!uniquePartnerIds.has(partnerId)) {
              uniquePartnerIds.add(partnerId);
              recentMessages.push(message);
            }
          });

          // Fetch partner profiles
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, bio')
            .in('id', Array.from(uniquePartnerIds));

          if (profilesError) throw profilesError;

          if (profiles) {
            const chats: RecentChat[] = recentMessages
              .map(message => {
                const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
                const partner = profiles.find(p => p.id === partnerId);
                if (partner) {
                  return {
                    partner,
                    lastMessage: message,
                  };
                }
                return null;
              })
              .filter((chat): chat is RecentChat => chat !== null);

            setRecentChats(chats);
          }
        }
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentChats();
  }, [user]);

  useEffect(() => {
    const fetchChatPartner = async () => {
      if (!user || !partnerId) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, bio')
          .eq('id', partnerId)
          .single();

        if (error) throw error;
        if (data) {
          setChatPartner(data);
        }
      } catch (error) {
        console.error('Error fetching chat partner:', error);
      }
    };

    fetchChatPartner();
  }, [user, partnerId]);

  useEffect(() => {
    if (!user || !chatPartner) return;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${chatPartner.id}),and(sender_id.eq.${chatPartner.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('INSERT', (payload) => {
        const newMessage = payload.new as Message;
        // Only add message if it's part of this conversation
        if (
          (newMessage.sender_id === user.id && newMessage.receiver_id === chatPartner.id) ||
          (newMessage.sender_id === chatPartner.id && newMessage.receiver_id === user.id)
        ) {
          setMessages((current) => [...current, newMessage]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, chatPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !chatPartner || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        content: newMessage.trim(),
        sender_id: user.id,
        receiver_id: chatPartner.id,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBack = () => {
    navigate('/chat', { replace: true });
    setChatPartner(null);
  };

  const handleChatSelect = (partnerId: string) => {
    navigate(`/chat?with=${partnerId}`);
  };

  if (!chatPartner) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">Recent Conversations</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : recentChats.length > 0 ? (
            <div className="divide-y">
              {recentChats.map(({ partner, lastMessage }) => (
                <div key={partner.id} className="group">
                  <div
                    onClick={() => handleChatSelect(partner.id)}
                    className="w-full p-4 hover:bg-gray-50 transition flex items-center gap-4 cursor-pointer"
                  >
                    <Link
                      to={`/profile/${partner.id}`}
                      className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-blue-200 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <User className="w-6 h-6 text-blue-600" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${partner.id}`}
                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {partner.name}
                      </Link>
                      <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(lastMessage.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md h-[calc(100vh-12rem)] flex flex-col">
        {/* Chat header */}
        <div className="p-4 border-b flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Link
            to={`/profile/${chatPartner.id}`}
            className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors flex-1"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{chatPartner.name}</h2>
              <p className="text-sm text-gray-500 line-clamp-1">{chatPartner.bio}</p>
            </div>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {format(new Date(message.created_at), 'p')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;