
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
