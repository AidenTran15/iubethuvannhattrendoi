import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import './OurMemory.css';

// AWS Configuration
const AWS_CONFIG = {
  region: 'ap-southeast-2', // Sydney region
  bucketName: 'iubethuvannheonheo-memories', // Tên bucket S3
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
  apiGatewayUrl: 'https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod', // API Gateway endpoint
};

function OurMemory() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [memories, setMemories] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Initialize S3 client
  const getS3Client = () => {
    return new S3Client({
      region: AWS_CONFIG.region,
      credentials: {
        accessKeyId: AWS_CONFIG.accessKeyId,
        secretAccessKey: AWS_CONFIG.secretAccessKey,
      },
    });
  };

  // Load memories for a specific date
  const loadMemories = useCallback(async (date) => {
    if (!AWS_CONFIG.accessKeyId || !AWS_CONFIG.secretAccessKey) {
      console.warn('AWS credentials not configured');
      return;
    }

    try {
      const dateKey = formatDateKey(date);
      const client = getS3Client();
      const command = new ListObjectsV2Command({
        Bucket: AWS_CONFIG.bucketName,
        Prefix: `memories/${dateKey}/`,
      });

      const response = await client.send(command);
      const memoryUrls = (response.Contents || []).map((item) => ({
        key: item.Key,
        url: `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${item.Key}`,
        lastModified: item.LastModified,
      }));

      setMemories((prev) => ({
        ...prev,
        [dateKey]: memoryUrls,
      }));
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  }, []);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload images via API Gateway
  const uploadImages = async (files, date) => {
    setUploading(true);
    const dateKey = formatDateKey(date);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Convert file to base64
        const imageBase64 = await fileToBase64(file);
        
        // Prepare request body
        const requestBody = {
          date: dateKey,
          image: imageBase64,
          filename: file.name,
          contentType: file.type || 'image/jpeg',
        };

        // Call API Gateway
        const response = await fetch(AWS_CONFIG.apiGatewayUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        
        // Handle different response formats from API Gateway
        let responseData;
        if (result.statusCode) {
          // Lambda proxy integration format: { statusCode: 200, body: "..." }
          responseData = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
        } else {
          // Direct response format
          responseData = result;
        }
        
        if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
          throw new Error(responseData.error || `Upload failed: ${response.statusText}`);
        }
        
        if (responseData.url) {
          return {
            key: responseData.key || responseData.url.split('/').pop(),
            url: responseData.url,
          };
        } else {
          throw new Error(responseData.error || 'Upload failed: No URL returned');
        }
      });

      const uploadedMemories = await Promise.all(uploadPromises);

      // Update local state
      setMemories((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), ...uploadedMemories],
      }));

      alert(`Upload thành công ${uploadedMemories.length} hình ảnh!`);
      setSelectedFiles([]);
      
      // Reload memories to show new uploads
      loadMemories(date);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Lỗi khi upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calendar functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    loadMemories(newDate);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert('Vui lòng chọn ít nhất một hình ảnh');
      return;
    }
    uploadImages(selectedFiles, selectedDate);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  useEffect(() => {
    loadMemories(selectedDate);
  }, [selectedDate, loadMemories]);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const selectedDateKey = formatDateKey(selectedDate);
  const selectedMemories = memories[selectedDateKey] || [];

  const calendarDays = [];
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="memory-container">
      <button className="back-button" onClick={() => navigate('/home')}>
        <span className="back-icon">←</span>
        <span>Về Trang Chủ</span>
      </button>

      <div className="memory-content">
        <div className="memory-header">
          <h1 className="memory-title">Our Memory</h1>
        </div>

        <div className="memory-layout">
          {/* Calendar Section */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button className="month-nav" onClick={handlePrevMonth}>‹</button>
              <h2 className="month-year">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button className="month-nav" onClick={handleNextMonth}>›</button>
            </div>

            <div className="calendar-grid">
              {dayNames.map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                }
                const isSelected =
                  day === selectedDate.getDate() &&
                  currentMonth === selectedDate.getMonth() &&
                  currentYear === selectedDate.getFullYear();
                const dateKey = formatDateKey(new Date(currentYear, currentMonth, day));
                const hasMemories = memories[dateKey] && memories[dateKey].length > 0;

                return (
                  <div
                    key={day}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${hasMemories ? 'has-memories' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day}
                    {hasMemories && <span className="memory-dot"></span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Memory Details Section */}
          <div className="memory-details-section">
            <div className="selected-date-header">
              <h3>{formatDateDisplay(selectedDate)}</h3>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
              <input
                type="file"
                id="memory-upload"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <label htmlFor="memory-upload" className="upload-button">
                📸 Chọn Hình Ảnh
              </label>
              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <p>{selectedFiles.length} hình đã chọn</p>
                  <button
                    className="upload-submit-button"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? 'Đang upload...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>

            {/* Memories Gallery */}
            <div className="memories-gallery">
              {selectedMemories.length === 0 ? (
                <div className="no-memories">
                  <p>Chưa có kỷ niệm nào cho ngày này</p>
                  <p className="hint">Chọn hình ảnh và upload để lưu kỷ niệm!</p>
                </div>
              ) : (
                selectedMemories.map((memory, index) => (
                  <div key={index} className="memory-item">
                    <img src={memory.url} alt={`Memory ${index + 1}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OurMemory;
