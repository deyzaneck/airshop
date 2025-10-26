import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { authAPI } from '../api/services';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="card-dark max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-light-100 mb-2">
              Вход в админ панель
            </h1>
            <p className="text-light-300">Введите пароль для доступа</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-light-200 text-sm font-medium mb-2">
                Логин
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="input"
                placeholder="Введите логин"
                autoFocus
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-light-200 text-sm font-medium mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="input"
                placeholder="Введите пароль"
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || !username || !password}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-light-400 text-sm">
              Используйте учетные данные из настроек бэкенда
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
