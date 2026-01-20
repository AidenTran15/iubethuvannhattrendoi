"""
Lambda function để list memories từ S3 theo date
"""

import json
import os
import boto3

s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    Lambda handler để list memories từ S3
    
    Event format (query string):
    ?date=2025-12-24
    
    Hoặc trong body:
    {
        "date": "2025-12-24"
    }
    """
    
    bucket_name = os.environ.get('BUCKET_NAME', 'iubethuvannheonheo-memories')
    
    try:
        # Parse event - có thể từ query string hoặc body
        date = None
        
        # Check query string parameters
        if event.get('queryStringParameters'):
            date = event['queryStringParameters'].get('date')
        
        # Check body
        if not date and event.get('body'):
            if isinstance(event['body'], str):
                body = json.loads(event['body'])
            else:
                body = event['body']
            date = body.get('date')
        
        if not date:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'error': 'Missing required parameter: date'
                })
            }
        
        # List objects với prefix
        prefix = f"memories/{date}/"
        
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix
        )
        
        # Tạo URLs cho các objects
        region = os.environ.get('AWS_REGION', 'ap-southeast-2')
        memories = []
        
        if 'Contents' in response:
            for item in response['Contents']:
                key = item['Key']
                # Skip folders (keys ending with /)
                if not key.endswith('/'):
                    url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{key}"
                    memories.append({
                        'key': key,
                        'url': url,
                        'lastModified': item['LastModified'].isoformat() if 'LastModified' in item else None,
                        'size': item.get('Size', 0)
                    })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'date': date,
                'memories': memories,
                'count': len(memories)
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': str(e)
            })
        }

