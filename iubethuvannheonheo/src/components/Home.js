import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
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
        {[...Array(25)].map((_, i) => (
          <div key={i} className="sparkle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}></div>
        ))}
      </div>

      <div className="home-content">
        <div className="welcome-section">
          <div className="main-heart">💕</div>
          <h1 className="home-title">Welcome Cục Cứt Húi</h1>

        </div>
        
        <div className="buttons-container">
          <button 
            className="home-button memory-button"
            onClick={() => navigate('/our-memory')}
          >
            <div className="button-content">
              <span className="button-icon">📸</span>
              <div className="button-text">
                <span className="button-title">Our Memory</span>

              </div>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <button 
            className="home-button together-button"
            onClick={() => navigate('/been-together')}
          >
            <div className="button-content">
              <span className="button-icon">💑</span>
              <div className="button-text">
                <span className="button-title">Been Together</span>
              </div>
            </div>
            <div className="button-glow"></div>
          </button>
          
          <button 
            className="home-button letter-button"
            onClick={() => navigate('/letter')}
          >
            <div className="button-content">
              <span className="button-icon">💌</span>
              <div className="button-text">
                <span className="button-title">Thư Cho Em</span>
              </div>
            </div>
            <div className="button-glow"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
