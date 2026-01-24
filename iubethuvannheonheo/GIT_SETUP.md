# Hướng dẫn Setup Git Push

## Vấn đề
GitHub không còn hỗ trợ password authentication. Cần dùng SSH key hoặc Personal Access Token.

## Giải pháp: SSH Key (Đã setup xong)

### Bước 1: Thêm SSH Key vào GitHub

1. Copy SSH public key này:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPt7Wg+33hSykSJbgzezxBWmvk+wMC+8hkqB0HQP3+k5 aidenkiettran@gmail.com
```

2. Vào GitHub: https://github.com/settings/keys
3. Click "New SSH key"
4. Title: "MacBook" (hoặc tên bạn muốn)
5. Key: Paste key ở trên
6. Click "Add SSH key"

### Bước 2: Test kết nối
Chạy lệnh này để test:
```bash
ssh -T git@github.com
```

Nếu thấy "Hi AidenTran15! You've successfully authenticated..." là thành công!

### Bước 3: Push code
Sau khi thêm key, bạn có thể push:
```bash
cd /Users/aidentranx15/Desktop/iubethuvannhattrendoi
git push origin main
```

## Lưu ý
- Remote đã được đổi sang SSH: `git@github.com:AidenTran15/iubethuvannhattrendoi.git`
- SSH key đã được tạo tại: `~/.ssh/id_ed25519`
