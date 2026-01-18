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
      {/* Floating hearts background */}
      <div className="floating-hearts">
        <span className="heart">💖</span>
        <span className="heart">💕</span>
        <span className="heart">💗</span>
        <span className="heart">💝</span>
        <span className="heart">💞</span>
        <span className="heart">💓</span>
        <span className="heart">💟</span>
        <span className="heart">💖</span>
      </div>

      {/* Sparkles effect */}
      <div className="sparkles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}></div>
        ))}
      </div>

      <div className="login-box">
        <div className="heart-icon">💕</div>
        <h1 className="login-title">The Day We Got Together</h1>
        <p className="login-subtitle">Nhập mật khẩu để tiếp tục</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Nhập mật khẩu..."
              className="password-input"
              autoFocus
            />
            <span className="input-icon">🔒</span>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            <span>Mở Khóa</span>
            <span className="button-heart">💖</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
