import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OurMemory.css';

function OurMemory() {
  const navigate = useNavigate();

  return (
    <div className="memory-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        ← Về Trang Chủ
      </button>
      <div className="memory-content">
        <h1>Our Memory</h1>
        <p>Nội dung Our Memory sẽ được thêm vào đây...</p>
      </div>
    </div>
  );
}

export default OurMemory;

