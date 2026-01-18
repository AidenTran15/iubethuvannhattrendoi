import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BeenTogether.css';

function BeenTogether() {
  const navigate = useNavigate();

  return (
    <div className="together-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Về Trang Chủ
      </button>
      <div className="together-content">
        <h1>Been Together</h1>
        <p>Nội dung Been Together sẽ được thêm vào đây...</p>
      </div>
    </div>
  );
}

export default BeenTogether;

