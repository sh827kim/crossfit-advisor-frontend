#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

def create_icon(size):
    """파란색 배경에 흰색 덤벨을 그린 아이콘 생성"""
    # 이미지 생성 (파란색 배경)
    img = Image.new('RGB', (size, size), color='#2563EB')
    draw = ImageDraw.Draw(img)

    # 덤벨 그리기 (흰색)
    # 왼쪽 원판
    left_circle_bbox = [
        size * 0.13,
        size * 0.38,
        size * 0.37,
        size * 0.62
    ]
    draw.ellipse(left_circle_bbox, fill='white')

    # 중앙 바
    bar_bbox = [
        size * 0.35,
        size * 0.45,
        size * 0.65,
        size * 0.55
    ]
    draw.rectangle(bar_bbox, fill='white')

    # 오른쪽 원판
    right_circle_bbox = [
        size * 0.63,
        size * 0.38,
        size * 0.87,
        size * 0.62
    ]
    draw.ellipse(right_circle_bbox, fill='white')

    return img

# public 디렉토리 확인
public_dir = os.path.join(os.path.dirname(__file__), '../public')
os.makedirs(public_dir, exist_ok=True)

# 192x192와 512x512 아이콘 생성
sizes = [192, 512]
for size in sizes:
    img = create_icon(size)
    icon_path = os.path.join(public_dir, f'icon-{size}x{size}.png')
    img.save(icon_path, 'PNG')
    print(f'✅ Generated: {icon_path}')

print('\n✨ PWA 아이콘이 성공적으로 생성되었습니다!')
