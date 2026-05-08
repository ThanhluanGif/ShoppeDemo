import React, { useState, useEffect, useRef, useContext } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ChatBox = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (isOpen && messages.length === 0) {
      const welcomeMsg = user 
        ? `Chào ${user.name}! Tôi là trợ lý AI của ThanhLuanShop. Tôi có thể giúp gì cho bạn?`
        : 'Xin chào! Tôi là trợ lý AI của ThanhLuanShop. Tôi có thể giúp gì cho bạn?';
      
      setMessages([{ id: 1, text: welcomeMsg, sender: 'bot' }]);
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (val) => {
    const textToSend = typeof val === 'string' ? val : input;
    if (!textToSend.trim()) return;

    const userMessage = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock AI Response Logic
    setTimeout(() => {
      let botResponse = "";
      const lowerInput = textToSend.toLowerCase();
      
      if (lowerInput.includes('vận chuyển') || lowerInput.includes('ship')) {
        botResponse = "ThanhLuanShop miễn phí vận chuyển cho đơn hàng từ 50.000đ bạn nhé! Thời gian giao hàng từ 2-4 ngày làm việc.";
      } else if (lowerInput.includes('bảo hành')) {
        botResponse = "Tất cả sản phẩm chính hãng tại Shop được bảo hành 12 tháng theo chính sách của nhà sản xuất.";
      } else if (lowerInput.includes('đổi trả')) {
        botResponse = "Bạn có thể đổi trả hàng trong vòng 3 ngày kể từ khi nhận được hàng nếu có lỗi từ nhà sản xuất.";
      } else if (lowerInput.includes('người bán') || lowerInput.includes('bán hàng')) {
        botResponse = "Để trở thành người bán, bạn vui lòng nhấn vào mục 'Trở thành người bán' ở trên thanh Menu nhé.";
      } else {
        botResponse = "Cảm ơn bạn đã quan tâm! Hiện tại nhân viên tư vấn đang bận, tôi có thể ghi lại lời nhắn để Shop phản hồi bạn sau được không?";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
      setIsLoading(false);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center hover:scale-110 hover:bg-blue-700 transition-all z-[999] animate-bounce group"
      >
        <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full text-[11px] flex items-center justify-center font-bold shadow-sm">1</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[400px] bg-white shadow-2xl rounded-lg overflow-hidden z-[999] border-2 border-gray-300 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14 w-64' : 'h-[600px]'}`}>
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
             title={isMinimized ? "Phóng to" : "Thu nhỏ"}
           >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
             className="hover:bg-red-600 p-2 rounded-md transition-all flex items-center gap-1 font-bold text-xs border border-white/20 ml-1"
           >
              <X className="w-4 h-4" />
              <span>ĐÓNG</span>
           </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f5f5]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${msg.sender === 'user' ? 'bg-[#ee4d2d]' : 'bg-white border-2 border-gray-200'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#ee4d2d]" />}
                  </div>
                  <div className={`p-3 text-[13px] font-medium leading-relaxed shadow-md rounded-2xl ${msg.sender === 'user' ? 'bg-[#ee4d2d] text-white rounded-tr-none' : 'bg-white text-[#1a1a1a] rounded-tl-none border border-gray-200'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0 shadow-md">
                       <Loader2 className="w-4 h-4 text-[#ee4d2d] animate-spin" />
                    </div>
                    <div className="p-3 bg-white text-gray-500 text-xs font-bold italic rounded-2xl rounded-tl-none shadow-md border border-gray-200">AI đang trả lời...</div>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 bg-[#ebebeb] border-t border-gray-300 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
             {quickActions.map((action) => (
               <button
                 key={action.value}
                 onClick={() => handleSend(action.value)}
                 className="px-4 py-2 bg-white text-[#333] font-bold hover:bg-[#ee4d2d] hover:text-white border-2 border-gray-300 hover:border-[#ee4d2d] rounded-full text-[11px] transition-all flex-shrink-0 shadow-sm uppercase"
               >
                 {action.label}
               </button>
             ))}
          </div>

          {/* Footer Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-4 bg-white border-t-2 border-gray-200 flex gap-2">
            <input 
              type="text" 
              placeholder="Bạn muốn hỏi gì..." 
              className="flex-1 text-sm bg-gray-50 text-[#1a1a1a] font-semibold border-2 border-gray-300 rounded-full px-5 py-3 outline-none focus:border-[#ee4d2d] focus:ring-1 ring-[#ee4d2d] transition placeholder:text-gray-500 shadow-inner"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-[#ee4d2d] text-white p-3 rounded-full hover:bg-[#d73211] transition-all shadow-[0_4px_10px_rgba(238,77,45,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!input.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBox;