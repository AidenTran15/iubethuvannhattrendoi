# Hướng dẫn thêm endpoint List Memories vào API Gateway

## Bước 1: Vào API Gateway Console

1. Vào AWS Console → API Gateway
2. Chọn API hiện tại (có URL: `https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod`)

## Bước 2: Tạo Resource mới

1. Trong Resources panel bên trái, click vào `/` (root)
2. Click **Actions** → **Create Resource**
3. Resource Name: `list`
4. Resource Path: `/list` (sẽ tự động điền)
5. Click **Create Resource**

## Bước 3: Tạo Method GET

1. Click vào resource `/list` vừa tạo
2. Click **Actions** → **Create Method**
3. Chọn **GET** từ dropdown
4. Click dấu tick ✓
5. Setup:
   - Integration type: **Lambda Function**
   - Use Lambda Proxy integration: ✅ **Check** (quan trọng!)
   - Lambda Region: `ap-southeast-2`
   - Lambda Function: `list-memories-from-s3`
6. Click **Save**
7. Khi hỏi "Add Permission to Lambda Function?", click **OK**

## Bước 4: Enable CORS (nếu cần)

1. Click vào method **GET** vừa tạo
2. Click **Actions** → **Enable CORS**
3. Các settings mặc định đã đúng (Access-Control-Allow-Origin: *)
4. Click **Enable CORS and replace existing CORS headers**

## Bước 5: Deploy API

1. Click **Actions** → **Deploy API**
2. Deployment stage: Chọn **prod** (hoặc stage hiện tại)
3. Deployment description: `Add list memories endpoint`
4. Click **Deploy**

## Bước 6: Test

Sau khi deploy, test endpoint:
```
GET https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod/list?date=2025-12-24
```

Bạn sẽ thấy response với danh sách memories!

## Lưu ý

- URL endpoint sẽ là: `https://5sygni79g3.execute-api.ap-southeast-2.amazonaws.com/prod/list`
- Code frontend đã được cập nhật để sử dụng endpoint này
- Nếu URL khác, cập nhật `listMemoriesUrl` trong `OurMemory.js`

