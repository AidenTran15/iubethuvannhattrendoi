"""
Script để cập nhật Lambda function code (bỏ ACL)
Chạy: python update_lambda_function.py
"""

import boto3
import zipfile
import os
from botocore.exceptions import ClientError

LAMBDA_FUNCTION_NAME = 'upload-memory-to-s3'
REGION = 'ap-southeast-2'

def update_lambda_function():
    """Cập nhật Lambda function code"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    try:
        print(f"🔄 Đang cập nhật Lambda function: {LAMBDA_FUNCTION_NAME}...")
        
        # Kiểm tra file lambda_function.py có tồn tại không
        if not os.path.exists('lambda_function.py'):
            print("❌ Không tìm thấy file lambda_function.py")
            print("   Vui lòng đảm bảo bạn đang chạy script từ thư mục aws_setup")
            return False
        
        # Tạo zip file cho Lambda function
        zip_path = 'lambda_function.zip'
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.write('lambda_function.py')
        
        # Đọc zip file
        with open(zip_path, 'rb') as f:
            zip_content = f.read()
        
        # Update function code
        lambda_client.update_function_code(
            FunctionName=LAMBDA_FUNCTION_NAME,
            ZipFile=zip_content
        )
        
        print(f"✅ Đã cập nhật Lambda function: {LAMBDA_FUNCTION_NAME}")
        print()
        print("📝 Thay đổi:")
        print("   • Đã xóa ACL='public-read' khỏi put_object")
        print("   • Public access giờ được control qua bucket policy")
        
        # Xóa zip file
        if os.path.exists(zip_path):
            os.remove(zip_path)
        
        return True
        
    except ClientError as e:
        print(f"❌ Lỗi khi cập nhật Lambda function: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi không mong đợi: {e}")
        return False

def main():
    print("=" * 60)
    print("🔄 Cập nhật Lambda Function")
    print("=" * 60)
    print()
    
    # Kiểm tra AWS credentials
    try:
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"✅ Đã xác thực AWS")
        print(f"   Account: {identity.get('Account')}")
        print()
    except Exception as e:
        print(f"❌ Lỗi xác thực AWS: {e}")
        return
    
    # Cập nhật Lambda function
    if update_lambda_function():
        print()
        print("=" * 60)
        print("✅ Hoàn tất!")
        print("=" * 60)
        print()
        print("🧪 Bước tiếp theo:")
        print("  1. Đợi vài giây để Lambda function update")
        print("  2. Test lại Lambda function trong AWS Console")
        print("  3. Lần này sẽ không còn lỗi ACL nữa!")
        print()

if __name__ == '__main__':
    main()

