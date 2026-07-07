import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios.js';

function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [match, setMatch] = useState(null);
  const [me, setMe] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    // Initialize socket
    socketRef.current = io('https://tinkoff-match-backend.onrender.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    fetchData();
    
    // Listen for messages
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join_chat', matchId);
    });

    socketRef.current.on('receive_message', (msg) => {
      console.log('Received message:', msg);
      setMessages((prev) => {
        // Check for duplicates
        const exists = prev.find(m => m.id === msg.id);
        if (exists) {
          console.log('Duplicate message, skipping');
          return prev;
        }
        const newMessages = [...prev, msg];
        console.log('New messages:', newMessages);
        return newMessages;
      });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket...');
        socketRef.current.disconnect();
      }
    };
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchData = async () => {
    try {
      const [userRes, matchesRes, messagesRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/matches'),
        api.get('/messages/' + matchId)
      ]);
      
      const currentUser = userRes.data;
      setMe(currentUser);
      
      const currentMatch = matchesRes.data.find(m => m.id === matchId);
      
      if (!currentMatch) {
        setLoading(false);
        return;
      }
      
      setMatch(currentMatch);
      
      let other = null;
      if (currentMatch.user) {
        other = currentMatch.user;
      } else if (currentMatch.user1 && currentMatch.user2) {
        other = currentMatch.user1.id === currentUser.id ? currentMatch.user2 : currentMatch.user1;
      }
      
      setOtherUser(other);
      setMessages(messagesRes.data || []);
      setLoading(false);
    } catch (e) {
      console.error('Error:', e);
      setLoading(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const res = await api.post('/messages/' + matchId, { text: newMsg });
      console.log('Message sent:', res.data);
      
      // Emit via socket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('send_message', { 
          matchId, 
          message: res.data 
        });
        console.log('Emitted message via socket');
      } else {
        console.log('Socket not connected, adding message directly');
        setMessages(prev => [...prev, res.data]);
      }
      
      setNewMsg('');
    } catch (e) {
      console.error('Error sending:', e);
      alert('Не удалось отправить сообщение');
    }
  };

  const formatTime = (dateString) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand"><span>Т</span> Матч</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#888' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!match || !me || !otherUser) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand"><span>Т</span> Матч</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#888' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h2>Чат не найден</h2>
          <button onClick={() => navigate('/matches')} className="btn" style={{ marginTop: '24px' }}>
            ← К списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button onClick={() => navigate('/matches')} style={{ background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: '600', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherUser.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{otherUser.department || 'Онлайн'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#4CAF50', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ fontSize: '13px', color: '#4CAF50' }}>Онлайн</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '13px' }}>
            Начало переписки с {otherUser.name}
          </div>

          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '80px', color: '#888', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ fontSize: '16px' }}>Начните общение!</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Напишите первое сообщение</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMine = msg.senderId === me.id;
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
            const time = formatTime(msg.createdAt);
            
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '16px', alignItems: 'flex-end' }}>
                {!isMine && showAvatar && (
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: '#FFDD2D', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '8px', 
                    fontWeight: '600', 
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {otherUser.name ? otherUser.name[0].toUpperCase() : '?'}
                  </div>
                )}
                {!isMine && !showAvatar && <div style={{ width: '40px', flexShrink: 0 }}></div>}
                
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine ? '#FFDD2D' : 'white',
                  color: '#333',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  <p style={{ fontSize: '15px', lineHeight: '1.5', margin: 0 }}>{msg.text}</p>
                  {time && (
                    <span style={{ fontSize: '11px', color: '#999', marginTop: '6px', display: 'block', textAlign: 'right' }}>
                      {time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #e8e8e8', padding: '16px 20px' }}>
        <form onSubmit={send} style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={newMsg} 
            onChange={(e) => setNewMsg(e.target.value)} 
            placeholder="Написать сообщение..."
            style={{ 
              flex: 1, 
              padding: '14px 18px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '14px', 
              fontSize: '15px', 
              background: '#fafafa',
              minWidth: 0
            }}
            onFocus={e => { e.target.style.borderColor = '#FFDD2D'; e.target.style.background = 'white'; }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#fafafa'; }}
          />
          <button type="submit" className="btn" style={{ borderRadius: '14px', padding: '14px 24px', fontSize: '18px', flexShrink: 0 }} disabled={!newMsg.trim()}>
            →
          </button>
        </form>
      </div>
    </div>
  );
}
export default Chat;
