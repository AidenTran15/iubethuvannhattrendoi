# AWS Setup cho Our Memory App

Hướng dẫn setup AWS S3 và Lambda function để lưu trữ hình ảnh.

## Yêu cầu

1. Python 3.8+
2. AWS CLI đã được cấu hình với credentials
3. Quyền tạo S3 bucket, IAM role, và Lambda function

## Cài đặt

1. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

## Chạy Setup

1. Di chuyển vào thư mục `aws_setup`:
```bash
cd aws_setup
```

2. Chạy script setup:
```bash
python setup_aws.py
```

Script sẽ tự động:
- Tạo S3 bucket `iubethuvannheonheo-memories`
- Cấu hình CORS và public read access
- Tạo IAM role cho Lambda
- Tạo Lambda function để xử lý upload

## Cấu hình React App

1. Tạo file `.env` trong thư mục root của React app:
```
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_here
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

2. Cập nhật `AWS_CONFIG` trong `src/components/OurMemory.js`:
```javascript
const AWS_CONFIG = {
  region: 'us-east-1', // Thay đổi theo region của bạn
  bucketName: 'iubethuvannheonheo-memories',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
};
```

## Lưu ý Bảo mật

⚠️ **Quan trọng**: Không commit file `.env` vào git!

Thêm vào `.gitignore`:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## Cấu trúc S3

Hình ảnh sẽ được lưu theo cấu trúc:
```
s3://iubethuvannheonheo-memories/
  └── memories/
      └── 2025-12-24/
          ├── 20251224_120000_image1.jpg
          ├── 20251224_120001_image2.jpg
          └── ...
```

## Troubleshooting

### Lỗi: BucketAlreadyExists
- Bucket đã tồn tại, script sẽ bỏ qua bước tạo bucket

### Lỗi: EntityAlreadyExists (IAM Role)
- Role đã tồn tại, script sẽ sử dụng role hiện có

### Lỗi: ResourceConflictException (Lambda)
- Lambda function đã tồn tại, script sẽ cập nhật code

### Lỗi xác thực AWS
- Kiểm tra AWS credentials:
  ```bash
  aws configure list
  ```
- Hoặc set environment variables:
  ```bash
  export AWS_ACCESS_KEY_ID=your_key
  export AWS_SECRET_ACCESS_KEY=your_secret
  ```

## Chi phí AWS

- S3: ~$0.023/GB/tháng cho storage, $0.005/1000 requests
- Lambda: Miễn phí 1M requests/tháng, $0.20/1M requests sau đó
- Tổng chi phí ước tính: < $1/tháng cho app nhỏ

