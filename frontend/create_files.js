import { writeFileSync, mkdirSync } from 'fs';

mkdirSync('src/api', { recursive: true });
mkdirSync('src/pages', { recursive: true });

const files = {
  'src/index.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.btn { background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; }
.input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; margin-bottom: 16px; }
.label { display: block; margin-bottom: 8px; font-weight: 600; }`,

  'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);`,

  'src/api/axios.js': `import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:3001/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
export default api;`,

  'src/App.jsx': `import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import Matches from './pages/Matches.jsx';
import Chat from './pages/Chat.jsx';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  useEffect(() => {
    if (token) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); }
    else { localStorage.removeItem('token'); localStorage.removeItem('user'); }
  }, [token, user]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/register" element={!token ? <Register setToken={setToken} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/questionnaire" element={token ? <Questionnaire /> : <Navigate to="/login" />} />
        <Route path="/matches" element={token ? <Matches /> : <Navigate to="/login" />} />
        <Route path="/chat/:matchId" element={token ? <Chat /> : <Navigate to="/login" />} />
        <Route path="/" element={token ? <Navigate to="/matches" /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;`,

  'src/pages/Login.jsx': `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
function Login({ setToken, setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token); setUser(response.data.user); navigate('/questionnaire');
    } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
  };
  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '24px', textAlign: 'center', color: '#667eea' }}>Tinkoff Match</h1>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '12px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="label">Email</label>
          <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="label">Пароль</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="btn" style={{ width: '100%' }}>Войти</button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center' }}>Нет аккаунта? <Link to="/register" style={{ color: '#667eea' }}>Зарегистрироваться</Link></p>
      </div>
    </div>
  );
}
export default Login;`,

  'src/pages/Register.jsx': `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
function Register({ setToken, setUser }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', location: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/register', formData);
      setToken(response.data.token); setUser(response.data.user); navigate('/questionnaire');
    } catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
  };
  return (
    <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '24px', textAlign: 'center', color: '#667eea' }}>Регистрация</h1>
        {error && <div style={{ background: '#fee', color: '#c00', padding: '12px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="label">Имя</label><input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
          <label className="label">Email</label><input type="email" name="email" className="input" value={formData.email} onChange={handleChange} required />
          <label className="label">Пароль</label><input type="password" name="password" className="input" value={formData.password} onChange={handleChange} required />
          <label className="label">Отдел</label><input type="text" name="department" className="input" value={formData.department} onChange={handleChange} />
          <label className="label">Локация</label>
          <select name="location" className="input" value={formData.location} onChange={handleChange}>
            <option value="">Выберите</option><option value="Москва">Москва</option><option value="Санкт-Петербург">СПб</option><option value="Удаленно">Удаленно</option>
          </select>
          <button type="submit" className="btn" style={{ width: '100%' }}>Зарегистрироваться</button>
        </form>
        <p style={{ marginTop: '16px', textAlign: 'center' }}>Есть аккаунт? <Link to="/login" style={{ color: '#667eea' }}>Войти</Link></p>
      </div>
    </div>
  );
}
export default Register;`,

  'src/pages/Questionnaire.jsx': `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
const questions = [
  { id: 'sports', question: 'Спорт?', type: 'multiple', options: ['Футбол', 'Баскетбол', 'Йога', 'Бег'] },
  { id: 'hobbies', question: 'Хобби?', type: 'multiple', options: ['Чтение', 'Игры', 'Музыка', 'Путешествия'] },
  { id: 'afterWork', question: 'После работы?', type: 'single', options: ['Бар', 'Спортзал', 'Дома', 'Прогулки'] },
  { id: 'tech', question: 'Технологии?', type: 'multiple', options: ['AI/ML', 'Web', 'Mobile', 'DevOps'] }
];
function Questionnaire() {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleAnswer = (qId, val, type) => {
    if (type === 'multiple') {
      const cur = answers[qId] || [];
      setAnswers({ ...answers, [qId]: cur.includes(val) ? cur.filter(a => a !== val) : [...cur, val] });
    } else { setAnswers({ ...answers, [qId]: val }); }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const formatted = Object.entries(answers).map(([q, a]) => ({ questionId: q, answer: Array.isArray(a) ? a.join(', ') : a }));
      await api.post('/users/answers', { answers: formatted });
      await api.post('/matches/create');
      navigate('/matches');
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };
  return (
    <div className="container" style={{ maxWidth: '700px', marginTop: '30px' }}>
      <div className="card">
        <h1 style={{ marginBottom: '24px', textAlign: 'center', color: '#667eea' }}>Анкета</h1>
        <form onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} style={{ marginBottom: '32px' }}>
              <label className="label" style={{ fontSize: '18px' }}>{q.question}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {q.options.map((opt) => {
                  const sel = Array.isArray(answers[q.id]) ? answers[q.id].includes(opt) : answers[q.id] === opt;
                  return (
                    <button key={opt} type="button" onClick={() => handleAnswer(q.id, opt, q.type)}
                      style={{ padding: '12px 20px', border: '2px solid ' + (sel ? '#667eea' : '#e0e0e0'), background: sel ? '#667eea' : 'white', color: sel ? 'white' : '#333', borderRadius: '8px', cursor: 'pointer' }}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? '...' : 'Найти коллег'}</button>
        </form>
      </div>
    </div>
  );
}
export default Questionnaire;`,

  'src/pages/Matches.jsx': `import React, { useState, useEffect } from 'react';
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
      const u = await api.get('/users/me'); setUser(u.data);
      const m = await api.get('/matches'); setMatches(m.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  if (loading) return <h2 style={{color:'white', textAlign:'center', marginTop:'100px'}}>Загрузка...</h2>;
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ color: 'white' }}>Привет, {user?.name}!</h1>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="btn" style={{ background: '#e74c3c' }}>Выйти</button>
      </div>
      {matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}><h2>Совпадений нет</h2></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {matches.map((m) => (
            <div key={m.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div><h3>{m.user.name}</h3><p style={{ color: '#666', fontSize: '14px' }}>{m.user.department}</p></div>
                <div style={{ background: '#667eea', color: 'white', padding: '8px 12px', borderRadius: '20px' }}>{Math.round(m.score * 100)}%</div>
              </div>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>Общее: {m.commonInterests}</p>
              <button onClick={() => navigate('/chat/' + m.id)} className="btn" style={{ width: '100%' }}>Чат</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Matches;`,

  'src/pages/Chat.jsx': `import React, { useState, useEffect, useRef } from 'react';
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
      const [u, ms, msgs] = await Promise.all([api.get('/users/me'), api.get('/matches'), api.get('/messages/' + matchId)]);
      setMe(u.data); setMatch(ms.data.find(m => m.id === matchId)); setMessages(msgs.data);
    } catch (e) { console.error(e); }
  };

  const send = async (e) => {
    e.preventDefault(); if (!newMsg.trim()) return;
    try {
      const res = await api.post('/messages/' + matchId, { text: newMsg });
      socketRef.current.emit('send_message', { matchId, message: res.data });
      setNewMsg('');
    } catch (e) { console.error(e); }
  };

  if (!match || !me) return <h2 style={{color:'white', textAlign:'center'}}>Загрузка...</h2>;

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '30px' }}>
      <div className="card" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/matches')} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>←</button>
          <h3>{match.user.name}</h3>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((msg) => {
            const isMine = msg.senderId === me.id;
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{ padding: '12px 16px', borderRadius: '16px', background: isMine ? '#667eea' : '#f0f0f0', color: isMine ? 'white' : '#333', maxWidth: '70%' }}>
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
          <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Сообщение..." className="input" style={{ marginBottom: 0, flex: 1 }} />
          <button type="submit" className="btn">Отпр.</button>
        </form>
      </div>
    </div>
  );
}
export default Chat;`
};

for (const [path, content] of Object.entries(files)) {
  writeFileSync(path, content);
  console.log('✅ Created: ' + path);
}

console.log('\n🎉 All files created!');
