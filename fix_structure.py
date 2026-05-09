import os
import re

def fix_navbar_structure(content, is_english=False):
    """Fix the broken navbar HTML structure"""
    
    if is_english:
        # English navbar
        navbar_html = """                <!-- Desktop Menu -->
                <nav id="main_menu" class="navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="active"><a href="index-en.html">HOME</a></li>
                        <li><a href="rooms-en.html">ROOMS</a></li>
                        <li><a href="index-en.html#puerto-viejo">PUERTO VIEJO</a></li>
                        <li><a href="blog-puerto-viejo-en.html">BLOG</a></li>
                        <li><a href="contact-en.html">CONTACT</a></li>
                        <li class="menu_button">
                            <a href="https://wa.me/50688932987" class="button sc-btn-secondary" target="_blank">BOOK NOW</a>
                        </li>
                    </ul>
                </nav>
                <!-- Mobile Menu -->"""
    else:
        # Spanish navbar
        navbar_html = """                <!-- Desktop Menu -->
                <nav id="main_menu" class="navbar-collapse">
                    <ul class="nav navbar-nav">
                        <li class="active"><a href="index.html">INICIO</a></li>
                        <li><a href="habitaciones.html">HABITACIONES</a></li>
                        <li><a href="index.html#puerto-viejo">PUERTO VIEJO</a></li>
                        <li><a href="blog-puerto-viejo.html">BLOG</a></li>
                        <li><a href="contacto.html">CONT&Aacute;CTANOS</a></li>
                        <li class="menu_button">
                            <a href="https://wa.me/50688932987" class="button sc-btn-secondary" target="_blank">RESERVAR</a>
                        </li>
                    </ul>
                </nav>
                <!-- Mobile Menu -->"""
    
    # Find and replace the broken navbar section
    # Pattern matches from <!-- Desktop Menu --> to <!-- Mobile Menu -->
    pattern = r'<!-- Desktop Menu -->\s*<nav id="main_menu"[^>]*>.*?</ul>\s*</nav>\s*<!-- Mobile Menu -->'
    
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, navbar_html, content, flags=re.DOTALL)
        return content
    return None

def fix_footer_structure(content, is_english=False):
    """Fix the footer to add language selector in a new column"""
    
    if is_english:
        # Find the Navigation widget and replace it with Navigation + Language
        old_pattern = r'<div class="col-md-2 col-sm-6 widget">\s*<h5>Navigation</h5>\s*<ul class="useful_links">\s*<li><a href="index-en\.html">Home</a></li>\s*<li><a href="rooms-en\.html">Rooms</a></li>\s*<li><a href="index-en\.html#puerto-viejo">Puerto Viejo</a></li>\s*<li><a href="contact-en\.html">Contact Us</a></li>\s*</ul>\s*</div>'
        
        new_widgets = """                        <div class="col-md-2 col-sm-6 widget">
                            <h5>Navigation</h5>
                            <ul class="useful_links">
                                <li><a href="index-en.html">Home</a></li>
                                <li><a href="rooms-en.html">Rooms</a></li>
                                <li><a href="index-en.html#puerto-viejo">Puerto Viejo</a></li>
                                <li><a href="contact-en.html">Contact Us</a></li>
                            </ul>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Language / Idioma</h5>
                            <ul class="useful_links">
                                <li><a href="index.html">🇪🇸 Español</a></li>
                                <li><a href="index-en.html">🇺🇸 English</a></li>
                            </ul>
                        </div>"""
    else:
        # Find the Navigation widget and replace it with Navigation + Language
        old_pattern = r'<div class="col-md-2 col-sm-6 widget">\s*<h5>Navegaci(?:&oacute;|ó)n</h5>\s*<ul class="useful_links">\s*<li><a href="index\.html">Inicio</a></li>\s*<li><a href="habitaciones\.html">Habitaciones</a></li>\s*<li><a href="index\.html#puerto-viejo">Puerto Viejo</a></li>\s*<li><a href="contacto\.html">Cont(?:&aacute;|á)ctanos</a></li>\s*</ul>\s*</div>'
        
        new_widgets = """                        <div class="col-md-2 col-sm-6 widget">
                            <h5>Navegaci&oacute;n</h5>
                            <ul class="useful_links">
                                <li><a href="index.html">Inicio</a></li>
                                <li><a href="habitaciones.html">Habitaciones</a></li>
                                <li><a href="index.html#puerto-viejo">Puerto Viejo</a></li>
                                <li><a href="contacto.html">Cont&aacute;ctanos</a></li>
                            </ul>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Idioma / Language</h5>
                            <ul class="useful_links">
                                <li><a href="index.html">🇪🇸 Español</a></li>
                                <li><a href="index-en.html">🇺🇸 English</a></li>
                            </ul>
                        </div>"""
    
    # Replace the navigation widget with navigation + language widgets
    if re.search(old_pattern, content, re.DOTALL):
        content = re.sub(old_pattern, new_widgets, content, flags=re.DOTALL)
        return content
    return None

# Process all HTML files
html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for filename in html_files:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    is_english = '-en.html' in filename or 'rooms-en.html' in filename or 'contact-en.html' in filename
    
    # Fix navbar
    new_content = fix_navbar_structure(content, is_english)
    if new_content:
        content = new_content
        print(f"✓ Fixed navbar: {filename}")
    else:
        print(f"✗ Could not fix navbar: {filename}")
        continue
    
    # Fix footer
    new_content = fix_footer_structure(content, is_english)
    if new_content:
        content = new_content
        print(f"✓ Fixed footer: {filename}")
    else:
        print(f"✗ Could not fix footer: {filename}")
    
    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nAll files processed!")
