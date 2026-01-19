# 🔧 Quick Fix: Lambda Permission Error

## ❌ Lỗi hiện tại:
```
AccessDenied: User is not authorized to perform: s3:PutObject
```

## ✅ Giải pháp nhanh:

### Cách 1: Chạy script tự động (Khuyên dùng)

```bash
cd aws_setup
python fix_lambda_permissions.py
```

Script sẽ tự động:
- Tìm role của Lambda function
- Cấp quyền S3 cho role đó

### Cách 2: Cấp quyền thủ công qua AWS Console

1. **Vào IAM Console** → Roles
2. **Tìm role**: `webthuvan-role-trp7mccw` (hoặc role của Lambda function)
3. **Click vào role** → Tab "Permissions"
4. **Click "Add permissions"** → "Create inline policy"
5. **Chọn JSON tab** và paste policy sau:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::iubethuvannheonheo-memories",
                "arn:aws:s3:::iubethuvannheonheo-memories/*"
            ]
        }
    ]
}
```

6. **Đặt tên policy**: `S3MemoryBucketAccess`
7. **Click "Create policy"**

### Cách 3: Sử dụng AWS CLI

```bash
# Lấy role name từ Lambda function
aws lambda get-function --function-name upload-memory-to-s3 --region ap-southeast-2

# Tạo file policy.json với nội dung trên, sau đó:
aws iam put-role-policy \
  --role-name webthuvan-role-trp7mccw \
  --policy-name S3MemoryBucketAccess \
  --policy-document file://policy.json
```

## ⏱️ Sau khi cấp quyền:

1. **Đợi 10-30 giây** để IAM policy propagate
2. **Test lại Lambda function** trong AWS Console
3. Nếu vẫn lỗi, đợi thêm 1-2 phút rồi thử lại

## ✅ Kết quả mong đợi:

Sau khi cấp quyền, test event sẽ trả về:

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

## 🔍 Kiểm tra quyền đã được cấp:

```bash
aws iam get-role-policy \
  --role-name webthuvan-role-trp7mccw \
  --policy-name S3MemoryBucketAccess
```

