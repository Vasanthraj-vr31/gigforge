import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import { getContacts } from '../../api/user';
import { getConversation } from '../../api/messages';

const SOCKET_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');

export default function MessagesPanel() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef(null);
  const boxRef = useRef(null);

  const active = useMemo(() => contacts.find((c) => c._id === activeId), [contacts, activeId]);

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
    socket.on('receive_message', (msg) => {
      if (msg.sender === activeId || msg.receiver === activeId || msg.sender === user._id) {
        setMessages((prev) => [...prev, msg]);
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

  return (
    <div className="grid grid-2">
      <div className="panel">
        <h2>Conversations</h2>
        <div className="grid">
          {contacts.map((c) => (
            <button key={c._id} className="btn btn-outline" onClick={() => setActiveId(c._id)}>
              {c.name} ({c.role})
            </button>
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Chat {active ? `- ${active.name}` : ''}</h2>
        <div ref={boxRef} className="chat-box">
          {messages.map((m) => (
            <div key={m._id || `${m.sender}-${m.createdAt}`} className={`bubble ${m.sender === user._id ? 'me' : 'them'}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <input
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="btn" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

