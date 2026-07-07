import React, { useState } from 'react';
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
export default Register;