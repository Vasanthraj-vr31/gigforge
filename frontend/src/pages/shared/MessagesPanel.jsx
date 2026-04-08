import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import { getContacts } from '../../api/user';
import { getConversation } from '../../api/messages';
import { Send, MessageCircle, Search } from 'lucide-react';

const SOCKET_URL = (
  typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:5000/api/v1'
).replace('/api/v1', '');

function Avatar({ name, img, size = 40 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: img ? 'transparent' : 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: 'white', fontSize: size * 0.34,
      overflow: 'hidden', border: '2px solid #f0fdfa',
    }}>
      {img ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

export default function MessagesPanel() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const socketRef = useRef(null);
  const boxRef = useRef(null);

  const active = useMemo(() => contacts.find(c => c._id === activeId), [contacts, activeId]);

  const filteredContacts = useMemo(
    () => contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [contacts, search]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getContacts();
        setContacts(data);
        if (data[0]) setActiveId(data[0]._id);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load contacts');
      }
    })();
  }, []);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      try {
        const data = await getConversation(activeId);
        setMessages(data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load messages');
      }
    })();
  }, [activeId]);

  useEffect(() => {
    if (!user?._id) return;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_room', user._id);
    socket.on('receive_message', msg => {
      if (msg.sender === activeId || msg.receiver === activeId || msg.sender === user._id) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => socket.disconnect();
  }, [user?._id, activeId]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!draft.trim() || !activeId) return;
    socketRef.current?.emit('send_message', {
      sender: user._id,
      receiver: activeId,
      content: draft.trim(),
    });
    setDraft('');
  };

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 140px)', gap: 0, background: 'white', borderRadius: 18, overflow: 'hidden', border: '1px solid #e9eef6', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
      
      {/* Contacts sidebar */}
      <div style={{ borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: 12 }}>Messages</h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              style={{
                width: '100%', paddingLeft: 30, padding: '8px 10px 8px 30px',
                border: '1.5px solid #e9eef6', borderRadius: 8, fontSize: '0.82rem',
                color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
              }}
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {filteredContacts.length === 0 && (
            <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
              <MessageCircle size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              No contacts available
            </div>
          )}
          {filteredContacts.map(c => {
            const isActive = c._id === activeId;
            return (
              <button
                key={c._id}
                onClick={() => setActiveId(c._id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: isActive ? '#f0fdfa' : 'transparent',
                  transition: 'background 0.15s',
                  marginBottom: 2,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar name={c.name} img={c.profileImage} />
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: isActive ? '#0d9488' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>
                  <span style={{ fontSize: '0.72rem', background: isActive ? '#ccfbf1' : '#f1f5f9', color: isActive ? '#0d9488' : '#64748b', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>
                    {c.role}
                  </span>
                </div>
                {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#14b8a6', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Chat header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, background: '#fafbfd' }}>
          {active ? (
            <>
              <Avatar name={active.name} img={active.profileImage} size={38} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{active.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, textTransform: 'capitalize' }}>{active.role}</div>
              </div>
            </>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Select a conversation</span>
          )}
        </div>

        {/* Messages */}
        <div ref={boxRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 && activeId && (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              <MessageCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.875rem' }}>No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map(m => {
            const isMe = m.sender === user._id || m.sender?._id === user._id;
            return (
              <div key={m._id || `${m.sender}-${m.createdAt}`} style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: 8,
              }}>
                {!isMe && <Avatar name={active?.name || ''} img={active?.profileImage} size={28} />}
                <div style={{
                  maxWidth: '68%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : '#f1f5f9',
                  color: isMe ? 'white' : '#0f172a',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  boxShadow: isMe ? '0 2px 8px rgba(20,184,166,0.2)' : 'none',
                }}>
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, alignItems: 'flex-end', background: '#fafbfd' }}>
          <textarea
            rows={1}
            style={{
              flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12,
              fontSize: '0.875rem', resize: 'none', outline: 'none', background: 'white',
              fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
              lineHeight: 1.5,
            }}
            onFocus={e => e.target.style.borderColor = '#14b8a6'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message... (Enter to send)"
            disabled={!activeId}
          />
          <button
            onClick={send}
            disabled={!draft.trim() || !activeId}
            style={{
              width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: draft.trim() && activeId ? 'linear-gradient(135deg,#14b8a6,#0d9488)' : '#e2e8f0',
              color: draft.trim() && activeId ? 'white' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
