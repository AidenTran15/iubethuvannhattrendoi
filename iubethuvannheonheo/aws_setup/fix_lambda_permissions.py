"""
Script để cấp quyền S3 cho Lambda function role
Chạy: python fix_lambda_permissions.py
"""

import boto3
import json
from botocore.exceptions import ClientError

# Cấu hình
BUCKET_NAME = 'iubethuvannheonheo-memories'
LAMBDA_FUNCTION_NAME = 'upload-memory-to-s3'
REGION = 'ap-southeast-2'

def get_lambda_role_arn():
    """Lấy ARN của role hiện tại của Lambda function"""
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    try:
        response = lambda_client.get_function(FunctionName=LAMBDA_FUNCTION_NAME)
        role_arn = response['Configuration']['Role']
        role_name = role_arn.split('/')[-1]
        print(f"✅ Tìm thấy Lambda function")
        print(f"   Function: {LAMBDA_FUNCTION_NAME}")
        print(f"   Role ARN: {role_arn}")
        print(f"   Role Name: {role_name}")
        print()
        return role_arn, role_name
    except ClientError as e:
        print(f"❌ Không tìm thấy Lambda function: {e}")
        return None, None

def attach_s3_policy_to_role(role_name):
    """Attach S3 policy vào IAM role"""
    iam_client = boto3.client('iam')
    
    try:
        print(f"🔧 Đang cấp quyền S3 cho role: {role_name}...")
        
        # Tạo inline policy cho S3 access
        s3_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:PutObject",
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:ListBucket"
                    ],
                    "Resource": [
                        f"arn:aws:s3:::{BUCKET_NAME}",
                        f"arn:aws:s3:::{BUCKET_NAME}/*"
                    ]
                }
            ]
        }
        
        policy_name = 'S3MemoryBucketAccess'
        
        # Kiểm tra policy đã tồn tại chưa
        try:
            existing_policy = iam_client.get_role_policy(
                RoleName=role_name,
                PolicyName=policy_name
            )
            print(f"⚠️  Policy '{policy_name}' đã tồn tại, đang cập nhật...")
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchEntity':
                print(f"📝 Tạo policy mới: {policy_name}")
            else:
                raise
        
        # Put policy
        iam_client.put_role_policy(
            RoleName=role_name,
            PolicyName=policy_name,
            PolicyDocument=json.dumps(s3_policy)
        )
        
        print(f"✅ Đã cấp quyền S3 cho role: {role_name}")
        print()
        print("📋 Quyền đã được cấp:")
        print(f"   • s3:PutObject trên {BUCKET_NAME}/*")
        print(f"   • s3:GetObject trên {BUCKET_NAME}/*")
        print(f"   • s3:DeleteObject trên {BUCKET_NAME}/*")
        print(f"   • s3:ListBucket trên {BUCKET_NAME}")
        
        return True
        
    except ClientError as e:
        print(f"❌ Lỗi khi cấp quyền: {e}")
        print()
        print("💡 Kiểm tra:")
        print("  1. Bạn có quyền quản lý IAM roles không?")
        print("  2. Role name có đúng không?")
        return False

def main():
    print("=" * 60)
    print("🔧 Cấp quyền S3 cho Lambda Function")
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
    
    # Lấy role của Lambda function
    role_arn, role_name = get_lambda_role_arn()
    if not role_arn or not role_name:
        return
    
    # Cấp quyền S3
    if attach_s3_policy_to_role(role_name):
        print()
        print("=" * 60)
        print("✅ Hoàn tất!")
        print("=" * 60)
        print()
        print("🧪 Bước tiếp theo:")
        print("  1. Đợi vài giây để IAM policy propagate")
        print("  2. Test lại Lambda function trong AWS Console")
        print("  3. Nếu vẫn lỗi, đợi thêm 1-2 phút rồi thử lại")
        print()

if __name__ == '__main__':
    main()

