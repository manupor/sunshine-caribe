import os
import re

# Files to fix - remove bg-solid class from header
files_to_fix = [
    'blog-actividades-aventura.html',
    'blog-cultura-afrocaribena.html',
    'blog-donde-hospedarse.html',
    'blog-gastronomia-caribe.html',
    'blog-parque-cahuita.html',
    'blog-playas-puerto-viejo.html',
    'blog-puerto-viejo-en.html',
    'blog-puerto-viejo.html',
    'contact-en.html',
    'contacto.html',
    'habitaciones.html',
    'index-en.html',
    'rooms-en.html'
]

for filename in files_to_fix:
    if not os.path.exists(filename):
        print(f"⚠ File not found: {filename}")
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace <header class="fixed bg-solid"> with <header class="fixed">
    # Keep id if it exists, add id="main-header" if not
    new_content = re.sub(
        r'<header class="fixed bg-solid">',
        '<header class="fixed" id="main-header">',
        content
    )
    
    # Also handle case where it might have other classes
    new_content = re.sub(
        r'<header class="([^"]*)bg-solid([^"]*)"',
        lambda m: f'<header class="{m.group(1).strip()} {m.group(2).strip()}"'.replace('  ', ' ').strip(),
        new_content
    )
    
    if new_content != content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ Fixed navbar: {filename}")
    else:
        print(f"✓ No change needed: {filename}")

print("\nAll navbar styles made consistent!")
