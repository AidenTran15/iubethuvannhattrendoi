import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BeenTogether.css';

function BeenTogether() {
  const navigate = useNavigate();
  const [timeTogether, setTimeTogether] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Ngày bắt đầu: 24/12/2025
  const startDate = new Date('2025-12-24T00:00:00');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = now - startDate;

      if (diff > 0) {
        // Tính số tháng
        let months = 0;
        let tempDate = new Date(startDate);
        while (tempDate < now) {
          tempDate.setMonth(tempDate.getMonth() + 1);
          if (tempDate <= now) {
            months++;
          } else {
            tempDate.setMonth(tempDate.getMonth() - 1);
            break;
          }
        }

        // Tính số ngày còn lại sau khi trừ tháng
        const dateAfterMonths = new Date(startDate);
        dateAfterMonths.setMonth(dateAfterMonths.getMonth() + months);
        const daysDiff = now - dateAfterMonths;
        
        const days = Math.floor(daysDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((daysDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((daysDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((daysDiff % (1000 * 60)) / 1000);

        setTimeTogether({ months, days, hours, minutes, seconds });
      } else {
        // Nếu chưa đến ngày bắt đầu
        setTimeTogether({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Tính toán ngay lập tức
    calculateTime();

    // Cập nhật mỗi giây
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="together-container">
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

      <button className="back-button" onClick={() => navigate('/home')}>
        <span className="back-icon">←</span>
        <span>Về Trang Chủ</span>
      </button>

      <div className="together-content">
        <div className="header-section">
          <div className="main-heart">💑</div>
          <h1 className="main-title">Been Together</h1>
          <p className="subtitle">Từ ngày chúng ta bắt đầu</p>
        </div>

        <div className="start-date-box">
          <span className="date-label">Ngày bắt đầu</span>
          <span className="date-value">{formatDate(startDate)}</span>
        </div>

        <div className="time-display">
          <div className="time-card">
            <div className="time-number">{timeTogether.months}</div>
            <div className="time-label">Tháng</div>
          </div>
          
          <div className="time-separator">:</div>
          
          <div className="time-card">
            <div className="time-number">{timeTogether.days}</div>
            <div className="time-label">Ngày</div>
          </div>
          
          <div className="time-separator">:</div>
          
          <div className="time-card">
            <div className="time-number">{String(timeTogether.hours).padStart(2, '0')}</div>
            <div className="time-label">Giờ</div>
          </div>
          
          <div className="time-separator">:</div>
          
          <div className="time-card">
            <div className="time-number">{String(timeTogether.minutes).padStart(2, '0')}</div>
            <div className="time-label">Phút</div>
          </div>
          
          <div className="time-separator">:</div>
          
          <div className="time-card">
            <div className="time-number">{String(timeTogether.seconds).padStart(2, '0')}</div>
            <div className="time-label">Giây</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeenTogether;
