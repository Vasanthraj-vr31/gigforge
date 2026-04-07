import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import './ChatUI.css';

const contacts = [
  { id: 1, name: 'Karthik R.', role: 'Freelancer', lastMsg: 'Sure, I can start Monday!', time: '10:30 AM', unread: 2 },
  { id: 2, name: 'Priya M.', role: 'Freelancer', lastMsg: 'Thanks for the opportunity.', time: 'Yesterday', unread: 0 },
  { id: 3, name: 'Anbu Tech', role: 'Client', lastMsg: 'Please share the designs.', time: 'Mon', unread: 1 },
];

const initialMessages = {
  1: [
    { id: 1, from: 'them', text: 'Hello! I saw your project posting.', time: '10:20 AM' },
    { id: 2, from: 'me', text: 'Hi Karthik, thanks for reaching out!', time: '10:22 AM' },
    { id: 3, from: 'them', text: 'Sure, I can start Monday!', time: '10:30 AM' },
  ],
  2: [
    { id: 1, from: 'them', text: 'Thanks for the opportunity.', time: 'Yesterday' },
  ],
  3: [
    { id: 1, from: 'them', text: 'Please share the designs.', time: 'Mon' },
  ],
};

const ChatUI = () => {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, activeContact]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: 'me', text: input, time: 'Now' };
    setMessages(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));
    setInput('');
    toast.success('Message sent!');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <section className="chat-section" id="messages">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            <MessageSquare size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--teal)' }} />
            Messages
          </h2>
          <p className="section-sub">Chat with clients and freelancers</p>
        </motion.div>

        <motion.div
          className="chat-container"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Sidebar */}
          <div className="chat-sidebar">
            <div className="sidebar-header">Conversations</div>
            {contacts.map(c => (
              <button
                key={c.id}
                className={`contact-item ${activeContact.id === c.id ? 'active' : ''}`}
                onClick={() => setActiveContact(c)}
              >
                <div className="contact-avatar">{c.name[0]}</div>
                <div className="contact-info">
                  <div className="contact-top">
                    <span className="contact-name">{c.name}</span>
                    <span className="contact-time">{c.time}</span>
                  </div>
                  <div className="contact-bottom">
                    <span className="contact-last">{c.lastMsg}</span>
                    {c.unread > 0 && <span className="unread-badge">{c.unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            <div className="chat-header">
              <div className="contact-avatar">{activeContact.name[0]}</div>
              <div>
                <p className="chat-name">{activeContact.name}</p>
                <p className="chat-role">{activeContact.role}</p>
              </div>
            </div>

            <div className="messages-list">
              <AnimatePresence initial={false}>
                {(messages[activeContact.id] || []).map(msg => (
                  <motion.div
                    key={msg.id}
                    className={`message-bubble ${msg.from}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{msg.text}</p>
                    <span className="msg-time">{msg.time}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <motion.button
                className="send-btn"
                onClick={sendMessage}
                whileTap={{ scale: 0.92 }}
                disabled={!input.trim()}
              >
                <Send size={17} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatUI;
