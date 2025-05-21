import React, { useState, useEffect, useRef } from 'react';
import { chatbotData } from '../data/chatbotData';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot } from 'lucide-react';

const Chatbot = ({ isBouncing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentCategory, setCurrentCategory] = useState('main');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const randomWelcome =
        chatbotData.welcome[Math.floor(Math.random() * chatbotData.welcome.length)];
      setMessages([{ text: randomWelcome, isBot: true, options: chatbotData.options.main }]);
    }
    scrollToBottom();
  }, [isOpen, messages]);

  const handleOptionClick = option => {
    setMessages(prev => [...prev, { text: option.text, isBot: false }]);

    setTimeout(() => {
      const response = getBotResponse(option.text.toLowerCase());
      setMessages(prev => [
        ...prev,
        {
          text: response,
          isBot: true,
          options: chatbotData.options[option.category] || chatbotData.options.main,
        },
      ]);
      setCurrentCategory(option.category);
    }, 500);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, isBot: false }]);

    setTimeout(() => {
      const response = getBotResponse(input.toLowerCase());
      setMessages(prev => [
        ...prev,
        {
          text: response,
          isBot: true,
          options: chatbotData.options[currentCategory] || chatbotData.options.main,
        },
      ]);
    }, 500);

    setInput('');
  };

  const getBotResponse = userInput => {
    if (userInput.includes('hello') || userInput.includes('hi')) {
      return getRandomResponse('greeting');
    } else if (userInput.includes('help')) {
      return getRandomResponse('help');
    } else if (userInput.includes('bye') || userInput.includes('goodbye')) {
      return getRandomResponse('goodbye');
    } else if (userInput.includes('email')) {
      return 'You can reach our admin, Thato Myles Nsala, at tnsala@aisolutions.com';
    } else if (userInput.includes('phone')) {
      return 'You can call our admin, Thato Myles Nsala, at 72524605';
    } else if (userInput.includes('location')) {
      return 'Our office is located in South Africa';
    }
    return getRandomResponse('default');
  };

  const getRandomResponse = type => {
    const responses = chatbotData.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isBouncing ? 'animate-bounce' : ''}`}
    >
      {!isOpen ? (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-orange-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-[32rem] w-80 flex-col rounded-lg border border-red-500/20 bg-gradient-to-br from-gray-900 to-black shadow-xl"
        >
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
            <h3 className="font-semibold">AI Assistant</h3>
            <motion.button
              onClick={() => setIsOpen(false)}
              className="text-white transition-colors hover:text-gray-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-start gap-2`}
              >
                {message.isBot && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isBot
                      ? 'border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 text-white'
                      : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  }`}
                >
                  {message.text}
                </div>
                {!message.isBot && (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-orange-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
            {messages.length > 0 &&
              messages[messages.length - 1].isBot &&
              messages[messages.length - 1].options && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 grid grid-cols-2 gap-2"
                >
                  {messages[messages.length - 1].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleOptionClick(option)}
                      className="rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/10 to-orange-500/10 p-2 text-sm text-white transition-all duration-300 hover:from-red-500/20 hover:to-orange-500/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {option.text}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-red-500/20 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-red-500/20 bg-gray-800 px-4 py-2 text-white transition-all duration-300 focus:border-red-500 focus:outline-none"
              />
              <motion.button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-white transition-all duration-300 hover:from-red-600 hover:to-orange-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Chatbot;
