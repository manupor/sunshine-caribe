import os
import re

# Standard footer templates
footer_es = '''        <!-- FOOTER -->
        <footer>
            <div class="inner">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 col-sm-6 widget">
                            <div class="about sc-footer-logo">
                                <img src="images/rooms/logo sunshine caribe.png" height="50" alt="Sunshine Caribe">
                                <p style="margin-top:16px">Tu hogar en el Caribe Sur de Costa Rica. A pasos de las playas de arena negra de Puerto Viejo de Talamanca.</p>
                            </div>
                        </div>
                        <div class="col-md-2 col-sm-6 widget">
                            <h5>Navegaci&oacute;n</h5>
                            <ul class="useful_links">
                                <li><a href="index.html">Inicio</a></li>
                                <li><a href="habitaciones.html">Habitaciones</a></li>
                                <li><a href="index.html#puerto-viejo">Puerto Viejo</a></li>
                                <li><a href="contacto.html">Cont&aacute;ctanos</a></li>
                            </ul>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Cont&aacute;ctanos</h5>
                            <address>
                                <ul class="address_details">
                                    <li><i class="fa fa-map-marker"></i> Puerto Viejo de Talamanca, Lim&oacute;n, Costa Rica</li>
                                    <li><i class="fa fa-whatsapp"></i> <a href="https://wa.me/50688932987" target="_blank">WhatsApp</a></li>
                                    <li><i class="fa fa-envelope"></i> <a href="mailto:reservaciones@sunshinecaribe.com">reservaciones@sunshinecaribe.com</a></li>
                                    <li><i class="fa fa-envelope"></i> <a href="mailto:jilmatica@outlook.com">jilmatica@outlook.com</a></li>
                                </ul>
                            </address>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Reservaciones</h5>
                            <p>Para reservar, cont&aacute;ctenos por WhatsApp o por correo electr&oacute;nico. Aceptamos dep&oacute;sitos bancarios al BNCR.</p>
                            <a href="https://wa.me/50688932987" class="button sc-btn-whatsapp-outline mt20" target="_blank"><i class="fa fa-whatsapp"></i> RESERVAR AHORA</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="subfooter">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6 col-sm-6">
                            <div class="copyrights">&copy; 2025 <a href="index.html">Sunshine Caribe</a> &mdash; Todos los derechos reservados.</div>
                        </div>
                        <div class="col-md-6 col-sm-6">
                            <div class="social_media">
                                <a class="facebook" href="#" title="Facebook"><i class="fa fa-facebook"></i></a>
                                <a class="instagram" href="#" title="Instagram"><i class="fa fa-instagram"></i></a>
                                <a class="sc-wa" href="https://wa.me/50688932987" target="_blank" title="WhatsApp"><i class="fa fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>'''

footer_en = '''        <!-- FOOTER -->
        <footer>
            <div class="inner">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 col-sm-6 widget">
                            <div class="about sc-footer-logo">
                                <img src="images/rooms/logo sunshine caribe.png" height="50" alt="Sunshine Caribe">
                                <p style="margin-top:16px">Your home in the South Caribbean of Costa Rica. Steps away from the black sand beaches of Puerto Viejo de Talamanca.</p>
                            </div>
                        </div>
                        <div class="col-md-2 col-sm-6 widget">
                            <h5>Navigation</h5>
                            <ul class="useful_links">
                                <li><a href="index-en.html">Home</a></li>
                                <li><a href="rooms-en.html">Rooms</a></li>
                                <li><a href="index-en.html#puerto-viejo">Puerto Viejo</a></li>
                                <li><a href="contact-en.html">Contact Us</a></li>
                            </ul>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Contact Us</h5>
                            <address>
                                <ul class="address_details">
                                    <li><i class="fa fa-map-marker"></i> Puerto Viejo de Talamanca, Lim&oacute;n, Costa Rica</li>
                                    <li><i class="fa fa-whatsapp"></i> <a href="https://wa.me/50688932987" target="_blank">WhatsApp</a></li>
                                    <li><i class="fa fa-envelope"></i> <a href="mailto:reservaciones@sunshinecaribe.com">reservaciones@sunshinecaribe.com</a></li>
                                    <li><i class="fa fa-envelope"></i> <a href="mailto:jilmatica@outlook.com">jilmatica@outlook.com</a></li>
                                </ul>
                            </address>
                        </div>
                        <div class="col-md-3 col-sm-6 widget">
                            <h5>Reservations</h5>
                            <p>To book, contact us via WhatsApp or email. We accept bank deposits to BNCR.</p>
                            <a href="https://wa.me/50688932987" class="button sc-btn-whatsapp-outline mt20" target="_blank"><i class="fa fa-whatsapp"></i> BOOK NOW</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="subfooter">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6 col-sm-6">
                            <div class="copyrights">&copy; 2025 <a href="index-en.html">Sunshine Caribe</a> &mdash; All rights reserved.</div>
                        </div>
                        <div class="col-md-6 col-sm-6">
                            <div class="social_media">
                                <a class="facebook" href="#" title="Facebook"><i class="fa fa-facebook"></i></a>
                                <a class="instagram" href="#" title="Instagram"><i class="fa fa-instagram"></i></a>
                                <a class="sc-wa" href="https://wa.me/50688932987" target="_blank" title="WhatsApp"><i class="fa fa-whatsapp"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>'''

# Files to fix
files_config = {
    'index.html': footer_es,
    'habitaciones.html': footer_es,
    'contacto.html': footer_es,
    'blog-puerto-viejo.html': footer_es,
    'index-en.html': footer_en,
    'rooms-en.html': footer_en,
    'contact-en.html': footer_en,
    'blog-puerto-viejo-en.html': footer_en,
}

for filename, new_footer in files_config.items():
    if not os.path.exists(filename):
        print(f"⚠ File not found: {filename}")
        continue
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace footer section
    pattern = r'<!-- FOOTER -->.*?<!-- FOOTER -->'
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(pattern, new_footer, content, flags=re.DOTALL)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Restored footer: {filename}")
    else:
        print(f"✗ Footer pattern not found in: {filename}")

print("\nAll footers restored to Zante theme style!")
