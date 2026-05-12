#!/usr/bin/env python3
import os
import glob

old_logo = "images/rooms/logo sunshine caribe.png"
new_logo = "images/sunshinecaribe_logo.png"

html_files = glob.glob("*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_logo in content:
        new_content = content.replace(old_logo, new_logo)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ Updated: {filepath}")
    else:
        print(f"⏭️  No changes: {filepath}")

print("\n🎉 Logo replacement complete!")
