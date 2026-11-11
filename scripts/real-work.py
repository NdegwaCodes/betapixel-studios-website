"""Real job photos and videos from the owner's phone (images/Google Photos and Videos/, not committed).

Photos: EXIF-rotated, saved as 2000px masters in images/real/ (committed), then watermarked 900px samples in
src/assets/work/portfolio/. Videos: 720p H.264, silent, faststart, logo burned in at the bottom, saved to
public/video/; a watermarked poster frame goes to src/assets/work/video/. Needs ffmpeg on PATH.
Run: python scripts/real-work.py
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from watermark import watermark, _SHAPE, GREY, OPACITY, SHADOW

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'images' / 'Google Photos and Videos'
MASTER = ROOT / 'images' / 'real'
PORT = ROOT / 'src' / 'assets' / 'work' / 'portfolio'
POSTER = ROOT / 'src' / 'assets' / 'work' / 'video'
VIDEO = ROOT / 'public' / 'video'
for d in (MASTER, POSTER, VIDEO):
    d.mkdir(parents=True, exist_ok=True)

PHOTOS = {
    'PXL_20240622_174106651.jpg': 'signage-large-format-al-baraka-acrylic-logo-sign-installed',
    'PXL_20241213_172122335.jpg': 'signage-large-format-seefle-led-logo-sign-installed',
    'PXL_20260226_174957888.RAW-01.COVER.jpg': 'signage-large-format-ghost-burgers-3d-illuminated-sign-installed',
    'PXL_20260225_145003179.RAW-01.COVER.jpg': 'signage-large-format-ghost-burgers-branded-counter-installed',
    'PXL_20251010_135544991.RAW-01.COVER.jpg': 'packaging-labels-ghost-burgers-printed-fries-box',
    'PXL_20260418_163821350.RAW-01.COVER.jpg': 'commercial-printing-biostimulant-product-brochure',
    'PXL_20260418_163843412.RAW-01.COVER.jpg': 'commercial-printing-prebiotic-product-brochure',
    'PXL_20260418_170619780.RAW-01.COVER.jpg': 'commercial-printing-agricultural-brochure-range',
    'PXL_20251030_134929577.RAW-01.COVER~2.jpg': 'book-publishing-through-the-fog-printed-copies',
    'PXL_20251030_134510683.RAW-01.COVER.jpg': 'book-publishing-through-the-fog-book-spines',
    'PXL_20260606_161456200.NIGHT.RAW-01.COVER.jpg': 'customised-mirrors-ghost-burgers-selfie-mirror-installed',
    'whatsapp-ginger-shot-floating.png': 'packaging-labels-ginger-shot-bottle-label',
    'whatsapp-ginger-shot-flatlay.png': 'packaging-labels-ginger-shot-label-with-fresh-ginger',
    'whatsapp-treats-cup.jpg': 'packaging-labels-treats-branded-dessert-cup',
    'whatsapp-karak-and-go-uber-eats.jpg': 'packaging-labels-karak-and-go-branded-cups-and-boxes',
}
VIDEOS = {
    'PXL_20240622_174118137.mp4': 'signage-large-format-al-baraka-acrylic-sign',
    'PXL_20240629_151403903.mp4': 'signage-large-format-al-baraka-backlit-sign',
    'PXL_20241213_172052248.mp4': 'signage-large-format-seefle-led-sign',
    'PXL_20250920_150704640.mp4': 'signage-large-format-ghost-burgers-fascia-sign',
    'PXL_20250924_164317824.mp4': 'signage-large-format-ghost-burgers-illuminated-sign',
    'PXL_20260226_122405352.mp4': 'signage-large-format-ghost-burgers-terrace-banner',
    'PXL_20240606_111648093.mp4': 'signage-large-format-window-film-installation',
    'PXL_20240606_112841652.mp4': 'signage-large-format-window-graphic-installation',
    'PXL_20260417_142242159.mp4': 'signage-large-format-glass-door-sticker-application',
    'PXL_20251004_135449213.mp4': 'packaging-labels-ghost-burgers-fries-box',
    'PXL_20251006_123108818.mp4': 'packaging-labels-ghost-burgers-branded-cup',
    'PXL_20251007_125142602.mp4': 'packaging-labels-ghost-burgers-smash-sip-box',
    'PXL_20260418_162509582.mp4': 'commercial-printing-brochure-page-flip',
    'PXL_20260417_142129080.mp4': 'commercial-printing-lamination-in-production',
    'whatsapp-sinia-opening.mp4': 'packaging-labels-sinia-branded-cans-and-bowls',
}


def overlay_png(width: int, height: int, path: Path) -> None:
    """Transparent PNG with the grey logo and soft shadow, bottom-centre, for ffmpeg to burn in."""
    lw = round(width * 0.42)
    lh = round(_SHAPE.height * lw / _SHAPE.width)
    x, y = (width - lw) // 2, height - lh - round(height * 0.05)
    shape = _SHAPE.resize((lw, lh), Image.LANCZOS)
    layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    blur = max(1, lh // 45)
    shadow = Image.new('L', (width, height), 0)
    shadow.paste(shape.point(lambda a: round(a * SHADOW)), (x + blur // 2, y + blur // 2))
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur))
    layer.paste((20, 24, 40, 255), (0, 0), shadow)
    mark = Image.new('RGBA', (lw, lh), GREY + (255,))
    mark.putalpha(shape.point(lambda a: round(a * OPACITY)))
    layer.alpha_composite(mark, (x, y))
    layer.save(path)


def probe_size(path: Path) -> tuple[int, int]:
    """Displayed size: phone videos store landscape pixels plus a rotation flag that ffmpeg applies on decode."""
    info = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height:stream_side_data=rotation',
                                      '-of', 'json', str(path)], capture_output=True, text=True, check=True).stdout)['streams'][0]
    w, h = info['width'], info['height']
    rotation = next((abs(int(d.get('rotation', 0))) for d in info.get('side_data_list', []) if 'rotation' in d), 0)
    return (h, w) if rotation in (90, 270) else (w, h)


for src, name in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(SRC / src)).convert('RGB')
    im.thumbnail((2000, 2000), Image.LANCZOS)
    im.save(MASTER / f'{name}.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
    web = im.copy()
    web.thumbnail((900, 1200), Image.LANCZOS)
    watermark(web).save(PORT / f'{name}.webp', 'WEBP', quality=84, method=6)
    print('photo', name, web.size)

if not shutil.which('ffmpeg'):
    sys.exit('ffmpeg not found on PATH: photos done, videos skipped.')

meta = {}
for src, name in VIDEOS.items():
    w, h = probe_size(SRC / src)
    tw, th = (720, round(720 * h / w / 2) * 2) if h >= w else (round(720 * w / h / 2) * 2, 720)
    mark = POSTER / f'_{name}-overlay.png'
    overlay_png(tw, th, mark)
    out = VIDEO / f'{name}.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(SRC / src), '-i', str(mark),
                    '-filter_complex', f'[0:v]scale={tw}:{th}:flags=lanczos,fps=30[v];[v][1:v]overlay=0:0,format=yuv420p',
                    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '1400k', '-bufsize', '2800k', '-profile:v', 'high', '-movflags', '+faststart', str(out)], check=True)
    frame = POSTER / f'_{name}.png'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0.8', '-i', str(out), '-frames:v', '1', str(frame)], check=True)
    Image.open(frame).convert('RGB').save(POSTER / f'{name}.webp', 'WEBP', quality=82, method=6)
    frame.unlink()
    mark.unlink()
    duration = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)],
                                    capture_output=True, text=True, check=True).stdout.strip())
    d = src[4:12] if src.startswith('PXL_') else '20261008'
    meta[name] = {'duration': round(duration, 1), 'date': f'{d[:4]}-{d[4:6]}-{d[6:]}', 'width': tw, 'height': th}
    print('video', name, f'{tw}x{th}', f'{out.stat().st_size / 1e6:.1f} MB')

(ROOT / 'src' / 'data' / 'videos.json').write_text(json.dumps(meta, indent=2) + '\n', encoding='utf-8')
print('videos.json', len(meta))
