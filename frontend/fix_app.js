import { writeFileSync } from 'fs';

const files = {
  'src/App.jsx': `
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#888' }}>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Navigate to="/matches" />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/matches" element={<Matches onLogout={handleLogout} />} />
        <Route path="/chat/:matchId" element={<Chat />} />
        <Route path="*" element={<Navigate to="/matches" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
`,

  'src/pages/Login.jsx': `
import React, { useState } from 'react';
import api from '../api/axios.js';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister 
        ? formData 
        : { email: formData.email, password: formData.password };

      const res = await api.post(endpoint, payload);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#FFDD2D', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '20px' }}>Т</span>
            <span style={{ fontWeight: '700', fontSize: '24px' }}>Матч</span>
          </div>
          <p style={{ color: '#888', fontSize: '15px' }}>Найди коллег по интересам</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>{isRegister ? 'Создать аккаунт' : 'С возвращением!'}</h2>

          {error && (
            <div style={{ background: '#fff3f3', border: '1px solid #ffcdd2', color: '#d32f2f', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label className="label">Имя *</label>
                <input className="input" name="name" value={formData.name} onChange={handleChange} required placeholder="Иван Петров" />
                
                <label className="label">Отдел</label>
                <input className="input" name="department" value={formData.department} onChange={handleChange} placeholder="Разработка, Маркетинг..." />
                
                <label className="label">Город</label>
                <select className="input" name="location" value={formData.location} onChange={handleChange}>
                  <option value="">Выберите город</option>
                  <option value="Москва">Москва</option>
                  <option value="Санкт-Петербург">Санкт-Петербург</option>
                  <option value="Казань">Казань</option>
                  <option value="Удаленно">Удаленно</option>
                </select>
              </>
            )}

            <label className="label">Email *</label>
            <input type="email" className="input" name="email" value={formData.email} onChange={handleChange} required placeholder="ivan@tbank.ru" />

            <label className="label">Пароль *</label>
            <input type="password" className="input" name="password" value={formData.password} onChange={handleChange} required placeholder={isRegister ? 'Минимум 6 символов' : '••••••'} />

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px', padding: '16px' }} disabled={loading}>
              {loading ? (isRegister ? 'Регистрация...' : 'Вход...') : (isRegister ? 'Зарегистрироваться' : 'Войти')}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', padding: '16px', background: '#fafafa', borderRadius: '12px' }}>
            <p style={{ fontSize: '14px', color: '#888' }}>
              {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
              <span onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ color: '#333', fontWeight: '600', cursor: 'pointer' }}>
                {isRegister ? 'Войти' : 'Зарегистрироваться'}
              </span>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#999' }}>
          Регистрируясь, вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}
export default Login;
`,

  'src/pages/Matches.jsx': `
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

function Matches({ onLogout }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [hasAnswers, setHasAnswers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const userRes = await api.get('/users/me');
      const userData = userRes.data;
      setUser(userData);
      setHasAnswers(userData.answers && userData.answers.length > 0);

      const matchesRes = await api.get('/matches');
      setMatches(matchesRes.data);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand"><span>Т</span> Матч</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ color: '#888', fontWeight: '400' }}>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (!hasAnswers) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand"><span>Т</span> Матч</div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Выйти</button>
        </div>
        <div className="container" style={{ paddingTop: '60px', maxWidth: '600px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>👋</div>
            <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Привет, {user?.name}!</h1>
            <p style={{ color: '#888', fontSize: '16px', marginBottom: '32px', lineHeight: '1.6' }}>
              Расскажите о своих интересах, чтобы мы могли подобрать вам коллег<br />
              с похожими увлечениями
            </p>
            <button onClick={() => navigate('/questionnaire')} className="btn" style={{ padding: '16px 32px', fontSize: '16px' }}>
              Заполнить анкету →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px' }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Подбор по интересам</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>Найдём коллег с похожими хобби</p>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
              <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Общение</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>Чат для удобного общения</p>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
              <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Нетворкинг</h3>
              <p style={{ fontSize: '13px', color: '#888' }}>Новые знакомства в компании</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand"><span>Т</span> Матч</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#888' }}>{user?.name}</span>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Выйти</button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Ваши коллеги</h1>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '15px' }}>Найдено совпадений: {matches.length}</p>

        {matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h2 style={{ marginBottom: '12px', fontSize: '20px' }}>Пока нет совпадений</h2>
            <p style={{ color: '#888', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
              Попробуйте заполнить анкету подробнее или зайдите позже — мы постоянно ищем новых коллег
            </p>
            <button onClick={() => navigate('/questionnaire')} className="btn-secondary">Редактировать анкету</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {matches.map((m) => (
              <div key={m.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/chat/' + m.id)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{m.user.name}</h3>
                    <p style={{ color: '#888', fontSize: '14px' }}>
                      {m.user.department || 'Отдел не указан'}
                      {m.user.location && <span> · {m.user.location}</span>}
                    </p>
                  </div>
                  <div className="score-badge">{Math.round(m.score * 100)}%</div>
                </div>

                {m.commonInterests && m.commonInterests !== '' && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px', fontWeight: '500' }}>Общие интересы:</p>
                    <div>
                      {m.commonInterests.split(', ').slice(0, 5).map((i, idx) => (
                        <span key={idx} className="tag">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn" style={{ width: '100%' }}>Написать сообщение →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default Matches;
`,

  'src/pages/Chat.jsx': `
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
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    fetchData();
    
    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [matchId]);

  useEffect(() => {
    if (socketRef.current && matchId) {
      socketRef.current.emit('join_chat', matchId);
    }
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
      
      setMe(userRes.data);
      const currentMatch = matchesRes.data.find(m => m.id === matchId);
      setMatch(currentMatch);
      setMessages(messagesRes.data);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const res = await api.post('/messages/' + matchId, { text: newMsg });
      if (socketRef.current) {
        socketRef.current.emit('send_message', { matchId, message: res.data });
      }
      setNewMsg('');
    } catch (e) {
      console.error('Error sending:', e);
    }
  };

  if (loading || !match || !me) {
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

  const otherUser = match.user1.id === me.id ? match.user2 : match.user1;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/matches')} style={{ background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{otherUser.name}</div>
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
            
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '16px', alignItems: 'flex-end' }}>
                {!isMine && showAvatar && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFDD2D', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px', fontWeight: '600', fontSize: '14px' }}>
                    {otherUser.name[0]}
                  </div>
                )}
                {!isMine && !showAvatar && <div style={{ width: '40px' }}></div>}
                
                <div style={{
                  maxWidth: '65%',
                  padding: '12px 16px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine ? '#FFDD2D' : 'white',
                  color: '#333',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                }}>
                  <p style={{ fontSize: '15px', lineHeight: '1.5', margin: 0 }}>{msg.text}</p>
                  <span style={{ fontSize: '11px', color: '#999', marginTop: '6px', display: 'block', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
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
              transition: 'all 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#FFDD2D'; e.target.style.background = 'white'; }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#fafafa'; }}
          />
          <button type="submit" className="btn" style={{ borderRadius: '14px', padding: '14px 24px', fontSize: '18px' }} disabled={!newMsg.trim()}>
            →
          </button>
        </form>
      </div>
    </div>
  );
}
export default Chat;
`
};

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content);
  console.log('✓ Updated: ' + path);
}
console.log('\\n✅ All files updated!');
