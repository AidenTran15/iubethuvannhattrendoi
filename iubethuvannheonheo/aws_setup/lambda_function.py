"""
Lambda function để xử lý upload hình ảnh lên S3
"""

import json
import os
import boto3
import base64
from datetime import datetime

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda handler để upload hình ảnh lên S3
    
    Event format:
    {
        "date": "2025-12-24",
        "image": "base64_encoded_image",
        "filename": "image.jpg",
        "contentType": "image/jpeg"
    }
    """
    
    bucket_name = os.environ.get('BUCKET_NAME', 'iubethuvannheonheo-memories')
    
    try:
        # Parse event
        if isinstance(event, str):
            event = json.loads(event)
        
        date = event.get('date')
        image_data = event.get('image')
        filename = event.get('filename', 'image.jpg')
        content_type = event.get('contentType', 'image/jpeg')
        
        if not date or not image_data:
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Missing required fields: date and image'
                })
            }
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Tạo key cho S3
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        s3_key = f"memories/{date}/{timestamp}_{filename}"
        
        # Upload lên S3
        # Lưu ý: Không dùng ACL vì bucket đã tắt ACLs
        # Public access được control qua bucket policy
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=image_bytes,
            ContentType=content_type
        )
        
        # Tạo URL với region
        region = os.environ.get('AWS_REGION', 'ap-southeast-2')
        image_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{s3_key}"
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Upload successful',
                'url': image_url,
                'key': s3_key
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

