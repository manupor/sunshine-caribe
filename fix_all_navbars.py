import os
import re

# List of HTML files to fix
files_to_fix = [
    'index.html', 'index-en.html', 
    'habitaciones.html', 'rooms-en.html',
    'contacto.html', 'contact-en.html',
    'blog-puerto-viejo.html', 'blog-puerto-viejo-en.html'
]

# Pattern to find and remove the broken language selector remnants
# This matches: a random <li> with a link, closing </ul>, closing </li>, then menu_button
pattern = r'<li><a href="[^"]*">[^<]*</a></li>\s*</ul>\s*</li>\s*<li class="menu_button">'

replacement = '<li class="menu_button">'

for filename in files_to_fix:
    if not os.path.exists(filename):
        print(f"⚠ File not found: {filename}")
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Apply the fix
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ Fixed: {filename}")
    else:
        print(f"✗ No change needed: {filename}")

print("\nAll navbar structures repaired!")
