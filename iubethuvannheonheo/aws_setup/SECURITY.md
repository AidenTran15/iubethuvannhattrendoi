# 🔒 Bảo mật AWS Credentials

## ⚠️ QUAN TRỌNG: Không bao giờ commit AWS credentials vào Git!

GitHub sẽ tự động chặn push nếu phát hiện AWS credentials trong code.

## Cách xử lý nếu đã commit credentials:

### 1. Xóa credentials khỏi git history:

```bash
# Xóa file khỏi git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch aws_setup/setup_aws.py" \
  --prune-empty --tag-name-filter cat -- --all

# Hoặc sử dụng git-filter-repo (khuyên dùng)
git filter-repo --path aws_setup/setup_aws.py --invert-paths
```

### 2. Force push (CẨN THẬN - chỉ làm nếu bạn chắc chắn):

```bash
git push origin --force --all
```

### 3. Nếu credentials đã bị expose:

**QUAN TRỌNG**: Nếu credentials đã bị commit và push lên GitHub, bạn CẦN:

1. **Xóa credentials ngay lập tức** trong AWS Console:
   - Vào IAM → Users → Security credentials
   - Xóa Access Key cũ
   - Tạo Access Key mới

2. **Cập nhật credentials mới** trong file `.env` (không commit file này!)

## Cách sử dụng credentials đúng cách:

1. **Tạo file `.env`** trong thư mục root (đã có trong .gitignore):
```bash
REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key
```

2. **File `.env` sẽ tự động được ignore** bởi `.gitignore`

3. **Không bao giờ**:
   - ❌ Hardcode credentials trong code
   - ❌ Commit file `.env`
   - ❌ Chia sẻ credentials qua chat/email

4. **Luôn luôn**:
   - ✅ Sử dụng environment variables
   - ✅ Sử dụng AWS credentials file (~/.aws/credentials) cho Python scripts
   - ✅ Rotate credentials định kỳ

## Kiểm tra credentials có bị expose không:

```bash
# Tìm kiếm trong git history
git log --all --full-history --source -- "*setup_aws.py"
```

