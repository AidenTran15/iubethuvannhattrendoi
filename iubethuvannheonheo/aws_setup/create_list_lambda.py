"""
Script để tạo Lambda function list memories từ S3
"""

import boto3
import json
import zipfile
import os
from botocore.exceptions import ClientError

# AWS Configuration
REGION = 'ap-southeast-2'
BUCKET_NAME = 'iubethuvannheonheo-memories'
LAMBDA_FUNCTION_NAME = 'list-memories-from-s3'
LAMBDA_ROLE_NAME = 'webthuvan-role-trp7mccw'  # Sử dụng role hiện tại

# Initialize clients
lambda_client = boto3.client('lambda', region_name=REGION)
iam_client = boto3.client('iam', region_name=REGION)

def get_role_arn(role_name):
    """Get IAM role ARN"""
    try:
        response = iam_client.get_role(RoleName=role_name)
        return response['Role']['Arn']
    except Exception as e:
        print(f"Error getting role: {e}")
        return None

def create_lambda_function():
    """Create or update Lambda function"""
    role_arn = get_role_arn(LAMBDA_ROLE_NAME)
    
    if not role_arn:
        print(f"❌ Không tìm thấy role: {LAMBDA_ROLE_NAME}")
        return False
    
    print(f"✅ Found role ARN: {role_arn}")
    
    # Check if lambda function file exists
    lambda_file = 'list_memories_lambda.py'
    if not os.path.exists(lambda_file):
        print(f"❌ Không tìm thấy file: {lambda_file}")
        print("   Vui lòng đảm bảo bạn đang chạy script từ thư mục aws_setup")
        return False
    
    # Create zip file for Lambda function
    zip_path = 'list_memories_lambda.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(lambda_file, 'lambda_function.py')  # Lambda expects handler file name
    
    # Read zip file
    with open(zip_path, 'rb') as f:
        zip_content = f.read()
    
    # Check if function exists
    try:
        lambda_client.get_function(FunctionName=LAMBDA_FUNCTION_NAME)
        print(f"📝 Function {LAMBDA_FUNCTION_NAME} đã tồn tại, đang cập nhật...")
        
        # Update function code
        response = lambda_client.update_function_code(
            FunctionName=LAMBDA_FUNCTION_NAME,
            ZipFile=zip_content
        )
        print(f"✅ Đã cập nhật function code")
        
        # Update environment variables
        lambda_client.update_function_configuration(
            FunctionName=LAMBDA_FUNCTION_NAME,
            Environment={
                'Variables': {
                    'BUCKET_NAME': BUCKET_NAME,
                    'AWS_REGION': REGION
                }
            }
        )
        print(f"✅ Đã cập nhật environment variables")
        
    except lambda_client.exceptions.ResourceNotFoundException:
        print(f"📝 Tạo function mới: {LAMBDA_FUNCTION_NAME}")
        
        # Create function
        response = lambda_client.create_function(
            FunctionName=LAMBDA_FUNCTION_NAME,
            Runtime='python3.11',
            Role=role_arn,
            Handler='lambda_function.lambda_handler',  # Changed to match zip file name
            Code={'ZipFile': zip_content},
            Description='List memories from S3 bucket',
            Timeout=30,
            MemorySize=128,
            Environment={
                'Variables': {
                    'BUCKET_NAME': BUCKET_NAME,
                    'AWS_REGION': REGION
                }
            }
        )
        print(f"✅ Đã tạo function: {response['FunctionArn']}")
    
    # Clean up zip file
    if os.path.exists(zip_path):
        os.remove(zip_path)
    
    # Ensure Lambda has S3 ListBucket permission
    print("\n📝 Đang kiểm tra quyền S3...")
    try:
        # Get current role policies
        role_policies = iam_client.list_role_policies(RoleName=LAMBDA_ROLE_NAME)
        
        # Check if S3 policy exists
        s3_policy_name = 'S3ListMemoriesPolicy'
        if s3_policy_name not in role_policies['PolicyNames']:
            # Create inline policy
            policy_document = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "s3:ListBucket",
                            "s3:GetObject"
                        ],
                        "Resource": [
                            f"arn:aws:s3:::{BUCKET_NAME}",
                            f"arn:aws:s3:::{BUCKET_NAME}/*"
                        ]
                    }
                ]
            }
            
            iam_client.put_role_policy(
                RoleName=LAMBDA_ROLE_NAME,
                PolicyName=s3_policy_name,
                PolicyDocument=json.dumps(policy_document)
            )
            print(f"✅ Đã thêm quyền S3 ListBucket cho Lambda role")
        else:
            print(f"✅ Quyền S3 đã tồn tại")
    except Exception as e:
        print(f"⚠️ Lỗi khi thêm quyền: {e}")
        print("   Bạn có thể thêm quyền thủ công trong IAM Console")
    
    print(f"\n✅ Hoàn tất! Lambda function '{LAMBDA_FUNCTION_NAME}' đã sẵn sàng")
    print(f"\n📝 Bước tiếp theo:")
    print(f"   1. Vào API Gateway Console")
    print(f"   2. Thêm resource/method mới để gọi Lambda này")
    print(f"   3. Deploy API")
    
    return True

if __name__ == '__main__':
    print("🚀 Bắt đầu tạo Lambda function để list memories...\n")
    create_lambda_function()

