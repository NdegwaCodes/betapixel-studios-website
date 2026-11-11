import sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from watermark import salient_mask, watermark

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'images'
OUT = ROOT / 'src' / 'assets' / 'hero-mobile'
SAFE = (0.22, 0.78)

SLIDES = {
    'uv-dtf-stickers': ('file_00000000be20820797480e6946abf84c', 'uv-dtf-stickers-uv-printer-printing-transfers'),
    'packaging-labels': ('file_0000000065588211b97a6e7f9d329307', 'packaging-labels-juice-bottle-and-hair-care-labels'),
    'corporate-branding': ('file_00000000316482078d4aac3391a7c86f', 'corporate-branding-calendars-notebooks-and-stationery'),
    'corporate-gifts': ('file_000000003728820785ed05c0422e590a', 'corporate-gifts-branded-executive-gift-boxes'),
    'custom-apparel': ('file_00000000e78c8207a8408c55c8e4d9aa', 'custom-apparel-branded-hoodies-polos-and-t-shirts'),
    'banners': ('file_000000007f7c821184e02303ae7b5547', 'banners-roll-up-banners-on-display'),
    'events-exhibitions': ('file_00000000bf5c8207a1898cea629209ea', 'events-exhibitions-branded-flags-and-feather-banner'),
    'book-publishing': ('file_00000000fe348211963c8ac45e4feecc', 'book-publishing-school-magazine-graduation-booklet-and-novel'),
    'signage': ('file_000000007b54820d80bf998dd3a9bdd9', 'signage-illuminated-3d-restaurant-wall-sign-portrait'),
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for raw, name in SLIDES.values():
        master = SRC / f'{name}.png'
        if not master.exists():
            (SRC / f'{raw}.png').rename(master)
        im = Image.open(master).convert('RGB')
        mask = salient_mask(im)
        W = im.size[0]
        mask[:, : round(W * SAFE[0])] = False
        mask[:, round(W * SAFE[1]):] = False
        watermark(im, mask).save(OUT / f'{name}.webp', 'WEBP', quality=90, method=6)
        print(name, im.size)


if __name__ == '__main__':
    main()
