# 🔧 Sửa lỗi ACL Error

## ❌ Lỗi hiện tại:
```
AccessControlListNotSupported: The bucket does not allow ACLs
```

## 🔍 Nguyên nhân:

AWS S3 buckets mới được tạo với **ACLs bị tắt** (default behavior). Lambda function đang cố gắng set `ACL='public-read'` nhưng bucket không cho phép.

## ✅ Giải pháp:

### Cách 1: Cập nhật Lambda function (Khuyên dùng)

**Option A: Chạy script tự động**
```bash
cd aws_setup
python update_lambda_function.py
```

**Option B: Cập nhật thủ công qua AWS Console**

1. Mở Lambda function `upload-memory-to-s3` trong AWS Console
2. Vào tab "Code"
3. Tìm dòng có `ACL='public-read'` trong file `lambda_function.py`
4. Xóa dòng đó (hoặc comment lại)
5. Code sẽ trở thành:
```python
s3_client.put_object(
    Bucket=bucket_name,
    Key=s3_key,
    Body=image_bytes,
    ContentType=content_type
    # ACL='public-read'  # Đã xóa vì bucket không cho phép ACLs
)
```
6. Click "Deploy"

### Cách 2: Bật ACLs cho bucket (Không khuyên dùng)

⚠️ AWS khuyến khích **tắt ACLs** và dùng bucket policy thay thế.

Nếu vẫn muốn bật ACLs:
1. Vào S3 Console → Bucket → Permissions
2. Tìm "Object Ownership" → Edit
3. Chọn "ACLs enabled"
4. Save

**Nhưng cách này không được khuyến khích!**

## 💡 Tại sao không cần ACL?

Bucket policy đã được cấu hình để cho phép public read:
```json
{
  "Effect": "Allow",
  "Principal": "*",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::iubethuvannheonheo-memories/*"
}
```

Vì vậy không cần ACL nữa!

## 🧪 Sau khi sửa:

1. **Đợi vài giây** để Lambda function update
2. **Test lại** Lambda function trong AWS Console
3. **Kết quả mong đợi**:
```json
{
  "statusCode": 200,
  "body": {
    "message": "Upload successful",
    "url": "https://iubethuvannheonheo-memories.s3.ap-southeast-2.amazonaws.com/...",
    "key": "memories/2025-12-24/..."
  }
}
```

## 📋 Tóm tắt thay đổi:

- ❌ **Trước**: `put_object(..., ACL='public-read')`
- ✅ **Sau**: `put_object(...)` (không có ACL)
- ✅ **Public access**: Được control qua bucket policy

