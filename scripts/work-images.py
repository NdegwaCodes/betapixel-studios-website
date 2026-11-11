from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
from watermark import watermark

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'images'
OUT = ROOT / 'src' / 'assets' / 'work'
RAW = SRC / 'crops-raw'
OG = ROOT / 'public' / 'og'
for d in (OUT, RAW, OG):
    d.mkdir(parents=True, exist_ok=True)

def src(name):
    return Image.open(SRC / f'{name}.png').convert('RGB')

GROUPS = {
    'uv-printer': ('uv-dtf-stickers-printer-full-colour-transfers', 'uv-dtf-stickers-printer-full-colour-transfers'),
    'uv-peel':    ('uv-dtf-stickers-peel-off-logo-on-leather-notebook', 'uv-dtf-stickers-peel-off-logo-on-leather-notebook'),
    'bottles':    ('uv-dtf-stickers-branded-water-bottles-and-tumbler', 'uv-dtf-stickers-branded-water-bottles-and-tumbler'),
    'gifts':      ('corporate-gifts-executive-gift-boxes', 'corporate-gifts-executive-gift-boxes'),
    'drinkware':  ('corporate-gifts-branded-mugs-cups-and-tumblers', 'corporate-gifts-branded-mugs-cups-and-tumblers'),
    'notebooks':  ('corporate-gifts-custom-branded-notebooks', 'corporate-gifts-custom-branded-notebooks'),
    'notebook-in':('corporate-gifts-notebook-branded-inner-pages', 'corporate-gifts-notebook-branded-inner-pages'),
    'cards':      ('commercial-printing-business-cards', 'commercial-printing-business-cards'),
    'menus':      ('commercial-printing-restaurant-menus-and-table-tents', 'commercial-printing-restaurant-menus-and-table-tents'),
    'magazines':  ('book-publishing-school-magazine-and-graduation-booklet', 'book-publishing-school-magazine-and-graduation-booklet'),
    'rollups':    ('signage-large-format-roll-up-banners', 'signage-large-format-roll-up-banners'),
    'flags':      ('events-exhibitions-flags-and-pop-up-banners', 'events-exhibitions-flags-and-pop-up-banners'),
    'hoodies':    ('custom-apparel-branded-hoodies', 'custom-apparel-branded-hoodies'),
    'tees':       ('custom-apparel-t-shirts-and-polo', 'custom-apparel-t-shirts-and-polo'),
    'calendars':  ('commercial-printing-wall-and-desk-calendars', 'commercial-printing-wall-and-desk-calendars'),
    'desk-cal':   ('commercial-printing-desk-calendars', 'commercial-printing-desk-calendars'),
    'wall-cal':   ('commercial-printing-three-month-wall-calendar', 'commercial-printing-three-month-wall-calendar'),
    'menus2':     ('commercial-printing-menu-covers-and-food-table-tents', 'commercial-printing-menu-covers-and-food-table-tents'),
    'labels':     ('packaging-labels-bottle-jar-and-juice-labels', 'packaging-labels-bottle-jar-and-juice-labels'),
    'cafe-hoodies':  ('custom-apparel-cafe-brand-hoodies-three-colours', 'custom-apparel-cafe-brand-hoodies-three-colours'),
    'tour-flag':     ('events-exhibitions-tour-company-fabric-flag', 'events-exhibitions-tour-company-fabric-flag'),
    'ghost-hoodie':  ('custom-apparel-restaurant-hoodie-front-and-back', 'custom-apparel-restaurant-hoodie-front-and-back'),
    'ghost-rollup':  ('signage-large-format-restaurant-roll-up-banner-on-stage', 'signage-large-format-restaurant-roll-up-banner-on-stage'),
    'coffee-hoodie': ('custom-apparel-coffee-brand-hoodie-back-print', 'custom-apparel-coffee-brand-hoodie-back-print'),
    'white-tee':     ('custom-apparel-white-t-shirt-left-chest-logo', 'custom-apparel-white-t-shirt-left-chest-logo'),
    'qr-set':        ('commercial-printing-qr-menu-table-tents-set', 'commercial-printing-qr-menu-table-tents-set'),
    'charcoal-hoodie':('custom-apparel-charcoal-hoodie-full-colour-logo', 'custom-apparel-charcoal-hoodie-full-colour-logo'),
    'charity-rollup':('signage-large-format-education-charity-roll-up-banner', 'signage-large-format-education-charity-roll-up-banner'),
    'popup':         ('events-exhibitions-hospital-pop-up-a-frame-banner', 'events-exhibitions-hospital-pop-up-a-frame-banner'),
    'feather':       ('events-exhibitions-lilac-feather-flag', 'events-exhibitions-lilac-feather-flag'),
    'proc-art':      ('uv-dtf-stickers-process-artwork-preparation', 'uv-dtf-stickers-process-artwork-preparation'),
    'proc-print':    ('uv-dtf-stickers-process-print-and-cure', 'uv-dtf-stickers-process-print-and-cure'),
    'proc-lam':      ('uv-dtf-stickers-process-lamination', 'uv-dtf-stickers-process-lamination'),
    'proc-apply':    ('uv-dtf-stickers-process-transfer-to-product', 'uv-dtf-stickers-process-transfer-to-product'),
    'backdrop':      ('events-exhibitions-media-backdrop-banner', 'events-exhibitions-media-backdrop-banner'),
    'award-apply':   ('uv-dtf-stickers-applying-transfer-to-acrylic-award', 'uv-dtf-stickers-applying-transfer-to-acrylic-award'),
    'award':         ('uv-dtf-stickers-acrylic-star-award-wooden-base', 'uv-dtf-stickers-acrylic-star-award-wooden-base'),
    'folder':        ('uv-dtf-stickers-leather-presentation-folder', 'uv-dtf-stickers-leather-presentation-folder'),
    'binder':        ('corporate-gifts-branded-pen-and-ring-binder', 'corporate-gifts-branded-pen-and-ring-binder'),
    'giftbox':       ('corporate-gifts-blue-notebook-and-pen-gift-box', 'corporate-gifts-blue-notebook-and-pen-gift-box'),
    'shop-sign':     ('signage-large-format-illuminated-restaurant-shop-sign', 'signage-large-format-illuminated-restaurant-shop-sign'),
    'resto-banner':  ('signage-large-format-restaurant-banner-and-counter-branding', 'signage-large-format-restaurant-banner-and-counter-branding'),
    'raynat-rollup': ('signage-large-format-organic-hair-care-roll-up-banner', 'signage-large-format-organic-hair-care-roll-up-banner'),
    'ygk-rollup':    ('signage-large-format-gadget-shop-roll-up-banner', 'signage-large-format-gadget-shop-roll-up-banner'),
    'sign-landscape': ('signage-ghost-burgers-illuminated-wall-sign', 'signage-ghost-burgers-illuminated-wall-sign'),
    'iman-rollup':   ('signage-large-format-fashion-brand-roll-up-banner', 'signage-large-format-fashion-brand-roll-up-banner'),
    'dnails-tee':    ('custom-apparel-beauty-academy-t-shirt', 'custom-apparel-beauty-academy-t-shirt'),
    'drink-set':     ('corporate-gifts-branded-mug-glass-bottle-and-coaster', 'corporate-gifts-branded-mug-glass-bottle-and-coaster'),
    'selfie-mirror': ('customised-mirrors-social-media-frame-selfie-mirror', 'customised-mirrors-social-media-frame-selfie-mirror'),
    'etched-glass':  ('customised-mirrors-etched-glass-restaurant-frontage', 'customised-mirrors-etched-glass-restaurant-frontage'),
}
CROP_ONLY = {'wall-cal', 'award-apply', 'award', 'folder', 'binder', 'giftbox', 'raynat-rollup', 'ygk-rollup', 'iman-rollup', 'dnails-tee', 'drink-set', 'selfie-mirror', 'etched-glass'} | {k for k in {'charity-rollup', 'qr-set', 'coffee-hoodie', 'tour-flag', 'feather', 'popup', 'ghost-hoodie', 'ghost-rollup', 'white-tee', 'cafe-hoodies', 'charcoal-hoodie'} if k != 'cafe-hoodies'}

CARD_BLUR = [(868, 142, 1072, 238), (1232, 140, 1500, 296), (518, 352, 742, 460),
             (962, 464, 1180, 548), (1402, 456, 1660, 547), (487, 657, 884, 764), (1152, 713, 1366, 826)]

CROPS = [
    ('uv-peel', (560, 150, 1672, 941), 'uv-dtf-stickers-3d-logo-transfer-peel'),
    ('bottles', (690, 80, 990, 830), 'uv-dtf-stickers-black-steel-water-bottle'),
    ('bottles', (915, 5, 1205, 940), 'uv-dtf-stickers-white-bamboo-bottle-sticker-collage'),
    ('bottles', (1200, 180, 1495, 825), 'uv-dtf-stickers-steel-travel-tumbler'),
    ('gifts', (770, 0, 1525, 545), 'corporate-gifts-insurance-executive-gift-box'),
    ('gifts', (750, 445, 1515, 941), 'corporate-gifts-blue-notebook-pen-keyring-set'),
    ('gifts', (235, 355, 795, 885), 'corporate-gifts-leather-notebook-logo'),
    ('drinkware', (210, 450, 615, 795), 'corporate-gifts-two-tone-branded-mug'),
    ('drinkware', (575, 150, 865, 665), 'packaging-labels-branded-plastic-drinks-cup'),
    ('drinkware', (865, 255, 1405, 725), 'packaging-labels-restaurant-milkshake-cups'),
    ('drinkware', (1380, 185, 1645, 735), 'corporate-gifts-patterned-steel-tumbler'),
    ('notebooks', (600, 30, 1085, 400), 'corporate-gifts-agri-brand-spiral-notebook'),
    ('notebooks', (960, 75, 1375, 440), 'corporate-gifts-conference-notebook-cover'),
    ('notebooks', (1285, 110, 1720, 520), 'corporate-gifts-tech-expo-notebook'),
    ('menus', (260, 15, 765, 645), 'commercial-printing-swahili-restaurant-menu'),
    ('menus', (790, 30, 1300, 655), 'commercial-printing-fast-food-menu-cover'),
    ('menus', (95, 525, 485, 965), 'commercial-printing-qr-table-tent-yellow'),
    ('menus', (550, 555, 965, 965), 'commercial-printing-qr-table-tent-green'),
    ('menus', (1010, 525, 1445, 965), 'commercial-printing-qr-table-tent-black'),
    ('qr-set', None, 'commercial-printing-qr-menu-table-tents-set'),
    ('backdrop', None, 'events-exhibitions-media-backdrop-banner'),
    ('shop-sign', None, 'signage-large-format-illuminated-restaurant-shop-sign'),
    ('resto-banner', None, 'signage-large-format-restaurant-banner-and-counter-branding'),
    ('raynat-rollup', None, 'signage-large-format-organic-hair-care-roll-up-banner'),
    ('ygk-rollup', None, 'signage-large-format-gadget-shop-roll-up-banner'),
    ('dnails-tee', None, 'custom-apparel-beauty-academy-t-shirt'),
    ('drink-set', None, 'corporate-gifts-branded-mug-glass-bottle-and-coaster'),
    ('selfie-mirror', None, 'customised-mirrors-social-media-frame-selfie-mirror'),
    ('etched-glass', None, 'customised-mirrors-etched-glass-restaurant-frontage'),
    ('award-apply', None, 'uv-dtf-stickers-applying-transfer-to-acrylic-award'),
    ('award', None, 'uv-dtf-stickers-acrylic-star-award-wooden-base'),
    ('folder', None, 'uv-dtf-stickers-leather-presentation-folder'),
    ('binder', None, 'corporate-gifts-branded-pen-and-ring-binder'),
    ('giftbox', None, 'corporate-gifts-blue-notebook-and-pen-gift-box'),
    ('magazines', (575, 0, 1415, 505), 'book-publishing-school-magazine'),
    ('magazines', (1185, 395, 1672, 895), 'book-publishing-graduation-booklet'),
    ('rollups', (355, 90, 645, 865), 'signage-large-format-training-authority-roll-up'),
    ('ghost-rollup', None, 'signage-large-format-burger-restaurant-roll-up'),
    ('charity-rollup', None, 'signage-large-format-education-charity-roll-up'),
    ('rollups', (825, 55, 1205, 915), 'signage-large-format-colouring-book-roll-up'),
    ('rollups', (1135, 90, 1425, 845), 'signage-large-format-ice-pop-roll-up'),
    ('iman-rollup', None, 'signage-large-format-fashion-brand-roll-up'),
    ('flags', (35, 85, 435, 610), 'events-exhibitions-branded-pole-flag'),
    ('flags', (405, 10, 595, 835), 'events-exhibitions-feather-flag-green'),
    ('feather', None, 'events-exhibitions-festival-feather-flag'),
    ('flags', (755, 85, 1005, 835), 'events-exhibitions-teardrop-flag'),
    ('flags', (1215, 85, 1515, 685), 'events-exhibitions-vertical-pole-banner'),
    ('flags', (85, 615, 475, 995), 'events-exhibitions-desk-flags'),
    ('popup', None, 'events-exhibitions-pop-up-a-frame-banner'),
    ('tour-flag', None, 'events-exhibitions-tour-company-fabric-flag'),
    ('charcoal-hoodie', None, 'custom-apparel-charcoal-printed-hoodie'),
    ('ghost-hoodie', None, 'custom-apparel-black-restaurant-hoodie'),
    ('cafe-hoodies', None, 'custom-apparel-cafe-brand-hoodies-three-colours'),
    ('coffee-hoodie', None, 'custom-apparel-coffee-brand-hoodie-back-print'),
    ('white-tee', None, 'custom-apparel-white-t-shirt-left-chest-logo'),
    ('tees', (725, 265, 1115, 595), 'custom-apparel-black-typography-t-shirt'),
    ('tees', (95, 555, 565, 1015), 'custom-apparel-magenta-graffiti-t-shirt'),
    ('tees', (535, 555, 995, 1005), 'custom-apparel-hospital-staff-polo'),
    ('tees', (955, 555, 1425, 965), 'custom-apparel-mountain-bike-t-shirt'),
    ('wall-cal', (257, 66, 773, 1497), 'commercial-printing-three-month-wall-calendar'),
    ('desk-cal', (10, 320, 540, 810), 'commercial-printing-agribusiness-desk-calendar'),
    ('desk-cal', (530, 234, 1004, 683), 'commercial-printing-property-company-desk-calendar'),
    ('desk-cal', (975, 320, 1530, 850), 'commercial-printing-auto-parts-desk-calendar'),
    ('menus2', (160, 15, 505, 570), 'commercial-printing-lounge-drinks-menu'),
    ('menus2', (485, 250, 765, 605), 'commercial-printing-cafe-table-tent-veggie-melt'),
    ('menus2', (765, 262, 1050, 630), 'commercial-printing-cafe-table-tent-sandwich'),
    ('menus2', (1000, 20, 1395, 585), 'commercial-printing-traditional-cuisine-menu'),
    ('menus2', (45, 555, 745, 1020), 'commercial-printing-laminated-menu-card'),
    ('menus2', (785, 570, 1500, 1005), 'commercial-printing-restaurant-wine-cellar-menu'),
    ('labels', (95, 10, 320, 610), 'packaging-labels-hair-oil-bottle-label'),
    ('labels', (325, 280, 660, 612), 'packaging-labels-hair-food-jar-label'),
    ('labels', (700, 35, 1055, 600), 'packaging-labels-ginger-honey-drink-bottle-labels'),
    ('labels', (1085, 0, 1475, 635), 'packaging-labels-cold-pressed-juice-bottle-labels'),
    ('labels', (530, 648, 1350, 998), 'packaging-labels-die-cut-product-labels'),
    ('labels', (175, 690, 445, 950), 'packaging-labels-agricultural-product-label'),
]

def save(img, path, max_w, q=84, mark=True):
    if img.width > max_w:
        img = img.resize((max_w, round(img.height * max_w / img.width)), Image.LANCZOS)
    if mark:
        img = watermark(img)
    img.save(path, 'WEBP', quality=q, method=6)
    return img.size

loaded = {}
for gid, (srcname, name) in GROUPS.items():
    im = src(srcname)
    if gid == 'cards':
        for box in CARD_BLUR:
            region = im.crop(box).filter(ImageFilter.GaussianBlur(9))
            im.paste(region, box[:2])
    loaded[gid] = im
    if gid not in CROP_ONLY:
        print(name, save(im, OUT / f'{name}.webp', 1600))

for gid, box, name in CROPS:
    im = loaded[gid] if box is None else loaded[gid].crop(box)
    print(' ', name, save(im, RAW / f'{name}.webp', 900, mark=False))

OG_FOR = {'uv-dtf-stickers': 'uv-peel', 'corporate-gifts': 'gifts', 'commercial-printing': 'menus',
          'book-publishing': 'magazines', 'signage': 'sign-landscape', 'banners': 'rollups', 'events-exhibitions': 'flags',
          'custom-apparel': 'hoodies', 'packaging-labels': 'labels', 'corporate-branding': 'cards'}
for svc, gid in OG_FOR.items():
    im = loaded[gid]; W, H = 1200, 630
    s = max(W / im.width, H / im.height); r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (r.width - W) // 2; y = (r.height - H) // 2
    watermark(r.crop((x, y, x + W, y + H))).save(OG / f'work-{svc}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
print('og cards', len(OG_FOR))

def og_card(im, path):
    W, H = 1200, 630
    s = max(W / im.width, H / im.height); r = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (r.width - W) // 2; y = (r.height - H) // 2
    watermark(r.crop((x, y, x + W, y + H))).save(path, 'JPEG', quality=84, optimize=True, progressive=True)

ART_OG = {'magic-stickers': 'uv-peel', 'sticker-printing': 'uv-printer', 'promotional-branding': 'gifts',
          't-shirt-printing': 'hoodies', 'banners-large-format': 'rollups', 'bulk-printing': 'cards',
          'commercial-printing': 'menus', 'label-printing': 'labels', 'book-publishing': 'magazines',
          'graphic-design': 'cards', 'photography': 'bottles', 'corporate-branding': 'notebooks',
          'events-exhibitions': 'flags', 'default': 'uv-printer'}
for key, gid in ART_OG.items():
    og_card(loaded[gid], OG / f'{key}.jpg')
books = sorted((SRC / 'products').glob('*'))
if books:
    b = Image.open(books[0]).convert('RGB'); canvas = Image.new('RGB', (1200, 630), 'white')
    b.thumbnail((1100, 590)); canvas.paste(b, ((1200 - b.width) // 2, (630 - b.height) // 2)); watermark(canvas).save(OG / 'products.jpg', 'JPEG', quality=84)
PRODUCTS = ROOT / 'src' / 'assets' / 'products'
PRODUCTS.mkdir(exist_ok=True)
for f in books:
    im = watermark(Image.open(f))
    if f.suffix == '.webp':
        im.save(PRODUCTS / f.name, 'WEBP', quality=88, method=6)
    else:
        im.save(PRODUCTS / f.name, 'PNG', optimize=True)
print('book photos', len(books))
print('legacy og cards', len(ART_OG))
