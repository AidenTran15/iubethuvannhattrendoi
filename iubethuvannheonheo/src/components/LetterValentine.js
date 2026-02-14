import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LetterValentine.css';

function LetterValentine() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [letterContent, setLetterContent] = useState(`Gửi vợ iu,

Chúc vợ iu có 1 valentine thật zui zẻ zà hạnh phúc nhe, cảm ơn bé iu đã sắp xếp địa điểm đi chơi và ăn uống cho buổi hẹn hò đầu tiên của chúng ta nhe. Anh bé cảm thấy gất hạnh phúc khi bên cạnh em bé. Năm nay anh bé chưa chuẩn bị đươc chu đáo, mong bé iu thông cảm và cho anh bé cơ hội mấy lần sau nhe. Thay thì tặng hoa ngoài đời thì anh bé tặng bé bóa hoa trên đây nhe. Anyway, happy valatine vợ iu nheeeeeeeeee <3. Yêu em bé nhìu nhìu nhìu nhìu nhìu nhìu nhắm lunnnn hêhhehehe
`);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => setIsOpen(true), 1200);
  };

  const handleBack = () => navigate('/home');

  return (
    <div className="valentine-letter-container">
      <div className="valentine-hearts">
        <span className="v-heart">❤️</span>
        <span className="v-heart">💕</span>
        <span className="v-heart">💗</span>
        <span className="v-heart">💖</span>
        <span className="v-heart">💝</span>
        <span className="v-heart">💞</span>
      </div>

      <div className="valentine-content">
        {!isOpen ? (
          <div className="valentine-envelope-wrap">
            <div
              className={`valentine-envelope ${isOpening ? 'opened' : ''}`}
              onClick={handleOpenEnvelope}
            >
              <div className="valentine-envelope-back"></div>
              <div className="valentine-envelope-front">
                <div className="valentine-flap">
                  <div className="valentine-seal"></div>
                </div>
                <div className="valentine-paper">
                  <div className="valentine-preview">
                    <p>💌</p>
                    <p>Happy Valentine's</p>
                    <p className="valentine-open-text">Click to open</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="valentine-opened-wrap">
            <div className="valentine-letter-paper">
              <div className="valentine-header">
                <h2>💕 Happy Valentine's Day 💕</h2>
              </div>
              <div className="valentine-body">
                <textarea
                  className="valentine-textarea"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder="Viết thư cho người thương..."
                />
              </div>
              <div className="valentine-footer">
                <button
                  type="button"
                  className="valentine-bouquet-btn"
                  onClick={() => navigate('/bouquet')}
                >
                  💐 Bấm để nhận bó hoa
                </button>
                <p className="valentine-signature">Yêu em nhiều</p>
                <p className="valentine-name">Kiệt húii</p>
              </div>
            </div>
            <button className="valentine-back-btn" onClick={handleBack}>
              ← Về Trang Chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LetterValentine;
