# Hướng dẫn sửa lỗi "Missing Authentication Token" khi upload

## Nguyên nhân
Lỗi này xảy ra khi API Gateway endpoint POST chưa được tạo hoặc chưa được deploy.

## Giải pháp: Tạo endpoint POST trong API Gateway

### Bước 1: Vào API Gateway Console
1. Vào AWS Console → API Gateway
2. Chọn API hiện tại (URL: `https://n2ltuq2f9i.execute-api.ap-southeast-2.amazonaws.com/prod`)

### Bước 2: Tạo Resource `/upload` (Tùy chọn - nếu muốn endpoint riêng)
1. Trong Resources panel, click vào `/` (root)
2. Click **Actions** → **Create Resource**
3. Resource Name: `upload`
4. Resource Path: `/upload`
5. Click **Create Resource**

### Bước 3: Tạo Method POST cho Upload
**Option A: Tạo POST trên resource `/upload` (nếu đã tạo ở bước 2)**
1. Click vào resource `/upload`
2. Click **Actions** → **Create Method**
3. Chọn **POST** từ dropdown
4. Click dấu tick ✓
5. Setup:
   - Integration type: **Lambda Function**
   - Use Lambda Proxy integration: ✅ **Check** (quan trọng!)
   - Lambda Region: `ap-southeast-2`
   - Lambda Function: `upload-memory-to-s3` (hoặc tên Lambda function upload của bạn)
6. Click **Save**
7. Khi hỏi "Add Permission to Lambda Function?", click **OK**

**Option B: Tạo POST trên resource root `/` (nếu muốn dùng root endpoint)**
1. Click vào resource `/` (root)
2. Click **Actions** → **Create Method**
3. Chọn **POST** từ dropdown
4. Click dấu tick ✓
5. Setup tương tự như Option A
6. Click **Save**

### Bước 4: Enable CORS (nếu cần)
1. Click vào method **POST** vừa tạo
2. Click **Actions** → **Enable CORS**
3. Các settings mặc định đã đúng (Access-Control-Allow-Origin: *)
4. Click **Enable CORS and replace existing CORS headers**

### Bước 5: Deploy API (QUAN TRỌNG!)
1. Click **Actions** → **Deploy API**
2. Deployment stage: Chọn **prod** (hoặc stage hiện tại)
3. Deployment description: `Add POST method for upload`
4. Click **Deploy**

⚠️ **LƯU Ý QUAN TRỌNG**: Nếu không deploy, endpoint sẽ không hoạt động!

### Bước 6: Test
Sau khi deploy, test endpoint:
```bash
# Test với curl (thay thế bằng data thực tế)
curl -X POST https://n2ltuq2f9i.execute-api.ap-southeast-2.amazonaws.com/prod/upload \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-12-24","image":"base64data","filename":"test.jpg","contentType":"image/jpeg"}'
```

Hoặc test trên web app - upload ảnh và xem có còn lỗi không.

## Kiểm tra nhanh
1. Vào API Gateway Console
2. Chọn API của bạn
3. Kiểm tra Resources:
   - Có resource `/upload` với method POST không?
   - Hoặc resource `/` có method POST không?
4. Kiểm tra Deployments:
   - Có deployment mới nhất cho stage `prod` không?

## Nếu vẫn lỗi
1. Kiểm tra Lambda function `upload-memory-to-s3` có tồn tại không
2. Kiểm tra Lambda function có quyền truy cập S3 không
3. Kiểm tra API Gateway có được deploy chưa
4. Xem CloudWatch Logs của Lambda để debug

