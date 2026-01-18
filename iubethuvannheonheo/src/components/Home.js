import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Trang Chủ</h1>
        <div className="buttons-container">
          <button 
            className="home-button memory-button"
            onClick={() => navigate('/our-memory')}
          >
            Our Memory
          </button>
          <button 
            className="home-button together-button"
            onClick={() => navigate('/been-together')}
          >
            Been Together
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

