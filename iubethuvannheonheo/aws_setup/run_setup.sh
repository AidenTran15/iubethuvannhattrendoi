#!/bin/bash

echo "========================================"
echo "AWS Setup cho Our Memory App"
echo "========================================"
echo ""

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python chưa được cài đặt!"
    echo "Vui lòng cài đặt Python 3.8+ từ https://www.python.org/"
    exit 1
fi

# Cài đặt dependencies
echo "Đang cài đặt dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Lỗi khi cài đặt dependencies!"
    exit 1
fi

echo ""
echo "Đang chạy setup script..."
echo ""

# Chạy setup script
python3 setup_aws.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Setup thất bại!"
    exit 1
fi

echo ""
echo "✅ Hoàn tất!"

