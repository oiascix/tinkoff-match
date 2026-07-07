
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
