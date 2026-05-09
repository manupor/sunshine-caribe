#!/usr/bin/env python3
"""
Add jPushMenu.js script to all HTML pages
"""

import os
import re

# List of HTML files to fix
html_files = [
    'habitaciones.html',
    'contacto.html',
    'contact-en.html',
    'rooms-en.html',
    'blog-puerto-viejo.html',
    'blog-puerto-viejo-en.html',
    'blog-actividades-aventura.html',
    'blog-cultura-afrocaribena.html',
    'blog-donde-hospedarse.html',
    'blog-gastronomia-caribe.html',
    'blog-parque-cahuita.html',
    'blog-playas-puerto-viejo.html',
    '404.html'
]

# Pattern to find and replace (handles different indentation)
old_pattern = r'<script type="text/javascript" src="js/jquery\.easing\.min\.js"></script>\n\s*<script type="text/javascript" src="js/main\.js"></script>'
new_replacement = r'<script type="text/javascript" src="js/jquery.easing.min.js"></script>\n    <script type="text/javascript" src="js/jPushMenu.js"></script>\n    <script type="text/javascript" src="js/main.js"></script>'

print("Starting jPushMenu fix script...")

for filename in html_files:
    filepath = os.path.join('/Users/manu/Downloads/hotel-zante-hotel-html-template-2025-02-04-13-36-06-utc/Zante', filename)
    
    print(f"Processing: {filename}")
    
    if not os.path.exists(filepath):
        print(f"  ⚠️ File not found: {filename}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if jPushMenu is already included
    if 'jPushMenu.js' in content:
        print(f"  ✅ jPushMenu.js already included")
        continue
    
    # Simple string replacement
    old_str = '<script type="text/javascript" src="js/jquery.easing.min.js"></script>\n    <script type="text/javascript" src="js/main.js"></script>'
    new_str = '<script type="text/javascript" src="js/jquery.easing.min.js"></script>\n    <script type="text/javascript" src="js/jPushMenu.js"></script>\n    <script type="text/javascript" src="js/main.js"></script>'
    
    if old_str in content:
        new_content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ Fixed!")
    else:
        print(f"  ⚠️ Pattern not found")

print("\n🎉 Done! All HTML files updated.")
