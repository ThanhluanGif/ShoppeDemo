import React, { useState, useEffect, useContext, useRef } from 'react';
import { Search, Send, User, Bot, Loader2 } from 'lucide-react';
import { get, post } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const AdminChatPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      socket.emit("addUser", user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("getMessage", (data) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, { id: Date.now(), text: data.text, sender: 'customer' }]);
      }
      // Refresh conversation list to show latest
      fetchConversations();
    });
    return () => socket.off("getMessage");
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      const { data } = await get('/messages/conversations');
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedUser) return;
      try {
        const { data } = await get(`/messages/${selectedUser._id}`);
        setMessages(data.map(m => ({
          id: m._id,
          text: m.text,
          sender: m.sender === user._id ? 'admin' : 'customer'
        })));
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };
    fetchHistory();
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const newMessage = { id: Date.now(), text: input, sender: 'admin' };
    setMessages(prev => [...prev, newMessage]);
    const textToSend = input;
    setInput('');

    try {
      await post('/messages', { receiverId: selectedUser._id, text: textToSend });
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: selectedUser._id,
        text: textToSend,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-shopee font-bold">Đang tải hội thoại...</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Sidebar - Conversation List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm khách hàng..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm outline-none focus:border-shopee"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {conversations.length > 0 ? (
             conversations.map((conv) => (
               <div 
                 key={conv._id} 
                 onClick={() => setSelectedUser(conv)}
                 className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${selectedUser?._id === conv._id ? 'bg-orange-50 border-r-4 border-shopee' : ''}`}
               >
                 <img src={conv.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} alt="" className="w-12 h-12 rounded-full border border-gray-100" />
                 <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{conv.username}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.role === 'customer' ? 'Khách hàng' : conv.shopName}</p>
                 </div>
               </div>
             ))
           ) : (
             <div className="p-8 text-center text-gray-400 text-sm italic">Chưa có hội thoại nào</div>
           )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shadow-sm">
               <img src={selectedUser.avatar} alt="" className="w-10 h-10 rounded-full" />
               <div>
                  <p className="font-bold text-gray-800">{selectedUser.username}</p>
                  <p className="text-[10px] text-green-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Đang hoạt động
                  </p>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-shopee text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'}`}>
                      {msg.text}
                   </div>
                 </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
               <input 
                 type="text" 
                 placeholder="Nhập nội dung phản hồi..." 
                 className="flex-1 border border-gray-200 rounded-md px-4 py-2 outline-none focus:border-shopee transition text-sm"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
               />
               <button 
                 type="submit" 
                 className="bg-shopee text-white p-2 px-4 rounded-md hover:opacity-90 transition shadow-sm flex items-center gap-2 font-bold text-sm"
                 disabled={!input.trim()}
               >
                 <Send className="w-4 h-4" /> GỬI
               </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <Bot className="w-16 h-16 mb-4 opacity-20" />
             <p>Chọn một hội thoại để bắt đầu hỗ trợ khách hàng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
