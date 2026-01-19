# 🌐 API Gateway Setup

## ✅ Đã cấu hình:

- **API Gateway URL**: `https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod`
- **Method**: POST
- **Content-Type**: application/json

## 📋 Request Format:

```json
{
  "date": "2025-12-24",
  "image": "base64_encoded_image_string",
  "filename": "image.jpg",
  "contentType": "image/jpeg"
}
```

## 📤 Response Format:

**Success (200):**
```json
{
  "statusCode": 200,
  "body": {
    "message": "Upload successful",
    "url": "https://iubethuvannheonheo-memories.s3.ap-southeast-2.amazonaws.com/memories/2025-12-24/...",
    "key": "memories/2025-12-24/..."
  }
}
```

**Error (400/500):**
```json
{
  "statusCode": 400,
  "body": {
    "error": "Missing required fields: date and image"
  }
}
```

## 🔧 Cấu hình trong Code:

File `src/components/OurMemory.js` đã được cập nhật với:

```javascript
const AWS_CONFIG = {
  apiGatewayUrl: 'https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod',
  // ... other configs
};
```

## 🧪 Test API Gateway:

### Sử dụng curl:
```bash
curl -X POST https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-24",
    "image": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "filename": "test.png",
    "contentType": "image/png"
  }'
```

### Sử dụng Postman:
1. Method: POST
2. URL: `https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON): Copy từ test_event.json

## ✅ Lợi ích của API Gateway:

- ✅ Không cần AWS credentials trên client
- ✅ Bảo mật hơn (credentials chỉ ở server-side)
- ✅ Có thể thêm authentication/authorization
- ✅ Rate limiting và monitoring
- ✅ CORS được handle tự động

## 🔍 Troubleshooting:

### Lỗi CORS:
- Đảm bảo API Gateway đã cấu hình CORS
- Kiểm tra headers trong response

### Lỗi 403/401:
- Kiểm tra API Gateway permissions
- Đảm bảo Lambda function có quyền invoke

### Lỗi timeout:
- Tăng timeout của API Gateway (mặc định 29s)
- Kiểm tra Lambda function timeout

