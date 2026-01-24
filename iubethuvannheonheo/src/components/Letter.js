import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Letter.css';

function Letter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [letterContent, setLetterContent] = useState(`Gửi Cục Cứt Húi yêu dấu của anh,

Cảm ơn cục cứt húi vì đã ở bên cạnh anh bé nhee, anh bé rất trân trọng và cảm thấy hạnh phúc khi có em bé bên cạnh. Tuy mới bên cạnh em bé có 1 tháng thui mà anh bé thấy rất quen thuộc và gần gũi với em bé như là mình đã bên cạnh nhau lâu lắm rùi. Cảm ơn em bé vì đã đến bên cạnh và chăm sóc cho anh bé nhe. Chúng mình cùng nhau cố gắng đi thật xa với nhau nhe bé yêu. Anh yêu em bé nhìu nhìu nhìu nhìu nhìu nhìu nhìu nhìu nhìu nhìu. Nhiều tới mức hông biết là bao nhiêu luôn. Anh bé hông giỏi văn vở nên anh bé hông biết viết làm sao cho hay, anh bé viết ra những lời trong lòng anh bé hoi
`);

  const handleOpenEnvelope = () => {
    if (isOpening) return; // Prevent multiple clicks
    setIsOpening(true);
    // Delay showing the letter to allow envelope animation to play
    setTimeout(() => {
      setIsOpen(true);
    }, 1200); // Match the envelope flap animation duration
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="letter-container">
      {/* Floating hearts background */}
      <div className="floating-hearts">
        <span className="heart">💖</span>
        <span className="heart">💕</span>
        <span className="heart">💗</span>
        <span className="heart">💝</span>
        <span className="heart">💞</span>
        <span className="heart">💓</span>
      </div>

      <div className="letter-content">
        {!isOpen ? (
          <div className="envelope-container">
            <div className={`envelope ${isOpening ? 'opened' : ''}`} onClick={handleOpenEnvelope}>
              <div className="envelope-back"></div>
              <div className="envelope-front">
                <div className="envelope-flap"></div>
                <div className="envelope-paper">
                  <div className="letter-preview">
                    <p>💌</p>
                    <p>Open here</p>
                  </div>
                </div>
              </div>
            </div>
           
          </div>
        ) : (
          <div className="opened-letter-container">
            <div className="letter-paper">
              <div className="letter-header">
                <h2>💌 Happy anniversary 1 month💌</h2>
              </div>
              <div className="letter-body">
                <textarea
                  className="letter-textarea"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder=""
                />
              </div>
              <div className="letter-footer">
                <p className="signature">Anh yêu bé Vân nhèo nhèoooo</p>
                <p className="signature-name">Trần Tuấn Kiêt mập thúi</p>
              </div>
            </div>
            <button className="back-button" onClick={handleBack}>
              ← Về Trang Chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Letter;
