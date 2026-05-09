import os

# Files that need the header fixed
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
    'index-en.html',
    'rooms-en.html'
]

for filename in files_to_fix:
    if not os.path.exists(filename):
        print(f"⚠ File not found: {filename}")
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if the file has the bg-solid class
    if '<header class="fixed bg-solid">' in content:
        new_content = content.replace('<header class="fixed bg-solid">', '<header class="fixed" id="main-header">')
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✓ Fixed header: {filename}")
    else:
        print(f"✓ No bg-solid found in: {filename}")

print("\nAll headers are now consistent!")
