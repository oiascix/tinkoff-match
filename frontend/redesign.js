import { writeFileSync } from 'fs';

const files = {
  'src/index.css': `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; min-height: 100vh; color: #333; }
.container { max-width: 1100px; margin: 0 auto; padding: 20px; }
.card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 16px; }
.btn { background: #FFDD2D; color: #333; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s; }
.btn:hover { background: #f5d428; transform: translateY(-1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #f5f5f5; color: #333; border: none; padding: 14px 28px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600; }
.btn-danger { background: #ff4444; color: white; }
.btn-danger:hover { background: #e03e3e; }
.input { width: 100%; padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 12px; font-size: 15px; margin-bottom: 16px; background: #fafafa; transition: border-color 0.2s; }
.input:focus { outline: none; border-color: #FFDD2D; background: white; }
.label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px; }
.navbar { background: white; padding: 16px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
.navbar-brand { font-size: 20px; font-weight: 700; color: #333; display: flex; align-items: center; gap: 8px; }
.navbar-brand span { background: #FFDD2D; padding: 4px 8px; border-radius: 6px; font-size: 14px; }
.tag { background: #f5f5f5; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #555; display: inline-block; margin: 4px; }
.score-badge { background: #FFDD2D; color: #333; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 14px; }
a { text-decoration: none; color: inherit; }
`,

  'src/App.jsx': `
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

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
        <Route path="/matches" element={<Matches />} />
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const res = await api.post('/auth/register', { email, password, name, department });
        onLogin(res.data.token, res.data.user);
      } else {
        const res = await api.post('/auth/login', { email, password });
        onLogin(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#FFDD2D', padding: '6px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '18px' }}>Т</span>
            <span style={{ fontWeight: '700', fontSize: '22px' }}>Матч</span>
          </div>
          <p style={{ color: '#888', fontSize: '14px' }}>Найди коллег по интересам</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '24px', fontSize: '20px' }}>{isRegister ? 'Регистрация' : 'Вход'}</h2>

          {error && <div style={{ background: '#fff3f3', color: '#d32f2f', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <label className="label">Имя</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Иван" />
                <label className="label">Отдел</label>
                <input className="input" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Разработка" />
              </>
            )}
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ivan@tbank.ru" />
            <label className="label">Пароль</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Минимум 6 символов" />
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px' }}>
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </form>

          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#888' }}>
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#333', fontWeight: '600', cursor: 'pointer' }}>
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
`,

  'src/pages/Questionnaire.jsx': `
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

const questions = [
  { id: 'sports', question: 'Какой спорт?', type: 'multiple', options: ['Футбол', 'Баскетбол', 'Йога', 'Бег', 'Плавание', 'Теннис'] },
  { id: 'hobbies', question: 'Хобби?', type: 'multiple', options: ['Чтение', 'Игры', 'Музыка', 'Путешествия', 'Кулинария', 'Фото'] },
  { id: 'afterWork', question: 'После работы?', type: 'single', options: ['Бар', 'Спортзал', 'Дома', 'Прогулки'] },
  { id: 'tech', question: 'Технологии?', type: 'multiple', options: ['AI/ML', 'Web', 'Mobile', 'DevOps', 'Data'] }
];

function Questionnaire() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggle = (qId, val, type) => {
    if (type === 'multiple') {
      const cur = answers[qId] || [];
      setAnswers({ ...answers, [qId]: cur.includes(val) ? cur.filter(a => a !== val) : [...cur, val] });
    } else {
      setAnswers({ ...answers, [qId]: val });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formatted = Object.entries(answers).map(([q, a]) => ({
        questionId: q,
        answer: Array.isArray(a) ? a.join(', ') : a
      }));
      await api.post('/users/answers', { answers: formatted });
      await api.post('/matches/create');
      navigate('/matches');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="navbar">
        <div className="navbar-brand"><span>Т</span> Матч</div>
      </div>
      <div className="container" style={{ maxWidth: '640px', paddingTop: '32px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Расскажите о себе</h1>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '15px' }}>Мы найдём коллег с похожими интересами</p>

        <form onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} className="card">
              <label style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px', display: 'block' }}>{q.question}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {q.options.map((opt) => {
                  const sel = Array.isArray(answers[q.id]) ? answers[q.id].includes(opt) : answers[q.id] === opt;
                  return (
                    <button key={opt} type="button" onClick={() => toggle(q.id, opt, q.type)}
                      style={{
                        padding: '10px 20px',
                        border: sel ? '2px solid #FFDD2D' : '2px solid #e8e8e8',
                        background: sel ? '#FFDD2D' : 'white',
                        color: '#333',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: sel ? '600' : '400',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '8px', padding: '16px' }} disabled={loading}>
            {loading ? 'Подбираем...' : 'Найти коллег →'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default Questionnaire;
`,

  'src/pages/Matches.jsx': `
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const u = await api.get('/users/me');
      setUser(u.data);
      const m = await api.get('/matches');
      setMatches(m.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

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
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ color: '#888', fontWeight: '400' }}>Загрузка...</h2>
          </div>
        ) : matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ marginBottom: '12px', fontSize: '20px' }}>Пока нет совпадений</h2>
            <p style={{ color: '#888', marginBottom: '24px' }}>Заполните анкету подробнее</p>
            <button onClick={() => navigate('/questionnaire')} className="btn">Заполнить анкету</button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Ваши коллеги</h1>
            <p style={{ color: '#888', marginBottom: '24px', fontSize: '15px' }}>Найдено: {matches.length}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {matches.map((m) => (
                <div key={m.id} className="card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => navigate('/chat/' + m.id)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{m.user.name}</h3>
                      <p style={{ color: '#888', fontSize: '14px' }}>{m.user.department || ''} {m.user.location ? '· ' + m.user.location : ''}</p>
                    </div>
                    <div className="score-badge">{Math.round(m.score * 100)}%</div>
                  </div>
                  {m.commonInterests && (
                    <div>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Общие интересы</p>
                      <div>
                        {m.commonInterests.split(', ').map((i, idx) => (
                          <span key={idx} className="tag">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <button className="btn" style={{ width: '100%', marginTop: '16px' }}>Написать →</button>
                </div>
              ))}
            </div>
          </>
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
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    fetchData();
    socketRef.current.on('receive_message', (msg) => setMessages((p) => [...p, msg]));
    return () => socketRef.current.disconnect();
  }, [matchId]);

  useEffect(() => { if (socketRef.current) socketRef.current.emit('join_chat', matchId); }, [matchId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchData = async () => {
    try {
      const [u, ms, msgs] = await Promise.all([
        api.get('/users/me'),
        api.get('/matches'),
        api.get('/messages/' + matchId)
      ]);
      setMe(u.data);
      setMatch(ms.data.find(m => m.id === matchId));
      setMessages(msgs.data);
    } catch (e) { console.error(e); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await api.post('/messages/' + matchId, { text: newMsg });
      socketRef.current.emit('send_message', { matchId, message: res.data });
      setNewMsg('');
    } catch (e) { console.error(e); }
  };

  if (!match || !me) {
    return (
      <div>
        <div className="navbar">
          <div className="navbar-brand"><span>Т</span> Матч</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#888' }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/matches')} style={{ background: '#f5f5f5', border: 'none', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <div style={{ fontWeight: '600', fontSize: '15px' }}>{match.user.name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{match.user.department || ''}</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#888' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
              <p>Начните общение с {match.user.name}</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === me.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine ? '#FFDD2D' : 'white',
                  color: '#333',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                }}>
                  <p style={{ fontSize: '15px', lineHeight: '1.4' }}>{msg.text}</p>
                  <span style={{ fontSize: '11px', color: '#999', marginTop: '4px', display: 'block' }}>
                    {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
      </div>

      <div style={{ background: 'white', borderTop: '1px solid #eee', padding: '16px 20px' }}>
        <form onSubmit={send} style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '12px' }}>
          <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Написать сообщение..."
            style={{ flex: 1, padding: '14px 18px', border: '1px solid #e0e0e0', borderRadius: '14px', fontSize: '15px', background: '#fafafa' }}
            onFocus={e => { e.target.style.borderColor = '#FFDD2D'; e.target.style.background = 'white'; }}
            onBlur={e => { e.target.style.borderColor = '#e0e0e0'; e.target.style.background = '#fafafa'; }}
          />
          <button type="submit" className="btn" style={{ borderRadius: '14px', padding: '14px 24px' }}>→</button>
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
  console.log('Created: ' + path);
}
console.log('Done!');
