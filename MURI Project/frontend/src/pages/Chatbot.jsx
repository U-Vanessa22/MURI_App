import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import './chatbot.css';
import AppLayout from '../components/layout/AppLayout';
import { chatbotAPI } from '../services/api';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [draftReply, setDraftReply] = useState('');

  const faqItems = [
    {
      issue: 'Screen is broken:',
      solution: 'Report direct to the DM and to the ICT Personnel'
    },
    {
      issue: 'Mouse not working:',
      solution: 'Check a key on the keyboard'
    },
    {
      issue: 'System Down:',
      solution: 'Direct Communicating to the IT Personnel'
    }
  ];

  const sendToBot = async (questionText) => {
    try {
      setIsSending(true);
      setDraftReply('Thinking...');
      const response = await chatbotAPI.ask(questionText, { timeoutMs: 30000 });
      setDraftReply('');
      setMessages(prev => [...prev, {
        text: response.reply,
        sender: 'bot',
        time: new Date(),
      }]);
    } catch (error) {
      setDraftReply('');
      setMessages(prev => [...prev, {
        text: error?.code === 'ECONNABORTED'
          ? 'The response took too long. Please try again or ask a shorter question.'
          : error?.response?.data?.detail || 'Chatbot service is currently unavailable. Please try again.',
        sender: 'bot',
        time: new Date(),
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const question = inputMessage.trim();
      setMessages(prev => [...prev, { text: question, sender: 'user', time: new Date() }]);
      setInputMessage('');
      await sendToBot(question);
    }
  };

  const handleFaqClick = async (faq) => {
    const question = faq.issue.replace(':', '');
    setMessages(prev => [...prev, {
      text: question,
      sender: 'user',
      time: new Date(),
    }]);
    await sendToBot(question);
  };

  return (
    <AppLayout activePath="/chatbot">
      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">Chatbot</h1>
        </header>

        <div className="content-wrapper">
          {/* FAQ Section */}
          <section className="faq-section">
            <div className="faq-header">
              <div className="faq-illustration">
                <svg width="400" height="150" viewBox="0 0 400 150">
                  <ellipse cx="120" cy="60" rx="80" ry="50" fill="#2FA6B4" opacity="0.9"/>
                  <text x="80" y="70" fill="white" fontSize="16" fontWeight="600">FREQUENTLY</text>
                  
                  <ellipse cx="280" cy="60" rx="80" ry="50" fill="#79D4E6" opacity="0.95"/>
                  <text x="240" y="70" fill="white" fontSize="16" fontWeight="600">QUESTIONS</text>
                  
                  <ellipse cx="200" cy="90" rx="70" ry="45" fill="#1E4D57" opacity="0.95"/>
                  <text x="170" y="100" fill="white" fontSize="16" fontWeight="600">ASKED</text>
                </svg>
              </div>
            </div>
            
            <div className="faq-list">
              {faqItems.map((faq, index) => (
                <div 
                  key={index} 
                  className="faq-item"
                  onClick={() => handleFaqClick(faq)}
                >
                  <span className="faq-issue">{faq.issue}</span>
                  <span className="faq-solution">{faq.solution}</span>
                </div>
              ))}
            </div>

            <button className="ask-question-btn">
              Explore support topics
            </button>
          </section>

          {/* Chat Section */}
          <section className="chat-section">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="empty-chat">
                  <Bot size={48} color="#6C9F8C" className="empty-chat-icon" />
                  <p className="empty-chat-text">Welcome! How can I assist you today?</p>
                  <p className="empty-chat-subtitle">Click on an FAQ above or type your question below</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}>
                    <div className={`message-bubble ${message.sender === 'user' ? 'message-bubble-user' : 'message-bubble-bot'}`}>
                      <p className="message-text">{message.text}</p>
                      <span className="message-time">
                        {message.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {draftReply && (
                <div className="message message-bot">
                  <div className="message-bubble message-bubble-bot message-bubble-loading">
                    <span className="typing-dot" />
                    <p className="message-text">{draftReply}</p>
                  </div>
                </div>
              )}
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="chat-input"
                disabled={isSending}
              />
              <button type="submit" className="send-btn" disabled={isSending}>
                <Send size={20} />
              </button>
            </form>
          </section>
        </div>

        <footer className="footer">
          <p>©2026. MURI</p>
        </footer>
      </main>
    </AppLayout>
  );
}