
import React, { useState, useRef, useEffect } from 'react';
import { BotIcon, XIcon, SendIcon } from './icons';
import { sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await sendChatMessage(input, messages);
        const modelMessage: ChatMessage = { role: 'model', text: responseText };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-16 h-16 bg-primary rounded-full text-white shadow-lg flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-30"
        aria-label="Toggle Chat Assistant"
      >
        {isOpen ? <XIcon className="w-8 h-8"/> : <BotIcon className="w-8 h-8"/>}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 w-full max-w-sm h-full max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-30 transition-all duration-300 origin-bottom-right transform scale-100 opacity-100">
          <header className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold text-lg">AI Equipment Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <XIcon className="w-6 h-6"/>
            </button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-slate-200 text-dark rounded-bl-none'}`}>
                    <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}/>
                  </div>
                </div>
              ))}
              {isLoading && (
                  <div className="flex justify-start">
                     <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-slate-200 text-dark rounded-bl-none">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse-fast"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse-fast delay-100"></span>
                            <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse-fast delay-200"></span>
                        </div>
                     </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white rounded-b-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center transition-colors disabled:bg-slate-400">
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
