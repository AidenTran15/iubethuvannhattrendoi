import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ setIsAuthenticated }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Thay đổi mật khẩu này thành mật khẩu bạn muốn
  const correctPassword = '2412';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      navigate('/home');
    } else {
      setError('Mật khẩu không đúng! Vui lòng thử lại.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Nhập Mật Khẩu</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="password-input"
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

