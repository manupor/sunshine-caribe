#!/usr/bin/env python3
import os
import glob

old_logos = [
    "images/sunshinecaribe_logo.png",
    "images/rooms/logo sunshine caribe.png"
]
new_logo = "images/sunshine/sunshine caribe.png"

html_files = glob.glob("*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    for old in old_logos:
        if old in content:
            content = content.replace(old, new_logo)
            changed = True
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Updated: {filepath}")
    else:
        print(f"⏭️  No changes: {filepath}")

print("\n🎉 Done!")
