"""
Script cực kỳ đơn giản để tạo S3 bucket
Chỉ cần chạy: python create_bucket_simple.py
"""

import boto3

# Thay đổi tên bucket và region ở đây
BUCKET_NAME = 'iubethuvannheonheo-memories'
REGION = 'ap-southeast-2'

# Tạo S3 client
s3 = boto3.client('s3', region_name=REGION)

try:
    # Tạo bucket
    if REGION == 'us-east-1':
        s3.create_bucket(Bucket=BUCKET_NAME)
    else:
        s3.create_bucket(
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={'LocationConstraint': REGION}
        )
    
    print(f"✅ Đã tạo bucket: {BUCKET_NAME}")
    print(f"📍 Region: {REGION}")
    
except Exception as e:
    if 'BucketAlreadyExists' in str(e) or 'BucketAlreadyOwnedByYou' in str(e):
        print(f"⚠️  Bucket '{BUCKET_NAME}' đã tồn tại")
    else:
        print(f"❌ Lỗi: {e}")

