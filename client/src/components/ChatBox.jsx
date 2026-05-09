import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { get, post } from '../services/api';
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { label: '📦 Vận chuyển', value: 'vận chuyển' },
    { label: '🛡️ Bảo hành', value: 'bảo hành' },
    { label: '🔄 Đổi trả', value: 'đổi trả' },
    { label: '🏪 Bán hàng', value: 'bán hàng' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (user) {
      socket.emit("addUser", user._id);
    }
  }, [user]);

  useEffect(() => {
    socket.on("getMessage", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: data.text,
          sender: 'admin',
        },
      ]);
    });
    return () => socket.off("getMessage");
  }, []);

  useEffect(() => {
    const fetchAdminAndHistory = async () => {
      try {
        // Find admin user
        const { data: users } = await get('/users');
        const admin = users.find(u => u.role === 'admin');
        if (admin) {
          setAdminId(admin._id);
          // Fetch history
          if (user) {
            const { data: history } = await get(`/messages/${admin._id}`);
            setMessages(history.map(m => ({
              id: m._id,
              text: m.text,
              sender: m.sender === user._id ? 'user' : 'admin'
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching chat context:', error);
      }
    };
    if (isOpen) fetchAdminAndHistory();
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoading) {
      const welcomeMsg = user 
        ? `Chào ${user.username}! Tôi là trợ lý của ThanhLuanShop. Tôi có thể giúp gì cho bạn?`
        : 'Xin chào! Tôi là trợ lý của ThanhLuanShop. Bạn vui lòng đăng nhập để được hỗ trợ tốt nhất nhé.';
      
      setMessages([{ id: 'welcome', text: welcomeMsg, sender: 'admin' }]);
    }
  }, [isOpen, user, messages.length, isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (val) => {
    const textToSend = typeof val === 'string' ? val : input;
    if (!textToSend.trim() || !user || !adminId) return;

    const userMessage = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      await post('/messages', { receiverId: adminId, text: textToSend });
      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId: adminId,
        text: textToSend,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (user?.role === 'admin' || user?.role === 'vendor') {
    // Admin and Vendor might use a different interface, but for now we keep the button
    // or we could return null if they should only use the dashboard.
    // The prompt says "Shop/Admin quản lý danh sách khách", so they probably don't use the floating chatbox.
    // However, for debugging we can keep it.
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#ee4d2d] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center hover:scale-110 transition-all z-[9999] animate-bounce group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full text-[11px] flex items-center justify-center font-bold shadow-sm">!</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[380px] sm:w-[400px] bg-white shadow-2xl rounded-lg overflow-hidden z-[9999] border border-gray-200 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14 w-64' : 'h-[550px] sm:h-[600px]'}`}>
      {/* Header */}
      <div className="bg-[#ee4d2d] p-4 flex items-center justify-between text-white shrink-0 cursor-pointer shadow-md" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="flex items-center gap-3">
           <div className="w-9 h-9 bg-white/30 rounded-full flex items-center justify-center border border-white/20">
              <Bot className="w-5 h-5 text-white" />
           </div>
           <div>
              <p className="text-sm font-extrabold leading-none tracking-tight">Hỗ Trợ ThanhLuanShop</p>
              {!isMinimized && <p className="text-[10px] text-white/90 mt-1 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> Đang trực tuyến</p>}
           </div>
        </div>
        <div className="flex items-center gap-1">
           <button 
             onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} 
             className="hover:bg-white/20 p-2 rounded-full transition-colors flex items-center justify-center"
           >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
             className="hover:bg-black/10 p-2 rounded-md transition-all flex items-center gap-1 font-bold text-xs"
           >
              <X className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f5f5]">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-[#ee4d2d]' : 'bg-white border border-gray-200'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#ee4d2d]" />}
                  </div>
                  <div className={`p-3 text-[13px] font-medium leading-relaxed shadow-sm rounded-2xl ${msg.sender === 'user' ? 'bg-[#ee4d2d] text-white rounded-tr-none' : 'bg-white text-[#1a1a1a] rounded-tl-none border border-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 bg-[#f8f8f8] border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
             {quickActions.map((action) => (
               <button
                 key={action.value}
                 onClick={() => handleSend(action.value)}
                 className="px-3 py-1.5 bg-white text-gray-600 border border-gray-200 hover:border-[#ee4d2d] hover:text-[#ee4d2d] rounded-full text-[10px] transition-all flex-shrink-0"
               >
                 {action.label}
               </button>
             ))}
          </div>

          {/* Footer Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t border-gray-200 flex gap-2">
            {!user ? (
               <div className="flex-1 text-center text-xs text-gray-500 py-2">
                  Vui lòng đăng nhập để trò chuyện
               </div>
            ) : (
               <>
                  <input 
                    type="text" 
                    placeholder="Nhập nội dung tin nhắn..." 
                    className="flex-1 text-sm bg-gray-50 text-[#1a1a1a] border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-[#ee4d2d] transition"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="bg-[#ee4d2d] text-white p-2 rounded-full hover:opacity-90 transition-all disabled:opacity-50"
                    disabled={!input.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
               </>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;