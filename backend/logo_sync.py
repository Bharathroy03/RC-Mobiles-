import os
import shutil
from PIL import Image, ImageDraw, ImageFont

def ensure_logo(uploads_dir, images_dirs):
    """
    Checks for image files in the user's Images directories.
    If found, copies the image to uploads_dir/logo.png.
    If no image is present yet, generates a sleek high-res RC Mobiles logo badge.
    """
    os.makedirs(uploads_dir, exist_ok=True)
    target_logo_path = os.path.join(uploads_dir, "logo.png")

    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp')

    # Look for existing user logo image in given search directories
    for search_dir in images_dirs:
        if os.path.exists(search_dir):
            for file_name in os.listdir(search_dir):
                if file_name.lower().endswith(valid_extensions):
                    src_path = os.path.join(search_dir, file_name)
                    try:
                        shutil.copy(src_path, target_logo_path)
                        print(f"Synced logo image from {src_path} -> {target_logo_path}")
                        return target_logo_path
                    except Exception as e:
                        print(f"Failed copying {src_path}: {e}")

    # If target logo doesn't exist yet, generate a high-res RC Mobiles brand emblem logo
    if not os.path.exists(target_logo_path):
        create_default_rc_logo(target_logo_path)
    
    return target_logo_path

def create_default_rc_logo(output_path):
    width, height = 400, 400
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Circle background with gradient feel
    margin = 20
    draw.ellipse([margin, margin, width - margin, height - margin], fill=(30, 41, 59, 255), outline=(99, 102, 241, 255), width=8)

    # Outer glow / ring
    draw.ellipse([margin + 12, margin + 12, width - margin - 12, height - margin - 12], outline=(129, 140, 248, 180), width=3)

    # Draw stylized 'RC' text
    try:
        font_large = ImageFont.truetype("arial.ttf", 110)
        font_sub = ImageFont.truetype("arial.ttf", 26)
    except IOError:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    # RC emblem text
    draw.text((width // 2, height // 2 - 25), "RC", fill=(255, 255, 255, 255), font=font_large, anchor="mm")
    
    # Subtitle MOBILES
    draw.text((width // 2, height // 2 + 65), "MOBILES", fill=(129, 140, 248, 255), font=font_sub, anchor="mm")

    img.save(output_path, "PNG")
    print(f"Generated default RC Mobiles brand logo at {output_path}")
