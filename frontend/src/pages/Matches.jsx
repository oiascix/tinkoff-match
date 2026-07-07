
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
