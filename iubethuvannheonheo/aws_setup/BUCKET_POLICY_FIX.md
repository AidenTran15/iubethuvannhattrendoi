# 🔧 Sửa lỗi Bucket Policy

## ❌ Lỗi hiện tại:
```
Policies must be valid JSON and the first byte must be '{'
```

**Nguyên nhân**: Bucket policy thiếu trường `Principal` (bắt buộc trong bucket policy).

## ✅ Giải pháp:

### Option 1: Bucket Policy cho Public Read (Đơn giản nhất)

Copy policy này vào AWS Console:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::iubethuvannheonheo-memories/*"
    }
  ]
}
```

**Lưu ý**: Policy này chỉ cho phép **public read** (xem hình ảnh), không cho phép upload. Upload sẽ được xử lý qua Lambda function với IAM role.

### Option 2: Bucket Policy đầy đủ (Lambda + Public Read)

Nếu muốn cấp quyền trực tiếp cho Lambda qua bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowLambdaAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::493885330050:role/webthuvan-role-trp7mccw"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::iubethuvannheonheo-memories/*"
    },
    {
      "Sid": "AllowLambdaListBucket",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::493885330050:role/webthuvan-role-trp7mccw"
      },
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::iubethuvannheonheo-memories"
    },
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::iubethuvannheonheo-memories/*"
    }
  ]
}
```

## 📋 Cách sửa trong AWS Console:

1. **Xóa toàn bộ policy hiện tại** trong editor
2. **Copy một trong hai policy trên** (khuyên dùng Option 1)
3. **Paste vào editor**
4. **Click "Save changes"**

## 💡 Khuyến nghị:

**Sử dụng Option 1** (Public Read only) vì:
- ✅ Đơn giản hơn
- ✅ Lambda function đã có quyền qua IAM role (sau khi chạy `fix_lambda_permissions.py`)
- ✅ Chỉ cần public read để hiển thị hình ảnh trên web
- ✅ Bảo mật hơn (không cho phép public upload)

## 🔍 Kiểm tra:

Sau khi lưu policy:
1. Policy sẽ hiển thị không còn lỗi
2. Hình ảnh có thể được truy cập công khai qua URL
3. Lambda function vẫn có thể upload (qua IAM role permissions)

