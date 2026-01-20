# Hướng dẫn tạo Lambda function để List Memories

## Vấn đề
Web app không thể load ảnh từ S3 vì không có AWS credentials. Cần tạo Lambda function để list memories và expose qua API Gateway.

## Bước 1: Tạo Lambda function mới

1. Vào AWS Lambda Console
2. Click "Create function"
3. Chọn "Author from scratch"
4. Đặt tên: `list-memories-from-s3`
5. Runtime: Python 3.11 hoặc 3.12
6. Execution role: Chọn role hiện tại (ví dụ: `webthuvan-role-trp7mccw`)
7. Click "Create function"

## Bước 2: Copy code Lambda

Copy code từ file `list_memories_lambda.py` vào Lambda function code editor.

## Bước 3: Cấu hình Environment Variables

Trong Lambda function, vào tab "Configuration" > "Environment variables":
- `BUCKET_NAME`: `iubethuvannheonheo-memories`
- `AWS_REGION`: `ap-southeast-2`

## Bước 4: Đảm bảo Lambda có quyền List S3

Lambda role cần có quyền `s3:ListBucket` cho bucket. Nếu chưa có, chạy script `fix_lambda_permissions.py` hoặc thêm policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::iubethuvannheonheo-memories",
                "arn:aws:s3:::iubethuvannheonheo-memories/*"
            ]
        }
    ]
}
```

## Bước 5: Thêm vào API Gateway

1. Vào API Gateway Console
2. Chọn API hiện tại (có URL: `https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod`)
3. Tạo resource mới: `/list` hoặc `/memories`
4. Tạo method: `GET`
5. Integration type: Lambda Function
6. Chọn Lambda function: `list-memories-from-s3`
7. Enable CORS nếu cần
8. Deploy API

## Bước 6: Cập nhật code frontend

Sau khi có endpoint mới, cập nhật `OurMemory.js`:

```javascript
// Thêm vào AWS_CONFIG
listMemoriesUrl: 'https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod/list',

// Sửa loadMemories function để dùng API Gateway
const loadMemories = useCallback(async (date) => {
  const dateKey = formatDateKey(date);
  
  try {
    const response = await fetch(`${AWS_CONFIG.listMemoriesUrl}?date=${dateKey}`);
    const result = await response.json();
    
    if (result.statusCode === 200) {
      const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
      const memoryUrls = body.memories || [];
      
      setMemories((prev) => ({
        ...prev,
        [dateKey]: memoryUrls,
      }));
    }
  } catch (error) {
    console.error('Error loading memories:', error);
  }
}, []);
```

## Tạm thời (Workaround)

Hiện tại code đã được cập nhật để:
1. Lưu memories vào localStorage sau khi upload
2. Load từ localStorage khi không có credentials
3. Hiển thị ảnh ngay sau khi upload

Ảnh sẽ hiển thị ngay sau khi upload, và được lưu vào localStorage để persist qua page reload.

