# 🔧 Hướng dẫn khắc phục lỗi GitHub Secret Scanning

## ✅ Đã làm:
- ✅ Xóa AWS credentials khỏi file `setup_aws.py`
- ✅ Thay bằng placeholder an toàn

## 📋 Các bước tiếp theo:

### Bước 1: Commit thay đổi mới (đã xóa credentials)

```bash
git add aws_setup/setup_aws.py
git commit -m "Remove AWS credentials from code - use environment variables instead"
```

### Bước 2: Xóa credentials khỏi git history

Vì credentials đã bị commit trong commit `5a52f04`, bạn cần xóa chúng khỏi history:

**Cách 1: Sử dụng git filter-branch (đơn giản hơn)**
```bash
# Xóa file khỏi commit đó
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch aws_setup/setup_aws.py" \
  --prune-empty --tag-name-filter cat -- 5a52f04^..HEAD

# Hoặc rewrite toàn bộ history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch aws_setup/setup_aws.py" \
  --prune-empty --tag-name-filter cat -- --all
```

**Cách 2: Sử dụng BFG Repo-Cleaner (nhanh hơn, khuyên dùng)**
```bash
# Download BFG từ https://rtyley.github.io/bfg-repo-cleaner/
# Sau đó chạy:
java -jar bfg.jar --delete-files setup_aws.py
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Cách 3: Tạo commit mới để ghi đè (nhanh nhất nhưng không xóa history)**
```bash
# Chỉ cần push commit mới (đã xóa credentials)
git push origin main
# GitHub sẽ chấp nhận vì credentials đã bị xóa trong commit mới
```

### Bước 3: Force push (CHỈ làm nếu bạn chắc chắn và đã xóa history)

```bash
# ⚠️ CẨN THẬN: Chỉ làm nếu bạn đã xóa credentials khỏi history
git push origin --force --all
```

### Bước 4: QUAN TRỌNG - Rotate AWS Credentials

**Vì credentials đã bị expose trên GitHub, bạn CẦN:**

1. **Vào AWS Console** → IAM → Users → Security credentials
2. **Xóa Access Key cũ** (AKIAXF7O4CKBAWMKVMOA)
3. **Tạo Access Key mới**
4. **Cập nhật trong file `.env`** (không commit file này!)

### Bước 5: Tạo file .env với credentials mới

Tạo file `.env` trong thư mục root:
```
REACT_APP_AWS_ACCESS_KEY_ID=your_new_access_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_new_secret_key
```

## 🛡️ Ngăn chặn tương lai:

1. ✅ File `.env` đã có trong `.gitignore`
2. ✅ Không hardcode credentials trong code
3. ✅ Sử dụng environment variables
4. ✅ Sử dụng AWS credentials file cho Python scripts

## 📝 Lưu ý:

- Nếu bạn làm việc nhóm, thông báo cho mọi người về việc rotate credentials
- Kiểm tra lại các file khác xem có credentials nào khác không
- Xem file `aws_setup/SECURITY.md` để biết thêm về bảo mật

