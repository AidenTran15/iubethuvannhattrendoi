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
  apiGatewayBaseUrl: 'https://n2ltuq2f9i.execute-api.ap-southeast-2.amazonaws.com/prod', // API Gateway base URL
  // Will try /upload first, then fallback to root
  uploadUrl: 'https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod/', // API Gateway endpoint for upload
  listMemoriesUrl: 'https://n2ltuq2f9i.execute-api.ap-southeast-2.amazonaws.com/prod/', // API Gateway endpoint for list
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
  // Use API Gateway to list memories (no credentials needed on frontend)
  const loadMemories = useCallback(async (date) => {
    const dateKey = formatDateKey(date);
    
    // Try using S3 SDK if credentials are available (for development)
    if (AWS_CONFIG.accessKeyId && AWS_CONFIG.secretAccessKey) {
      try {
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
        console.log(`Loaded ${memoryUrls.length} memories for ${dateKey} using S3 SDK`);
        return;
      } catch (error) {
        console.warn('Error loading with S3 SDK:', error);
      }
    }
    
    // Use API Gateway to list memories
    try {
      // Clean URL (remove trailing slash if exists)
      const baseUrl = AWS_CONFIG.listMemoriesUrl.replace(/\/$/, '');
      // Try /list endpoint first, fallback to root with query param
      let listUrl = `${baseUrl}/list?date=${dateKey}`;
      console.log(`Loading memories from API Gateway: ${listUrl}`);
      
      let response = await fetch(listUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // If /list doesn't exist (404), try root endpoint with query param
      if (response.status === 404 || response.status === 403) {
        console.log('Endpoint /list not found, trying root endpoint...');
        listUrl = `${baseUrl}?date=${dateKey}`;
        response = await fetch(listUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get response text first to handle different formats
      const responseText = await response.text();
      console.log('API Gateway raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
      }
      
      console.log('API Gateway parsed response:', result);
      
      // Handle API Gateway response format
      let responseData;
      if (result.statusCode !== undefined) {
        // Lambda proxy integration format
        if (typeof result.body === 'string') {
          try {
            responseData = JSON.parse(result.body);
          } catch (e) {
            console.error('Failed to parse body:', e);
            responseData = { error: result.body };
          }
        } else {
          responseData = result.body;
        }
      } else {
        // Direct response format
        responseData = result;
      }
      
      console.log('Final response data:', responseData);
      
      if (responseData.memories && Array.isArray(responseData.memories)) {
        const memoryUrls = responseData.memories.map((memory) => ({
          key: memory.key,
          url: memory.url,
          lastModified: memory.lastModified ? new Date(memory.lastModified) : null,
        }));

        setMemories((prev) => ({
          ...prev,
          [dateKey]: memoryUrls,
        }));
        
        // Also save to localStorage for offline access
        try {
          localStorage.setItem(`memories_${dateKey}`, JSON.stringify(memoryUrls));
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
        
        console.log(`✅ Loaded ${memoryUrls.length} memories for ${dateKey} from API Gateway`);
      } else {
        console.warn('No memories array in response:', responseData);
        // If no memories, set empty array
        setMemories((prev) => ({
          ...prev,
          [dateKey]: [],
        }));
      }
    } catch (error) {
      console.error('Error loading memories from API Gateway:', error);
      
      // Fallback to localStorage if API fails
      try {
        const stored = localStorage.getItem(`memories_${dateKey}`);
        if (stored) {
          const storedMemories = JSON.parse(stored);
          setMemories((prev) => ({
            ...prev,
            [dateKey]: storedMemories,
          }));
          console.log(`Loaded ${storedMemories.length} memories from localStorage for ${dateKey}`);
        }
      } catch (localError) {
        console.warn('Error loading from localStorage:', localError);
      }
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
        try {
          // Convert file to base64
          const imageBase64 = await fileToBase64(file);
          
          // Prepare request body
          const requestBody = {
            date: dateKey,
            image: imageBase64,
            filename: file.name,
            contentType: file.type || 'image/jpeg',
          };

          console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes');

          // Try /upload endpoint first, fallback to root if needed
          let uploadUrl = AWS_CONFIG.uploadUrl;
          console.log('Trying upload URL:', uploadUrl);
          
          let response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // If /upload doesn't exist (404 or 403), try root endpoint
          if (response.status === 404 || response.status === 403) {
            console.log('Endpoint /upload not found, trying root endpoint...');
            uploadUrl = AWS_CONFIG.apiGatewayBaseUrl;
            response = await fetch(uploadUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });
          }

          console.log('API Response status:', response.status, response.statusText);
          
          // Get response text first to see raw data
          const responseText = await response.text();
          console.log('API Response raw text:', responseText);
          
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}`);
          }
          
          console.log('API Response parsed:', result);
          
          // Handle different response formats from API Gateway
          let responseData;
          if (result.statusCode !== undefined) {
            // Lambda proxy integration format: { statusCode: 200, body: "..." }
            if (typeof result.body === 'string') {
              try {
                responseData = JSON.parse(result.body);
              } catch (e) {
                console.error('Failed to parse body:', e);
                responseData = { error: result.body };
              }
            } else {
              responseData = result.body;
            }
          } else {
            // Direct response format
            responseData = result;
          }
          
          console.log('Final response data:', responseData);
          
          // Check for errors
          if (!response.ok || (result.statusCode && result.statusCode !== 200)) {
            const errorMsg = responseData.error || responseData.message || `Upload failed: ${response.statusText}`;
            console.error('Upload error:', errorMsg, 'Full response:', responseData);
            throw new Error(errorMsg);
          }
          
          // Check if we have a URL
          if (!responseData.url) {
            console.error('No URL in response:', responseData);
            throw new Error(responseData.error || 'Upload failed: No URL returned from server');
          }
          
          // Ensure URL includes region if needed
          let imageUrl = responseData.url;
          if (imageUrl && !imageUrl.includes(AWS_CONFIG.region) && imageUrl.includes('s3.amazonaws.com')) {
            // Fix URL to include region
            const key = responseData.key || imageUrl.split('/').slice(-1)[0];
            imageUrl = `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${key}`;
          }
          
          console.log('✅ Upload successful! URL:', imageUrl, 'Key:', responseData.key);
          
          return {
            key: responseData.key || imageUrl.split('/').slice(-1)[0],
            url: imageUrl,
          };
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          throw fileError;
        }
      });

      const uploadedMemories = await Promise.all(uploadPromises);
      console.log('All uploads completed:', uploadedMemories);

      // Update local state immediately (for instant feedback)
      setMemories((prev) => {
        const newMemories = {
          ...prev,
          [dateKey]: [...(prev[dateKey] || []), ...uploadedMemories],
        };
        
        // Also save to localStorage for persistence
        try {
          localStorage.setItem(`memories_${dateKey}`, JSON.stringify(newMemories[dateKey]));
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
        
        return newMemories;
      });

      alert(`Upload thành công ${uploadedMemories.length} hình ảnh!`);
      setSelectedFiles([]);
      
      // Reload memories from S3 to ensure we have all images (including newly uploaded)
      console.log(`🔄 Reloading memories from S3 for ${dateKey}...`);
      await loadMemories(date);
      console.log(`✅ Memories reloaded for ${dateKey}`);
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
