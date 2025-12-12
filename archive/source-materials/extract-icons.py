#!/usr/bin/env python3
"""
Extract individual stakeholder icons from the combined image.
Each icon will be saved as a separate PNG file with consistent sizing and transparent background.
"""

from PIL import Image
import os

# Define the stakeholder names in order (left to right in the image)
stakeholders = [
    'policy-makers',
    'grid-operators',
    'industry',
    'csos-ngos',
    'public',
    'scientific',
    'finance'
]

def make_transparent(img, tolerance=30):
    """Convert white/light backgrounds to transparent"""
    img = img.convert('RGBA')
    data = img.getdata()

    new_data = []
    for item in data:
        # Change all white/near-white (based on tolerance) to transparent
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    return img

def extract_icons():
    # Load the source image
    source_path = 'source-photos/stakeholder-icons.png'
    img = Image.open(source_path)

    # Get image dimensions
    width, height = img.size
    print(f"Source image size: {width}x{height}")

    # Calculate approximate width per icon (7 icons)
    icon_width = width // 7

    # Create output directory if it doesn't exist
    output_dir = 'public/icons'
    os.makedirs(output_dir, exist_ok=True)

    # Extract each icon
    for i, stakeholder_name in enumerate(stakeholders):
        # Calculate the bounding box for this icon
        left = i * icon_width
        right = (i + 1) * icon_width

        # Crop ONLY the icon part (top 60% - excludes text at bottom)
        # The text labels are at the bottom, so we crop to just get the icon graphic
        top = 5
        bottom = int(height * 0.55)  # Take only top 55% to exclude text

        icon_box = (left + 10, top, right - 10, bottom)
        icon = img.crop(icon_box)

        # Make background transparent
        icon = make_transparent(icon, tolerance=40)

        # Resize to a standard size (128x128) while maintaining aspect ratio
        target_size = 128
        icon.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)

        # Create a new transparent image
        final_icon = Image.new('RGBA', (target_size, target_size), (255, 255, 255, 0))

        # Center the icon
        offset = ((target_size - icon.width) // 2, (target_size - icon.height) // 2)
        final_icon.paste(icon, offset, icon if icon.mode == 'RGBA' else None)

        # Save the icon
        output_path = os.path.join(output_dir, f'{stakeholder_name}.png')
        final_icon.save(output_path, 'PNG')
        print(f"Saved: {output_path} ({icon.width}x{icon.height} -> {target_size}x{target_size})")

    print(f"\nSuccessfully extracted {len(stakeholders)} icons with transparent backgrounds!")
    print("\nMissing icons (need to be created separately):")
    print("- regional-bodies")
    print("- development-partners")

if __name__ == '__main__':
    extract_icons()
