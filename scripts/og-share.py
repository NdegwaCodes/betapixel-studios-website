import io
from pathlib import Path
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'public' / 'fonts'
OUT = ROOT / 'public' / 'og' / 'betapixel-studios-share.jpg'
PHOTOS = ['corporate-gifts-branded-executive-gift-boxes', 'custom-apparel-branded-hoodies-polos-and-t-shirts', 'packaging-labels-juice-bottle-and-hair-care-labels']
NAVY, NAVY_DEEP, ORANGE, WHITE = (16, 41, 125), (11, 26, 85), (255, 124, 58), (255, 255, 255)
W, H = 1200, 630


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    f = TTFont(FONTS / f'{name}.woff2')
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    buf.seek(0)
    return ImageFont.truetype(buf, size)


def main() -> None:
    card = Image.new('RGB', (W, H), NAVY_DEEP)
    draw = ImageDraw.Draw(card)
    panel_w, gap, top = 196, 12, 0
    x0 = W - 3 * panel_w - 2 * gap
    for i, name in enumerate(PHOTOS):
        im = Image.open(ROOT / 'src' / 'assets' / 'hero-mobile' / f'{name}.webp').convert('RGB')
        card.paste(ImageOps.fit(im, (panel_w, H), centering=(0.5, 0.5)), (x0 + i * (panel_w + gap), top))
    shade = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shade).rectangle([0, 0, x0 - 1, H], fill=255)
    card.paste(Image.new('RGB', (W, H), NAVY_DEEP), (0, 0), shade)

    logo = Image.open(ROOT / 'src' / 'assets' / 'brand' / 'logo-light.png').convert('RGBA')
    logo.thumbnail((300, 80))
    card.paste(logo, (56, 56), logo)

    draw.text((56, 200), 'Printing & Branding', font=font('manrope-800', 52), fill=WHITE)
    draw.text((56, 262), 'in Nairobi', font=font('manrope-800', 52), fill=ORANGE)
    body = font('k2d-400', 25)
    for j, line in enumerate(['UV DTF stickers · Signage · Banners', 'T-shirts · Labels · Corporate gifts', 'Made in-house, delivered across Kenya']):
        draw.text((56, 350 + j * 38), line, font=body, fill=(214, 222, 245))
    draw.rounded_rectangle([56, 500, 360, 556], radius=28, fill=ORANGE)
    draw.text((208, 528), 'betapixels.studio', font=font('k2d-600', 24), fill=NAVY_DEEP, anchor='mm')
    draw.rectangle([0, H - 8, x0 - 1, H], fill=NAVY)
    card.save(OUT, 'JPEG', quality=86, optimize=True, progressive=True)
    print(OUT.name, card.size)


if __name__ == '__main__':
    main()
