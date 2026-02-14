import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Bouquet.css';

function Bouquet() {
  const navigate = useNavigate();

  return (
    <div className="bouquet-page">
      <div className="bouquet-bg-hearts">
        <span className="bh">💕</span>
        <span className="bh">🌸</span>
        <span className="bh">💗</span>
        <span className="bh">🌷</span>
        <span className="bh">💖</span>
        <span className="bh">🌹</span>
      </div>

      <div className="bouquet-wrap">
        <p className="bouquet-title">Tặng em yêu 💐</p>

        <div className="bouquet-container">
          {/* Wrapping paper / base */}
          <div className="bouquet-paper">
            <div className="bouquet-ribbon"></div>
            <div className="bouquet-ribbon vertical"></div>

            {/* Flowers layer - big roses and mixed flowers */}
            <div className="flowers-layer">
              <div className="flower rose rose-1">🌹</div>
              <div className="flower rose rose-2">🌹</div>
              <div className="flower rose rose-3">🌹</div>
              <div className="flower rose rose-4">🌹</div>
              <div className="flower rose rose-5">🌹</div>
              <div className="flower rose rose-6">🌹</div>
              <div className="flower rose rose-7">🌹</div>
              <div className="flower tulip tulip-1">🌷</div>
              <div className="flower tulip tulip-2">🌷</div>
              <div className="flower tulip tulip-3">🌷</div>
              <div className="flower cherry cherry-1">🌸</div>
              <div className="flower cherry cherry-2">🌸</div>
              <div className="flower cherry cherry-3">🌸</div>
              <div className="flower hibiscus h-1">🌺</div>
              <div className="flower hibiscus h-2">🌺</div>
              <div className="flower blossom b-1">💮</div>
              <div className="flower blossom b-2">💮</div>
            </div>

            {/* Leaves */}
            <div className="leaves-layer">
              <div className="leaf leaf-1">🍃</div>
              <div className="leaf leaf-2">🍃</div>
              <div className="leaf leaf-3">🍃</div>
              <div className="leaf leaf-4">🍃</div>
              <div className="leaf leaf-5">🍃</div>
              <div className="leaf leaf-6">🍃</div>
            </div>
          </div>
        </div>

        <p className="bouquet-message">Mãi yêu em — từ anh ❤️</p>

        <button className="bouquet-back-btn" onClick={() => navigate('/home')}>
          ← Về Trang Chủ
        </button>
      </div>
    </div>
  );
}

export default Bouquet;
