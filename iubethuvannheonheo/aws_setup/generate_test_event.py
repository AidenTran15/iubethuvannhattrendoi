"""
Script để generate test event JSON cho Lambda function
Có thể tạo test event từ file ảnh hoặc sử dụng ảnh mẫu
"""

import json
import base64
import os
from datetime import datetime

def create_test_event_from_file(image_path, date=None, filename=None):
    """
    Tạo test event từ file ảnh
    
    Args:
        image_path: Đường dẫn đến file ảnh
        date: Ngày (format: YYYY-MM-DD), mặc định là hôm nay
        filename: Tên file, mặc định lấy từ image_path
    """
    if not os.path.exists(image_path):
        print(f"❌ Không tìm thấy file: {image_path}")
        return None
    
    # Đọc file ảnh và encode base64
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
    
    # Xác định content type
    ext = os.path.splitext(image_path)[1].lower()
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    content_type = content_types.get(ext, 'image/jpeg')
    
    # Lấy tên file
    if not filename:
        filename = os.path.basename(image_path)
    
    # Lấy ngày
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    
    # Tạo event
    event = {
        "date": date,
        "image": image_base64,
        "filename": filename,
        "contentType": content_type
    }
    
    return event

def create_simple_test_event():
    """Tạo test event đơn giản với ảnh 1x1 pixel"""
    # 1x1 pixel PNG (transparent)
    tiny_png_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    event = {
        "date": datetime.now().strftime('%Y-%m-%d'),
        "image": tiny_png_base64,
        "filename": "test_image.png",
        "contentType": "image/png"
    }
    
    return event

def main():
    print("=" * 60)
    print("🧪 Generate Test Event cho Lambda Function")
    print("=" * 60)
    print()
    
    print("Chọn cách tạo test event:")
    print("1. Sử dụng ảnh mẫu (1x1 pixel - nhanh)")
    print("2. Từ file ảnh")
    print()
    
    choice = input("Nhập lựa chọn (1 hoặc 2): ").strip()
    
    if choice == "1":
        event = create_simple_test_event()
        print("✅ Đã tạo test event với ảnh mẫu")
    elif choice == "2":
        image_path = input("Nhập đường dẫn đến file ảnh: ").strip().strip('"')
        date = input("Nhập ngày (YYYY-MM-DD) hoặc Enter để dùng hôm nay: ").strip()
        if not date:
            date = None
        
        event = create_test_event_from_file(image_path, date=date)
        if not event:
            return
        print("✅ Đã tạo test event từ file ảnh")
    else:
        print("❌ Lựa chọn không hợp lệ")
        return
    
    # Lưu vào file
    output_file = "test_event.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(event, f, indent=2, ensure_ascii=False)
    
    print()
    print(f"✅ Đã lưu test event vào: {output_file}")
    print()
    print("📋 Thông tin test event:")
    print(f"   • Date: {event['date']}")
    print(f"   • Filename: {event['filename']}")
    print(f"   • Content Type: {event['contentType']}")
    print(f"   • Image size: {len(event['image'])} characters (base64)")
    print()
    print("💡 Bước tiếp theo:")
    print("   1. Mở AWS Lambda Console")
    print("   2. Chọn function 'upload-memory-to-s3'")
    print("   3. Vào tab 'Test'")
    print("   4. Copy nội dung file test_event.json vào Event JSON")
    print("   5. Click 'Test' để chạy")

if __name__ == '__main__':
    main()

