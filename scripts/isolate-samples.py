import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from rembg import remove, new_session
from scipy import ndimage
from watermark import watermark

ROOT = Path(__file__).resolve().parents[1]
PORT = ROOT / 'src' / 'assets' / 'work' / 'portfolio'
RAW = ROOT / 'images' / 'crops-raw'

KEEP = {
    'commercial-printing-fast-food-menu-cover': (0.0, 0.0, 1.0, 0.83),
    'commercial-printing-qr-table-tent-black': [(0.03, 0.06), (1.0, 0.06), (1.0, 1.0), (0.03, 1.0)],
    'commercial-printing-qr-table-tent-yellow': (0.0, 0.07, 1.0, 1.0),
    'commercial-printing-swahili-restaurant-menu': [(0.0, 0.0), (1.0, 0.0), (1.0, 0.72), (0.53, 0.85), (0.0, 0.85)],
    'corporate-gifts-conference-notebook-cover': [(0.22, 0.1), (0.72, 0.1), (0.78, 1.0), (0.1, 1.0), (0.1, 0.4), (0.2, 0.33)],
    'corporate-gifts-insurance-executive-gift-box': (0.0, 0.0, 1.0, 0.88),
    'corporate-gifts-leather-notebook-logo': (0.0, 0.0, 0.96, 1.0),
    'corporate-gifts-tech-expo-notebook': (0.07, 0.0, 1.0, 1.0),
    'custom-apparel-black-typography-t-shirt': (0.0, 0.0, 1.0, 0.86),
    'custom-apparel-faith-slogan-t-shirt': (0.0, 0.0, 0.93, 0.91),
    'custom-apparel-hospital-staff-polo': (0.04, 0.05, 1.0, 1.0),
    'custom-apparel-mountain-bike-t-shirt': (0.0, 0.05, 1.0, 1.0),
    'events-exhibitions-desk-flags': [(0.0, 0.0), (0.83, 0.0), (0.83, 0.3), (0.89, 0.3), (0.89, 0.76), (0.0, 0.76)],
    'events-exhibitions-vertical-pole-banner': (0.0, 0.0, 1.0, 1.0),
    'events-exhibitions-teardrop-flag': (0.0, 0.0, 1.0, 0.87),
    'packaging-labels-branded-plastic-drinks-cup': (0.0, 0.0, 1.0, 0.72),
    'packaging-labels-restaurant-milkshake-cups': (0.12, 0.0, 1.0, 1.0),
    'signage-large-format-colouring-book-roll-up': (0.0, 0.0, 0.9, 1.0),
    'signage-large-format-training-authority-roll-up': (0.0, 0.0, 0.93, 1.0),
    'uv-dtf-stickers-black-steel-water-bottle': (0.0, 0.0, 0.76, 1.0),
    'uv-dtf-stickers-steel-travel-tumbler': (0.0, 0.0, 1.0, 1.0),
    'commercial-printing-three-month-wall-calendar': (0.0, 0.0, 1.0, 1.0),
    'commercial-printing-property-company-desk-calendar': (0.0, 0.0, 1.0, 1.0),
    'packaging-labels-die-cut-product-labels': (0.0, 0.04, 0.87, 1.0),
    'commercial-printing-lounge-drinks-menu': [(0.0, 0.0), (1.0, 0.0), (1.0, 0.4), (0.92, 0.44), (0.92, 1.0), (0.0, 1.0)],
    'commercial-printing-cafe-table-tent-sandwich': (0.0, 0.0, 0.86, 1.0),
    'commercial-printing-traditional-cuisine-menu': [(0.0, 0.0), (1.0, 0.0), (1.0, 1.0), (0.08, 1.0), (0.08, 0.45), (0.0, 0.45)],
    'commercial-printing-laminated-menu-card': [(0.0, 0.08), (0.62, 0.04), (0.64, 0.13), (1.0, 0.13), (1.0, 1.0), (0.0, 1.0)],
    'commercial-printing-restaurant-wine-cellar-menu': [(0.0, 0.72), (0.3, 0.21), (0.36, 0.21), (0.36, 0.0), (1.0, 0.0), (1.0, 1.0), (0.0, 1.0)],
}
BOX_ONLY = {'corporate-gifts-tech-expo-notebook', 'custom-apparel-mountain-bike-t-shirt', 'events-exhibitions-vertical-pole-banner',
            'signage-large-format-training-authority-roll-up', 'uv-dtf-stickers-steel-travel-tumbler',
            'corporate-gifts-conference-notebook-cover', 'commercial-printing-three-month-wall-calendar',
            'commercial-printing-property-company-desk-calendar', 'commercial-printing-laminated-menu-card'}
FADE = 0.035
AS_IS = {'signage-large-format-illuminated-restaurant-shop-sign', 'signage-large-format-restaurant-banner-and-counter-branding', 'signage-large-format-organic-hair-care-roll-up-banner', 'signage-large-format-gadget-shop-roll-up-banner', 'signage-large-format-fashion-brand-roll-up', 'custom-apparel-beauty-academy-t-shirt', 'corporate-gifts-branded-mug-glass-bottle-and-coaster', 'customised-mirrors-social-media-frame-selfie-mirror', 'customised-mirrors-etched-glass-restaurant-frontage', 'events-exhibitions-media-backdrop-banner', 'uv-dtf-stickers-applying-transfer-to-acrylic-award', 'uv-dtf-stickers-acrylic-star-award-wooden-base', 'uv-dtf-stickers-leather-presentation-folder', 'corporate-gifts-branded-pen-and-ring-binder', 'corporate-gifts-blue-notebook-and-pen-gift-box', 'events-exhibitions-festival-feather-flag', 'events-exhibitions-pop-up-a-frame-banner', 'events-exhibitions-tour-company-fabric-flag', 'custom-apparel-charcoal-printed-hoodie', 'custom-apparel-black-restaurant-hoodie', 'custom-apparel-cafe-brand-hoodies-three-colours', 'custom-apparel-coffee-brand-hoodie-back-print', 'custom-apparel-white-t-shirt-left-chest-logo', 'signage-large-format-burger-restaurant-roll-up', 'signage-large-format-education-charity-roll-up', 'commercial-printing-qr-menu-table-tents-set'}
MODEL_ONLY = {'packaging-labels-die-cut-product-labels'}
MERGE_ALL = {'events-exhibitions-desk-flags', 'corporate-gifts-insurance-executive-gift-box',
             'packaging-labels-ginger-honey-drink-bottle-labels', 'packaging-labels-cold-pressed-juice-bottle-labels',
             'packaging-labels-die-cut-product-labels'}

session = new_session('isnet-general-use')

def isolate(name: str, im: Image.Image) -> Image.Image:
    cut = remove(im, session=session, post_process_mask=True)
    rgb = np.asarray(im).astype(int)
    nonwhite = (rgb.min(axis=2) < 205) | ((rgb.max(axis=2) - rgb.min(axis=2)) > 28)
    a = np.array(cut.split()[-1]) > 110
    if name not in MODEL_ONLY:
        a |= nonwhite
    H, W = a.shape
    r = max(3, int(min(H, W) * 0.012))
    a = ndimage.binary_opening(a, iterations=1)
    a = ndimage.binary_closing(a, structure=np.ones((3, 3)), iterations=r)
    a = ndimage.binary_fill_holes(a)
    if name in KEEP:
        k = KEEP[name]
        pts = [(k[0], k[1]), (k[2], k[1]), (k[2], k[3]), (k[0], k[3])] if isinstance(k, tuple) else k
        poly = Image.new('L', (W, H), 0)
        ImageDraw.Draw(poly).polygon([(x * W, y * H) for x, y in pts], fill=255)
        keep_area = np.array(poly) > 0
        a = keep_area.copy() if name in BOX_ONLY else a & keep_area
    else:
        keep_area = None
    lab, n = ndimage.label(a)
    if n == 0:
        return im
    sizes = ndimage.sum(a, lab, range(1, n + 1))
    if name in MERGE_ALL:
        keep = [i + 1 for i, s in enumerate(sizes) if s > 0.05 * sizes.max()]
    else:
        cents = ndimage.center_of_mass(a, lab, range(1, n + 1))
        diag = (H ** 2 + W ** 2) ** 0.5
        score = [sizes[i] * (1.2 - ((cents[i][0] - H / 2) ** 2 + (cents[i][1] - W / 2) ** 2) ** 0.5 / diag) for i in range(n)]
        keep = [int(np.argmax(score)) + 1]
    mask = np.isin(lab, keep)
    mask = ndimage.binary_fill_holes(mask)
    alpha_f = mask.astype(float)
    if keep_area is not None:
        padded = np.pad(keep_area, 1, constant_values=True)
        dist = ndimage.distance_transform_edt(padded)[1:-1, 1:-1]
        alpha_f *= np.clip(dist / max(4, FADE * max(H, W)), 0, 1)
    alpha = Image.fromarray((alpha_f * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.2))
    ys, xs = np.where(mask); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    obj = im.crop((x0, y0, x1 + 1, y1 + 1)); al = alpha.crop((x0, y0, x1 + 1, y1 + 1))
    w, h = obj.size; pad = int(max(w, h) * 0.08)
    canvas = Image.new('RGB', (w + 2 * pad, h + 2 * pad + pad // 2), 'white')
    sh = Image.new('L', canvas.size, 0); d = ImageDraw.Draw(sh)
    d.ellipse((pad + w * 0.08, pad + h - h * 0.02, pad + w * 0.92, pad + h + max(8, h * 0.035)), fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(max(6, w * 0.03)))
    canvas.paste(Image.new('RGB', canvas.size, (120, 124, 135)), (0, 0), sh)
    canvas.paste(obj, (pad, pad), al)
    return canvas

only = set(sys.argv[1:])
for raw in sorted(RAW.glob('*.webp')):
    f = PORT / raw.name
    if only and f.stem not in only:
        continue
    im = Image.open(raw).convert('RGB')
    out = im if f.stem in AS_IS else isolate(f.stem, im)
    if out.width > 900:
        out = out.resize((900, round(out.height * 900 / out.width)), Image.LANCZOS)
    watermark(out).save(f, 'WEBP', quality=86, method=6)
    print(f.stem, out.size)
