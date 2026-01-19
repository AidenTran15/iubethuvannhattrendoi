"""
Script để tạo S3 bucket và Lambda function cho Our Memory app
Chạy: python setup_aws.py
Script sẽ tự động đọc AWS credentials từ ~/.aws/credentials hoặc environment variables
"""

import boto3
import json
import zipfile
import os
from botocore.exceptions import ClientError

# Cấu hình
BUCKET_NAME = 'iubethuvannheonheo-memories'
REGION = 'ap-southeast-2'  # Sydney region
LAMBDA_FUNCTION_NAME = 'upload-memory-to-s3'
LAMBDA_ROLE_NAME = 'lambda-s3-upload-role'

def get_aws_session():
    """Tạo AWS session tự động từ credentials file hoặc environment"""
    try:
        # Boto3 sẽ tự động đọc từ ~/.aws/credentials hoặc environment variables
        session = boto3.Session()
        return session
    except Exception as e:
        print(f"❌ Lỗi khi tạo AWS session: {e}")
        return None

def create_s3_bucket(session):
    """Tạo S3 bucket để lưu trữ hình ảnh"""
    s3_client = session.client('s3', region_name=REGION)
    
    try:
        print(f"Đang tạo S3 bucket: {BUCKET_NAME}...")
        
        # Kiểm tra bucket đã tồn tại chưa
        try:
            s3_client.head_bucket(Bucket=BUCKET_NAME)
            print(f"⚠️  Bucket {BUCKET_NAME} đã tồn tại")
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
                print(f"✅ Đã tạo S3 bucket: {BUCKET_NAME}")
            else:
                raise
        
        # Cấu hình CORS để cho phép upload từ web
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
        print(f"✅ Đã cấu hình CORS cho bucket")
        
        # Cấu hình public read access cho hình ảnh
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
        print(f"✅ Đã cấu hình public read access")
        
        return True
        
    except ClientError as e:
        print(f"❌ Lỗi khi tạo bucket: {e}")
        return False

def create_iam_role(session):
    """Tạo IAM role cho Lambda function"""
    iam_client = session.client('iam')
    
    try:
        print(f"Đang tạo IAM role: {LAMBDA_ROLE_NAME}...")
        
        # Trust policy cho Lambda
        trust_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }
        
        # Tạo role
        try:
            role = iam_client.create_role(
                RoleName=LAMBDA_ROLE_NAME,
                AssumeRolePolicyDocument=json.dumps(trust_policy),
                Description='Role for Lambda to upload to S3'
            )
            print(f"✅ Đã tạo IAM role: {LAMBDA_ROLE_NAME}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'EntityAlreadyExists':
                print(f"⚠️  Role {LAMBDA_ROLE_NAME} đã tồn tại")
                role = iam_client.get_role(RoleName=LAMBDA_ROLE_NAME)
            else:
                raise
        
        role_arn = role['Role']['Arn']
        
        # Attach policies
        try:
            iam_client.attach_role_policy(
                RoleName=LAMBDA_ROLE_NAME,
                PolicyArn='arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
            )
            print(f"✅ Đã attach Lambda execution policy")
        except ClientError as e:
            if e.response['Error']['Code'] != 'EntityAlreadyExists':
                print(f"⚠️  Policy đã được attach")
        
        # Tạo và attach policy cho S3 access
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
        
        iam_client.put_role_policy(
            RoleName=LAMBDA_ROLE_NAME,
            PolicyName='S3AccessPolicy',
            PolicyDocument=json.dumps(s3_policy)
        )
        print(f"✅ Đã cấu hình S3 access policy")
        
        return role_arn
        
    except ClientError as e:
        print(f"❌ Lỗi khi tạo role: {e}")
        return None

def create_lambda_function(session, role_arn):
    """Tạo Lambda function để xử lý upload"""
    lambda_client = session.client('lambda', region_name=REGION)
    
    try:
        print(f"Đang tạo Lambda function: {LAMBDA_FUNCTION_NAME}...")
        
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
        
        # Tạo Lambda function
        try:
            response = lambda_client.create_function(
                FunctionName=LAMBDA_FUNCTION_NAME,
                Runtime='python3.11',
                Role=role_arn,
                Handler='lambda_function.lambda_handler',
                Code={'ZipFile': zip_content},
                Description='Upload memory images to S3',
                Timeout=30,
                MemorySize=256,
                Environment={
                    'Variables': {
                        'BUCKET_NAME': BUCKET_NAME
                    }
                }
            )
            print(f"✅ Đã tạo Lambda function: {LAMBDA_FUNCTION_NAME}")
            
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceConflictException':
                print(f"⚠️  Lambda function {LAMBDA_FUNCTION_NAME} đã tồn tại, đang cập nhật...")
                # Update function code
                lambda_client.update_function_code(
                    FunctionName=LAMBDA_FUNCTION_NAME,
                    ZipFile=zip_content
                )
                print(f"✅ Đã cập nhật Lambda function: {LAMBDA_FUNCTION_NAME}")
            else:
                raise
        
        # Xóa zip file
        if os.path.exists(zip_path):
            os.remove(zip_path)
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo Lambda function: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 AWS Setup cho Our Memory App")
    print("=" * 60)
    print()
    
    # Tạo AWS session (tự động đọc credentials)
    session = get_aws_session()
    if not session:
        print("❌ Không thể tạo AWS session")
        print("Vui lòng kiểm tra:")
        print("  - File ~/.aws/credentials có tồn tại không")
        print("  - Hoặc set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY")
        return
    
    # Kiểm tra AWS credentials
    try:
        sts = session.client('sts')
        identity = sts.get_caller_identity()
        print(f"✅ Đã xác thực AWS")
        print(f"   Account ID: {identity.get('Account')}")
        print(f"   User/Role: {identity.get('Arn', '').split('/')[-1]}")
        print()
    except Exception as e:
        print(f"❌ Lỗi xác thực AWS: {e}")
        print("Vui lòng kiểm tra AWS credentials trong file ~/.aws/credentials")
        return
    
    # Tạo S3 bucket
    if not create_s3_bucket(session):
        return
    print()
    
    # Tạo IAM role
    role_arn = create_iam_role(session)
    if not role_arn:
        return
    print()
    
    # Tạo Lambda function
    if not create_lambda_function(session, role_arn):
        return
    print()
    
    print("=" * 60)
    print("✅ Setup hoàn tất!")
    print("=" * 60)
    print()
    print("📋 Thông tin cấu hình:")
    print(f"   • S3 Bucket: {BUCKET_NAME}")
    print(f"   • Region: {REGION}")
    print(f"   • Lambda Function: {LAMBDA_FUNCTION_NAME}")
    print()
    print("📝 Bước tiếp theo:")
    print("1. Tạo file .env trong thư mục root của React app:")
    print("   REACT_APP_AWS_ACCESS_KEY_ID=your_access_key_here")
    print("   REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key_here")
    print()
    print("   (Lấy credentials từ file ~/.aws/credentials hoặc AWS Console)")
    print()
    print("2. Region đã được cấu hình là 'ap-southeast-2' trong OurMemory.js")
    print()
    print("3. Restart React app: npm start")
    print()

if __name__ == '__main__':
    main()
