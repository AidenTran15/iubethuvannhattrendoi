"""
Script đơn giản để tạo S3 bucket trên AWS
Chạy: python create_s3_bucket.py
"""

import boto3
from botocore.exceptions import ClientError

# Cấu hình
BUCKET_NAME = 'iubethuvannheonheo-memories'  # Thay đổi tên bucket nếu cần
REGION = 'ap-southeast-2'  # Sydney region

def create_s3_bucket():
    """Tạo S3 bucket với cấu hình CORS và public read access"""
    
    # Tạo S3 client (tự động đọc credentials từ ~/.aws/credentials)
    s3_client = boto3.client('s3', region_name=REGION)
    
    try:
        print(f"🚀 Đang tạo S3 bucket: {BUCKET_NAME}...")
        print(f"📍 Region: {REGION}")
        print()
        
        # Kiểm tra bucket đã tồn tại chưa
        try:
            s3_client.head_bucket(Bucket=BUCKET_NAME)
            print(f"⚠️  Bucket '{BUCKET_NAME}' đã tồn tại!")
            return True
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket không tồn tại, tạo mới
                if REGION == 'us-east-1':
                    s3_client.create_bucket(Bucket=BUCKET_NAME)
                else:
                    s3_client.create_bucket(
                        Bucket=BUCKET_NAME,
                        CreateBucketConfiguration={'LocationConstraint': REGION}
                    )
                print(f"✅ Đã tạo bucket: {BUCKET_NAME}")
            else:
                raise
        
        # Cấu hình CORS để cho phép upload từ web
        print("🔧 Đang cấu hình CORS...")
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedHeaders': ['*'],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    'AllowedOrigins': ['*'],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }
        s3_client.put_bucket_cors(Bucket=BUCKET_NAME, CORSConfiguration=cors_configuration)
        print("✅ Đã cấu hình CORS")
        
        # Cấu hình public read access cho hình ảnh
        print("🔧 Đang cấu hình public read access...")
        import json
        bucket_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": f"arn:aws:s3:::{BUCKET_NAME}/*"
                }
            ]
        }
        s3_client.put_bucket_policy(
            Bucket=BUCKET_NAME,
            Policy=json.dumps(bucket_policy)
        )
        print("✅ Đã cấu hình public read access")
        
        print()
        print("=" * 50)
        print("✅ Hoàn tất!")
        print("=" * 50)
        print(f"Bucket URL: https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/")
        print()
        
        return True
        
    except ClientError as e:
        print(f"❌ Lỗi: {e}")
        print()
        print("💡 Kiểm tra:")
        print("  1. AWS credentials đã được cấu hình chưa? (~/.aws/credentials)")
        print("  2. Bạn có quyền tạo S3 bucket không?")
        print("  3. Tên bucket có hợp lệ không? (phải unique trên toàn AWS)")
        return False
    except Exception as e:
        print(f"❌ Lỗi không mong đợi: {e}")
        return False

def main():
    print("=" * 50)
    print("📦 Tạo S3 Bucket")
    print("=" * 50)
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
        print()
        print("💡 Vui lòng cấu hình AWS credentials:")
        print("  - Chạy: aws configure")
        print("  - Hoặc tạo file ~/.aws/credentials")
        return
    
    # Tạo bucket
    create_s3_bucket()

if __name__ == '__main__':
    main()

