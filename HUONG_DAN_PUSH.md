# Đẩy code lên GitHub

Đã cấu hình remote dùng HTTPS. Bạn làm **1 bước** sau:

## Bước 1: Tạo token (nếu chưa có)
1. Vào https://github.com/settings/tokens  
2. **Generate new token (classic)**  
3. Chọn quyền **repo** → **Generate token** → copy token (chỉ hiện 1 lần).

## Bước 2: Push trong Terminal
Mở **Terminal** (trên Mac) hoặc CMD/PowerShell, chạy:

```bash
cd /Users/aidentranx15/Desktop/iubethuvannhattrendoi
git push -u origin main
```

Khi được hỏi **Password**, dán **token** (không phải mật khẩu GitHub) rồi Enter.

Xong. Code sẽ lên https://github.com/AidenTran15/iubethuvannhattrendoi
